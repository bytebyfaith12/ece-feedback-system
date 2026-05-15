import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { FeedbackResponse, SmileyRating } from "@/types/index";

const labels: Record<SmileyRating, string> = { 1: "Very Unhappy", 2: "Unhappy", 3: "Neutral", 4: "Happy", 5: "Very Happy" };
const colors: Record<SmileyRating, string> = { 1: "#DC2626", 2: "#FCA5A5", 3: "#FCD34D", 4: "#86EFAC", 5: "#16A34A" };

export function distribution(feedback: FeedbackResponse[]) {
  return ([5, 4, 3, 2, 1] as SmileyRating[]).map((rating) => ({ name: labels[rating], value: feedback.filter((item) => item.rating === rating).length, color: colors[rating] }));
}

export function SmileyDistributionChart({ feedback, height = 280 }: { feedback: FeedbackResponse[]; height?: number }) {
  const data = distribution(feedback);
  if (!feedback.length) {
    return <div style={{ height }} className="grid place-items-center rounded-2xl border border-dashed border-cyan-300/20 bg-white/[0.025] text-center text-sm text-slate-500">No feedback submitted yet</div>;
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={104} paddingAngle={3} animationDuration={800}>
            {data.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,242,254,0.24)", background: "#07131c", color: "#ecfeff" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

