import { TrendingDown, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatNumber } from "@/utils/formatters";

export function KPICard({ label, value, helper, trend = 0, tone = "green", delay = 0 }: { label: string; value: string | number; helper?: string; trend?: number; tone?: "green" | "blue" | "amber" | "red"; delay?: number }) {
  const Icon = trend < 0 ? TrendingDown : TrendingUp;
  const toneClass = {
    green: "text-emerald-200 bg-emerald-400/10 border border-emerald-300/15",
    blue: "text-cyan-200 bg-cyan-400/10 border border-cyan-300/15",
    amber: "text-amber-200 bg-amber-400/10 border border-amber-300/15",
    red: "text-red-200 bg-red-400/10 border border-red-300/15",
  }[tone];
  return (
    <Card delay={delay}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/55">{label}</p>
          <p className="mt-3 display-title text-3xl text-white">{typeof value === "number" ? formatNumber(value) : value}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${toneClass}`}><Icon className="size-3" />{trend > 0 ? "+" : ""}{trend}</span>
      </div>
      {helper ? <p className="mt-3 text-sm text-slate-400">{helper}</p> : null}
    </Card>
  );
}
