import { TrendingDown, TrendingUp } from "lucide-react";
import type { HappinessIndex } from "@/types/index";
import { ProgressBar } from "@/components/ui/ProgressBar";

export function HappinessScore({ index, compact = false }: { index: HappinessIndex; compact?: boolean }) {
  const TrendIcon = index.trendDirection === "down" ? TrendingDown : TrendingUp;
  return (
    <div className={compact ? "" : "space-y-4"}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/55">Happiness Index</p>
          <div className="mt-1 flex items-end gap-2">
            <span className="display-title text-5xl leading-none" style={{ color: index.color }}>{index.score}</span>
            <span className="pb-1 text-xl font-bold text-slate-400">/100</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold ${index.trendDirection === "down" ? "border-red-300/15 bg-red-400/10 text-red-200" : "border-emerald-300/15 bg-emerald-400/10 text-emerald-200"}`}>
          <TrendIcon className="size-4" /> {index.trend > 0 ? "+" : ""}{index.trend}
        </div>
      </div>
      <ProgressBar value={index.score} color={index.score >= 70 ? "bg-brand-green" : index.score >= 50 ? "bg-amber-500" : "bg-red-500"} />
      <p className="text-sm text-slate-400">{index.label} · {index.totalResponses.toLocaleString()} responses</p>
    </div>
  );
}

