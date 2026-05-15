import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeedbackResponse, Location } from "@/types/index";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";

export function locationRanking(feedback: FeedbackResponse[], locations: Location[], limit = 10) {
  return locations
    .map((location) => {
      const rows = feedback.filter((item) => item.locationId === location.id);
      return { name: location.name.replace(" - ", "\n"), score: calculateHappinessIndex(rows).score, responses: rows.length };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function LocationComparisonChart({ feedback, locations, height = 320 }: { feedback: FeedbackResponse[]; locations: Location[]; height?: number }) {
  if (!feedback.length) {
    return <div style={{ height }} className="grid place-items-center rounded-2xl border border-dashed border-cyan-300/20 bg-white/[0.025] text-center text-sm text-slate-500">No feedback submitted yet</div>;
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={locationRanking(feedback, locations)} layout="vertical" margin={{ left: 40 }}>
          <CartesianGrid stroke="rgba(0,242,254,0.12)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} width={120} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,242,254,0.24)", background: "#07131c", color: "#ecfeff" }} />
          <Bar dataKey="score" fill="#30D158" radius={[0, 10, 10, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

