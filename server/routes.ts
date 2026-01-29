
import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { randomUUID } from "crypto";

interface SubmitLogEntry {
  correlationId: string;
  timestamp: string;
  method: string;
  origin: string;
  referer: string;
  contentLength: string;
  receivedBodyKeys: string[];
  payloadWasString: boolean;
  isTestPayload: boolean;
  normalizedGroupId: string;
  normalizedMembersCount: number;
  targetUrl: string;
  received: boolean;
  forwarded: boolean;
  upstreamStatus?: number;
  upstreamBodyKeys?: string[];
  error?: string;
  success: boolean;
}

const submitLogs: SubmitLogEntry[] = [];
const MAX_SUBMIT_LOGS = 50;

interface RequestLogEntry {
  ts: string;
  method: string;
  path: string;
  origin: string | null;
  referer: string | null;
  contentLength: string | null;
  userAgent?: string;
  note?: string;
}

const recentRequests: RequestLogEntry[] = [];
const MAX_RECENT_REQUESTS = 200;

function addRequestLog(entry: RequestLogEntry) {
  recentRequests.push(entry);
  if (recentRequests.length > MAX_RECENT_REQUESTS) {
    recentRequests.shift();
  }
}

function addSubmitLog(entry: SubmitLogEntry) {
  submitLogs.unshift(entry);
  if (submitLogs.length > MAX_SUBMIT_LOGS) {
    submitLogs.pop();
  }
}

// CORS allowlist
const CORS_ALLOWED_ORIGINS = [
  "https://artemis-hub.replit.app",
  "https://artemis-hub--arthursmt89.replit.app",
  "https://artemis-hunting.replit.app",
  "https://artemis-hunting--arthursmt89.replit.app",
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (CORS_ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow any *.replit.dev for dev previews
  if (origin.endsWith(".replit.dev")) return true;
  // Allow localhost for development
  if (origin.startsWith("http://localhost")) return true;
  return false;
}

function setCorsHeaders(res: Response, origin: string | undefined) {
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Correlation-Id");
    res.setHeader("Access-Control-Expose-Headers", "X-Correlation-Id");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
}

// Normalize incoming Hunt payloads to Arise-required schema
interface NormalizedPayload {
  proposalId: string;
  groupId: string;
  members: Array<{ memberId: string; name: string; firstName: string; lastName: string; loanAmount: number; role: string }>;
  leaderName: string;
  clientName: string;
  totalAmount: number;
  submittedAt: string;
  [key: string]: any;
}

interface NormalizationResult {
  normalized: NormalizedPayload;
  payloadWasString: boolean;
  isTestPayload: boolean;
}

function normalizeProposalInput(body: any): NormalizationResult {
  let payloadWasString = false;
  let raw = body;
  
  // Handle payload field - could be object or JSON string
  if (body && body.payload !== undefined) {
    if (typeof body.payload === 'string') {
      payloadWasString = true;
      try {
        raw = JSON.parse(body.payload);
      } catch (e) {
        console.log(`[NORMALIZE] Failed to parse payload string, using as-is`);
        raw = body;
      }
    } else if (typeof body.payload === 'object' && body.payload !== null) {
      raw = body.payload;
    }
  }
  
  // Detect test/debug payloads
  const bodyStr = JSON.stringify(body).toLowerCase();
  const isTestPayload = 
    bodyStr.includes('"test"') || 
    bodyStr.includes('"debug"') ||
    bodyStr.includes('test-') ||
    bodyStr.includes('debug-') ||
    (body.proposalId && body.proposalId.toString().startsWith('test'));
  
  // Determine proposalId
  const proposalId = body.proposalId || raw.proposalId || raw.id || String(Date.now());
  
  // Determine groupId (prefer payload.groupId, else synthesize)
  const groupId = raw.groupId || body.groupId || `GRP-${proposalId}`;
  
  // Determine leaderName / clientName
  const leaderName = raw.leaderName || raw.clientName || raw.fullName || "Unknown Leader";
  
  // Determine loan amount
  const loanAmount = raw.loanAmount || raw.requestedAmount || raw.totalAmount || raw.amount || 10000;
  
  // Determine members - Arise requires: name (or firstName+lastName), loanAmount (or requestedAmount)
  let members: Array<any>;
  if (Array.isArray(raw.members) && raw.members.length > 0) {
    // Ensure each member has required fields
    members = raw.members.map((m: any, idx: number) => {
      const memberName = m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || leaderName;
      const nameParts = memberName.split(' ');
      return {
        memberId: m.memberId || m.id || `M${idx + 1}`,
        name: memberName,
        firstName: m.firstName || nameParts[0] || memberName,
        lastName: m.lastName || nameParts.slice(1).join(' ') || '',
        loanAmount: m.loanAmount || m.requestedAmount || loanAmount,
        role: m.role || (idx === 0 ? "LEADER" : "MEMBER"),
      };
    });
  } else {
    // Create default member with required fields from leaderName/clientName
    const nameParts = leaderName.split(' ');
    members = [{
      memberId: raw.memberId || "M1",
      name: leaderName,
      firstName: nameParts[0] || leaderName,
      lastName: nameParts.slice(1).join(' ') || '',
      loanAmount: loanAmount,
      role: "LEADER"
    }];
  }
  
  // Build normalized payload - must have at least { groupId, members }
  const normalized: NormalizedPayload = {
    proposalId,
    groupId,
    members,
    leaderName,
    clientName: raw.clientName || leaderName,
    totalAmount: loanAmount,
    submittedAt: raw.submittedAt || new Date().toISOString(),
  };
  
  // Preserve extra fields that might be useful
  if (raw.loanAmount || loanAmount) normalized.loanAmount = loanAmount;
  if (raw.loanPurpose) normalized.loanPurpose = raw.loanPurpose;
  if (raw.loanTerm) normalized.loanTerm = raw.loanTerm;
  if (raw.status) normalized.status = raw.status;
  if (raw.agentId) normalized.agentId = raw.agentId;
  
  return { normalized, payloadWasString, isTestPayload };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // ========================================
  // CORS MIDDLEWARE - applies to ALL routes
  // ========================================
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowed = isOriginAllowed(origin);
    
    // Set CORS headers on every response
    setCorsHeaders(res, origin);
    
    // Log preflight requests
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] OPTIONS preflight`);
      console.log(`[CORS]   path: ${req.path}`);
      console.log(`[CORS]   origin: ${origin}`);
      console.log(`[CORS]   referer: ${req.headers.referer || 'none'}`);
      console.log(`[CORS]   allowed: ${allowed}`);
      return res.status(204).end();
    }
    
    next();
  });

  // ========================================
  // REQUEST LOGGING MIDDLEWARE - logs all requests to ring buffer
  // ========================================
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip debug endpoints to reduce noise
    if (req.path.startsWith('/api/debug/')) {
      return next();
    }
    
    addRequestLog({
      ts: new Date().toISOString(),
      method: req.method,
      path: req.path,
      origin: req.headers.origin || null,
      referer: req.headers.referer || null,
      contentLength: req.headers['content-length'] || null,
      userAgent: req.headers['user-agent'],
    });
    
    next();
  });
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      ok: true,
      ts: new Date().toISOString(),
      huntUrl: process.env.VITE_HUNT_URL ? "[configured]" : "[not set]",
      gateUrl: process.env.VITE_GATE_URL ? "[configured]" : "[not set]",
      ariseBaseUrl: process.env.ARISE_BASE_URL ? "[configured]" : "[not set]",
    });
  });

  // Probe endpoint to confirm deployed server is serving our code
  app.get("/api/debug/probe", (req, res) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
    }
    res.json({
      ok: true,
      service: "hub",
      ts: new Date().toISOString(),
    });
  });

  // Debug endpoint - environment info
  app.get("/api/debug/env", (req, res) => {
    res.json({
      nodeEnv: process.env.NODE_ENV,
      hasAriseBaseUrl: !!process.env.ARISE_BASE_URL,
      service: "hub",
    });
  });

  // Debug endpoint - recent requests ring buffer
  app.get("/api/debug/requests", (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, MAX_RECENT_REQUESTS);
    res.json({
      count: recentRequests.length,
      limit,
      nodeEnv: process.env.NODE_ENV,
      now: new Date().toISOString(),
      logs: recentRequests.slice(-limit).reverse(),
    });
  });

  // Debug endpoint - CORS behavior check
  app.get("/api/debug/cors", (req, res) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const allowedOriginEcho = origin && isOriginAllowed(origin) ? origin : null;
    
    res.json({
      ok: true,
      origin: origin || null,
      referer: referer || null,
      allowedOriginEcho,
    });
  });

  // Proposals
  app.get(api.proposals.list.path, async (req, res) => {
    const proposals = await storage.getProposals();
    res.json(proposals);
  });

  app.post(api.proposals.create.path, async (req, res) => {
    try {
      const input = api.proposals.create.input.parse(req.body);
      const proposal = await storage.createProposal(input);
      res.status(201).json(proposal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Proposal submit endpoint - forwards to Arise with normalized payload
  app.post("/api/proposals/submit", async (req, res) => {
    const correlationId = randomUUID();
    const origin = req.headers.origin || 'unknown';
    const referer = req.headers.referer || 'none';
    const contentLength = req.headers['content-length'] || 'unknown';
    const receivedBodyKeys = Object.keys(req.body || {});
    const ARISE_BASE_URL = process.env.ARISE_BASE_URL;
    const targetUrl = ARISE_BASE_URL ? `${ARISE_BASE_URL}/api/proposals/submit` : '';
    
    // Normalize payload for Arise (handles string payloads, various shapes)
    const { normalized, payloadWasString, isTestPayload } = normalizeProposalInput(req.body);
    
    // Add to request log with detailed note
    addRequestLog({
      ts: new Date().toISOString(),
      method: 'POST',
      path: '/api/proposals/submit',
      origin: origin === 'unknown' ? null : origin,
      referer: referer === 'none' ? null : referer,
      contentLength: contentLength === 'unknown' ? null : String(contentLength),
      note: `SUBMIT_HANDLER_ENTER | keys=[${receivedBodyKeys.join(',')}] | isTest=${isTestPayload}`,
    });
    
    console.log(`[HUNT SUBMIT] === POST /api/proposals/submit ===`);
    console.log(`[HUNT SUBMIT] correlationId: ${correlationId}`);
    console.log(`[HUNT SUBMIT] origin: ${origin}`);
    console.log(`[HUNT SUBMIT] referer: ${referer}`);
    console.log(`[HUNT SUBMIT] content-length: ${contentLength} bytes`);
    console.log(`[HUNT SUBMIT] received body keys: ${receivedBodyKeys.join(', ')}`);
    console.log(`[HUNT SUBMIT] payloadWasString: ${payloadWasString}`);
    console.log(`[HUNT SUBMIT] isTestPayload: ${isTestPayload}`);
    console.log(`[HUNT SUBMIT] normalized groupId: ${normalized.groupId}`);
    console.log(`[HUNT SUBMIT] normalized members.length: ${normalized.members.length}`);
    console.log(`[HUNT SUBMIT] targetUrl: ${targetUrl}`);
    
    // Create log entry immediately (received = true)
    const logEntry: SubmitLogEntry = {
      correlationId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      origin: String(origin),
      referer: String(referer),
      contentLength: String(contentLength),
      receivedBodyKeys,
      payloadWasString,
      isTestPayload,
      normalizedGroupId: normalized.groupId,
      normalizedMembersCount: normalized.members.length,
      targetUrl,
      received: true,
      forwarded: false,
      success: false,
    };
    
    // Add to log immediately so we see it even if something fails
    addSubmitLog(logEntry);
    
    if (!ARISE_BASE_URL) {
      const error = "ARISE_BASE_URL not configured";
      console.error(`[HUNT SUBMIT] ${error}`);
      logEntry.error = error;
      return res.status(502).json({
        correlationId,
        error,
        success: false,
      });
    }
    
    try {
      // Forward NORMALIZED payload to Arise
      const upstreamResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
        body: JSON.stringify(normalized),
      });
      
      const upstreamStatus = upstreamResponse.status;
      let upstreamBody: any;
      
      try {
        upstreamBody = await upstreamResponse.json();
      } catch {
        upstreamBody = { raw: await upstreamResponse.text() };
      }
      
      const upstreamBodyKeys = Object.keys(upstreamBody || {});
      
      console.log(`[HUNT SUBMIT] Upstream status: ${upstreamStatus}`);
      console.log(`[HUNT SUBMIT] Upstream body keys: ${upstreamBodyKeys.join(', ')}`);
      
      // Update log entry
      logEntry.forwarded = true;
      logEntry.upstreamStatus = upstreamStatus;
      logEntry.upstreamBodyKeys = upstreamBodyKeys;
      logEntry.success = upstreamStatus >= 200 && upstreamStatus < 300;
      
      // Pass-through upstream response
      res.status(upstreamStatus).json({
        correlationId,
        ...upstreamBody,
      });
    } catch (err: any) {
      const errorMsg = err.message || "Unknown error";
      console.error(`[HUNT SUBMIT] Error forwarding to Arise:`, err.stack || err);
      
      logEntry.error = errorMsg;
      
      res.status(502).json({
        correlationId,
        error: errorMsg,
        success: false,
      });
    }
  });

  // Debug endpoint - last N submit attempts
  app.get("/api/debug/submit-last", (req, res) => {
    const limit = Math.min(parseInt(req.query.limit as string) || 10, MAX_SUBMIT_LOGS);
    res.json({
      count: submitLogs.length,
      limit,
      logs: submitLogs.slice(0, limit),
    });
  });

  // Contracts
  app.get(api.contracts.list.path, async (req, res) => {
    const contracts = await storage.getContracts();
    res.json(contracts);
  });

  // KPIs (Mocked for backend structure compliance, though frontend uses local mocks)
  app.get(api.kpis.get.path, async (req, res) => {
    res.json({
      creditPortfolio: 120000,
      activeClients: 85,
      delinquencyRate: "4.8%",
    });
  });

  return httpServer;
}
