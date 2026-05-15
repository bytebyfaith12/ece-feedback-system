import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

const colors = ["#10a85f", "#00b8d4", "#7dd3fc", "#fbbf24", "#fb7185"];

export function MinimalChartCard({
  title,
  description,
  data,
  type,
}: {
  title: string;
  description: string;
  data: ChartPoint[];
  type: "line" | "bar" | "donut";
}) {
  const hasData = data.some((item) => item.value > 0);

  let chart: ReactNode = null;
  if (type === "line") {
    chart = (
      <LineChart data={data}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#10a85f" strokeWidth={3} dot={{ r: 4, fill: "#10a85f" }} />
      </LineChart>
    );
  }
  if (type === "bar") {
    chart = (
      <BarChart data={data}>
        <CartesianGrid stroke="#eef2f7" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#10a85f" />
      </BarChart>
    );
  }
  if (type === "donut") {
    chart = (
      <PieChart>
        <Tooltip />
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={90} paddingAngle={4}>
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    );
  }

  return (
    <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5 h-72">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            {chart}
          </ResponsiveContainer>
        ) : (
          <EmptyState title="No feedback data yet" description="Waiting for first response." />
        )}
      </div>
    </section>
  );
}
