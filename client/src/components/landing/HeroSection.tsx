import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { AnimatedHeroShowcase } from "@/components/landing/AnimatedHeroShowcase";
import { HeroKpiCards } from "@/components/landing/HeroKpiCards";
import type { FeedbackResponse } from "@/types/index";

const ThreeParticleField = lazy(() => import("@/components/visual/ThreeParticleField").then((module) => ({ default: module.ThreeParticleField })));

interface HeroSectionProps {
  feedback: FeedbackResponse[];
  alertsCount: number;
  authenticated: boolean;
}

const heroContainer: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.12,
    },
  },
};

const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const headlineLines = [
  [{ text: "Real-Time" }],
  [{ text: "Feedback", highlight: true }, { text: " For" }],
  [{ text: "Better", highlight: true }],
  [{ text: "Workplace" }],
  [{ text: "Decisions" }],
];

export function HeroSection({ feedback, alertsCount, authenticated }: HeroSectionProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="absolute left-1/2 top-24 h-80 w-80 rounded-full bg-cyan-400/15 blur-[120px]" />
      <div aria-hidden="true" className="absolute right-[8%] top-32 h-96 w-96 rounded-full bg-emerald-300/10 blur-[130px]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(rgba(0,242,254,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(0,242,254,0.035)_1px,transparent_1px)] bg-[size:42px_42px] opacity-45" />
      <Suspense fallback={null}>
        <ThreeParticleField className="opacity-50" />
      </Suspense>

      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-20">
        <motion.div variants={heroContainer} initial="hidden" animate="visible" className="max-w-3xl">
          <motion.p variants={heroItem} className="inline-flex rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.22em] text-cyan-100 shadow-[0_0_22px_rgba(0,242,254,0.12)]">
            Real-Time Feedback Command System
          </motion.p>

          <h1 className="hero-title mt-6 text-4xl uppercase leading-[1.08] text-white md:text-5xl xl:text-[56px]">
            {headlineLines.map((line, lineIndex) => (
              <motion.span key={lineIndex} variants={heroItem} className="block">
                {line.map((part) => (
                  <span key={part.text} className={part.highlight && !reducedMotion ? "hero-glow-word text-cyan-50" : undefined}>
                    {part.text}
                  </span>
                ))}
              </motion.span>
            ))}
          </h1>

          <motion.p variants={heroItem} className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
            Collect accurate feedback from employees, applicants, visitors, clients, IT teams, facilities, HR, payroll, and security across ECE Contact Centers.
          </motion.p>

          <motion.div variants={heroItem} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.div whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/submit-feedback"
                aria-label="Submit feedback"
                className="hero-primary-cta group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-300 to-emerald-300 px-6 py-4 font-extrabold text-[#031017] shadow-[0_0_35px_rgba(0,242,254,0.28)]"
              >
                Submit Feedback
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={reducedMotion ? undefined : { y: -2 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={authenticated ? "/dashboard" : "/login"}
                aria-label="View dashboard"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-white/[0.035] px-6 py-4 font-bold text-cyan-100 transition hover:border-cyan-200/60 hover:bg-cyan-300/10 hover:shadow-[0_0_28px_rgba(0,242,254,0.16)]"
              >
                View Dashboard
                <PlayCircle className="size-4 transition-transform duration-200 group-hover:scale-110" />
              </Link>
            </motion.div>
          </motion.div>

          <HeroKpiCards feedback={feedback} alertsCount={alertsCount} />
        </motion.div>

        <AnimatedHeroShowcase />
      </div>
    </section>
  );
}
