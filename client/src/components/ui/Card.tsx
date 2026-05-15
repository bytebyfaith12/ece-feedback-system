import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

export function Card({ children, className = "", delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay }}
      className={cn("rounded-[1.45rem] border border-cyan-300/15 bg-white/[0.045] p-6 text-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-cyan-300/30 hover:shadow-[0_22px_70px_rgba(0,242,254,0.12)]", className)}
    >
      {children}
    </motion.section>
  );
}
