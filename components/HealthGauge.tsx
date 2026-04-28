"use client";

import { motion } from "framer-motion";

export function HealthGauge({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const color =
    clamped >= 70
      ? "text-emerald-400"
      : clamped >= 45
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-white/10"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-bold tabular-nums ${color}`}>
          {clamped}
        </span>
        <span className="text-xs text-muted-foreground">Health score</span>
      </div>
    </div>
  );
}
