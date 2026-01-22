import { useProposalStore } from "@/lib/proposalStore";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Play, Calendar, Trash2, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { format } from "date-fns";

export default function OnGoingProposals() {
  const { proposals, deleteProposal } = useProposalStore();
  const [, setLocation] = useLocation();
  const ongoing = proposals.filter(p => p.status === 'on_going');

  const handleDelete = (id: string) => {
    if (window.confirm("Delete proposal\n\nAre you sure you want to delete this proposal? This will remove all related data and cannot be undone.")) {
      deleteProposal(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200" data-testid="button-back">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">On Going Proposals</h1>
            <p className="text-slate-500">Active applications currently in progress.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="text-blue-900 flex items-center gap-2 text-lg">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              Proposals List
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {ongoing.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No ongoing proposals at the moment.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-900">Date Created</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ongoing.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {proposal.leaderName}
                      </TableCell>
                      <TableCell className="font-mono text-slate-600">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(proposal.totalAmount)}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(proposal.dateCreated), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status="on_going" />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col gap-2 w-full max-w-[200px] ml-auto">
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="bg-primary hover:bg-primary/90 text-white font-semibold h-9 w-full rounded-lg shadow-sm"
                            onClick={() => setLocation(`/product-config/${proposal.id}`)}
                            data-testid={`button-keep-filling-${proposal.id}`}
                          >
                            Keep filling <Play className="w-3 h-3 ml-2 fill-current" />
                          </Button>
                          <div className="flex items-center justify-between px-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-slate-500 hover:text-primary h-auto p-0 text-sm font-medium hover:bg-transparent"
                              onClick={() => setLocation(`/ongoing/${proposal.id}/details`)}
                              data-testid={`button-view-details-${proposal.id}`}
                            >
                              View details
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700 h-auto p-0 text-sm font-medium hover:bg-transparent"
                              onClick={() => handleDelete(String(proposal.id))}
                              data-testid={`button-delete-${proposal.id}`}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
