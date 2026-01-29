
import type { Express } from "express";
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
  bodyKeys: string[];
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

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  // Helper to set CORS headers on response
  function setCorsHeaders(res: any, origin: string | undefined) {
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-Correlation-Id");
      res.setHeader("Access-Control-Expose-Headers", "X-Correlation-Id");
      res.setHeader("Access-Control-Max-Age", "86400");
    }
  }

  // Explicit OPTIONS handler for /api/proposals/submit
  app.options("/api/proposals/submit", (req, res) => {
    const origin = req.headers.origin;
    const referer = req.headers.referer || 'none';
    
    console.log(`[SUBMIT OPTIONS] === OPTIONS /api/proposals/submit ===`);
    console.log(`[SUBMIT OPTIONS] origin: ${origin}`);
    console.log(`[SUBMIT OPTIONS] referer: ${referer}`);
    
    setCorsHeaders(res, origin);
    res.status(204).end();
  });

  // Proposal submit endpoint - forwards to Arise
  app.post("/api/proposals/submit", async (req, res) => {
    const correlationId = randomUUID();
    const origin = req.headers.origin || 'unknown';
    const referer = req.headers.referer || 'none';
    const contentLength = req.headers['content-length'] || 'unknown';
    const bodyKeys = Object.keys(req.body || {});
    const ARISE_BASE_URL = process.env.ARISE_BASE_URL;
    const targetUrl = ARISE_BASE_URL ? `${ARISE_BASE_URL}/api/proposals/submit` : '';
    
    console.log(`[HUNT SUBMIT] === POST /api/proposals/submit ===`);
    console.log(`[HUNT SUBMIT] correlationId: ${correlationId}`);
    console.log(`[HUNT SUBMIT] origin: ${origin}`);
    console.log(`[HUNT SUBMIT] referer: ${referer}`);
    console.log(`[HUNT SUBMIT] content-length: ${contentLength} bytes`);
    console.log(`[HUNT SUBMIT] body keys: ${bodyKeys.join(', ')}`);
    console.log(`[HUNT SUBMIT] targetUrl: ${targetUrl}`);
    
    // Set CORS headers immediately (before any early returns)
    setCorsHeaders(res, req.headers.origin);
    
    // Create log entry immediately (received = true)
    const logEntry: SubmitLogEntry = {
      correlationId,
      timestamp: new Date().toISOString(),
      method: 'POST',
      origin: String(origin),
      referer: String(referer),
      contentLength: String(contentLength),
      bodyKeys,
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
      const upstreamResponse = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-Id': correlationId,
        },
        body: JSON.stringify(req.body),
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
