import { cn } from "@/utils/cn";

export function ProgressBar({ value, className = "", color = "bg-brand-green" }: { value: number; className?: string; color?: string }) {
  return (
    <div className={cn("h-2 overflow-hidden rounded-full bg-slate-100", className)}>
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
