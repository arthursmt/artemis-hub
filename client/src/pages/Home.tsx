import { useKpis } from "@/hooks/use-kpis";
import { useProposalStore } from "@/lib/proposalStore";
import { useContracts } from "@/hooks/use-contracts";
import { PageHeader } from "@/components/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { PipelineCard } from "@/components/PipelineCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  Briefcase, 
  Users, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Search,
  CheckCircle2, 
  RefreshCcw, 
  AlertCircle 
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: kpis, isLoading: isLoadingKpis } = useKpis();
  const { proposals } = useProposalStore();
  const { data: contracts, isLoading: isLoadingContracts } = useContracts();

  // Compute counts
  const ongoingCount = proposals.filter(p => p.status === 'on_going').length;
  const evaluationCount = proposals.filter(p => p.status === 'under_evaluation').length;
  const completedCount = proposals.filter(p => p.status === 'completed').length;
  const renewalCount = contracts?.filter(c => c.status === 'renewal_due').length || 0;
  const collectionCount = contracts?.filter(c => c.status === 'delinquent').length || 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <PageHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Welcome Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div>
            <h2 className="text-3xl font-display font-bold text-slate-900">Dashboard</h2>
            <p className="text-slate-500 mt-1 text-lg">Here's what's happening with your portfolio today.</p>
          </div>
          <Link href="/new-proposal">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg shadow-primary/25 rounded-xl px-8 transition-transform hover:-translate-y-0.5 active:translate-y-0">
              <Plus className="w-5 h-5 mr-2" />
              New Proposal
            </Button>
          </Link>
        </section>

        {/* Master KPIs */}
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingKpis || !kpis ? (
              <>
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
                <Skeleton className="h-40 rounded-2xl" />
              </>
            ) : (
              <>
                <KpiCard 
                  title="Credit Portfolio" 
                  value={`$${kpis.creditPortfolio.currentValue.toLocaleString()}`} 
                  trend={`${(((kpis.creditPortfolio.currentValue - kpis.creditPortfolio.lastMonthValue) / kpis.creditPortfolio.lastMonthValue) * 100).toFixed(1)}%`}
                  trendUp={kpis.creditPortfolio.currentValue > kpis.creditPortfolio.lastMonthValue}
                  progressPercent={kpis.creditPortfolio.progressPercent}
                  status={kpis.creditPortfolio.status as "on_track" | "at_risk"}
                  icon={<Briefcase className="w-6 h-6" />}
                  className="bg-white border-l-4 border-l-primary"
                  delay={100}
                />
                <KpiCard 
                  title="Active Clients" 
                  value={kpis.activeClients.currentValue} 
                  trend={`${kpis.activeClients.currentValue - kpis.activeClients.lastMonthValue} new`}
                  trendUp={kpis.activeClients.currentValue > kpis.activeClients.lastMonthValue}
                  progressPercent={kpis.activeClients.progressPercent}
                  status={kpis.activeClients.status as "on_track" | "at_risk"}
                  icon={<Users className="w-6 h-6" />}
                  className="bg-white border-l-4 border-l-secondary"
                  delay={200}
                />
                <KpiCard 
                  title="Delinquency Rate" 
                  value={`${(kpis.delinquencyRate.currentValue * 100).toFixed(1)}%`} 
                  trend={`${Math.abs((kpis.delinquencyRate.currentValue - kpis.delinquencyRate.lastMonthValue) * 100).toFixed(1)}%`}
                  trendUp={kpis.delinquencyRate.currentValue < kpis.delinquencyRate.lastMonthValue} // Down is good
                  progressPercent={kpis.delinquencyRate.progressPercent}
                  status={kpis.delinquencyRate.status as "on_track" | "at_risk"}
                  icon={<AlertTriangle className="w-6 h-6" />}
                  className="bg-white border-l-4 border-l-red-500"
                  delay={300}
                />
              </>
            )}
          </div>
        </section>

        {/* Pipeline Overview */}
        <section>
          <h3 className="text-xl font-display font-bold text-slate-900 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-secondary rounded-full"></div>
            Pipeline Overview
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {isLoadingContracts ? (
              Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
            ) : (
              <>
                <PipelineCard 
                  title="On Going" 
                  count={ongoingCount} 
                  href="/ongoing" 
                  color="blue"
                  icon={<FileText className="w-6 h-6" />}
                  delay={100}
                />
                <PipelineCard 
                  title="Under Eval" 
                  count={evaluationCount} 
                  href="/under-evaluation" 
                  color="yellow"
                  icon={<Search className="w-6 h-6" />}
                  delay={200}
                />
                <PipelineCard 
                  title="Completed" 
                  count={completedCount} 
                  href="/completed" 
                  color="green"
                  icon={<CheckCircle2 className="w-6 h-6" />}
                  delay={300}
                />
                <PipelineCard 
                  title="Renewals" 
                  count={renewalCount} 
                  href="/renewals" 
                  color="indigo"
                  icon={<RefreshCcw className="w-6 h-6" />}
                  delay={400}
                />
                <PipelineCard 
                  title="Collections" 
                  count={collectionCount} 
                  href="/collections" 
                  color="red"
                  icon={<AlertCircle className="w-6 h-6" />}
                  delay={500}
                />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
