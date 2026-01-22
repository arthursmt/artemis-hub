import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  progressPercent?: number;
  status?: "on_track" | "at_risk";
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
}

export function KpiCard({ title, value, trend, trendUp, progressPercent, status, icon, className, delay = 0 }: KpiCardProps) {
  return (
    <div 
      className={cn(
        "animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative group h-full">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
          {icon}
        </div>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
              </div>
              <h3 className="text-3xl font-display font-bold text-slate-900 mt-2">{value}</h3>
            </div>
            <div className={cn(
              "p-3 rounded-xl", 
              "bg-primary/10 text-primary"
            )}>
              {icon || <TrendingUp className="w-6 h-6" />}
            </div>
          </div>
          
          <div className="mt-4 space-y-3">
            {progressPercent !== undefined && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Target Progress</span>
                  <span>{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full transition-all duration-1000 ease-out",
                      status === "on_track" ? "bg-primary" : "bg-yellow-500"
                    )}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {trend && (
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
                  trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {trend}
                </div>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-secondary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
      </Card>
    </div>
  );
}
