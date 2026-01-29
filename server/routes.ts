
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
  originalBodyKeys: string[];
  normalizedBodyKeys: string[];
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
  members: Array<{ memberId: string; fullName: string; role: string }>;
  leaderName: string;
  clientName: string;
  totalAmount: number;
  submittedAt: string;
  [key: string]: any;
}

function normalizeForArise(body: any): NormalizedPayload {
  // Unwrap if wrapped in payload
  let raw = body;
  if (body && typeof body.payload === 'object' && body.payload !== null) {
    raw = body.payload;
  }
  
  // Determine proposalId
  const proposalId = body.proposalId || raw.proposalId || raw.id || String(Date.now());
  
  // Determine groupId
  const groupId = raw.groupId || body.groupId || `GRP-${proposalId}`;
  
  // Determine leaderName / clientName
  const leaderName = raw.leaderName || raw.clientName || raw.fullName || "Unknown Leader";
  
  // Determine loan amount
  const loanAmount = raw.loanAmount || raw.requestedAmount || raw.totalAmount || raw.amount || 10000;
  
  // Determine members - Arise requires: name (or firstName+lastName), loanAmount (or requestedAmount)
  let members: Array<any>;
  if (Array.isArray(raw.members) && raw.members.length > 0) {
    // Ensure each member has required fields
    members = raw.members.map((m: any, idx: number) => ({
      memberId: m.memberId || m.id || `M${idx + 1}`,
      name: m.name || m.fullName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || leaderName,
      firstName: m.firstName || (m.name || leaderName).split(' ')[0],
      lastName: m.lastName || (m.name || leaderName).split(' ').slice(1).join(' ') || '',
      loanAmount: m.loanAmount || m.requestedAmount || loanAmount,
      role: m.role || (idx === 0 ? "LEADER" : "MEMBER"),
    }));
  } else {
    // Create default member with required fields
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
  
  // Build normalized payload
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
  
  return normalized;
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
    const originalBodyKeys = Object.keys(req.body || {});
    const ARISE_BASE_URL = process.env.ARISE_BASE_URL;
    const targetUrl = ARISE_BASE_URL ? `${ARISE_BASE_URL}/api/proposals/submit` : '';
    
    // Normalize payload for Arise
    const normalized = normalizeForArise(req.body);
    const normalizedBodyKeys = Object.keys(normalized);
    
    console.log(`[HUNT SUBMIT] === POST /api/proposals/submit ===`);
    console.log(`[HUNT SUBMIT] correlationId: ${correlationId}`);
    console.log(`[HUNT SUBMIT] origin: ${origin}`);
    console.log(`[HUNT SUBMIT] referer: ${referer}`);
    console.log(`[HUNT SUBMIT] content-length: ${contentLength} bytes`);
    console.log(`[HUNT SUBMIT] original body keys: ${originalBodyKeys.join(', ')}`);
    console.log(`[HUNT SUBMIT] normalized keys: ${normalizedBodyKeys.join(', ')}`);
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
      originalBodyKeys,
      normalizedBodyKeys,
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
