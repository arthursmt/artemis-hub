import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface PipelineCardProps {
  title: string;
  count: number;
  href: string;
  color: "blue" | "yellow" | "green" | "red" | "indigo";
  icon: React.ReactNode;
  delay?: number;
}

const colorMap = {
  blue: "bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300",
  yellow: "bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300",
  green: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300",
  red: "bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300",
  indigo: "bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300",
};

export function PipelineCard({ title, count, href, color, icon, delay = 0 }: PipelineCardProps) {
  const hasActionDot = ["On Going", "Renewals", "Collections"].includes(title);

  return (
    <Link href={href}>
      <div 
        className="cursor-pointer group h-full"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={cn(
          "animate-in zoom-in-95 duration-500 h-full",
        )}>
          <Card className={cn(
            "h-full border-2 transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 relative",
            colorMap[color]
          )}>
            {hasActionDot && (
              <div className="absolute top-4 left-4 w-2 h-2 bg-amber-500 rounded-full z-10" />
            )}
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow-sm">
                  {icon}
                </div>
                <div className="text-4xl font-display font-bold opacity-90 tracking-tight">
                  {count}
                </div>
              </div>
              <h3 className="text-lg font-bold font-display">{title}</h3>
            </CardContent>
            
            <CardFooter className="p-6 pt-0 mt-auto">
              <div className="w-full flex items-center justify-between text-sm font-medium opacity-70 group-hover:opacity-100 transition-opacity">
                <span>View details</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Link>
  );
}
