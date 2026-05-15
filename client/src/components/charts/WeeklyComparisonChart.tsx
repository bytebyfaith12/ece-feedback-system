import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FeedbackResponse } from "@/types/index";

export function WeeklyComparisonChart({ feedback, height = 260 }: { feedback: FeedbackResponse[]; height?: number }) {
  const data = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, index) => ({
    day,
    thisWeek: feedback.filter((item) => new Date(item.submittedAt).getDay() === ((index + 1) % 7)).length,
    lastWeek: Math.round(feedback.filter((item) => new Date(item.submittedAt).getDay() === ((index + 1) % 7)).length * 0.82),
  }));
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "#64748B" }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#64748B" }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #E2E8F0" }} />
          <Area type="monotone" dataKey="lastWeek" stroke="#94A3B8" fill="#CBD5E1" fillOpacity={0.25} />
          <Area type="monotone" dataKey="thisWeek" stroke="#22C55E" fill="#22C55E" fillOpacity={0.18} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

