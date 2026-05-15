import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeedbackResponse } from "@/types/index";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";

export function trendByDay(feedback: FeedbackResponse[]) {
  const buckets = Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(Date.now() - (13 - index) * 86400000);
    const key = date.toISOString().slice(0, 10);
    const rows = feedback.filter((item) => item.submittedAt.slice(0, 10) === key);
    return { name: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), score: calculateHappinessIndex(rows).score, responses: rows.length };
  });
  return buckets;
}

export function HappinessIndexChart({ feedback, height = 280 }: { feedback: FeedbackResponse[]; height?: number }) {
  if (!feedback.length) {
    return <div style={{ height }} className="grid place-items-center rounded-2xl border border-dashed border-cyan-300/20 bg-white/[0.025] text-center text-sm text-slate-500">No feedback submitted yet</div>;
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendByDay(feedback)}>
          <defs><linearGradient id="hiFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#22C55E" stopOpacity={0.28} /><stop offset="100%" stopColor="#22C55E" stopOpacity={0.02} /></linearGradient></defs>
          <CartesianGrid stroke="rgba(0,242,254,0.12)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,242,254,0.24)", background: "#07131c", color: "#ecfeff" }} />
          <Area type="monotone" dataKey="score" stroke="#22C55E" fill="url(#hiFill)" strokeWidth={3} animationDuration={800} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

