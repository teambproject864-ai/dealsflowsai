// app/features/page.tsx
"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Search, 
  Brain, 
  Database, 
  Cpu, 
  Shield, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Zap,
  Star
} from "lucide-react";
import { 
  IconAlertObjection, 
  IconArrowRight,
  IconAwardRoi,
  IconLaunchGtm,
  IconTargetAccount,
  IconChipPlatform
} from "@/components/gtm/GtmIcons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  FEATURE_CATEGORIES, 
  getIconComponent 
} from "@/lib/features";
import { useFeatures } from "@/lib/feature-hooks";
import Link from "next/link";

// 4 Core Features Detail Content
const CORE_ARCHITECTURE = [
  {
    id: "hermes",
    title: "Memory OS (Hermes)",
    icon: Brain,
    glow: "glow-violet",
    accent: "text-violet-400",
    borderColor: "border-violet-500/30",
    bgGradient: "from-violet-500/10",
    definition: "The foundational operating system for unified memory management across the entire DealFlow.AI ecosystem.",
    capabilities: [
      "Multi-agent memory state synchronization in real-time.",
      "Real-time memory virtualization and state abstraction.",
      "Automatic priority zoning to separate short-term and persistent memory.",
      "Instant historical state hydration for returning prospects."
    ],
    synergy: "Feeds raw memory assets directly to MEM Palace for structured storage and provides the execution runtime context for ALMA's learning models.",
    benefit: "Instant, zero-latency context loading when agents hand over leads, ensuring no prospect interaction detail is ever lost."
  },
  {
    id: "mempalace",
    title: "MEM Palace",
    icon: Database,
    glow: "glow-teal",
    accent: "text-teal-400",
    borderColor: "border-teal-500/30",
    bgGradient: "from-teal-500/10",
    definition: "The centralized, highly organized semantic storage layer that structures and indexes long-term memory assets.",
    capabilities: [
      "High-dimensional vector indexing for complex query operations.",
      "Auto-clustering memory associations for conversational relevance.",
      "Query-time contextual routing for rapid retrieval.",
      "Cross-channel memory recall (SMS, Email, Voice)."
    ],
    synergy: "Leverages the memory virtualization pipeline of Memory OS (Hermes) to structure data and serves as the semantic database that ALMA queries for adaptive learning.",
    benefit: "Lightning-fast retrieval of client preferences, past conversations, and objection-handling strategies in under 50ms."
  },
  {
    id: "alma",
    title: "ALMA (Agent Learning and Memory Architecture)",
    icon: Cpu,
    glow: "glow-cyan",
    accent: "text-cyan-400",
    borderColor: "border-cyan-500/30",
    bgGradient: "from-cyan-500/10",
    definition: "The intelligent cognitive and adaptive learning engine that enables continuous optimization of agent decision-making.",
    capabilities: [
      "Self-supervised agent fine-tuning from historical engagement.",
      "Automated error reflection to continuously improve response logic.",
      "Context-aware prompt synthesis for localized communication.",
      "Outreach strategy feedback loops based on live conversion data."
    ],
    synergy: "Queries MEM Palace for deep context, writes updated decision patterns back to Memory OS (Hermes), and secures all learning states using Clawpatrol policies.",
    benefit: "AI agents get smarter with every customer interaction, translating to a 40% improvement in meeting booking rates over 30 days."
  },
  {
    id: "clawpatrol",
    title: "Agent Security Firewall (Clawpatrol)",
    icon: Shield,
    glow: "glow-amber",
    accent: "text-amber-400",
    borderColor: "border-amber-500/30",
    bgGradient: "from-amber-500/10",
    definition: "The enterprise-grade guardrails and security layer overseeing all agent execution, memory access, and data compliance.",
    capabilities: [
      "Real-time PII redacting across conversation streams.",
      "Role-based memory access control for secure team boundaries.",
      "Automated threat prevention guarding against prompt injections.",
      "Immutable cryptographic audit trails stored in compliance vaults."
    ],
    synergy: "Intercepts all memory operations in Memory OS (Hermes), inspects vectors in MEM Palace, and validates learning iterations inside ALMA.",
    benefit: "SOC2 and GDPR compliance by design, ensuring customer data remains secure, private, and audit-ready at all times."
  }
];

function FeaturesContent() {
  const { features, loading, error } = useFeatures();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFeatures = features.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...FEATURE_CATEGORIES];

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
        <p className="mt-4 text-slate-400 animate-pulse font-medium">Loading Dealflow.ai capabilities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="flex justify-center mb-4">
          <IconAlertObjection className="h-12 w-12 text-rose-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Unable to load features</h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6 border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-white">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative elements */}
      <div className="absolute top-[10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-violet-600/5 dark:bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[35rem] h-[35rem] rounded-full bg-teal-600/5 dark:bg-teal-600/10 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-slate-200 dark:border-white/5">
        <div className="max-w-5xl mx-auto text-center px-6 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
            <span>Product capabilities</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight"
          >
            Autonomous Sales Powered by{" "}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-750 dark:from-teal-400 dark:via-cyan-400 dark:to-violet-500 bg-clip-text text-transparent">
              Cognitive AI Architecture
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-605 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Scale your pipeline operations with memory-infused sales agents that coordinate, adapt, and drive conversions securely.
          </motion.p>
        </div>
      </section>

      {/* Core Architecture Cards Section */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 border-b border-slate-200 dark:border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white">The Core Systems</h2>
          <p className="text-slate-605 dark:text-slate-400 text-lg">
            Our platform is built upon four foundational technologies working in perfect synchronization to power intelligent revenue operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {CORE_ARCHITECTURE.map((core, idx) => (
            <motion.div
              key={core.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={`group relative p-8 rounded-3xl border border-slate-200 dark:${core.borderColor} bg-gradient-to-b from-slate-50/50 to-transparent dark:${core.bgGradient} dark:to-transparent backdrop-blur-md transition-all duration-500 overflow-hidden flex flex-col justify-between`}
            >
              {/* Card visual accent glow */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-4 rounded-2xl bg-slate-100 dark:bg-white/5 ${core.accent} border border-slate-200 dark:border-white/10 transition-transform duration-300 group-hover:scale-110`}>
                    <core.icon className="h-8 w-8" />
                  </div>
                  <Badge className="bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10">v2.4 Stable</Badge>
                </div>

                <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">{core.title}</h3>
                <p className="text-slate-700 dark:text-slate-300 font-medium mb-6">{core.definition}</p>

                <div className="space-y-4 border-t border-slate-200 dark:border-white/5 pt-6">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Key Capabilities</h4>
                  <ul className="space-y-2.5 text-slate-600 dark:text-slate-400 text-sm">
                    {core.capabilities.map((cap, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${core.accent}`} />
                        <span>{cap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/5 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1">Integration & Synergy</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">{core.synergy}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-550 dark:text-slate-400 mb-1">Tangible Business Impact</h4>
                  <p className="text-emerald-600 dark:text-emerald-400 text-xs font-medium leading-relaxed">{core.benefit}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Explorer Section */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 border-b border-slate-200 dark:border-white/5">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-slate-200 dark:border-white/5 pb-12 mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Capabilities Directory</h2>
            <p className="text-slate-605 dark:text-slate-400">Filter and explore the complete standard suite of DealFlow.AI modules.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <div className="relative min-w-[280px]">
              <Search className="absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-500" />
              <Input 
                placeholder="Search modules..." 
                className="pl-11 w-full bg-slate-100/50 dark:bg-white/3 border-slate-200 dark:border-white/8 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:ring-teal-500/50 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                    (selectedCategory === cat || (cat === "All" && !selectedCategory))
                      ? "bg-teal-500 text-white border-teal-500 shadow-lg shadow-teal-500/20"
                      : "bg-slate-100/50 dark:bg-white/3 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/5 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredFeatures.map((f, i) => {
              const Icon = getIconComponent(f.iconName);
              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                >
                  <Card className="h-full bg-slate-50/50 dark:bg-white/3 border-slate-200 dark:border-white/8 hover:bg-slate-100/80 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all duration-300 group overflow-hidden flex flex-col justify-between">
                    <CardHeader className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="rounded-xl bg-teal-500/10 p-3 text-teal-400 transition-all group-hover:bg-teal-500 group-hover:text-white group-hover:scale-105 border border-teal-500/20">
                          <Icon className="h-5 w-5" />
                        </div>
                        {f.isNew && (
                          <Badge className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 font-semibold text-[10px] tracking-wider uppercase px-2 py-0.5">New</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
                        {f.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 flex-grow flex flex-col justify-between">
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                        {f.description}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/5 pt-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <IconChipPlatform className="h-3.5 w-3.5 text-teal-500/70" />
                          {f.category}
                        </div>
                        {f.version && (
                          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-600 font-semibold">
                            v{f.version}.0
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      {/* Competitive Advantages */}
      <section className="py-20 sm:py-28 max-w-7xl mx-auto px-6 border-b border-slate-200 dark:border-white/5">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Unmatched Accuracy",
              desc: "Our integrated validation layer ensures 99.9% factual accuracy in all AI-driven customer interactions.",
              icon: IconAwardRoi,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-100 dark:bg-amber-400/10",
              borderColor: "border-amber-200 dark:border-amber-500/10"
            },
            {
              title: "Infinite Scalability",
              desc: "Deploy thousands of autonomous agents simultaneously across multiple timezones and languages.",
              icon: IconLaunchGtm,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-100 dark:bg-emerald-400/10",
              borderColor: "border-emerald-200 dark:border-emerald-500/10"
            },
            {
              title: "Data Intelligence",
              desc: "Leverage vector-based semantic search and intelligent data integration for deep lead understanding.",
              icon: IconTargetAccount,
              color: "text-sky-600 dark:text-sky-400",
              bg: "bg-sky-100 dark:bg-sky-400/10",
              borderColor: "border-sky-200 dark:border-sky-500/10"
            }
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`p-8 rounded-3xl bg-slate-50/50 dark:bg-white/3 border border-slate-200 dark:${item.borderColor} hover:bg-slate-100/80 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/15 transition-all duration-300`}
            >
              <div className={`p-3 rounded-2xl w-fit mb-6 ${item.bg} ${item.color} border border-slate-200 dark:border-white/5`}>
                <item.icon className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Modern Redesigned CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-6 text-center">
        <div className="relative p-12 md:p-20 rounded-[2.5rem] border border-teal-500/20 bg-gradient-to-b from-teal-500/10 via-background/80 to-background overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,184,166,0.08),transparent_50%)] pointer-events-none" />
          
          <div className="relative max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white">Why leading teams choose DealFlow.ai</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
              {[
                { label: "Revenue Growth", value: "40%", desc: "Increase in velocity" },
                { label: "Cost Reduction", value: "65%", desc: "Lower overheads" },
                { label: "Agent Response", value: "< 2s", desc: "Instant interactions" },
                { label: "Data Accuracy", value: "100%", desc: "Secure & compliant" }
              ].map((stat, i) => (
                <div key={stat.label} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-white/3 border border-slate-200 dark:border-white/5">
                  <div className="text-3xl md:text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-1">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-0.5">{stat.label}</div>
                  <div className="text-[11px] text-slate-550 dark:text-slate-500">{stat.desc}</div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/book-demo" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full h-14 rounded-xl bg-teal-500 hover:bg-teal-450 text-white font-semibold shadow-lg shadow-teal-500/25 transition-all hover:-translate-y-0.5"
                >
                  Schedule Live Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/book-demo?trial=true" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 rounded-xl border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/3 text-slate-850 dark:text-white hover:bg-slate-200 dark:hover:bg-white/5 transition-all"
                >
                  Start Free Trial
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-teal-500" />
        </div>
      }>
        <FeaturesContent />
      </Suspense>
    </div>
  );
}

