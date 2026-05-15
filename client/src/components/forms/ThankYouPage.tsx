import { CheckCircle2, Home, RotateCcw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import type { ProductionFeedbackRecord } from "@/types/feedback";
import { feedbackStatusLabels, feedbackTypeLabels, sentimentLabels } from "@/types/feedback";

export function ThankYouPage() {
  const location = useLocation();
  const record = (location.state as { record?: ProductionFeedbackRecord } | null)?.record;

  return (
    <main id="main-content" className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_50%_0%,rgba(0,242,254,0.14),transparent_32%),linear-gradient(180deg,#06111b,#02070d)] p-4 text-slate-100">
      <section className="w-full max-w-2xl rounded-[2rem] border border-emerald-300/25 bg-[#081522]/90 p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-8">
        <CheckCircle2 className="mx-auto size-16 text-emerald-200" />
        <h1 className="display-title mt-5 text-4xl text-white">Thank You</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">Your feedback has been received. The command center will update from this real submission.</p>
        {record ? (
          <div className="mt-6 grid gap-3 rounded-3xl border border-cyan-300/12 bg-slate-950/40 p-4 text-left sm:grid-cols-2">
            <Summary label="Submission ID" value={record.submissionId} />
            <Summary label="Category" value={feedbackTypeLabels[record.feedbackType]} />
            <Summary label="Rating" value={`${record.rating}/5 - ${sentimentLabels[record.sentiment]}`} />
            <Summary label="Site" value={record.site} />
            <Summary label="Status" value={feedbackStatusLabels[record.status]} />
            <Summary label="Submitted" value={new Date(record.createdAt).toLocaleString()} />
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-cyan-300/12 bg-slate-950/40 p-5 text-sm text-slate-400">Submission details are available immediately after submitting a feedback form.</div>
        )}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/submit-feedback" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 font-extrabold text-[#031017] hover:bg-emerald-300">
            <RotateCcw className="size-4" />
            Submit Another Feedback
          </Link>
          <Link to="/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 px-5 font-bold text-cyan-100 hover:bg-cyan-300/10">
            <Home className="size-4" />
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/10 bg-[#07131c] p-4">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-extrabold text-slate-100">{value}</p>
    </div>
  );
}
