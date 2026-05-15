import { motion, useReducedMotion, type MotionStyle } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface FloatingFeedbackCardProps {
  title: string;
  text: string;
  emoji?: string;
  icon?: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  style?: MotionStyle;
}

export function FloatingFeedbackCard({
  title,
  text,
  emoji,
  icon,
  delay = 0,
  duration = 4,
  className,
  style,
}: FloatingFeedbackCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={reducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -8, 0], scale: 1 }}
      transition={
        reducedMotion
          ? { delay, duration: 0.24, ease: "easeOut" }
          : {
              opacity: { delay, duration: 0.35, ease: "easeOut" },
              scale: { delay, duration: 0.35, ease: "easeOut" },
              y: { delay, duration, repeat: Infinity, ease: "easeInOut" },
            }
      }
      whileHover={reducedMotion ? undefined : { y: -10, scale: 1.035 }}
      style={style}
      className={cn(
        "pointer-events-auto w-[min(218px,44vw)] rounded-2xl border border-cyan-300/15 bg-[#061522]/86 p-4 text-left text-slate-100 shadow-[0_18px_55px_rgba(0,0,0,0.34)] backdrop-blur-xl",
        "supports-[backdrop-filter]:bg-[#061522]/70",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
          {emoji ?? icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-extrabold text-white">{title}</p>
          <p className="mt-1 text-xs leading-5 text-slate-300">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
