import { cn } from "@/utils/cn";

const toneMap: Record<string, string> = {
  critical: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-blue-100 text-blue-700",
  online: "bg-green-100 text-green-700",
  offline: "bg-red-100 text-red-700",
  warning: "bg-amber-100 text-amber-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-slate-100 text-slate-700",
  new: "bg-blue-100 text-blue-700",
};

export function StatusBadge({ value, className = "" }: { value: string; className?: string }) {
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", toneMap[value] ?? "bg-slate-100 text-slate-700", className)}>{value.replace(/-/g, " ")}</span>;
}
