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
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.34, ease: "easeOut" }}
      style={style}
      className={cn("pointer-events-auto", className)}
    >
      <motion.div
        animate={reducedMotion ? undefined : { y: [0, -8, 0], x: [0, 3, 0], rotate: [0, 0.45, 0] }}
        transition={reducedMotion ? undefined : { delay, duration, repeat: Infinity, ease: "easeInOut" }}
        whileHover={reducedMotion ? undefined : { y: -10, scale: 1.035, rotate: -1.2 }}
        className={cn(
          "relative w-[min(226px,45vw)] overflow-hidden rounded-3xl border border-cyan-300/18 bg-[rgba(6,21,34,0.94)] p-4 text-left text-slate-100 shadow-[0_18px_55px_rgba(0,0,0,0.34),0_0_28px_rgba(0,242,254,0.1)] backdrop-blur-xl",
          "supports-[backdrop-filter]:bg-[rgba(6,21,34,0.84)]",
        )}
      >
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
        <div className="flex items-start gap-3">
          <motion.span
            animate={reducedMotion ? undefined : { scale: [1, 1.08, 1], rotate: [0, -4, 0] }}
            transition={reducedMotion ? undefined : { duration: 2.4 + delay, repeat: Infinity, ease: "easeInOut" }}
            className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white text-2xl shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
          >
            {emoji ?? icon}
          </motion.span>
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-white">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-200">{text}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
