import type { SmileyRating } from "@/types/index";

const emoji: Record<SmileyRating, string> = { 1: "😡", 2: "🙁", 3: "😐", 4: "🙂", 5: "😄" };
const colors: Record<SmileyRating, string> = {
  1: "bg-red-100 text-red-700",
  2: "bg-rose-100 text-rose-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-green-100 text-green-700",
  5: "bg-emerald-100 text-emerald-700",
};

export function SmileyBadge({ rating }: { rating: SmileyRating }) {
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${colors[rating]}`}>{emoji[rating]} {rating}</span>;
}

