"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";
import { HeartPulse, Moon, Brain, Footprints, TrendingUp, TrendingDown } from "lucide-react";
import { Reveal } from "./reveal";

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

function Spark({ points, color }: { points: string; color: string }) {
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const KPIS = [
  {
    icon: HeartPulse,
    label: "Bien-être",
    value: 82,
    delta: "+6 %",
    up: true,
    color: "#3B82F6",
    spark: "0,26 20,22 40,24 60,16 80,18 100,10 120,8",
  },
  {
    icon: Moon,
    label: "Sommeil",
    value: 74,
    delta: "+3 %",
    up: true,
    color: "#8b7cf6",
    spark: "0,24 20,20 40,22 60,18 80,20 100,14 120,12",
  },
  {
    icon: Brain,
    label: "Stress",
    value: 68,
    delta: "−4 %",
    up: false,
    color: "#f59e0b",
    spark: "0,10 20,14 40,12 60,18 80,16 100,22 120,20",
  },
  {
    icon: Footprints,
    label: "Activité",
    value: 90,
    delta: "+8 %",
    up: true,
    color: "#34d399",
    spark: "0,28 20,24 40,20 60,18 80,12 100,10 120,6",
  },
];

export function Stats() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {KPIS.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.08}>
            <motion.div
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
            >
              <div
                className="absolute -right-8 -top-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                style={{ background: k.color }}
              />
              <div className="flex items-center justify-between">
                <span
                  className="grid size-10 place-items-center rounded-xl"
                  style={{ backgroundColor: `${k.color}22`, color: k.color }}
                >
                  <k.icon className="size-5" />
                </span>
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${
                    k.up ? "bg-emerald-400/15 text-emerald-300" : "bg-emerald-400/15 text-emerald-300"
                  }`}
                >
                  {k.up ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {k.delta}
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold text-white">
                <CountUp to={k.value} suffix=" %" />
              </p>
              <p className="text-sm text-white/50">{k.label}</p>
              <div className="mt-3">
                <Spark points={k.spark} color={k.color} />
              </div>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
