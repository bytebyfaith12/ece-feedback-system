import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function KPIStatCard({ label, value, helper, icon }: { label: string; value: string | number; helper: string; icon: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-full min-h-36 flex-col justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <div className="grid size-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">{icon}</div>
      </div>
      <div>
        <p className="mt-6 text-4xl font-black text-slate-950">{value}</p>
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      </div>
    </motion.div>
  );
}
