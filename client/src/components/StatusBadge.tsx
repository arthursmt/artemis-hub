import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
  let label = status.replace('_', ' ');

  switch (status) {
    case 'on_going':
    case 'active':
      colorClass = "bg-blue-100 text-blue-700 border-blue-200";
      break;
    case 'under_evaluation':
    case 'renewal_due':
      colorClass = "bg-amber-100 text-amber-700 border-amber-200";
      break;
    case 'completed':
      colorClass = "bg-emerald-100 text-emerald-700 border-emerald-200";
      break;
    case 'delinquent':
      colorClass = "bg-rose-100 text-rose-700 border-rose-200";
      break;
  }

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border",
      colorClass
    )}>
      {label}
    </span>
  );
}
