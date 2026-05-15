import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AlertCircle, ArrowRight, Building2, CheckCircle2, FileUp, Loader2, Mail, Send, UserRound, X } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { StarRating } from "@/components/forms/StarRating";
import { accountOptions, categoryOptionsByType, departmentOptions, feedbackTypeCards, floorOptions, productionSiteOptions, recruitmentStageOptions, serviceTypeOptions, visitPurposeOptions } from "@/lib/feedbackConfig";
import { feedbackInputSchema, validateAttachment } from "@/lib/feedbackValidation";
import { useFeedbackStore } from "@/store/useFeedbackStore";
import type { FeedbackType, ProductionFeedbackInput, ProductionFeedbackRecord, ProductionSite } from "@/types/feedback";
import { feedbackTypeLabels, feedbackTypes } from "@/types/feedback";

type FieldErrors = Partial<Record<keyof ProductionFeedbackInput | "attachment" | "form", string>>;

const emptyByType: Record<FeedbackType, Pick<ProductionFeedbackInput, "category">> = {
  workplace: { category: categoryOptionsByType.workplace[0] },
  service: { category: categoryOptionsByType.service[0] },
  visitor: { category: categoryOptionsByType.visitor[0] },
  applicant: { category: categoryOptionsByType.applicant[0] },
  account: { category: categoryOptionsByType.account[0] },
};

function defaultInput(type: FeedbackType = "workplace"): ProductionFeedbackInput {
  return {
    feedbackType: type,
    fullName: "",
    email: "",
    isAnonymous: false,
    site: "Noel",
    floor: "Ground Floor",
    account: "",
    department: "",
    serviceType: "",
    visitPurpose: "",
    personVisited: "",
    positionApplied: "",
    recruitmentStage: "",
    operationalConcern: "",
    rating: 0,
    category: emptyByType[type].category,
    message: "",
  };
}

function pickInitialType(value: string | null): FeedbackType {
  return feedbackTypes.includes(value as FeedbackType) ? (value as FeedbackType) : "workplace";
}

function fieldErrorMap(error: unknown): FieldErrors {
  const fields: FieldErrors = {};
  if (error && typeof error === "object" && "issues" in error) {
    for (const issue of (error as { issues: Array<{ path: Array<string | number>; message: string }> }).issues) {
      const key = issue.path[0] as keyof ProductionFeedbackInput | undefined;
      if (key && !fields[key]) fields[key] = issue.message;
    }
  }
  return fields;
}

function inputClass(hasError?: boolean) {
  return `h-12 w-full rounded-2xl border bg-[#122131] px-4 text-sm font-semibold text-slate-50 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/25 ${
    hasError ? "border-red-300/60" : "border-cyan-300/20 focus:border-cyan-300/70"
  }`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert" className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-red-200">
      <AlertCircle className="size-3.5" />
      {message}
    </p>
  ) : null;
}

export function ProductionFeedbackForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const submitProductionFeedback = useFeedbackStore((state) => state.submitProductionFeedback);
  const [input, setInput] = useState<ProductionFeedbackInput>(() => defaultInput(pickInitialType(searchParams.get("type"))));
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [successRecord, setSuccessRecord] = useState<ProductionFeedbackRecord | null>(null);

  const siteFloors = floorOptions[input.site] ?? [];
  const siteAccounts = accountOptions[input.site] ?? [];
  const categories = categoryOptionsByType[input.feedbackType];
  const showFloor = input.feedbackType === "workplace" || input.feedbackType === "account";
  const showAccount = input.feedbackType === "account";
  const messageCount = input.message.length;

  useEffect(() => {
    const nextType = pickInitialType(searchParams.get("type"));
    queueMicrotask(() => {
      setInput((current) => (current.feedbackType === nextType ? current : { ...defaultInput(nextType), fullName: current.fullName, email: current.email, isAnonymous: current.isAnonymous, site: current.site }));
    });
  }, [searchParams]);

  const update = <K extends keyof ProductionFeedbackInput>(key: K, value: ProductionFeedbackInput[K]) => {
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
    setInput((current) => ({ ...current, [key]: value }));
  };

  const setFeedbackType = (feedbackType: FeedbackType) => {
    setErrors({});
    setInput((current) => ({
      ...current,
      feedbackType,
      category: categoryOptionsByType[feedbackType][0],
      account: feedbackType === "account" ? current.account : "",
      floor: feedbackType === "workplace" || feedbackType === "account" ? current.floor || siteFloors[0] : "",
      department: "",
      serviceType: "",
      visitPurpose: "",
      personVisited: "",
      positionApplied: "",
      recruitmentStage: "",
      operationalConcern: "",
    }));
  };

  const setSite = (site: string) => {
    const typedSite = site as ProductionSite;
    setInput((current) => ({
      ...current,
      site: typedSite,
      floor: floorOptions[typedSite][0] ?? "",
      account: "",
    }));
  };

  const attachmentSummary = useMemo(() => {
    if (!attachment) return "Images or PDF, up to 5MB";
    return `${attachment.name} (${Math.max(1, Math.round(attachment.size / 1024))} KB)`;
  }, [attachment]);

  const onAttachmentChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    const error = validateAttachment(file);
    if (error) {
      setAttachment(null);
      setErrors((current) => ({ ...current, attachment: error }));
      event.target.value = "";
      return;
    }
    setAttachment(file);
    setErrors((current) => ({ ...current, attachment: undefined }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const attachmentError = validateAttachment(attachment);
    const parsed = feedbackInputSchema.safeParse(input);
    if (!parsed.success || attachmentError) {
      setErrors({ ...fieldErrorMap(parsed.success ? undefined : parsed.error), attachment: attachmentError ?? undefined });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const record = await submitProductionFeedback(parsed.data, attachment);
      setSuccessRecord(record);
      toast.success("Feedback submitted successfully.");
      navigate("/thank-you", { state: { record }, replace: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Feedback could not be submitted. Please try again.";
      setErrors({ form: message });
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="main-content" className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_0%,rgba(0,242,254,0.11),transparent_28%),linear-gradient(180deg,#06111b,#02070d)] px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(0,242,254,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.08)_1px,transparent_1px)] [background-size:42px_42px]" />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: reducedMotion ? 0 : 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative mx-auto grid max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]"
        noValidate
      >
        <div className="space-y-6">
          <section className="rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl md:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Choose feedback type</p>
            <h1 className="display-title mt-3 text-3xl text-white md:text-4xl">Tell Us What Happened</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">Submit workplace, service, visitor, applicant, or account feedback. The admin dashboard updates only after this real submission is saved.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {feedbackTypeCards.map(({ type, title, description, icon: Icon }, index) => {
                const active = input.feedbackType === type;
                return (
                  <motion.button
                    key={type}
                    type="button"
                    initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={reducedMotion ? undefined : { y: -4 }}
                    whileTap={reducedMotion ? undefined : { scale: 0.98 }}
                    onClick={() => setFeedbackType(type)}
                    className={`min-h-[154px] rounded-3xl border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-cyan-300/45 ${
                      active ? "border-cyan-200/70 bg-cyan-300/12 shadow-[0_0_32px_rgba(0,242,254,0.15)]" : "border-slate-700/80 bg-slate-950/35 hover:border-cyan-300/40 hover:bg-cyan-300/[0.06]"
                    }`}
                  >
                    <Icon className={`size-7 ${active ? "text-cyan-100" : "text-slate-400"}`} />
                    <span className="mt-4 block font-extrabold text-white">{title}</span>
                    <span className="mt-2 block text-xs leading-5 text-slate-400">{description}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <section className="grid gap-6 rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-5 backdrop-blur-xl md:grid-cols-2 md:p-7">
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">About you</p>
              <h2 className="display-title mt-2 text-2xl text-white">Contact Details</h2>
            </div>
            <div>
              <label htmlFor="fullName" className="mb-2 block text-sm font-bold text-slate-200">Full name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input id="fullName" value={input.fullName} onChange={(event) => update("fullName", event.target.value)} disabled={input.isAnonymous} aria-required={!input.isAnonymous} aria-describedby="fullName-error" className={`${inputClass(Boolean(errors.fullName))} pl-11 disabled:opacity-50`} placeholder={input.isAnonymous ? "Anonymous feedback" : "Juan Dela Cruz"} />
              </div>
              <FieldError id="fullName-error" message={errors.fullName} />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-bold text-slate-200">Email optional</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                <input id="email" type="email" value={input.email ?? ""} onChange={(event) => update("email", event.target.value)} aria-describedby="email-error" className={`${inputClass(Boolean(errors.email))} pl-11`} placeholder="name@ececontactcenters.com" />
              </div>
              <FieldError id="email-error" message={errors.email} />
            </div>
            <label className="flex min-h-12 items-center justify-between rounded-2xl border border-cyan-300/15 bg-slate-950/35 px-4">
              <span>
                <span className="block text-sm font-bold text-white">Submit anonymously</span>
                <span className="block text-xs text-slate-500">Name is not required when this is on.</span>
              </span>
              <input type="checkbox" checked={input.isAnonymous} onChange={(event) => update("isAnonymous", event.target.checked)} className="size-5 accent-cyan-300" />
            </label>
          </section>

          <section className="grid gap-6 rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-5 backdrop-blur-xl md:grid-cols-2 md:p-7">
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Location</p>
              <h2 className="display-title mt-2 text-2xl text-white">Where Did This Happen?</h2>
            </div>
            <CustomSelect label="Site" value={input.site} onChange={setSite} options={productionSiteOptions} />
            {showFloor ? <CustomSelect label="Floor" value={input.floor ?? ""} onChange={(value) => update("floor", value)} options={siteFloors} /> : null}
            {showAccount ? (
              <div className="md:col-span-2">
                <CustomSelect label="Account / Campaign" value={input.account ?? ""} onChange={(value) => update("account", value)} options={siteAccounts} placeholder="Select account" />
                <FieldError id="account-error" message={errors.account} />
              </div>
            ) : null}
            {input.feedbackType === "workplace" ? <CustomSelect label="Department" value={input.department ?? ""} onChange={(value) => update("department", value)} options={departmentOptions} placeholder="Select department" /> : null}
            {input.feedbackType === "service" ? <CustomSelect label="Service type" value={input.serviceType ?? ""} onChange={(value) => update("serviceType", value)} options={serviceTypeOptions} placeholder="Select service" /> : null}
            {input.feedbackType === "visitor" ? (
              <>
                <CustomSelect label="Visit purpose" value={input.visitPurpose ?? ""} onChange={(value) => update("visitPurpose", value)} options={visitPurposeOptions} placeholder="Select purpose" />
                <div>
                  <label htmlFor="personVisited" className="mb-2 block text-sm font-bold text-slate-200">Person or department visited</label>
                  <input id="personVisited" value={input.personVisited ?? ""} onChange={(event) => update("personVisited", event.target.value)} className={inputClass(Boolean(errors.personVisited))} placeholder="Reception, HR, recruitment..." />
                  <FieldError id="personVisited-error" message={errors.personVisited} />
                </div>
              </>
            ) : null}
            {input.feedbackType === "applicant" ? (
              <>
                <div>
                  <label htmlFor="positionApplied" className="mb-2 block text-sm font-bold text-slate-200">Position applied for</label>
                  <input id="positionApplied" value={input.positionApplied ?? ""} onChange={(event) => update("positionApplied", event.target.value)} className={inputClass(Boolean(errors.positionApplied))} placeholder="Customer service representative" />
                  <FieldError id="positionApplied-error" message={errors.positionApplied} />
                </div>
                <CustomSelect label="Recruitment stage" value={input.recruitmentStage ?? ""} onChange={(value) => update("recruitmentStage", value)} options={recruitmentStageOptions} placeholder="Select stage" />
              </>
            ) : null}
            {input.feedbackType === "account" ? (
              <div className="md:col-span-2">
                <label htmlFor="operationalConcern" className="mb-2 block text-sm font-bold text-slate-200">Operational concern</label>
                <input id="operationalConcern" value={input.operationalConcern ?? ""} onChange={(event) => update("operationalConcern", event.target.value)} className={inputClass(Boolean(errors.operationalConcern))} placeholder="Queue support, tools, schedule, coaching..." />
                <FieldError id="operationalConcern-error" message={errors.operationalConcern} />
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/88 p-5 backdrop-blur-xl md:grid-cols-2 md:p-7">
            <div className="md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">Details</p>
              <h2 className="display-title mt-2 text-2xl text-white">{feedbackTypeLabels[input.feedbackType]}</h2>
            </div>
            <CustomSelect label="Category" value={input.category} onChange={(value) => update("category", value)} options={categories} />
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-200">Rate your experience</label>
              <StarRating value={input.rating} onChange={(value) => update("rating", value)} errorId="rating-error" />
              <FieldError id="rating-error" message={errors.rating} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="message" className="mb-2 block text-sm font-bold text-slate-200">Detailed comments</label>
              <textarea
                id="message"
                value={input.message}
                onChange={(event) => update("message", event.target.value.slice(0, 500))}
                rows={5}
                maxLength={500}
                aria-required
                aria-describedby="message-error message-count"
                className={`min-h-[132px] w-full resize-y rounded-3xl border bg-[#122131] p-4 text-sm font-medium leading-6 text-slate-50 outline-none transition placeholder:text-slate-500 focus:ring-2 focus:ring-cyan-300/25 ${errors.message ? "border-red-300/60" : "border-cyan-300/20 focus:border-cyan-300/70"}`}
                placeholder="Please share what happened, where it happened, and what would help improve the experience."
              />
              <div className="mt-2 flex items-center justify-between gap-3">
                <FieldError id="message-error" message={errors.message} />
                <span id="message-count" className={`ml-auto text-xs font-semibold ${messageCount > 460 ? "text-amber-200" : "text-slate-500"}`}>{messageCount}/500</span>
              </div>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="attachment" className="mb-2 block text-sm font-bold text-slate-200">Optional attachment</label>
              <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-cyan-300/20 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-2xl bg-cyan-300/10 text-cyan-100"><FileUp className="size-5" /></span>
                  <div>
                    <p className="text-sm font-bold text-white">{attachment ? "Attachment selected" : "Attach an image or PDF"}</p>
                    <p className="text-xs text-slate-500">{attachmentSummary}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label className="inline-flex min-h-11 cursor-pointer items-center rounded-2xl border border-cyan-300/20 px-4 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/10">
                    Choose file
                    <input id="attachment" type="file" accept="image/*,application/pdf" onChange={onAttachmentChange} className="sr-only" />
                  </label>
                  {attachment ? (
                    <button type="button" onClick={() => setAttachment(null)} className="grid size-11 place-items-center rounded-2xl border border-slate-700 text-slate-300 hover:bg-slate-800" aria-label="Remove selected attachment">
                      <X className="size-4" />
                    </button>
                  ) : null}
                </div>
              </div>
              <FieldError id="attachment-error" message={errors.attachment} />
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-[1.8rem] border border-cyan-300/15 bg-[#081522]/92 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl md:p-6">
            <Building2 className="size-8 text-cyan-100" />
            <h2 className="display-title mt-4 text-2xl text-white">Submission Summary</h2>
            <div className="mt-5 space-y-3 text-sm">
              {[
                ["Type", feedbackTypeLabels[input.feedbackType]],
                ["Site", input.site],
                ["Location", showAccount ? input.account || "Account required" : showFloor ? input.floor || "Floor selected" : "Site level"],
                ["Category", input.category],
                ["Rating", input.rating ? `${input.rating}/5` : "Not rated"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 rounded-2xl border border-cyan-300/10 bg-slate-950/35 px-4 py-3">
                  <span className="text-slate-500">{label}</span>
                  <span className="text-right font-bold text-slate-100">{value}</span>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {errors.form ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="alert" className="mt-4 rounded-2xl border border-red-300/25 bg-red-500/10 p-3 text-sm text-red-100">
                  {errors.form}
                </motion.div>
              ) : null}
            </AnimatePresence>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={reducedMotion || submitting ? undefined : { y: -2 }}
              whileTap={reducedMotion || submitting ? undefined : { scale: 0.98 }}
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-5 font-extrabold text-[#031017] shadow-[0_20px_50px_rgba(0,242,254,0.18)] transition hover:shadow-[0_24px_70px_rgba(0,242,254,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
              {submitting ? "Submitting..." : "Submit Feedback"}
            </motion.button>
            <p className="mt-4 text-xs leading-5 text-slate-500">Admin analytics, cases, and alerts update only after a real submission is saved.</p>
          </section>
        </aside>
      </motion.form>

      <AnimatePresence>
        {successRecord ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] grid place-items-center bg-[#02070d]/78 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} className="w-full max-w-lg rounded-[2rem] border border-emerald-300/25 bg-[#071620] p-6 text-center shadow-[0_30px_120px_rgba(0,0,0,0.42)]">
              <CheckCircle2 className="mx-auto size-14 text-emerald-200" />
              <h2 className="display-title mt-4 text-3xl text-white">Thank you</h2>
              <p className="mt-2 text-sm text-slate-400">Your feedback was submitted successfully.</p>
              <div className="mt-5 rounded-2xl bg-slate-950/45 p-4 text-left text-sm">
                <p className="text-slate-500">Submission ID</p>
                <p className="font-extrabold text-cyan-100">{successRecord.submissionId}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => { setSuccessRecord(null); setInput(defaultInput(input.feedbackType)); setAttachment(null); }} className="rounded-2xl border border-cyan-300/20 px-4 py-3 text-sm font-bold text-cyan-100 hover:bg-cyan-300/10">Submit another</button>
                <Link to="/admin" className="rounded-2xl bg-cyan-300 px-4 py-3 text-sm font-extrabold text-[#031017] hover:bg-emerald-300">
                  View dashboard <ArrowRight className="ml-1 inline size-4" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
