import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, FileText, Phone, DollarSign, MapPin } from "lucide-react";
import { Link, useParams, useLocation } from "wouter";
import { useProposalStore } from "@/lib/proposalStore";
import { useEffect } from "react";
import { format } from "date-fns";

export default function ProposalDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { getProposalById } = useProposalStore();
  const proposal = getProposalById(id || "");

  useEffect(() => {
    if (id && !proposal) {
      setLocation("/ongoing");
    }
  }, [id, proposal, setLocation]);

  if (!proposal) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFullAddress = (member: any) => {
    const parts = [
      member.addressLine1,
      member.addressLine2,
      member.city,
      member.state,
      member.zipCode
    ].filter(part => part && part.trim() !== "");
    
    return parts.length > 0 ? parts.join(", ") : "--";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/ongoing">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200" data-testid="button-back">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Proposal Details</h1>
            <p className="text-slate-500">Full review of group and member information.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Group Details Card */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Group details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Group ID</p>
                  <p className="font-mono font-medium text-slate-900" data-testid="text-group-id">
                    {proposal.groupId || "--"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Leader</p>
                  <p className="font-semibold text-slate-900" data-testid="text-leader-name">
                    {proposal.leaderName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Amount</p>
                  <p className="font-bold text-primary" data-testid="text-total-amount">
                    {formatCurrency(proposal.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Date Created</p>
                  <p className="text-slate-600" data-testid="text-date-created">
                    {format(new Date(proposal.dateCreated), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members Table Card */}
          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-primary flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900 pl-6">Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Primary phone</TableHead>
                    <TableHead className="font-semibold text-slate-900">Requested amount</TableHead>
                    <TableHead className="font-semibold text-slate-900 pr-6">Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proposal.data.group.members.map((member, idx) => (
                    <TableRow key={member.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900 pl-6">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300 text-xs">{idx + 1}.</span>
                          <span data-testid={`text-member-name-${member.id}`}>
                            {member.firstName || member.lastName ? `${member.firstName || ""} ${member.lastName || ""}`.trim() : "--"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span data-testid={`text-member-phone-${member.id}`}>
                            {(member as any).phone || (member as any).primaryPhone || (member as any).mobilePhone || "--"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-slate-900 font-semibold">
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-slate-400" />
                          <span data-testid={`text-member-amount-${member.id}`}>
                            {member.requestedAmount ? 
                              (typeof member.requestedAmount === 'string' ? 
                                new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parseFloat(member.requestedAmount.replace(/[^\d.-]/g, '')) / (member.requestedAmount.includes('.') ? 1 : 100)) : 
                                formatCurrency(member.requestedAmount)) 
                              : "--"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-500 text-sm pr-6 max-w-xs">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3 h-3 text-slate-400 mt-1 shrink-0" />
                          <span data-testid={`text-member-address-${member.id}`}>
                            {getFullAddress(member)}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
