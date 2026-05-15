import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

function ParticleCloud({ count = 520 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const data = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      data[index * 3] = (Math.random() - 0.5) * 8;
      data[index * 3 + 1] = (Math.random() - 0.5) * 4.5;
      data[index * 3 + 2] = (Math.random() - 0.5) * 4;
    }
    return data;
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.12) * 0.14;
    ref.current.rotation.x = Math.cos(clock.elapsedTime * 0.1) * 0.06;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled>
      <PointMaterial transparent color="#00F2FE" size={0.018} sizeAttenuation depthWrite={false} opacity={0.58} />
    </Points>
  );
}

export function ThreeParticleField({ className = "", density = "normal" }: { className?: string; density?: "low" | "normal" }) {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smallScreen = window.innerWidth < 760;
    setEnabled(!reduceMotion && !smallScreen);
  }, []);

  if (!enabled) {
    return <div className={`pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,242,254,0.12),transparent_36%)] ${className}`} />;
  }

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Canvas camera={{ position: [0, 0, 4.5], fov: 55 }} gl={{ antialias: false, alpha: true, powerPreference: "low-power" }}>
        <ambientLight intensity={0.5} />
        <ParticleCloud count={density === "low" ? 260 : 520} />
      </Canvas>
    </div>
  );
}
