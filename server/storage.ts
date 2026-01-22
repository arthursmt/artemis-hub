
import { db } from "./db";
import {
  proposals,
  contracts,
  type InsertProposal,
  type InsertContract,
  type Proposal,
  type Contract
} from "@shared/schema";

export interface IStorage {
  getProposals(): Promise<Proposal[]>;
  createProposal(proposal: InsertProposal): Promise<Proposal>;
  getContracts(): Promise<Contract[]>;
}

export class DatabaseStorage implements IStorage {
  async getProposals(): Promise<Proposal[]> {
    return await db.select().from(proposals);
  }

  async createProposal(proposal: InsertProposal): Promise<Proposal> {
    const [newProposal] = await db
      .insert(proposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async getContracts(): Promise<Contract[]> {
    return await db.select().from(contracts);
  }
}

export const storage = new DatabaseStorage();
