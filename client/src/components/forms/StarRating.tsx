import { motion, useReducedMotion } from "framer-motion";
import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  errorId,
}: {
  value: number;
  onChange: (value: number) => void;
  errorId?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div role="radiogroup" aria-label="Rate your experience" aria-describedby={errorId} className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((rating) => {
        const selected = rating <= value;
        return (
          <motion.button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
            whileHover={reducedMotion ? undefined : { y: -2, scale: 1.03 }}
            whileTap={reducedMotion ? undefined : { scale: 0.95 }}
            onClick={() => onChange(rating)}
            className={`grid size-12 place-items-center rounded-2xl border text-sm transition focus:outline-none focus:ring-2 focus:ring-cyan-300/50 ${
              selected
                ? "border-cyan-200/70 bg-cyan-300/15 text-cyan-100 shadow-[0_0_26px_rgba(0,242,254,0.18)]"
                : "border-slate-700 bg-slate-950/55 text-slate-500 hover:border-cyan-300/40 hover:text-cyan-100"
            }`}
          >
            <Star className={`size-5 ${selected ? "fill-cyan-200" : ""}`} />
          </motion.button>
        );
      })}
    </div>
  );
}
