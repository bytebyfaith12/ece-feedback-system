import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, Paperclip, Send } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import { api } from "@/services/api";
import type { Rating } from "@/types";
import { Button } from "@/components/ui/Button";
import { Field, SelectInput, TextAreaInput, TextInput } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/ToastNotification";
import { EmojiRating } from "@/components/feedback/EmojiRating";
import { FeedbackCard } from "@/components/feedback/FeedbackCard";

const initialForm = {
  userType: "",
  fullName: "",
  employeeOrVisitorId: "",
  site: "",
  floor: "",
  accountDepartment: "",
  role: "",
  email: "",
  category: "",
  rating: "" as Rating | "",
  comment: "",
  deviceKioskId: "",
};

export function MultiStepFeedbackForm() {
  const meta = useMeta();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const site = meta?.sites.find((item) => item.name === form.site);
  const floors = site?.floors ?? [];
  const floor = floors.find((item) => item.name === form.floor);
  const accounts = floor?.accounts ?? meta?.accounts ?? [];

  const progress = useMemo(() => (step / 5) * 100, [step]);

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const canContinue = () => {
    if (step === 1) return Boolean(form.userType);
    if (step === 2) return Boolean(form.fullName && form.employeeOrVisitorId && form.site && form.floor && form.accountDepartment && form.role);
    if (step === 3) return Boolean(form.category);
    if (step === 4) return Boolean(form.rating);
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => payload.append(key, value));
      if (attachment) payload.append("attachment", attachment);
      const response = await api.submitFeedback(payload);
      showToast({ title: "Feedback submitted", message: "Thank you for helping ECE improve.", type: "success" });
      navigate("/thank-you", { state: { feedbackId: response.data.feedbackId } });
    } catch (error) {
      showToast({ title: "Could not submit feedback", message: error instanceof Error ? error.message : "Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FeedbackCard className="mx-auto max-w-3xl">
      <div className="mb-8">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <motion.div className="h-full rounded-full bg-emerald-600" animate={{ width: `${progress}%` }} />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-500">Step {step} of 5</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.22 }}>
          {step === 1 ? (
            <div>
              <h1 className="text-3xl font-black text-slate-950">Who are you?</h1>
              <p className="mt-2 text-slate-500">Choose the option that best describes you.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {meta?.userTypes.map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      update("userType", type);
                      update("role", type);
                    }}
                    className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${
                      form.userType === type ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h1 className="text-3xl font-black text-slate-950">Tell us the basics</h1>
              <p className="mt-2 text-slate-500">This helps the right team understand where support is needed.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <Field label="Full Name"><TextInput value={form.fullName} onChange={(e) => update("fullName", e.target.value)} /></Field>
                <Field label="Employee ID / Visitor Name"><TextInput value={form.employeeOrVisitorId} onChange={(e) => update("employeeOrVisitorId", e.target.value)} /></Field>
                <Field label="Site">
                  <SelectInput value={form.site} onChange={(e) => setForm((current) => ({ ...current, site: e.target.value, floor: "", accountDepartment: "" }))}>
                    <option value="">Select site</option>
                    {meta?.sites.map((item) => <option key={item.name}>{item.name}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Floor">
                  <SelectInput value={form.floor} onChange={(e) => setForm((current) => ({ ...current, floor: e.target.value, accountDepartment: "" }))}>
                    <option value="">Select floor</option>
                    {floors.map((item) => <option key={item.name}>{item.name}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Account / Department">
                  <SelectInput value={form.accountDepartment} onChange={(e) => update("accountDepartment", e.target.value)}>
                    <option value="">Select account or department</option>
                    {accounts.map((account) => <option key={account}>{account}</option>)}
                  </SelectInput>
                </Field>
                <Field label="Role"><TextInput value={form.role} onChange={(e) => update("role", e.target.value)} /></Field>
                <Field label="Optional email"><TextInput type="email" value={form.email} onChange={(e) => update("email", e.target.value)} /></Field>
                <Field label="Device / Kiosk ID if applicable"><TextInput value={form.deviceKioskId} onChange={(e) => update("deviceKioskId", e.target.value)} placeholder="Optional" /></Field>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h1 className="text-3xl font-black text-slate-950">What is this about?</h1>
              <p className="mt-2 text-slate-500">Pick one category.</p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                {meta?.feedbackCategories.map((category) => (
                  <button
                    type="button"
                    key={category}
                    onClick={() => update("category", category)}
                    className={`rounded-2xl border p-4 text-left text-sm font-bold transition ${
                      form.category === category ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h1 className="text-3xl font-black text-slate-950">How was your experience?</h1>
              <p className="mt-2 text-slate-500">Tap the face that best matches your feedback.</p>
              <div className="mt-8"><EmojiRating value={form.rating || undefined} onChange={(rating) => update("rating", rating)} /></div>
            </div>
          ) : null}

          {step === 5 ? (
            <div>
              <h1 className="text-3xl font-black text-slate-950">Anything else?</h1>
              <p className="mt-2 text-slate-500">Optional details can help the right team act faster.</p>
              <div className="mt-6 space-y-4">
                <Field label="Additional feedback"><TextAreaInput value={form.comment} onChange={(e) => update("comment", e.target.value)} placeholder="Type your comment here..." /></Field>
                <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50">
                  <Paperclip className="size-5 text-emerald-600" />
                  <span>{attachment ? attachment.name : "Upload attachment or photo (optional)"}</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.webp,.pdf" className="hidden" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
        <Button variant="secondary" disabled={step === 1 || submitting} onClick={() => setStep((value) => Math.max(1, value - 1))}>
          <ArrowLeft className="size-4" />
          Go back
        </Button>
        {step < 5 ? (
          <Button disabled={!canContinue()} onClick={() => setStep((value) => Math.min(5, value + 1))}>
            Continue
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button disabled={submitting} onClick={submit}>
            {submitting ? <CheckCircle2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit feedback
          </Button>
        )}
      </div>
    </FeedbackCard>
  );
}
