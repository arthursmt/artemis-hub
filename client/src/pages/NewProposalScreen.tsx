import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Plus, X, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateProposal } from "@/hooks/use-proposals";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES = [
  { value: "ssn", label: "Social Security Number (SSN)" },
  { value: "itin", label: "Individual Taxpayer Identification Number (ITIN)" },
  { value: "dl_state_id", label: "US Driver’s License / State ID" },
  { value: "passport", label: "Passport" },
  { value: "foreign_id", label: "Foreign Government ID" },
];

interface Member {
  id: number;
  firstName: string;
  middleName: string;
  lastName: string;
  requestedAmount: string;
  documentType: string;
  documentNumber: string;
  errors?: Record<string, string>;
}

export default function NewProposalScreen() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createProposal = useCreateProposal();

  const [proposalType, setProposalType] = useState<"group" | "individual">("group");
  const [members, setMembers] = useState<Member[]>(() => {
    const storedData = sessionStorage.getItem("pending_proposal");
    if (storedData) {
      const proposalData = JSON.parse(storedData);
      return proposalData.members;
    }
    return [
      {
        id: Date.now(),
        firstName: "",
        middleName: "",
        lastName: "",
        requestedAmount: "",
        documentType: "",
        documentNumber: "",
      },
    ];
  });
  const [activeMemberId, setActiveMemberId] = useState<number>(members[0].id);

  useEffect(() => {
    const storedData = sessionStorage.getItem("pending_proposal");
    if (storedData) {
      const proposalData = JSON.parse(storedData);
      setProposalType(proposalData.type || "group");
    }
  }, []);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const validateName = (name: string) => {
    if (!name) return true;
    // Simple but effective: must start with letter, only letters and spaces
    // Using a range that covers most accented characters without fancy unicode props
    const regex = /^[a-zA-Z\u00C0-\u017F][a-zA-Z\u00C0-\u017F\s]*$/;
    return regex.test(name);
  };

  const formatCurrency = (val: string) => {
    // Remove all non-digits
    const cleanValue = val.replace(/\D/g, "");
    if (!cleanValue) return "";
    
    const num = parseInt(cleanValue) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const handleAmountChange = (id: number, val: string) => {
    // 1. Strip all non-digit characters from the raw input string.
    const digits = val.replace(/\D/g, "");
    
    // 2. Interpret the resulting digits as cents (integer).
    const cents = parseInt(digits) || 0;
    
    // 3. Compute the numeric value in dollars: amountInDollars = cents / 100.
    const amountInDollars = (cents / 100).toString();
    
    // 4. Store this numeric value in component state for validation.
    // 5. Format amountInDollars as a US currency string and set that as the input value.
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);

    updateMember(id, "requestedAmount", formattedValue);
  };

  const handleAmountBlur = (id: number) => {
    const member = members.find(m => m.id === id);
    if (!member) return;

    // Numeric value in dollars
    const digits = member.requestedAmount.replace(/\D/g, "");
    const amountInDollars = (parseInt(digits) || 0) / 100;

    let error = "";
    if (amountInDollars <= 0) {
      error = "Amount must be greater than 0";
    } else if (amountInDollars > 50000) {
      error = "Maximum loan amount is $50,000.00";
    }

    setMembers(prev => prev.map(m => 
      m.id === id ? { ...m, errors: { ...m.errors, requestedAmount: error } } : m
    ));
  };

  const handleAmountFocus = (id: number) => {
    // Overriding previous behavior: we stay in formatted mode as we type now
  };

  const handleRemoveMember = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (members.length === 1) {
      toast({
        title: "Action blocked",
        description: "Group must have at least one member.",
        variant: "destructive",
      });
      return;
    }

    const member = members.find(m => m.id === id);
    const hasData = member && (
      !!member.firstName ||
      !!member.lastName ||
      !!member.requestedAmount ||
      !!member.documentType ||
      !!member.documentNumber
    );

    if (!hasData || window.confirm("Are you sure you want to remove this member from the group?")) {
      const newMembers = members.filter((m) => m.id !== id);
      setMembers(newMembers);
      if (activeMemberId === id) {
        setActiveMemberId(newMembers[0].id);
      }
    }
  };

  const handleAddMember = () => {
    const newMember: Member = {
      id: Date.now(),
      firstName: "",
      middleName: "",
      lastName: "",
      requestedAmount: "",
      documentType: "",
      documentNumber: "",
    };
    setMembers([...members, newMember]);
    setActiveMemberId(newMember.id);
  };

  const updateMember = (id: number, field: keyof Member, value: string) => {
    setMembers(
      members.map((m) => (m.id === id ? { ...m, [field]: value, errors: { ...m.errors, [field]: "" } } : m))
    );
  };

  const validateAll = () => {
    let isValid = true;
    const newMembers = members.map(m => {
      const errors: Record<string, string> = {};
      
      if (!m.firstName) {
        errors.firstName = "First name is required";
        isValid = false;
      } else if (!validateName(m.firstName)) {
        errors.firstName = "Only letters and spaces allowed (cannot start with space)";
        isValid = false;
      }

      if (m.middleName && !validateName(m.middleName)) {
        errors.middleName = "Only letters and spaces allowed";
        isValid = false;
      }

      if (!m.lastName) {
        errors.lastName = "Last name is required";
        isValid = false;
      } else if (!validateName(m.lastName)) {
        errors.lastName = "Only letters and spaces allowed (cannot start with space)";
        isValid = false;
      }

      const digits = m.requestedAmount.replace(/\D/g, "");
      const amount = (parseInt(digits) || 0) / 100;
      if (!digits || amount <= 0) {
        errors.requestedAmount = "Amount must be greater than 0";
        isValid = false;
      } else if (amount > 50000) {
        errors.requestedAmount = "Maximum loan amount is $50,000.00";
        isValid = false;
      }

      if (!m.documentType) {
        errors.documentType = "Document type is required";
        isValid = false;
      }

      if (!m.documentNumber) {
        errors.documentNumber = "Document number is required";
        isValid = false;
      }

      return { ...m, errors };
    });

    setMembers(newMembers);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAll()) {
      toast({
        title: "Validation Error",
        description: "Please check all members for missing or invalid fields.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      type: proposalType,
      members: proposalType === "individual" ? [members[0]] : members,
    };
    
    // Store in session for the next screen
    sessionStorage.setItem("pending_proposal", JSON.stringify(payload));
    
    // Navigate to validation screen
    setLocation("/credit-validation");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">New Proposal</h1>
            <p className="text-slate-500">Originate a new credit application.</p>
          </div>
        </div>

        <div className="mb-6">
          <Label className="text-slate-900 font-semibold block mb-3">Proposal Type</Label>
          <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => {
                setProposalType("group");
                if (proposalType === "individual") {
                  setActiveMemberId(members[0].id);
                }
              }}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                proposalType === "group" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Group
            </button>
            <button
              type="button"
              onClick={() => {
                setProposalType("individual");
                setActiveMemberId(members[0].id);
              }}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-semibold transition-all",
                proposalType === "individual" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              Individual
            </button>
          </div>
        </div>

        {proposalType === "group" && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {members.map((member, index) => (
              <div
                key={member.id}
                onClick={() => setActiveMemberId(member.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-t-lg cursor-pointer transition-all border-b-2 font-medium text-sm",
                  activeMemberId === member.id
                    ? "bg-white text-primary border-primary"
                    : "text-slate-500 border-transparent hover:text-slate-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <span>Member {index + 1}</span>
                  {Object.values(member.errors || {}).some(e => e) && (
                    <AlertCircle className="w-3 h-3 text-red-500" />
                  )}
                </div>
                {members.length > 1 && (
                  <X 
                    className="h-3 w-3 hover:text-red-500 transition-colors" 
                    onClick={(e) => handleRemoveMember(member.id, e)}
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddMember}
              className="p-2 rounded-full hover:bg-slate-200 text-primary transition-colors mb-1 ml-2"
              title="Add Member"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        )}

        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">First Name</Label>
                    <Input 
                      placeholder="e.g. Maria" 
                      className={cn("h-12", activeMember.errors?.firstName && "border-red-500 focus-visible:ring-red-500")}
                      value={activeMember.firstName}
                      onChange={(e) => updateMember(activeMember.id, "firstName", e.target.value)}
                    />
                    {activeMember.errors?.firstName && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.firstName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">Last Name</Label>
                    <Input 
                      placeholder="e.g. Silva" 
                      className={cn("h-12", activeMember.errors?.lastName && "border-red-500 focus-visible:ring-red-500")}
                      value={activeMember.lastName}
                      onChange={(e) => updateMember(activeMember.id, "lastName", e.target.value)}
                    />
                    {activeMember.errors?.lastName && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-semibold">Middle Name (optional)</Label>
                  <Input 
                    placeholder="e.g. Mercedes" 
                    className={cn("h-12", activeMember.errors?.middleName && "border-red-500 focus-visible:ring-red-500")}
                    value={activeMember.middleName}
                    onChange={(e) => updateMember(activeMember.id, "middleName", e.target.value)}
                  />
                  {activeMember.errors?.middleName && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.middleName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-900 font-semibold">Requested Amount ($)</Label>
                  <Input 
                    type="text"
                    placeholder="$0.00" 
                    className={cn("h-12 text-lg font-mono", activeMember.errors?.requestedAmount && "border-red-500 focus-visible:ring-red-500")}
                    value={activeMember.requestedAmount}
                    onChange={(e) => handleAmountChange(activeMember.id, e.target.value)}
                    onBlur={() => handleAmountBlur(activeMember.id)}
                  />
                  {activeMember.errors?.requestedAmount && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.requestedAmount}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">ID Document Type</Label>
                    <Select 
                      value={activeMember.documentType} 
                      onValueChange={(val) => updateMember(activeMember.id, "documentType", val)}
                    >
                      <SelectTrigger className={cn("h-12 bg-white", activeMember.errors?.documentType && "border-red-500 focus-visible:ring-red-500")}>
                        <SelectValue placeholder="Select ID type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md p-1">
                        {DOCUMENT_TYPES.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value} 
                            className="focus:bg-primary/10 focus:text-primary cursor-pointer rounded-md transition-colors"
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {activeMember.errors?.documentType && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.documentType}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-900 font-semibold">Document Number</Label>
                    <Input 
                      placeholder="Enter number" 
                      className={cn("h-12", activeMember.errors?.documentNumber && "border-red-500 focus-visible:ring-red-500")}
                      value={activeMember.documentNumber}
                      onChange={(e) => updateMember(activeMember.id, "documentNumber", e.target.value)}
                    />
                    {activeMember.errors?.documentNumber && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">{activeMember.errors.documentNumber}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Link href="/" className="w-full">
                  <Button type="button" variant="outline" className="w-full h-12">Cancel</Button>
                </Link>
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4 mr-2" /> Create Proposal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
