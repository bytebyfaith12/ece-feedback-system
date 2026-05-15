import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function FeedbackCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-[2rem] border border-slate-100 bg-white p-5 shadow-sm md:p-8 ${className}`}
    >
      {children}
    </motion.section>
  );
}
