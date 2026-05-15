import { CheckCircle2, Languages, Mic, QrCode } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { FeedbackMode, SmileyRating } from "@/types/index";
import { SmileyButton } from "@/components/ui/SmileyButton";

interface Props {
  autoReset?: boolean;
  resetDelay?: number;
  showFollowUp?: boolean;
  locationId?: string;
  locationName?: string;
  questionText?: string;
  buttonMode?: FeedbackMode;
  language?: string;
  showQR?: boolean;
  onSubmit?: (rating: SmileyRating, followUps?: string[], comment?: string) => void;
}

export function SmileyFeedback({
  autoReset = true,
  resetDelay = 3000,
  showFollowUp = true,
  locationName = "ECE Touchpoint",
  questionText = "How was your experience?",
  buttonMode = "4button",
  language = "EN",
  showQR = true,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState<SmileyRating | null>(null);
  const [done, setDone] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const ratings: SmileyRating[] = buttonMode === "4button" ? [5, 4, 2, 1] : [5, 4, 3, 2, 1];
  const needsFollowUp = showFollowUp && rating !== null && rating <= 2 && !done;

  useEffect(() => {
    if (!done || !autoReset) return undefined;
    const timer = window.setTimeout(() => {
      setRating(null);
      setDone(false);
      setFollowUps([]);
      setComment("");
    }, resetDelay);
    return () => window.clearTimeout(timer);
  }, [autoReset, done, resetDelay]);

  const submit = (value: SmileyRating, submitNow = false) => {
    setRating(value);
    if (value > 2 || submitNow || !showFollowUp) {
      setDone(true);
      onSubmit?.(value, followUps, comment);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-8 text-center shadow-card">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-12">
            <CheckCircle2 className="mx-auto size-20 text-brand-green" />
            <h3 className="mt-6 font-display text-3xl font-extrabold text-brand-navy">Thank you!</h3>
            <p className="mt-2 text-slate-500">Your response helps us improve.</p>
          </motion.div>
        ) : needsFollowUp ? (
          <motion.div key="follow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h3 className="font-display text-2xl font-bold text-brand-navy">What went wrong?</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["Dirty area", "No supplies", "Bad odor", "Slow response", "Broken fixture", "Other"].map((item) => (
                <button key={item} onClick={() => setFollowUps((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])} className={`rounded-full border px-4 py-2 text-sm font-semibold ${followUps.includes(item) ? "border-brand-green bg-green-50 text-green-700" : "border-gray-200 text-slate-600"}`}>{item}</button>
              ))}
            </div>
            <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Optional comment" className="mt-6 min-h-28 w-full rounded-2xl border border-gray-200 p-4 outline-none focus:ring-2 focus:ring-brand-green" />
            <button onClick={() => rating && submit(rating, true)} className="mt-5 rounded-xl bg-brand-green px-6 py-3 font-semibold text-white hover:bg-brand-green-dark">Submit</button>
          </motion.div>
        ) : (
          <motion.div key="question" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-green">{locationName}</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold text-brand-navy">{questionText}</h2>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {ratings.map((item) => <SmileyButton key={item} rating={item} selected={rating === item} onClick={submit} />)}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Languages className="size-4" /> {language}</span>
              {showQR ? <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><QrCode className="size-4" /> QR Code</span> : null}
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2"><Mic className="size-4" /> Voice</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

