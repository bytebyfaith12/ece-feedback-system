import type { FeedbackRecord } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState";

export function RecentFeedbackTable({ records }: { records: FeedbackRecord[] }) {
  if (!records.length) {
    return <EmptyState title="No feedback yet" description="Most recent feedback will appear here after the first response." />;
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <h2 className="text-lg font-black text-slate-950">Most Recent Feedback</h2>
        <p className="mt-1 text-sm text-slate-500">Latest saved responses from the database.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Rating</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Site</th>
              <th className="px-5 py-3">Account</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-5 py-4 font-semibold text-slate-950">{record.feedbackId}</td>
                <td className="px-5 py-4">{record.rating}</td>
                <td className="px-5 py-4 text-slate-600">{record.category}</td>
                <td className="px-5 py-4 text-slate-600">{record.site}</td>
                <td className="px-5 py-4 text-slate-600">{record.accountDepartment}</td>
                <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">{record.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
