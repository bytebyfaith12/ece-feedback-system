import { useState } from "react";
import type { FeedbackRecord } from "@/types";
import { api } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextAreaInput } from "@/components/ui/FormField";
import { useMeta } from "@/hooks/useMeta";
import { useToast } from "@/components/ui/ToastNotification";
import { EmptyState } from "@/components/ui/EmptyState";

export function AdminFeedbackTable({ records, onChanged }: { records: FeedbackRecord[]; onChanged: () => void }) {
  const meta = useMeta();
  const { showToast } = useToast();
  const [selected, setSelected] = useState<FeedbackRecord | null>(null);
  const [patch, setPatch] = useState({ status: "", assignedTeam: "", adminNotes: "", resolutionNotes: "" });

  if (!records.length) return <EmptyState title="No feedback records yet" description="Feedback records will appear here when users submit responses." />;

  const edit = (record: FeedbackRecord) => {
    setSelected(record);
    setPatch({
      status: record.status,
      assignedTeam: record.assignedTeam,
      adminNotes: record.adminNotes || "",
      resolutionNotes: record.resolutionNotes || "",
    });
  };

  const save = async () => {
    if (!selected) return;
    await api.updateFeedback(selected.id || selected.feedbackId, patch);
    showToast({ title: "Feedback updated", message: "Admin action was saved and audited.", type: "success" });
    setSelected(null);
    onChanged();
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Feedback</th>
                <th className="px-5 py-3">Person</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Assigned</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((record) => (
                <tr key={record.id}>
                  <td className="px-5 py-4 font-bold text-slate-950">{record.feedbackId}</td>
                  <td className="px-5 py-4 text-slate-600">{record.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">{record.category}</td>
                  <td className="px-5 py-4">{record.rating}</td>
                  <td className="px-5 py-4">{record.assignedTeam}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">{record.status}</span></td>
                  <td className="px-5 py-4"><Button variant="secondary" onClick={() => edit(record)}>Review</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">{selected ? `Review ${selected.feedbackId}` : "Select a record"}</h2>
        <p className="mt-1 text-sm text-slate-500">Assign, update status, add notes, resolve, or archive.</p>
        {selected ? (
          <div className="mt-5 space-y-4">
            <Field label="Status">
              <SelectInput value={patch.status} onChange={(e) => setPatch({ ...patch, status: e.target.value })}>
                {meta?.feedbackStatuses.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Assigned team">
              <SelectInput value={patch.assignedTeam} onChange={(e) => setPatch({ ...patch, assignedTeam: e.target.value })}>
                {meta?.assignedTeams.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </Field>
            <Field label="Admin notes"><TextAreaInput value={patch.adminNotes} onChange={(e) => setPatch({ ...patch, adminNotes: e.target.value })} /></Field>
            <Field label="Resolution notes"><TextAreaInput value={patch.resolutionNotes} onChange={(e) => setPatch({ ...patch, resolutionNotes: e.target.value })} /></Field>
            <div className="flex flex-wrap gap-3">
              <Button onClick={save}>Save changes</Button>
              <Button variant="danger" onClick={() => setPatch({ ...patch, status: "Archived" })}>Archive</Button>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">Choose a feedback row to manage it.</div>
        )}
      </section>
    </div>
  );
}
