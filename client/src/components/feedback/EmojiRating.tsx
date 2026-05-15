import { motion } from "framer-motion";
import { ratingOptions } from "@/data/mockData";
import type { Rating } from "@/types";

export function EmojiRating({
  value,
  onChange,
  compact = false,
}: {
  value?: Rating;
  onChange: (rating: Rating, score: number) => void;
  compact?: boolean;
}) {
  return (
    <div className={`grid gap-3 ${compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 md:grid-cols-5"}`}>
      {ratingOptions.map((option) => (
        <motion.button
          type="button"
          key={option.label}
          whileTap={{ scale: 0.9 }}
          whileHover={{ y: -6 }}
          onClick={() => onChange(option.label, option.score)}
          className={`rounded-[1.5rem] border p-4 text-center transition ${
            value === option.label ? "border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-100" : "border-slate-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/60"
          }`}
        >
          <span className={`${compact ? "text-4xl" : "text-5xl lg:text-6xl"} block`}>{option.emoji}</span>
          <span className="mt-3 block text-sm font-black text-slate-950">{option.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
