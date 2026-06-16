"use client";

import { motion } from "framer-motion";
import {
  IconMegaphoneCampaign,
  IconRevenueAcceleration,
  IconShieldCompliance,
} from "@/components/gtm/GtmIcons";

const stats = [
  { label: "Pipeline lift", value: "34%", hint: "avg. qualified opps" },
  { label: "Time saved", value: "18h", hint: "per rep / week" },
  { label: "Reply rate", value: "2.1×", hint: "vs. manual" },
];

const logos = ["Northwind", "Contoso", "Fabrikam", "Adventure", "Litware"];

const testimonials = [
  {
    quote:
      "DEALFLOW AI turned our outbound from a spreadsheet nightmare into a system we can actually measure.",
    name: "Jordan M.",
    role: "VP Revenue, B2B SaaS",
  },
  {
    quote:
      "The AI follow-ups feel consultative — not spammy. Our calendar finally reflects the demand we generate.",
    name: "Priya S.",
    role: "Head of Growth, Fintech",
  },
];

export function LandingTrust() {
  return (
    <section className="border-t border-white/10 bg-gradient-to-b from-transparent to-teal-950/15">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-teal-300/90">Trusted by modern revenue teams</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for teams who need pipeline without the chaos
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-xl border border-white/15 bg-slate-900 p-4"
                >
                  <p className="text-2xl font-bold tabular-nums text-white">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">{s.hint}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1">
                <IconShieldCompliance className="h-3.5 w-3.5 text-teal-400" /> SOC2-ready patterns
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1">
                <IconRevenueAcceleration className="h-3.5 w-3.5 text-amber-400" /> Sub-second orchestration
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1">
                <IconMegaphoneCampaign className="h-3.5 w-3.5 text-sky-400" /> Campaign-grade messaging
              </span>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {logos.map((name) => (
                <span
                  key={name}
                  className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-xs font-medium text-muted-foreground"
                >
                  {name}
                </span>
              ))}
            </div>
            {testimonials.map((t) => (
              <blockquote key={t.name} className="rounded-xl border border-teal-500/30 bg-slate-900 p-5">
                <p className="text-sm leading-relaxed text-foreground/90">“{t.quote}”</p>
                <footer className="mt-3 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{t.name}</span> — {t.role}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
