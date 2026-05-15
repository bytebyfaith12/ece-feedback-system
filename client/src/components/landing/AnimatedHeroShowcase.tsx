import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionStyle } from "framer-motion";
import { Radio } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PointerEvent } from "react";
import { FloatingFeedbackCard } from "@/components/landing/FloatingFeedbackCard";

export const heroProfiles = [
  {
    src: "/images/hero/profile-1.png",
    label: "IT Support",
    badge: "Great support",
    note: "Thank you, team!",
    objectPosition: "center 34%",
  },
  {
    src: "/images/hero/profile-2.png",
    label: "Employee Pulse",
    badge: "Quick pulse",
    note: "One tap feedback.",
    objectPosition: "center center",
  },
  {
    src: "/images/hero/profile-3.png",
    label: "Operations Feedback",
    badge: "Needs attention",
    note: "Routes to the right team.",
    objectPosition: "center 30%",
  },
] as const;

interface AnimatedHeroShowcaseProps {
  feedbackCount: number;
  happinessScore: number;
  alertsCount: number;
}

export function AnimatedHeroShowcase({ feedbackCount, happinessScore, alertsCount }: AnimatedHeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const activeProfile = heroProfiles[activeIndex] ?? heroProfiles[0];
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 95, damping: 18, mass: 0.25 });
  const springY = useSpring(mouseY, { stiffness: 95, damping: 18, mass: 0.25 });
  const rotateX = useTransform(springY, [-1, 1], [3, -3]);
  const rotateY = useTransform(springX, [-1, 1], [-3, 3]);
  const glowX = useTransform(springX, [-1, 1], [-10, 10]);
  const glowY = useTransform(springY, [-1, 1], [-8, 8]);
  const cardOneX = useTransform(springX, [-1, 1], [-8, 8]);
  const cardOneY = useTransform(springY, [-1, 1], [-6, 6]);
  const cardTwoX = useTransform(springX, [-1, 1], [7, -7]);
  const cardTwoY = useTransform(springY, [-1, 1], [-5, 5]);
  const cardThreeX = useTransform(springX, [-1, 1], [-5, 5]);
  const cardThreeY = useTransform(springY, [-1, 1], [8, -8]);
  const cardFourX = useTransform(springX, [-1, 1], [6, -6]);
  const cardFourY = useTransform(springY, [-1, 1], [7, -7]);
  const parallaxEnabled = !reducedMotion;

  useEffect(() => {
    if (reducedMotion) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroProfiles.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  const cards = useMemo(
    () => [
      { emoji: "😄", title: "Great support", text: "Thank you, team!", className: "left-1 top-5 sm:left-5 sm:top-7", delay: 0.3, duration: 4.2, style: { x: cardOneX, y: cardOneY } as MotionStyle },
      { emoji: "🙂", title: "Quick pulse", text: "One tap feedback.", className: "right-1 top-24 sm:right-5 sm:top-16", delay: 0.42, duration: 5, style: { x: cardTwoX, y: cardTwoY } as MotionStyle },
      { emoji: "😟", title: "Needs attention", text: "Routes to the right team.", className: "left-1 bottom-24 sm:left-8 sm:bottom-24", delay: 0.54, duration: 4.6, style: { x: cardThreeX, y: cardThreeY } as MotionStyle },
      { icon: <Radio className="size-5 text-[#061522]" />, title: "Waiting for first response", text: "Dashboard starts from zero.", className: "right-1 bottom-7 sm:right-6 sm:bottom-8", delay: 0.66, duration: 5.5, style: { x: cardFourX, y: cardFourY } as MotionStyle },
    ],
    [cardFourX, cardFourY, cardOneX, cardOneY, cardThreeX, cardThreeY, cardTwoX, cardTwoY],
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!parallaxEnabled || window.innerWidth < 768) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  function resetPointer() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section className="relative mx-auto w-full max-w-[680px] overflow-visible py-3">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={reducedMotion ? { opacity: 1, scale: 1, y: 0 } : { opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={
          reducedMotion
            ? { delay: 0.24, duration: 0.45, ease: "easeOut" }
            : {
                opacity: { delay: 0.24, duration: 0.8, ease: "easeOut" },
                scale: { delay: 0.24, duration: 0.8, ease: "easeOut" },
                y: { delay: 1, duration: 5, repeat: Infinity, ease: "easeInOut" },
              }
        }
        whileHover={reducedMotion ? undefined : { scale: 1.006 }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetPointer}
        style={{ rotateX: parallaxEnabled ? rotateX : 0, rotateY: parallaxEnabled ? rotateY : 0, transformPerspective: 1200 }}
        className="group relative overflow-visible"
      >
        <motion.div
          aria-hidden="true"
          style={{ x: parallaxEnabled ? glowX : 0, y: parallaxEnabled ? glowY : 0 }}
          className="hero-orb-pulse absolute -inset-12 rounded-[4rem] bg-[radial-gradient(circle_at_center,rgba(0,242,254,0.28),rgba(56,248,162,0.15)_42%,transparent_72%)] opacity-90 blur-[64px] transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="relative min-h-[520px] overflow-visible rounded-[44px] border border-[rgba(0,242,254,0.18)] bg-[#071620]/72 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_30px_120px_rgba(0,242,254,0.18),0_24px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-shadow duration-300 group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_34px_140px_rgba(0,242,254,0.24),0_26px_100px_rgba(0,0,0,0.46)] sm:min-h-[580px] sm:p-5">
          <div className="absolute inset-0 rounded-[44px] bg-[linear-gradient(135deg,rgba(0,242,254,0.16),rgba(56,248,162,0.08)_42%,rgba(255,255,255,0.035))]" />
          <div className="absolute inset-x-7 bottom-7 top-7 rounded-[40px] bg-gradient-to-br from-cyan-200/20 via-white/10 to-emerald-200/16" />
          <div className="relative h-[520px] overflow-hidden rounded-[36px] border border-white/12 bg-[#020b12] shadow-[inset_0_1px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.12),0_24px_90px_rgba(0,0,0,0.34)] sm:h-[560px]">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeProfile.src}
                src={activeProfile.src}
                alt={`${activeProfile.label} feedback profile`}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, x: 30 }}
                animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1.015, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, x: -30 }}
                transition={{ duration: reducedMotion ? 0.24 : 0.62, ease: "easeOut" }}
                style={{ objectPosition: activeProfile.objectPosition }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,transparent_20%,rgba(2,11,18,0.18)_72%,rgba(2,11,18,0.62)_100%),linear-gradient(180deg,rgba(2,11,18,0.04),rgba(2,11,18,0.18)_50%,rgba(2,11,18,0.64))]" />
            <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-4">
              <div className="rounded-full border border-cyan-300/25 bg-[#061522]/74 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-100 backdrop-blur-xl">
                Live: {feedbackCount} feedback
              </div>
              <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#031017] shadow-[0_0_36px_rgba(0,242,254,0.42)]">
                <span className="absolute inset-[-12px] rounded-[1.8rem] border border-cyan-200/30 animate-echo-radar" />
                <span className="logo-font text-2xl">E</span>
              </div>
            </div>
            <div className="absolute right-5 top-24 hidden max-w-[190px] gap-2 2xl:grid">
              {[
                ["Satisfaction", `${happinessScore}%`],
                ["Alerts", `${alertsCount} open`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-cyan-300/15 bg-[#061522]/68 px-3 py-2 text-xs backdrop-blur-xl">
                  <span className="block font-bold uppercase tracking-[0.14em] text-cyan-100/70">{label}</span>
                  <span className="mt-1 block text-base font-extrabold text-white">{value}</span>
                </div>
              ))}
            </div>
            <motion.div
              key={activeProfile.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute bottom-5 left-5 right-5 rounded-3xl border border-cyan-300/20 bg-[#061522]/78 p-4 backdrop-blur-xl sm:right-auto sm:max-w-[310px]"
            >
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{activeProfile.label}</p>
              <p className="mt-2 text-lg font-extrabold text-white">{activeProfile.badge}</p>
              <p className="mt-1 text-sm text-slate-300">{activeProfile.note}</p>
            </motion.div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            {cards.map((card) => (
              <FloatingFeedbackCard
                key={card.title}
                title={card.title}
                text={card.text}
                emoji={card.emoji}
                icon={card.icon}
                delay={card.delay}
                duration={card.duration}
                style={parallaxEnabled ? card.style : undefined}
                className={`absolute ${card.className}`}
              />
            ))}
          </div>

          <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-cyan-300/15 bg-[#061522]/76 px-3 py-2 backdrop-blur-xl">
            {heroProfiles.map((profile, index) => (
              <button
                key={profile.src}
                type="button"
                aria-label={`Show ${profile.label} hero profile`}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? "w-8 bg-gradient-to-r from-cyan-300 to-emerald-300 shadow-[0_0_16px_rgba(0,242,254,0.55)]" : "w-2.5 bg-slate-500/70 hover:bg-cyan-200"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
