import { useProposals } from "@/hooks/use-proposals";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompletedProposals() {
  const { data: proposals, isLoading } = useProposals();
  const list = proposals?.filter(p => p.status === 'completed') || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white shadow-sm border-slate-200">
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-900">Completed</h1>
            <p className="text-slate-500">Successfully disbursed loans.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
            <CardTitle className="text-emerald-900 flex items-center gap-2 text-lg">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Recently Disbursed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : list.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No completed proposals found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-900">Disbursed Date</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Certificate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((proposal) => (
                    <TableRow key={proposal.id} className="hover:bg-emerald-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {proposal.clientName}
                      </TableCell>
                      <TableCell className="font-mono text-slate-600">
                        ${Number(proposal.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {format(new Date(proposal.updatedAt!), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={proposal.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-emerald-100 hover:text-emerald-700">
                          <CheckCircle className="w-3 h-3 mr-2" /> View
                        </Button>
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
