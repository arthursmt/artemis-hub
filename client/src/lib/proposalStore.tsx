import React, { createContext, useContext, useState, useEffect } from "react";
import { Proposal, ProposalStatus } from "@shared/schema";

export interface Member {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
  countryOfOrigin?: string;
  birthDate?: string;
  homeAddress1?: string;
  homeAddress2?: string;
  state?: string;
  city?: string;
  zipCode?: string;
  contact1Type?: string;
  contact1Number?: string;
  contact2Type?: string;
  contact2Number?: string;
  contact3Type?: string;
  contact3Number?: string;
  referenceName1?: string;
  referenceNumber1?: string;
  referenceName2?: string;
  referenceNumber2?: string;
}

export interface Group {
  groupId: string;
  leaderId: number;
  members: Member[];
}

export interface LoanDetails {
  loanValue: string;
  loanType: string;
  interestRateApr: number;
  installments: number | null;
  firstPaymentDate: string;
  gracePeriodDays: number;
  loanGoal: string;
  otherGoal: string;
  borrowersInsurance: boolean;
  optionalInsurance1: string;
  optionalInsurance2: string;
  optionalInsurance3: string;
}

export interface ProposalData {
  group: Group;
  loanDetailsByMember?: Record<number, LoanDetails>;
  [key: string]: any;
}

export interface ProposalWithData extends Omit<Proposal, "amount" | "status"> {
  amount: string;
  status: string;
  data: ProposalData;
  totalAmount: number;
  dateCreated: string;
  leaderName: string;
  groupId: string;
}

interface ProposalContextType {
  proposals: ProposalWithData[];
  createProposalFromGroup: (group: Group) => ProposalWithData;
  updateProposal: (proposalId: string, updater: (p: ProposalWithData) => ProposalWithData) => void;
  getProposalById: (id: string) => ProposalWithData | undefined;
  deleteProposal: (id: string) => void;
}

const ProposalContext = createContext<ProposalContextType | undefined>(undefined);

export const ProposalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [proposals, setProposals] = useState<ProposalWithData[]>(() => {
    const saved = localStorage.getItem("artemis_proposals");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("artemis_proposals", JSON.stringify(proposals));
  }, [proposals]);

  const createProposalFromGroup = (group: Group) => {
    const id = Date.now().toString();
    const leader = group.members.find(m => m.id === group.leaderId) || group.members[0];
    const totalAmount = group.members.reduce((sum, m) => {
      const digits = String(m.requestedAmount).replace(/\D/g, "");
      return sum + (parseInt(digits) || 0) / 100;
    }, 0);

    const newProposal: ProposalWithData = {
      id: id as any,
      groupId: group.groupId,
      clientName: `${leader.firstName} ${leader.lastName}`,
      leaderName: `${leader.firstName} ${leader.lastName}`,
      amount: totalAmount.toString(),
      totalAmount: totalAmount,
      status: "on_going",
      dateCreated: new Date().toISOString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {
        group: group
      }
    };

    setProposals(prev => [...prev, newProposal]);
    return newProposal;
  };

  const updateProposal = (proposalId: string, updater: (p: ProposalWithData) => ProposalWithData) => {
    setProposals(prev => prev.map(p => String(p.id) === String(proposalId) ? updater(p) : p));
  };

  const getProposalById = (id: string) => {
    return proposals.find(p => String(p.id) === String(id));
  };

  const deleteProposal = (id: string) => {
    setProposals(prev => prev.filter(p => String(p.id) !== String(id)));
  };

  return (
    <ProposalContext.Provider value={{ proposals, createProposalFromGroup, updateProposal, getProposalById, deleteProposal }}>
      {children}
    </ProposalContext.Provider>
  );
};

export const useProposalStore = () => {
  const context = useContext(ProposalContext);
  if (!context) {
    throw new Error("useProposalStore must be used within a ProposalProvider");
  }
  return context;
};
