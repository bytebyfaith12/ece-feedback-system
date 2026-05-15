import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeedbackResponse } from "@/types/index";

export function volumeByHour(feedback: FeedbackResponse[]) {
  return Array.from({ length: 24 }).map((_, hour) => ({
    hour: `${hour}:00`,
    responses: feedback.filter((item) => new Date(item.submittedAt).getHours() === hour).length,
  }));
}

export function ResponseVolumeChart({ feedback, height = 280 }: { feedback: FeedbackResponse[]; height?: number }) {
  if (!feedback.length) {
    return <div style={{ height }} className="grid place-items-center rounded-2xl border border-dashed border-cyan-300/20 bg-white/[0.025] text-center text-sm text-slate-500">No feedback submitted yet</div>;
  }
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={volumeByHour(feedback)}>
          <CartesianGrid stroke="rgba(0,242,254,0.12)" vertical={false} />
          <XAxis dataKey="hour" tick={{ fill: "#94a3b8", fontSize: 11 }} interval={2} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid rgba(0,242,254,0.24)", background: "#07131c", color: "#ecfeff" }} />
          <Bar dataKey="responses" fill="#00F2FE" radius={[10, 10, 0, 0]} animationDuration={800} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

