import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import type { ComponentPropsWithoutRef } from "react";

type ParallaxSectionProps = ComponentPropsWithoutRef<"section"> & {
  strength?: number;
};

export function ParallaxSection({ children, className = "", strength = 42, ...props }: ParallaxSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);

  return (
    <section ref={ref} className={`relative overflow-hidden ${className}`} {...props}>
      <motion.div style={{ y: reducedMotion ? 0 : y }} className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_30%_20%,rgba(0,242,254,0.14),transparent_36%),radial-gradient(circle_at_70%_40%,rgba(48,209,88,0.1),transparent_34%)] blur-2xl" />
      <div className="relative">{children}</div>
    </section>
  );
}
