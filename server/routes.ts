
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

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

  // Proposal submit endpoint with diagnostic logging
  app.post("/api/proposals/submit", async (req, res) => {
    const contentLength = req.headers['content-length'] || 'unknown';
    console.log(`[HUNT SUBMIT] Received request - Content-Length: ${contentLength} bytes`);
    console.log(`[HUNT SUBMIT] Body keys: ${Object.keys(req.body || {}).join(', ')}`);
    
    try {
      // For now, just acknowledge receipt - actual Arise integration would go here
      const bodySize = JSON.stringify(req.body).length;
      console.log(`[HUNT SUBMIT] Parsed body size: ${bodySize} bytes`);
      
      res.status(201).json({
        success: true,
        message: "Proposal submitted successfully",
        receivedBytes: contentLength,
        parsedBytes: bodySize,
      });
    } catch (err: any) {
      console.error(`[HUNT SUBMIT] Error:`, err);
      res.status(500).json({
        success: false,
        message: err.message || "Internal server error",
      });
    }
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
