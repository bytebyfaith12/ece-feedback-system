import { motion } from "framer-motion";
import { Activity, AlertTriangle, BarChart3, Download, Filter, Loader2, RefreshCw, Search, ShieldCheck, Star, TableProperties } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { downloadFeedbackCsv } from "@/lib/exportCsv";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import type { FeedbackResponse } from "@/types/index";
import { feedbackStatuses, feedbackTypeLabels, feedbackTypes, sentiments } from "@/types/feedback";
import type { ProductionFeedbackStatus } from "@/types/feedback";

const chartColors = ["#67e8f9", "#6ee7b7", "#a7f3d0", "#facc15", "#fb7185", "#c4b5fd"];

function countBy<T extends string>(rows: FeedbackResponse[], picker: (item: FeedbackResponse) => T | undefined) {
  const map = new Map<string, number>();
  rows.forEach((item) => {
    const key = picker(item) || "Unspecified";
    map.set(key, (map.get(key) ?? 0) + 1);
  });
  return [...map.entries()].map(([name, value]) => ({ name, value }));
}

function topValue(rows: Array<{ name: string; value: number }>) {
  return rows.slice().sort((a, b) => b.value - a.value)[0]?.name ?? "None yet";
}

function formatDate(value?: string) {
  return value ? new Date(value).toLocaleDateString() : "None yet";
}

function sentimentBucket(item: FeedbackResponse) {
  if (item.sentiment) return item.sentiment;
  if (item.rating >= 4) return "Positive";
  if (item.rating === 3) return "Neutral";
  return "Negative";
}

function trendByDay(rows: FeedbackResponse[]) {
  const map = new Map<string, number>();
  rows.forEach((item) => {
    const date = (item.createdAt ?? item.submittedAt).slice(0, 10);
    map.set(date, (map.get(date) ?? 0) + 1);
  });
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([name, value]) => ({ name, value }));
}

export function ProductionAdminDashboard() {
  const feedback = useFeedbackStore((state) => state.feedback);
  const remoteStatus = useFeedbackStore((state) => state.remoteStatus);
  const remoteError = useFeedbackStore((state) => state.remoteError);
  const syncFeedback = useFeedbackStore((state) => state.syncFeedback);
  const updateStatus = useFeedbackStore((state) => state.updateProductionFeedbackStatus);
  const [search, setSearch] = useState("");
  const [site, setSite] = useState("All");
  const [type, setType] = useState("All");
  const [rating, setRating] = useState("All");
  const [sentiment, setSentiment] = useState("All");
  const [status, setStatus] = useState("All");

  useEffect(() => {
    void syncFeedback();
  }, [syncFeedback]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return feedback.filter((item) => {
      const matchesSearch =
        !needle ||
        [item.submissionId, item.id, item.fullName, item.contact, item.siteName, item.account, item.category, item.message, item.comment, item.locationName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      return (
        matchesSearch &&
        (site === "All" || item.siteName === site) &&
        (type === "All" || item.feedbackType === type) &&
        (rating === "All" || item.rating === Number(rating)) &&
        (sentiment === "All" || sentimentBucket(item) === sentiment) &&
        (status === "All" || item.status === status)
      );
    });
  }, [feedback, rating, search, sentiment, site, status, type]);

  const siteData = useMemo(() => countBy(filtered, (item) => item.siteName), [filtered]);
  const accountData = useMemo(() => countBy(filtered, (item) => item.account), [filtered]);
  const categoryData = useMemo(() => countBy(filtered, (item) => item.category), [filtered]);
  const sentimentData = useMemo(() => countBy(filtered, sentimentBucket), [filtered]);
  const trendData = useMemo(() => trendByDay(filtered), [filtered]);
  const averageRating = filtered.length ? Math.round((filtered.reduce((sum, item) => sum + item.rating, 0) / filtered.length) * 10) / 10 : 0;
  const positive = filtered.filter((item) => item.rating >= 4).length;
  const neutral = filtered.filter((item) => item.rating === 3).length;
  const negative = filtered.filter((item) => item.rating <= 2).length;
  const latest = filtered[0];

  const setRowStatus = async (item: FeedbackResponse, nextStatus: string) => {
    try {
      await updateStatus(item.submissionId ?? item.id, nextStatus as ProductionFeedbackStatus, item.adminNotes);
      toast.success("Feedback status updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Status could not be updated.");
    }
  };

  return (
    <main id="main-content" className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(0,242,254,0.1),transparent_28%),linear-gradient(180deg,#07131c,#030b12)] p-4 text-slate-100 md:p-6">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(0,242,254,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">Admin Dashboard</p>
            <h1 className="display-title mt-3 text-4xl text-white md:text-5xl">Feedback Analytics</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">Only real submitted feedback appears here. Empty dashboards stay empty until a user submits feedback.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => void syncFeedback()} className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-300/20 px-4 text-sm font-bold text-cyan-100 hover:bg-cyan-300/10">
              {remoteStatus === "loading" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
              Refresh
            </button>
            <button onClick={() => downloadFeedbackCsv(filtered)} disabled={!filtered.length} className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-cyan-300 px-4 text-sm font-extrabold text-[#031017] hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50">
              <Download className="size-4" />
              Export CSV
            </button>
          </div>
        </div>

        {remoteError ? (
          <div role="alert" className="mt-6 rounded-3xl border border-amber-300/25 bg-amber-500/10 p-4 text-sm text-amber-100">
            {remoteError}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Total Feedback" value={filtered.length} icon={TableProperties} />
          <Kpi title="Average Rating" value={averageRating ? `${averageRating}/5` : "0/5"} icon={Star} />
          <Kpi title="Positive Feedback" value={positive} icon={ShieldCheck} />
          <Kpi title="Negative Feedback" value={negative} icon={AlertTriangle} tone="rose" />
          <Kpi title="Neutral Feedback" value={neutral} icon={Activity} />
          <Kpi title="Most Active Site" value={topValue(siteData)} icon={BarChart3} />
          <Kpi title="Most Common Issue" value={topValue(categoryData)} icon={Filter} />
          <Kpi title="Latest Submission" value={latest ? formatDate(latest.createdAt ?? latest.submittedAt) : "None yet"} icon={RefreshCw} />
        </div>

        <section className="mt-6 rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-4 backdrop-blur-xl md:p-5">
          <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(5,minmax(0,1fr))]">
            <label className="relative">
              <span className="sr-only">Search feedback</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="h-[52px] w-full rounded-2xl border border-cyan-300/20 bg-[#122131] pl-11 pr-4 text-sm font-semibold text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/70 focus:ring-2 focus:ring-cyan-300/25" placeholder="Search submissions..." />
            </label>
            <CustomSelect value={site} onChange={setSite} options={["All", "Noel", "Macias", "Consuelo"]} />
            <CustomSelect value={type} onChange={setType} options={["All", ...feedbackTypes.map((item) => ({ value: item, label: feedbackTypeLabels[item] }))]} />
            <CustomSelect value={rating} onChange={setRating} options={["All", "5", "4", "3", "2", "1"]} />
            <CustomSelect value={sentiment} onChange={setSentiment} options={["All", ...sentiments]} />
            <CustomSelect value={status} onChange={setStatus} options={["All", ...feedbackStatuses]} />
          </div>
        </section>

        {!filtered.length ? (
          <section className="mt-6 grid min-h-[320px] place-items-center rounded-[1.8rem] border border-dashed border-cyan-300/20 bg-[#081522]/78 p-8 text-center">
            <div>
              <BarChart3 className="mx-auto size-12 text-cyan-200" />
              <h2 className="display-title mt-5 text-3xl text-white">No feedback submitted yet.</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">Once users submit feedback, analytics will appear here.</p>
            </div>
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <ChartCard title="Feedback by Site">
                <BarChart data={siteData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#07131c", border: "1px solid rgba(0,242,254,0.2)", color: "#f8fafc" }} /><Bar dataKey="value" fill="#67e8f9" radius={[8, 8, 0, 0]} /></BarChart>
              </ChartCard>
              <ChartCard title="Feedback Trend">
                <LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" /><XAxis dataKey="name" stroke="#94a3b8" /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#07131c", border: "1px solid rgba(0,242,254,0.2)", color: "#f8fafc" }} /><Line type="monotone" dataKey="value" stroke="#6ee7b7" strokeWidth={3} dot={{ r: 4 }} /></LineChart>
              </ChartCard>
              <ChartCard title="Satisfaction Distribution">
                <PieChart><Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={96} paddingAngle={4}>{sentimentData.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip contentStyle={{ background: "#07131c", border: "1px solid rgba(0,242,254,0.2)", color: "#f8fafc" }} /></PieChart>
              </ChartCard>
              <ChartCard title="Feedback by Category">
                <BarChart data={categoryData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" /><XAxis dataKey="name" stroke="#94a3b8" hide /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#07131c", border: "1px solid rgba(0,242,254,0.2)", color: "#f8fafc" }} /><Bar dataKey="value" fill="#a7f3d0" radius={[8, 8, 0, 0]} /></BarChart>
              </ChartCard>
              <ChartCard title="Feedback by Account">
                <BarChart data={accountData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" /><XAxis dataKey="name" stroke="#94a3b8" hide /><YAxis allowDecimals={false} stroke="#94a3b8" /><Tooltip contentStyle={{ background: "#07131c", border: "1px solid rgba(0,242,254,0.2)", color: "#f8fafc" }} /><Bar dataKey="value" fill="#c4b5fd" radius={[8, 8, 0, 0]} /></BarChart>
              </ChartCard>
            </section>

            <section className="mt-6 overflow-hidden rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3 border-b border-cyan-300/10 p-5">
                <div>
                  <h2 className="display-title text-2xl text-white">Feedback Table</h2>
                  <p className="mt-1 text-sm text-slate-500">{filtered.length} records after filters</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-[1040px] w-full text-left text-sm">
                  <thead className="bg-slate-950/35 text-xs uppercase tracking-[0.16em] text-slate-500">
                    <tr>{["ID", "Type", "Site", "Account", "Rating", "Sentiment", "Category", "Status", "Created"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-cyan-300/10">
                    {filtered.slice(0, 100).map((item) => (
                      <tr key={item.id} className="align-top hover:bg-cyan-300/[0.035]">
                        <td className="px-4 py-4 font-bold text-cyan-100">{item.submissionId ?? item.id}</td>
                        <td className="px-4 py-4">{item.feedbackType && item.feedbackType in feedbackTypeLabels ? feedbackTypeLabels[item.feedbackType as keyof typeof feedbackTypeLabels] : "Legacy"}</td>
                        <td className="px-4 py-4">{item.siteName}</td>
                        <td className="px-4 py-4">{item.account || "None"}</td>
                        <td className="px-4 py-4">{item.rating}/5</td>
                        <td className="px-4 py-4">{sentimentBucket(item)}</td>
                        <td className="px-4 py-4 max-w-[220px]"><span className="block font-semibold text-white">{item.category}</span><span className="mt-1 line-clamp-2 block text-xs text-slate-500">{item.message ?? item.comment}</span></td>
                        <td className="px-4 py-4 min-w-[180px]"><CustomSelect value={item.status ?? "New"} onChange={(value) => void setRowStatus(item, value)} options={feedbackStatuses} /></td>
                        <td className="px-4 py-4">{new Date(item.createdAt ?? item.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function Kpi({ title, value, icon: Icon, tone = "cyan" }: { title: string; value: string | number; icon: LucideIcon; tone?: "cyan" | "rose" }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="rounded-[1.5rem] border border-cyan-300/15 bg-[#081522]/88 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.2)] backdrop-blur-xl">
      <div className={`grid size-11 place-items-center rounded-2xl ${tone === "rose" ? "bg-rose-400/10 text-rose-100" : "bg-cyan-300/10 text-cyan-100"}`}><Icon className="size-5" /></div>
      <p className="display-title mt-5 truncate text-3xl text-white">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{title}</p>
    </motion.div>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactElement }) {
  return (
    <div className="rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-5 backdrop-blur-xl">
      <h2 className="display-title text-2xl text-white">{title}</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">{children}</ResponsiveContainer>
      </div>
    </div>
  );
}
