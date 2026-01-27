import { z } from "zod";

/**
 * Workflow enums (source of truth)
 */
export const ProposalStage = {
  DOC_REVIEW: "DOC_REVIEW",
  RISK_REVIEW: "RISK_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CHANGES_REQUESTED: "CHANGES_REQUESTED",
} as const;

export type ProposalStageType = typeof ProposalStage[keyof typeof ProposalStage];

export const DecisionType = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
  FINAL_REJECT: "FINAL_REJECT",
} as const;

export type DecisionTypeType = typeof DecisionType[keyof typeof DecisionType];

/**
 * Member (group loan) — array of objects, each with stable memberId.
 */
export const memberSchema = z.object({
  memberId: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  idNumber: z.string().optional(),
  loanAmount: z.number(),
  evidencePhotos: z.array(z.string()).optional(),
  signature: z.string().optional(),
});

export type Member = z.infer<typeof memberSchema>;

/**
 * Proposal payload (Hunt -> Arise)
 */
export const proposalPayloadSchema = z.object({
  groupId: z.string(),
  groupName: z.string(),
  leaderName: z.string(),
  leaderPhone: z.string().optional(),
  members: z.array(memberSchema),
  totalAmount: z.number(),
  contractText: z.string().optional(),
  evidencePhotos: z.array(z.string()).optional(),
  formData: z.record(z.string(), z.any()).optional(),

});

export type ProposalPayload = z.infer<typeof proposalPayloadSchema>;

/**
 * Gate decision request (Gate -> Arise)
 */
export const insertDecisionSchema = z.object({
  stage: z.enum([ProposalStage.DOC_REVIEW, ProposalStage.RISK_REVIEW]),
  decision: z.enum([DecisionType.APPROVE, DecisionType.REJECT]),
  reasons: z.array(z.string()),
  comment: z.string().optional(),
  userId: z.string(),
});

export type InsertDecision = z.infer<typeof insertDecisionSchema>;
