import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useProposalStore } from "@/lib/proposalStore";

interface Member {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
}

type CheckStatus = "pending" | "approved" | "denied";

interface MemberValidationState {
  memberId: number;
  checks: {
    bureau: CheckStatus;
    aml: CheckStatus;
    risk: CheckStatus;
  };
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ssn: "Social Security Number (SSN)",
  itin: "Individual Taxpayer Identification Number (ITIN)",
  dl_state_id: "US Driver’s License / State ID",
  passport: "Passport",
  foreign_id: "Foreign Government ID",
};

export default function CreditValidationScreen() {
  const [, setLocation] = useLocation();
  const { createProposalFromGroup, updateProposal } = useProposalStore();
  const [members, setMembers] = useState<Member[]>([]);
  const [validationStates, setValidationStates] = useState<Record<number, MemberValidationState>>({});
  const [proposalId, setProposalId] = useState<string | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("pending_proposal");
    if (storedData) {
      const proposalData = JSON.parse(storedData);
      setMembers(proposalData.members);
      if (proposalData.proposalId) {
        setProposalId(proposalData.proposalId);
      }
      
      // Initialize validation states
      const initialStates: Record<number, MemberValidationState> = {};
      proposalData.members.forEach((m: Member) => {
        initialStates[m.id] = {
          memberId: m.id,
          checks: {
            bureau: "pending",
            aml: "pending",
            risk: "pending",
          }
        };
      });
      setValidationStates(initialStates);

      // Simulate async validation
      proposalData.members.forEach((m: Member) => {
        // Bureau check
        setTimeout(() => {
          setValidationStates(prev => ({
            ...prev,
            [m.id]: {
              ...prev[m.id],
              checks: { ...prev[m.id].checks, bureau: "approved" }
            }
          }));
        }, 1500 + Math.random() * 1000);

        // AML check
        setTimeout(() => {
          setValidationStates(prev => ({
            ...prev,
            [m.id]: {
              ...prev[m.id],
              checks: { ...prev[m.id].checks, aml: "approved" }
            }
          }));
        }, 2500 + Math.random() * 1000);

        // Risk check (simulate some denials for demo purposes if name starts with 'D' or randomly)
        setTimeout(() => {
          const status: CheckStatus = (m.firstName.toLowerCase().startsWith('d') || Math.random() > 0.8) ? "denied" : "approved";
          setValidationStates(prev => ({
            ...prev,
            [m.id]: {
              ...prev[m.id],
              checks: { ...prev[m.id].checks, risk: status }
            }
          }));
        }, 3500 + Math.random() * 1000);
      });
    }
  }, []);

  const handleContinue = () => {
    const storedData = sessionStorage.getItem("pending_proposal");
    if (!storedData) return;
    
    const proposalData = JSON.parse(storedData);
    const group = {
      groupId: proposalData.groupId || `GRP-${Date.now()}`,
      leaderId: members[0].id,
      members: members
    };

    let currentProposalId = proposalId;

    if (!currentProposalId) {
      const newProposal = createProposalFromGroup(group);
      currentProposalId = String(newProposal.id);
      setProposalId(currentProposalId);
      // Update session storage so we know this flow has a proposal
      sessionStorage.setItem("pending_proposal", JSON.stringify({
        ...proposalData,
        proposalId: currentProposalId,
        groupId: group.groupId
      }));
    } else {
      updateProposal(currentProposalId, (prev) => ({
        ...prev,
        data: { ...prev.data, group: group }
      }));
    }

    setLocation(`/product-config/${currentProposalId}`);
  };

  const formatCurrency = (val: string) => {
    const digits = val.replace(/\D/g, "");
    const num = (parseInt(digits) || 0) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const handleRemoveMember = (id: number) => {
    if (window.confirm("Are you sure you want to remove this member from the proposal?")) {
      const newMembers = members.filter(m => m.id !== id);
      setMembers(newMembers);
      
      // Update session storage
      const storedData = sessionStorage.getItem("pending_proposal");
      if (storedData) {
        const proposalData = JSON.parse(storedData);
        proposalData.members = newMembers;
        sessionStorage.setItem("pending_proposal", JSON.stringify(proposalData));
      }

      if (newMembers.length === 0) {
        sessionStorage.removeItem("pending_proposal");
        setLocation("/");
      }
    }
  };

  const hasMembers = members.length > 0;
  const hasDenied = members.some(m => {
    const state = validationStates[m.id];
    return state && Object.values(state.checks).some(s => s === "denied");
  });
  const hasPending = members.some(m => {
    const state = validationStates[m.id];
    return !state || Object.values(state.checks).some(s => s === "pending");
  });
  const canContinue = hasMembers && !hasDenied && !hasPending;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/new-proposal">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Credit Validation</h1>
            <p className="text-slate-500">Reviewing internal and external rules before approval.</p>
          </div>
        </div>

        <div className="space-y-6">
          {members.map((member, index) => {
            const state = validationStates[member.id];
            if (!state) return null;

            const isAnyDenied = Object.values(state.checks).some(s => s === "denied");
            const isAllApproved = Object.values(state.checks).every(s => s === "approved");
            const isPending = !isAnyDenied && !isAllApproved;

            let statusTitle = "Validation in Progress";
            let statusSubtext = "Automated rules engine is processing this member.";
            let StatusIcon = Clock;
            let iconColor = "text-yellow-500";

            if (isAnyDenied) {
              statusTitle = "Validation Denied";
              statusSubtext = "This member did not meet one or more risk criteria.";
              StatusIcon = XCircle;
              iconColor = "text-red-500";
            } else if (isAllApproved) {
              statusTitle = "Validation Approved";
              statusSubtext = "All checks have been approved for this member.";
              StatusIcon = CheckCircle2;
              iconColor = "text-green-500";
            }

            return (
              <Card key={member.id} className="border-none shadow-lg bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-primary/5 px-6 py-3 border-b border-primary/10 flex justify-between items-center">
                  <h3 className="font-bold text-primary flex items-center gap-2">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">
                      {index + 1}
                    </span>
                    {member.firstName} {member.middleName} {member.lastName}
                  </h3>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono font-bold text-slate-600">
                      {formatCurrency(member.requestedAmount)}
                    </span>
                    {isAnyDenied && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove member
                      </Button>
                    )}
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="text-sm">
                        <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">ID Document</p>
                        <p className="font-semibold text-slate-900">{DOCUMENT_TYPE_LABELS[member.documentType] || member.documentType}</p>
                        <p className="text-slate-600">{member.documentNumber}</p>
                      </div>
                      
                      <div className="pt-4 space-y-3">
                        <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest">Validation Checks</h4>
                        <CheckItem label="Credit bureau checks" status={state.checks.bureau} />
                        <CheckItem label="AML / anti-money-laundering screening" status={state.checks.aml} />
                        <CheckItem label="Internal risk criteria" status={state.checks.risk} />
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3 border border-slate-100">
                      <StatusIcon className={cn("w-8 h-8", iconColor, isPending && "animate-pulse")} />
                      <div>
                        <p className="font-bold text-slate-900">{statusTitle}</p>
                        <p className="text-xs text-slate-500">{statusSubtext}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex gap-4">
          <Link href="/new-proposal" className="flex-1">
            <Button variant="outline" className="w-full h-12">Edit Proposal</Button>
          </Link>
          <Button 
            className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
            disabled={!canContinue}
            onClick={handleContinue}
          >
            Continue to Product Config
          </Button>
        </div>
      </main>
    </div>
  );
}

function CheckItem({ label, status }: { label: string; status: CheckStatus }) {
  let statusText = status;
  let StatusIcon = Clock;
  let iconColor = "text-yellow-500";
  let description = "";

  if (status === "approved") {
    statusText = "approved";
    StatusIcon = CheckCircle2;
    iconColor = "text-green-500";
  } else if (status === "denied") {
    statusText = "denied";
    StatusIcon = AlertCircle;
    iconColor = "text-red-500";
    description = label === "Internal risk criteria" 
      ? " – does not meet internal risk criteria" 
      : " – credit bureau rules not met";
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-700">
        {label}
        {status === "denied" && <span className="text-[10px] text-red-500 font-medium block">{description}</span>}
      </span>
      <div className="flex items-center gap-2">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider",
          status === 'approved' && "text-green-600",
          status === 'denied' && "text-red-600",
          status === 'pending' && "text-yellow-600"
        )}>
          {statusText}
        </span>
        <StatusIcon className={cn("w-4 h-4", iconColor)} />
      </div>
    </div>
  );
}
