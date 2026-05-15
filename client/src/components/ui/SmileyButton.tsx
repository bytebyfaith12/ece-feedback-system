import { motion } from "framer-motion";
import type { SmileyRating } from "@/types/index";
import { cn } from "@/utils/cn";

export const smileyMeta: Record<SmileyRating, { emoji: string; label: string; color: string; text: string }> = {
  1: { emoji: "😡", label: "Very Unhappy", color: "bg-smiley-very-unhappy", text: "text-smiley-very-unhappy" },
  2: { emoji: "🙁", label: "Unhappy", color: "bg-smiley-unhappy", text: "text-red-500" },
  3: { emoji: "😐", label: "Neutral", color: "bg-smiley-neutral", text: "text-amber-500" },
  4: { emoji: "🙂", label: "Happy", color: "bg-smiley-happy", text: "text-green-500" },
  5: { emoji: "😄", label: "Very Happy", color: "bg-smiley-very-happy", text: "text-smiley-very-happy" },
};

export function SmileyButton({ rating, selected, onClick }: { rating: SmileyRating; selected?: boolean; onClick: (rating: SmileyRating) => void }) {
  const meta = smileyMeta[rating];
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => onClick(rating)}
      className="group flex flex-col items-center gap-3"
    >
      <span className={cn("grid size-[100px] place-items-center rounded-full text-5xl shadow-sm transition-all group-hover:shadow-card-hover", meta.color, selected && "ring-4 ring-brand-green ring-offset-4 shadow-smiley-selected")}>
        {meta.emoji}
      </span>
      <span className={cn("text-center text-[11px] font-bold uppercase tracking-wide", meta.text)}>{meta.label}</span>
    </motion.button>
  );
}

