// Submit proposal to Hub's API endpoint
import { getSubmitUrl, isEmbeddedMode, getEmbeddedConfig } from "./embeddedMode";
import type { ProposalWithData } from "./proposalStore";

interface SubmitPayload {
  proposalId: string;
  payload: {
    groupId: string;
    members: Array<{
      memberId: string;
      name: string;
      firstName: string;
      lastName: string;
      loanAmount: number;
      role: string;
    }>;
    leaderName: string;
    clientName: string;
    totalAmount: number;
    submittedAt: string;
    loanDetailsByMember?: Record<number, any>;
  };
}

export interface SubmitResult {
  success: boolean;
  proposalId?: string;
  stage?: string;
  error?: string;
  correlationId?: string;
}

export async function submitProposalToHub(proposal: ProposalWithData): Promise<SubmitResult> {
  const url = getSubmitUrl();
  const config = getEmbeddedConfig();
  
  // Build properly normalized payload
  const members = proposal.data.group.members.map((m, idx) => {
    const amountStr = String(m.requestedAmount || "0").replace(/[^\d.-]/g, "");
    const loanAmount = parseFloat(amountStr) || 0;
    
    return {
      memberId: String(m.id),
      name: `${m.firstName || ""} ${m.lastName || ""}`.trim() || "Unknown",
      firstName: m.firstName || "Unknown",
      lastName: m.lastName || "",
      loanAmount: loanAmount > 100 ? loanAmount : loanAmount * 100, // Handle cents vs dollars
      role: m.id === proposal.data.group.leaderId ? "LEADER" : "MEMBER",
    };
  });
  
  const leader = proposal.data.group.members.find(m => m.id === proposal.data.group.leaderId) 
    || proposal.data.group.members[0];
  const leaderName = leader 
    ? `${leader.firstName || ""} ${leader.lastName || ""}`.trim() 
    : proposal.leaderName || "Unknown";
  
  const body: SubmitPayload = {
    proposalId: String(proposal.id),
    payload: {
      groupId: proposal.groupId || proposal.data.group.groupId || `GRP-${proposal.id}`,
      members,
      leaderName,
      clientName: proposal.clientName || leaderName,
      totalAmount: proposal.totalAmount || 0,
      submittedAt: new Date().toISOString(),
      loanDetailsByMember: proposal.data.loanDetailsByMember,
    },
  };
  
  // Debug logging
  const bodyJson = JSON.stringify(body);
  const payloadType = typeof body.payload;
  console.log("[SUBMIT] url=", url);
  console.log("[SUBMIT] bytes=", bodyJson.length);
  console.log("[SUBMIT] keys=", Object.keys(body));
  console.log("[SUBMIT] payload type=", payloadType);
  console.log("[SUBMIT] isEmbedded=", config.isEmbedded);
  console.log("[SUBMIT] apiBase=", config.apiBase);
  
  try {
    const correlationId = `hunt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Correlation-Id": correlationId,
      },
      body: bodyJson,
    });
    
    const result = await response.json();
    
    console.log("[SUBMIT] response status=", response.status);
    console.log("[SUBMIT] response body=", result);
    
    if (response.ok && result.success) {
      return {
        success: true,
        proposalId: result.proposalId,
        stage: result.stage,
        correlationId: result.correlationId || correlationId,
      };
    } else {
      return {
        success: false,
        error: result.error || result.message || `HTTP ${response.status}`,
        correlationId: result.correlationId || correlationId,
      };
    }
  } catch (err) {
    console.error("[SUBMIT] fetch error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error",
    };
  }
}
