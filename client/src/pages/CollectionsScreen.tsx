import { useContracts } from "@/hooks/use-contracts";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, PhoneCall } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionsScreen() {
  const { data: contracts, isLoading } = useContracts();
  const list = contracts?.filter(c => c.status === 'delinquent') || [];

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
            <h1 className="text-2xl font-display font-bold text-slate-900">Collections</h1>
            <p className="text-slate-500">Delinquent accounts requiring attention.</p>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-md overflow-hidden">
          <CardHeader className="bg-red-50/50 border-b border-red-100">
            <CardTitle className="text-red-900 flex items-center gap-2 text-lg">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              Priority Collections
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
                No collections pending! Good job.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold text-slate-900">Client Name</TableHead>
                    <TableHead className="font-semibold text-slate-900">Outstanding</TableHead>
                    <TableHead className="font-semibold text-slate-900">Due Date</TableHead>
                    <TableHead className="font-semibold text-slate-900">Status</TableHead>
                    <TableHead className="text-right font-semibold text-slate-900">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {list.map((contract) => (
                    <TableRow key={contract.id} className="hover:bg-red-50/30 transition-colors border-l-4 border-l-red-500">
                      <TableCell className="font-bold text-slate-900">
                        {contract.clientName}
                      </TableCell>
                      <TableCell className="font-mono text-red-600 font-bold">
                        ${Number(contract.amount).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-red-500 font-semibold">
                        {format(new Date(contract.maturityDate!), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={contract.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" className="shadow-md shadow-red-200">
                          <PhoneCall className="w-3 h-3 mr-2" /> Contact
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
