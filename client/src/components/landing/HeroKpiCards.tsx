import { motion, type Variants } from "framer-motion";
import type { FeedbackResponse } from "@/types/index";
import { calculateHappinessIndex } from "@/utils/happinessCalculator";

interface HeroKpiCardsProps {
  feedback: FeedbackResponse[];
  alertsCount: number;
}

const kpiVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.78 + index * 0.08, duration: 0.4, ease: "easeOut" },
  }),
};

export function HeroKpiCards({ feedback, alertsCount }: HeroKpiCardsProps) {
  const happiness = calculateHappinessIndex(feedback);
  const cards = [
    { label: "Feedback", value: feedback.length },
    { label: "Happiness", value: feedback.length ? `${happiness.score}%` : "0%" },
    { label: "Alerts", value: alertsCount },
  ];

  return (
    <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.label}
          custom={index}
          variants={kpiVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -4, borderColor: "rgba(0,242,254,0.38)" }}
          className="rounded-3xl border border-cyan-300/15 bg-white/[0.045] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur"
        >
          <p className="display-title text-2xl text-white">{card.value}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{card.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
