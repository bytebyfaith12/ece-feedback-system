import { Activity, Bell, MessageSquare } from "lucide-react";
import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
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

function CountUpValue({ value, suffix = "" }: { value: number; suffix?: string }) {
  const reducedMotion = useReducedMotion();
  const count = useMotionValue(reducedMotion ? value : 0);
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useMotionValueEvent(count, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (reducedMotion) {
      queueMicrotask(() => setDisplay(value));
      return undefined;
    }
    const controls = animate(count, value, { duration: 0.85, ease: "easeOut" });
    return () => controls.stop();
  }, [count, reducedMotion, value]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

export function HeroKpiCards({ feedback, alertsCount }: HeroKpiCardsProps) {
  const happiness = calculateHappinessIndex(feedback);
  const cards = [
    { label: "Feedback", value: feedback.length, suffix: "", icon: MessageSquare },
    { label: "Happiness", value: feedback.length ? happiness.score : 0, suffix: "%", icon: Activity },
    { label: "Alerts", value: alertsCount, suffix: "", icon: Bell },
  ];

  return (
    <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            custom={index}
            variants={kpiVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -4, borderColor: "rgba(0,242,254,0.38)" }}
            className="group relative overflow-hidden rounded-3xl border border-cyan-300/15 bg-white/[0.045] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur transition"
          >
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent opacity-80" />
            <div className="flex items-center justify-between gap-2">
              <p className="display-title text-2xl text-white"><CountUpValue value={card.value} suffix={card.suffix} /></p>
              <Icon className="size-4 text-cyan-200/80 transition group-hover:scale-110 group-hover:text-emerald-200" />
            </div>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">{card.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
