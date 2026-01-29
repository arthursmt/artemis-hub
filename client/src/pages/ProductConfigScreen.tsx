import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, X, Star, Save, Info, Send, Loader2 } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useProposalStore, Group, Member, LoanDetails } from "@/lib/proposalStore";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitProposalToHub } from "@/lib/submitProposal";
import { isEmbeddedMode } from "@/lib/embeddedMode";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const parseCurrency = (value: string): number => {
  const digits = value.replace(/[^\d.]/g, "");
  const amount = parseFloat(digits);
  return isNaN(amount) ? 0 : amount;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDateInput = (d: Date) => d.toISOString().slice(0, 10);

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

const createEmptyLoanDetails = (): LoanDetails => ({
  loanValue: "",
  loanType: "Working capital",
  interestRateApr: 14,
  installments: null,
  firstPaymentDate: "",
  gracePeriodDays: 0,
  loanGoal: "",
  otherGoal: "",
  borrowersInsurance: true,
  optionalInsurance1: "None",
  optionalInsurance2: "None",
  optionalInsurance3: "None",
});

const INSURANCE_PRICES: Record<string, number> = {
  "Work Loss Insurance": 20,
  "Health Premium": 40,
  "Income Insurance": 30,
};

const INSURANCE_DESCRIPTIONS: Record<string, string> = {
  "Work Loss Insurance": "Helps cover your loan payments if you lose your job.",
  "Health Premium": "Provides extra protection in case of major medical events.",
  "Income Insurance": "Protects your monthly income against unexpected shocks.",
};

export default function ProductConfigScreen() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const { toast } = useToast();
  const { updateProposal, getProposalById } = useProposalStore();
  const [group, setGroup] = useState<Group | null>(null);
  const [activeMemberId, setActiveMemberId] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"loan" | "personal" | "business" | "financials">("loan");

  const [loanDetailsByMember, setLoanDetailsByMember] = useState<Record<number, LoanDetails>>({});
  const [loanErrorsByMember, setLoanErrorsByMember] = useState<Record<number, Partial<Record<keyof LoanDetails, string>>>>({});

  const proposalId = params.id;
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 60);

  useEffect(() => {
    if (!proposalId) return;
    const proposal = getProposalById(proposalId);
    if (proposal) {
      const loadedGroup = proposal.data.group;
      setGroup(loadedGroup);
      const initialActiveId = loadedGroup.leaderId || loadedGroup.members[0]?.id;
      setActiveMemberId(initialActiveId);
      
      if (proposal.data.loanDetailsByMember) {
        setLoanDetailsByMember(proposal.data.loanDetailsByMember);
      } else {
        setLoanDetailsByMember({});
      }
    }
  }, [proposalId, getProposalById]);

  useEffect(() => {
    if (!group || activeMemberId === null) return;
    const member = group.members.find(m => m.id === activeMemberId);
    if (member) {
      setLoanDetailsByMember(prev => {
        if (prev[activeMemberId]?.loanValue) return prev;
        const requested = parseCurrency(member.requestedAmount);
        return {
          ...prev,
          [activeMemberId]: {
            ...(prev[activeMemberId] || createEmptyLoanDetails()),
            loanValue: formatCurrency(requested),
          }
        };
      });
    }
  }, [group, activeMemberId]);

  const activeMember = group?.members.find(m => m.id === activeMemberId) || group?.members[0];
  const activeLoanDetails = activeMemberId !== null ? (loanDetailsByMember[activeMemberId] || createEmptyLoanDetails()) : createEmptyLoanDetails();
  const activeErrors = activeMemberId !== null ? (loanErrorsByMember[activeMemberId] || {}) : {};

  useEffect(() => {
    if (!activeMemberId || !activeLoanDetails.firstPaymentDate) return;
    const selected = new Date(activeLoanDetails.firstPaymentDate + "T00:00:00");
    const diffMs = selected.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    
    setLoanDetailsByMember(prev => {
      if (prev[activeMemberId]?.gracePeriodDays === diffDays) return prev;
      return {
        ...prev,
        [activeMemberId]: {
          ...prev[activeMemberId],
          gracePeriodDays: diffDays,
        }
      };
    });
  }, [activeLoanDetails.firstPaymentDate, activeMemberId]);

  const handleLoanFieldChange = (field: keyof LoanDetails, value: any) => {
    if (!group || activeMemberId === null) return;

    setLoanDetailsByMember(prev => {
      const base = prev[activeMemberId] ?? createEmptyLoanDetails();
      let next = { ...base, [field]: value };

      if (field === "loanGoal" && value !== "Other") {
        next.otherGoal = "";
      }

      if (field === "optionalInsurance1" && value === "None") {
        next.optionalInsurance2 = "None";
        next.optionalInsurance3 = "None";
      }
      if (field === "optionalInsurance2" && value === "None") {
        next.optionalInsurance3 = "None";
      }

      return { ...prev, [activeMemberId]: next };
    });

    setLoanErrorsByMember(prev => ({
      ...prev,
      [activeMemberId]: { ...prev[activeMemberId], [field]: undefined }
    }));
  };

  const handlePersonalFieldChange = (field: keyof Member, value: string) => {
    if (!group || !activeMember) return;

    const updatedMembers = group.members.map(member =>
      member.id === activeMember.id
        ? { ...member, [field]: value }
        : member
    );

    const newGroup = { ...group, members: updatedMembers };
    setGroup(newGroup);
    
    if (proposalId) {
      updateProposal(proposalId, prev => ({
        ...prev,
        data: {
          ...prev.data,
          group: newGroup
        }
      }));
    }
  };

  const handleAddMember = () => {
    if (!group) return;
    if (group.members.length >= 5) {
      window.alert("A group can have at most 5 members.");
      return;
    }

    const newMemberId = Date.now();
    const newMember: Member = {
      id: newMemberId,
      firstName: "",
      middleName: "",
      lastName: "",
      documentType: "ssn",
      documentNumber: "",
      requestedAmount: "0",
      countryOfOrigin: "",
      birthDate: "",
      homeAddress1: "",
      homeAddress2: "",
      state: "",
      city: "",
      zipCode: "",
      contact1Type: "Mobile",
      contact1Number: "",
      contact2Type: "",
      contact2Number: "",
      contact3Type: "",
      contact3Number: "",
      referenceName1: "",
      referenceNumber1: "",
      referenceName2: "",
      referenceNumber2: "",
    };

    const newGroup = { ...group, members: [...group.members, newMember] };
    setGroup(newGroup);
    setActiveMemberId(newMemberId);
    
    if (proposalId) {
      updateProposal(proposalId, prev => ({
        ...prev,
        data: {
          ...prev.data,
          group: newGroup
        }
      }));
    }
  };

  const handleRemoveMember = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!group) return;
    if (!window.confirm("Are you sure you want to remove this member? All data for this client will be lost.")) {
      return;
    }

    const updatedMembers = group.members.filter(m => m.id !== id);
    const newGroup = { ...group, members: updatedMembers };
    
    setGroup(newGroup);
    
    setLoanDetailsByMember(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (activeMemberId === id) {
      const idx = group.members.findIndex(m => m.id === id);
      const nextMember = updatedMembers[idx] || updatedMembers[idx - 1] || updatedMembers[0];
      setActiveMemberId(nextMember?.id || null);
    }

    if (proposalId) {
      updateProposal(proposalId, prev => ({
        ...prev,
        data: {
          ...prev.data,
          group: newGroup,
          loanDetailsByMember: (() => {
            const next = { ...prev.data.loanDetailsByMember };
            delete next[id];
            return next;
          })()
        }
      }));
    }
  };

  const adjustLoanValue = (delta: number) => {
    const current = parseCurrency(activeLoanDetails.loanValue || "0");
    let next = current + delta;
    if (next < 500) next = 500;
    if (next > 50000) next = 50000;
    
    handleLoanFieldChange("loanValue", formatCurrency(next));
    validateField("loanValue", formatCurrency(next));
  };

  const validateField = (field: keyof LoanDetails, value: string) => {
    if (!activeMemberId) return;
    let error: string | undefined = undefined;

    if (field === "loanValue") {
      const amount = parseCurrency(value);
      if (amount < 500 || amount > 50000) {
        error = "Loan value must be between $500 and $50,000";
      }
    } else if (field === "firstPaymentDate") {
      if (value) {
        const selected = new Date(value + "T00:00:00");
        const day = selected.getDate();
        const diffMs = selected.getTime() - today.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > 60 || day > 15) {
          error = "First payment date must be within 60 days and on or before the 15th of the month.";
        }
      }
    }

    setLoanErrorsByMember(prev => ({
      ...prev,
      [activeMemberId]: { ...prev[activeMemberId], [field]: error }
    }));
  };

  const principalAmount = parseCurrency(activeLoanDetails.loanValue);
  const annualRate = 0.14;
  const monthlyRate = annualRate / 12;
  const n = activeLoanDetails.installments ?? 0;

  const monthlyLoanPayment = useMemo(() => {
    if (principalAmount > 0 && n > 0 && !activeErrors.loanValue) {
      return (principalAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
             (Math.pow(1 + monthlyRate, n) - 1);
    }
    return 0;
  }, [principalAmount, n, monthlyRate, activeErrors.loanValue]);

  const lifeInsuranceTotal = activeLoanDetails.borrowersInsurance ? principalAmount * 0.02 : 0;
  const lifeInsuranceMonthly = (activeLoanDetails.borrowersInsurance && n > 0) ? (lifeInsuranceTotal / n) : 0;

  const optionalInsuranceMonthly = useMemo(() => {
    let total = 0;
    [activeLoanDetails.optionalInsurance1, activeLoanDetails.optionalInsurance2, activeLoanDetails.optionalInsurance3].forEach(ins => {
      if (ins !== "None") {
        const key = Object.keys(INSURANCE_PRICES).find(k => ins.startsWith(k));
        if (key) total += INSURANCE_PRICES[key];
      }
    });
    return total;
  }, [activeLoanDetails.optionalInsurance1, activeLoanDetails.optionalInsurance2, activeLoanDetails.optionalInsurance3]);

  const totalMonthlyInsurances = lifeInsuranceMonthly + optionalInsuranceMonthly;
  const totalMonthlyPayment = monthlyLoanPayment + totalMonthlyInsurances;

  const persistLoanDetails = () => {
    if (!proposalId) return;
    updateProposal(proposalId, prev => ({
      ...prev,
      data: {
        ...prev.data,
        loanDetailsByMember,
      },
    }));
  };

  const validate = () => {
    if (!activeMemberId) return false;
    if (activeSection !== "loan") return true; 
    
    const errors: any = {};
    const amount = parseCurrency(activeLoanDetails.loanValue);

    if (!activeLoanDetails.loanValue) errors.loanValue = "This field is required";
    else if (amount < 500 || amount > 50000) errors.loanValue = "Loan value must be between $500 and $50,000";

    if (!activeLoanDetails.loanType) errors.loanType = "This field is required";
    if (!activeLoanDetails.installments) errors.installments = "This field is required";
    
    if (!activeLoanDetails.firstPaymentDate) {
      errors.firstPaymentDate = "This field is required";
    } else {
      const selected = new Date(activeLoanDetails.firstPaymentDate + "T00:00:00");
      const day = selected.getDate();
      const diffMs = selected.getTime() - today.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0 || diffDays > 60 || day > 15) {
        errors.firstPaymentDate = "First payment date must be within 60 days and on or before the 15th of the month.";
      }
    }

    if (!activeLoanDetails.loanGoal) errors.loanGoal = "This field is required";

    setLoanErrorsByMember(prev => ({ ...prev, [activeMemberId]: errors }));
    return Object.keys(errors).length === 0;
  };

  const handleSaveExit = () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors.",
        variant: "destructive",
      });
      return;
    }
    persistLoanDetails();
    toast({
      title: "Proposal Saved",
      description: "You can resume this proposal later from the dashboard.",
    });
    setLocation("/");
  };

  const handleBackToHome = () => {
    const confirmed = window.confirm("Do you want to go back to the dashboard? Your latest changes will be saved.");
    if (!confirmed) return;
    persistLoanDetails();
    setLocation("/");
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleConfirmSubmit = async () => {
    if (!validate()) {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    if (!proposalId) {
      toast({
        title: "Error",
        description: "No proposal ID found.",
        variant: "destructive",
      });
      return;
    }
    
    persistLoanDetails();
    
    const proposal = getProposalById(proposalId);
    if (!proposal) {
      toast({
        title: "Error",
        description: "Could not find proposal data.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await submitProposalToHub(proposal);
      
      if (result.success) {
        toast({
          title: "Proposal Submitted",
          description: `Proposal submitted successfully. Stage: ${result.stage || "pending"}`,
        });
        
        updateProposal(proposalId, prev => ({
          ...prev,
          status: "under_evaluation",
        }));
        
        setLocation("/dashboard");
      } else {
        toast({
          title: "Submission Failed",
          description: result.error || "Unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Submission Error",
        description: err instanceof Error ? err.message : "Network error",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-center font-display">
        <Card className="max-w-md w-full border-none shadow-xl">
          <CardContent className="p-8 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">No Active Proposal</h2>
            <Link href="/new-proposal">
              <Button className="w-full bg-primary text-white">Start New Proposal</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-display">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-display font-bold text-slate-900 tracking-tight text-xl">ARTEMIS <span className="text-primary">HUNTING</span></span>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <h1 className="text-lg font-semibold text-slate-900 font-display">Product Configuration</h1>
          </div>
          <Button onClick={handleSaveExit} variant="outline" size="sm" className="gap-2">
            <Save className="w-4 h-4" /> Save & Exit
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Group ID</p>
              <p className="font-mono font-medium">{group.groupId}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Leader</p>
              <div className="flex items-center gap-2">
                <Star className="w-3 h-3 text-secondary fill-secondary" />
                <p className="font-semibold text-sm">
                  {group.members.find(m => m.id === group.leaderId)?.firstName || "Member"} {group.members.find(m => m.id === group.leaderId)?.lastName || ""}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400 font-bold mb-1 tracking-widest">Base Rate</p>
              <p className="font-semibold text-sm">14% APR (fixed)</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-slate-200 pb-0">
          {group.members.map((member, index) => (
            <div
              key={member.id}
              onClick={() => setActiveMemberId(member.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-t-xl cursor-pointer transition-all border-b-2 font-semibold text-sm relative group",
                activeMemberId === member.id ? "bg-white text-primary border-primary shadow-sm" : "text-slate-500 border-transparent hover:bg-slate-100/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="opacity-50">{index + 1}.</span>
                <span>{(member.firstName || member.lastName) ? `${member.firstName} ${member.lastName}` : `Member ${index + 1}`}</span>
                {member.id === group.leaderId && <Star className="w-3 h-3 text-secondary fill-secondary" />}
              </div>
              <button 
                onClick={(e) => handleRemoveMember(member.id, e)}
                className="ml-2 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {group.members.length < 5 && (
            <button
              onClick={handleAddMember}
              className="p-3 text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
              title="Add new member"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Add Member</span>
            </button>
          )}
          {group.members.length >= 5 && (
            <div className="p-3 text-slate-300 flex items-center gap-2 cursor-not-allowed" title="Maximum of 5 members per group">
              <Plus className="w-5 h-5" />
              <span className="text-sm font-semibold">Limit Reached</span>
            </div>
          )}
        </div>

        <div className="mb-4 border-b border-slate-200 flex gap-4">
          {[
            { id: "loan", label: "Loan Details" },
            { id: "personal", label: "Personal Data" },
            { id: "business", label: "Business Data" },
            { id: "financials", label: "Financials (P&L)" }
          ].map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={cn(
                "px-4 py-2 text-sm font-semibold border-b-2 transition-colors",
                activeSection === section.id ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {section.label}
            </button>
          ))}
        </div>

        {activeSection === "loan" && (
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Row 1 */}
                <div className="space-y-2">
                  <Label>Loan value</Label>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        type="text"
                        value={activeLoanDetails.loanValue}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const formatted = formatCurrency(parseInt(val || "0") / 100);
                          handleLoanFieldChange("loanValue", formatted);
                        }}
                        onBlur={(e) => validateField("loanValue", e.target.value)}
                        className={cn("h-10 text-slate-900 font-medium", activeErrors.loanValue && "border-red-500")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(500)} className="h-10 px-2 font-bold whitespace-nowrap">+500</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(1000)} className="h-10 px-2 font-bold whitespace-nowrap">+1k</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-500)} className="h-10 px-2 font-bold whitespace-nowrap">-500</Button>
                      <Button variant="outline" size="sm" onClick={() => adjustLoanValue(-1000)} className="h-10 px-2 font-bold whitespace-nowrap">-1k</Button>
                    </div>
                  </div>
                  {activeErrors.loanValue && <p className="text-xs text-red-500 font-medium">{activeErrors.loanValue}</p>}
                </div>

                <div className="space-y-2">
                  <Label>First payment date</Label>
                  <Input
                    type="date"
                    min={formatDateInput(today)}
                    max={formatDateInput(maxDate)}
                    value={activeLoanDetails.firstPaymentDate}
                    onChange={(e) => {
                      handleLoanFieldChange("firstPaymentDate", e.target.value);
                      validateField("firstPaymentDate", e.target.value);
                    }}
                    className={cn("h-10", activeErrors.firstPaymentDate && "border-red-500")}
                  />
                  {activeErrors.firstPaymentDate && <p className="text-xs text-red-500 font-medium">{activeErrors.firstPaymentDate}</p>}
                </div>

                {/* Row 2 */}
                <div className="space-y-2">
                  <Label>Loan type</Label>
                  <Select value={activeLoanDetails.loanType} onValueChange={(v) => handleLoanFieldChange("loanType", v)}>
                    <SelectTrigger className="h-10 bg-white text-slate-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Working capital">Working capital</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Grace period (days)</Label>
                  <Input value={String(activeLoanDetails.gracePeriodDays)} readOnly className="h-10 bg-slate-50 cursor-not-allowed" />
                </div>

                {/* Row 3 */}
                <div className="space-y-2">
                  <Label>Interest rate (APR, % per year)</Label>
                  <Input value={`${activeLoanDetails.interestRateApr}%`} readOnly className="h-10 bg-slate-50 cursor-not-allowed text-slate-500" />
                </div>

                <div className="space-y-2">
                  <Label>Loan goal</Label>
                  <Select value={activeLoanDetails.loanGoal} onValueChange={(v) => handleLoanFieldChange("loanGoal", v)}>
                    <SelectTrigger className="h-10 bg-white text-slate-900">
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Inventory">Inventory purchase</SelectItem>
                      <SelectItem value="Equipment purchase">Equipment purchase</SelectItem>
                      <SelectItem value="Working capital">Working capital</SelectItem>
                      <SelectItem value="Debt consolidation">Debt consolidation</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Row 4 */}
                <div className="space-y-2">
                  <Label>Number of installments</Label>
                  <Select value={activeLoanDetails.installments ? String(activeLoanDetails.installments) : ""} onValueChange={(v) => handleLoanFieldChange("installments", parseInt(v))}>
                    <SelectTrigger className={cn("h-10 bg-white text-slate-900", activeErrors.installments && "border-red-500")}>
                      <SelectValue placeholder="Select installments" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {[4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                        <SelectItem key={n} value={String(n)}>{n} months</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Installment amount (per month)</Label>
                  <Input 
                    value={monthlyLoanPayment ? formatCurrency(monthlyLoanPayment) : "--"} 
                    readOnly 
                    className="h-10 bg-slate-50 cursor-not-allowed text-slate-900 font-semibold" 
                  />
                </div>

                {/* Full Width Row for Other Goal */}
                {activeLoanDetails.loanGoal === "Other" && (
                  <div className="col-span-1 md:col-span-2 space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label>Other goal (optional)</Label>
                    <Input
                      value={activeLoanDetails.otherGoal}
                      onChange={(e) => handleLoanFieldChange("otherGoal", e.target.value)}
                      placeholder="Describe your goal"
                      className="h-10"
                    />
                  </div>
                )}
              </div>

              <div className="mt-12 pt-8 border-t space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900">Insurances</h3>
                  <div className="bg-slate-50 p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-slate-700">Borrower's Insurance (Credit Life)</Label>
                      <RadioGroup value={activeLoanDetails.borrowersInsurance ? "yes" : "no"} onValueChange={(v) => handleLoanFieldChange("borrowersInsurance", v === "yes")} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="ins-yes" />
                          <Label htmlFor="ins-yes" className="font-medium cursor-pointer">Yes</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="ins-no" />
                          <Label htmlFor="ins-no" className="font-medium cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    <p className="text-xs text-slate-500 font-medium italic">
                      Credit life insurance costs 2% of the loan amount (one-time premium, no interest). Total premium: <span className="text-slate-900 font-bold">{formatCurrency(lifeInsuranceTotal)}</span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(num => {
                    const field = `optionalInsurance${num}` as keyof LoanDetails;
                    const value = activeLoanDetails[field] as string;
                    const isVisible = num === 1 || activeLoanDetails[`optionalInsurance${num-1}` as keyof LoanDetails] !== "None";
                    
                    return (
                      <div key={num} className={cn("space-y-2 transition-opacity duration-200", !isVisible && "opacity-0 pointer-events-none")}>
                        <div className="flex items-center justify-between">
                          <Label>Optional insurance {num}</Label>
                          {value !== "None" && isVisible && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-primary hover:text-primary/80">
                                  <Info className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-white">
                                <DialogHeader>
                                  <DialogTitle>{Object.keys(INSURANCE_PRICES).find(k => value.startsWith(k))}</DialogTitle>
                                </DialogHeader>
                                <p className="text-slate-600 mt-4">{INSURANCE_DESCRIPTIONS[Object.keys(INSURANCE_PRICES).find(k => value.startsWith(k)) || ""]}</p>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        <Select value={value} onValueChange={(v) => handleLoanFieldChange(field, v)} disabled={!isVisible}>
                          <SelectTrigger className="h-10 bg-white text-slate-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="None">None</SelectItem>
                            <SelectItem value="Work Loss Insurance ($20/month)">Work Loss ($20/mo)</SelectItem>
                            <SelectItem value="Health Premium ($40/month)">Health Plus ($40/mo)</SelectItem>
                            <SelectItem value="Income Insurance ($30/month)">Income Prot ($30/mo)</SelectItem>
                          </SelectContent>
                        </Select>
                        {value !== "None" && isVisible && (
                          <p className="text-[11px] text-slate-500 leading-tight italic px-1">
                            {INSURANCE_DESCRIPTIONS[Object.keys(INSURANCE_PRICES).find(k => value.startsWith(k)) || ""]}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary Card */}
              <div className="mt-12 bg-primary/5 border border-primary/10 rounded-2xl p-8 space-y-6">
                <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full" />
                  Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Base monthly installment:</span>
                    <span className="text-lg font-bold text-slate-900">{monthlyLoanPayment ? formatCurrency(monthlyLoanPayment) : "--"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Interest rate:</span>
                    <span className="font-bold text-slate-900">14% APR</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className={cn("text-slate-500 font-medium transition-colors", !activeLoanDetails.borrowersInsurance && "text-slate-400")}>
                      Credit life insurance (monthly share):
                    </span>
                    <span className={cn("text-slate-900 font-bold transition-colors", !activeLoanDetails.borrowersInsurance && "text-slate-400")}>
                      {formatCurrency(lifeInsuranceMonthly)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">Optional insurances:</span>
                    <span className="text-slate-900 font-bold">{formatCurrency(optionalInsuranceMonthly)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500 font-medium">First payment date:</span>
                    <span className="text-slate-900 font-bold">{activeLoanDetails.firstPaymentDate || "--"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 col-span-1 md:col-span-2 mt-4 pt-6 border-t-2 border-primary/20">
                    <span className="text-xl font-bold text-primary">Total monthly payment:</span>
                    <span className="text-2xl font-black text-primary">
                      {monthlyLoanPayment ? formatCurrency(totalMonthlyPayment) : "--"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 col-span-1 md:col-span-2">
                    <span className="text-xs text-slate-400 font-medium">Due day of month:</span>
                    <span className="text-xs text-slate-500 font-bold">
                      {activeLoanDetails.firstPaymentDate ? `${new Date(activeLoanDetails.firstPaymentDate + "T00:00:00").getDate()}th of the month` : "--"}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === "personal" && activeMember && (
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="space-y-2">
                  <Label>First Name <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.firstName || ""} onChange={(e) => handlePersonalFieldChange("firstName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Middle Name</Label>
                  <Input value={activeMember.middleName || ""} onChange={(e) => handlePersonalFieldChange("middleName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.lastName || ""} onChange={(e) => handlePersonalFieldChange("lastName", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Document type <span className="text-red-500">*</span></Label>
                  <Select value={activeMember.documentType || ""} onValueChange={(v) => handlePersonalFieldChange("documentType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ssn">Social Security Number (SSN)</SelectItem>
                      <SelectItem value="dl">US Driver's License</SelectItem>
                      <SelectItem value="state_id">State ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                      <SelectItem value="foreign_id">Foreign Government ID</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Document ID <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.documentNumber || ""} onChange={(e) => handlePersonalFieldChange("documentNumber", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Country of Origin <span className="text-red-500">*</span></Label>
                  <Select value={activeMember.countryOfOrigin || ""} onValueChange={(v) => handlePersonalFieldChange("countryOfOrigin", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="Mexico">Mexico</SelectItem>
                      <SelectItem value="Brazil">Brazil</SelectItem>
                      <SelectItem value="Guatemala">Guatemala</SelectItem>
                      <SelectItem value="Honduras">Honduras</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Birth Date <span className="text-red-500">*</span></Label>
                  <Input type="date" value={activeMember.birthDate || ""} onChange={(e) => handlePersonalFieldChange("birthDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Home Address 1 <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.homeAddress1 || ""} onChange={(e) => handlePersonalFieldChange("homeAddress1", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Home Address 2</Label>
                  <Input value={activeMember.homeAddress2 || ""} onChange={(e) => handlePersonalFieldChange("homeAddress2", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>State <span className="text-red-500">*</span></Label>
                  <Select value={activeMember.state || ""} onValueChange={(v) => handlePersonalFieldChange("state", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white max-h-[300px]">
                      {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.city || ""} onChange={(e) => handlePersonalFieldChange("city", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Zip Code <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.zipCode || ""} onChange={(e) => handlePersonalFieldChange("zipCode", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact 1 Type <span className="text-red-500">*</span></Label>
                  <Select value={activeMember.contact1Type || "Mobile"} onValueChange={(v) => handlePersonalFieldChange("contact1Type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact 1 Number <span className="text-red-500">*</span></Label>
                  <Input value={activeMember.contact1Number || ""} onChange={(e) => handlePersonalFieldChange("contact1Number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact 2 Type</Label>
                  <Select value={activeMember.contact2Type || ""} onValueChange={(v) => handlePersonalFieldChange("contact2Type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Mobile">Mobile</SelectItem>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Contact 2 Number</Label>
                  <Input value={activeMember.contact2Number || ""} onChange={(e) => handlePersonalFieldChange("contact2Number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reference Name 1</Label>
                  <Input value={activeMember.referenceName1 || ""} onChange={(e) => handlePersonalFieldChange("referenceName1", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Reference Number 1</Label>
                  <Input value={activeMember.referenceNumber1 || ""} onChange={(e) => handlePersonalFieldChange("referenceNumber1", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {(activeSection === "business" || activeSection === "financials") && (
          <Card className="border-none shadow-xl bg-white">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <Info className="w-8 h-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Feature Coming Soon</h2>
              <p className="text-slate-500 max-w-sm mx-auto">The {activeSection === "business" ? "Business Data" : "Financials (P&L)"} section is currently under development.</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex justify-between items-center gap-4">
          <Button variant="outline" className="h-12 px-8 font-semibold" onClick={handleBackToHome}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
          <div className="flex gap-4">
            <Button 
              onClick={handleSaveExit}
              variant="outline"
              className="h-12 px-8 font-semibold"
            >
              <Save className="w-4 h-4 mr-2" /> Save Draft
            </Button>
            <Button 
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="h-12 px-12 bg-green-600 hover:bg-green-700 text-white font-bold shadow-xl shadow-green-600/20"
              data-testid="button-confirm-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" /> Confirm Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
