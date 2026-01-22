import { useContracts } from "@/hooks/use-contracts";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, RotateCw } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function RenewalsScreen() {
  const { data: contracts, isLoading } = useContracts();
  const list = contracts?.filter(c => c.status === 'renewal_due') || [];

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
            <h1 className="text-2xl font-display font-bold text-slate-900">Renewals</h1>
            <p className="text-slate-500">Contracts approaching maturity eligible for renewal.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100">
            <CardTitle className="text-indigo-900 flex items-center gap-2 text-lg">
              <div className="h-2 w-2 rounded-full bg-indigo-500" />
              Due for Renewal
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
                No renewals due at this time.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Current Amount</TableHead>
                    <TableHead className="font-semibold text-slate-900">Maturity Date</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-indigo-50/30 transition-colors">
                      <TableCell className="font-medium text-slate-900">
                        {contract.clientName}
                      </TableCell>
                      <TableCell className="font-mono text-slate-600">
                        ${Number(contract.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-slate-500 font-medium text-indigo-700">
                        {format(new Date(contract.maturityDate!), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md shadow-indigo-200">
                          <RotateCw className="w-3 h-3 mr-2" /> Renew
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
