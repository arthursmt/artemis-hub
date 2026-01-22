
import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === PROPOSALS ===
export const proposals = pgTable("proposals", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(), // 'on_going', 'under_evaluation', 'completed'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProposalSchema = createInsertSchema(proposals).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = z.infer<typeof insertProposalSchema>;

// === CONTRACTS ===
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  amount: numeric("amount").notNull(),
  status: text("status").notNull(), // 'active', 'renewal_due', 'delinquent'
  maturityDate: timestamp("maturity_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContractSchema = createInsertSchema(contracts).omit({ 
  id: true, 
  createdAt: true 
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

// === TYPES ===
export type ProposalStatus = 'on_going' | 'under_evaluation' | 'completed';
export type ContractStatus = 'active' | 'renewal_due' | 'delinquent';
