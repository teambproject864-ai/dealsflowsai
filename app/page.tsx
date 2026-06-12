"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Brain,
  TrendingUp,
  Users,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target,
  Activity,
  Database,
  Cpu,
  GitBranch,
  Layers,
  MessageSquare,
  ArrowUpRight,
  Cylinder,
  Network,
  LineChart,
  UserCheck,
  PlayCircle,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import { IntakeForm } from "@/components/IntakeForm";
import ErrorBoundary from "@/components/ErrorBoundary";

// ─── Animated Counter ────────────────────────────────────────────────────────
function AnimatedCounter({ value, suffix = "", prefix = "", duration = 2 }: {
  value: number; suffix?: string; prefix?: string; duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = 0;
    const increment = value / (duration * 60);
    let current = start;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [inView, value, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

// ─── Floating Orb ────────────────────────────────────────────────────────────
function FloatingOrb({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
      animate={{
        y: [0, -30, 0],
        scale: [1, 1.1, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

// ─── Holographic GTM Interactive Component ───────────────────────────────────
function HolographicGTM() {
  const [activeSection, setActiveSection] = useState<number>(0);
  const sections = [
    {
      title: "ICP Definition",
      description: "Identify your ideal customer profile with precision targeting parameters",
      icon: Target,
      color: "text-cyan-400",
    },
    {
      title: "Pipeline Analysis",
      description: "Deep dive into your sales funnel with real-time metrics and trends",
      icon: LineChart,
      color: "text-teal-400",
    },
    {
      title: "Agent Assignment",
      description: "Orchestrate specialized AI agents with defined roles and permissions",
      icon: UserCheck,
      color: "text-violet-400",
    },
    {
      title: "Execution Engine",
      description: "Deploy autonomous workflows for outreach, follow-ups, and qualification",
      icon: Zap,
      color: "text-amber-400",
    },
  ];

  return (
    <div className="relative group">
      {/* Hologram outer ring glow */}
      <div className="absolute inset-0 rounded-3xl border border-teal-500/20 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05),transparent)]" />
      <div className="absolute inset-1 rounded-[22px] border border-white/5" />

      {/* Animated scan lines */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <motion.div
          className="w-full h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent"
          animate={{ y: [0, 300] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 p-8">
        {/* Holographic core visualization */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-teal-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-cyan-500/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, ease: "linear", repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-violet-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <Network className="w-16 h-16 text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.6)]" />
            </div>
          </div>
        </div>

        {/* Section navigation */}
        <div className="grid grid-cols-2 gap-3">
          {sections.map((section, i) => (
            <button
              key={i}
              onClick={() => setActiveSection(i)}
              className={`group/btn relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 text-left ${
                activeSection === i
                  ? "border-teal-500/50 bg-teal-500/10"
                  : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
              }`}
            >
              <section.icon
                className={`w-5 h-5 mt-0.5 ${section.color} ${
                  activeSection === i ? "drop-shadow-[0_0_8px_currentColor]" : ""
                }`}
              />
              <div>
                <div className="font-semibold text-white text-sm mb-1">{section.title}</div>
                <div className="text-xs text-slate-400">{section.description}</div>
              </div>
              {activeSection === i && (
                <motion.div
                  layoutId="active-holo-indicator"
                  className="absolute -right-2 -top-2 w-2 h-2 rounded-full bg-teal-400"
                />
              )}
            </button>
          ))}
        </div>

        {/* Active section details */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-6 pt-6 border-t border-white/5"
        >
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <PlayCircle className="w-4 h-4 text-teal-400" />
            <span>Live {sections[activeSection].title} Engine</span>
          </div>
          <div className="mt-3 h-20 bg-black/20 rounded-lg border border-white/5 flex items-center justify-center overflow-hidden">
            <motion.div
              className="flex gap-2"
              animate={{ x: [0, -150] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              {[
                "Analyzing ICP fit",
                "Scoring leads",
                "Prioritizing outreach",
                "Drafting follow-ups",
                "Updating CRM",
                "Generating reports",
              ].map((text, i) => (
                <span key={i} className="text-xs font-mono text-slate-400 px-3 py-1 rounded bg-teal-500/10 border border-teal-500/20">
                  {text}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, gradient, delay = 0 }: {
  icon: any;
  title: string;
  description: string;
  gradient: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className="group relative p-6 rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/[0.01] hover:from-white/10 hover:to-white/5 hover:border-teal-500/30 transition-all duration-500 overflow-hidden cursor-default shadow-lg hover:shadow-teal-500/5 hover:-translate-y-1"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl ${gradient} blur-2xl scale-75`} />
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${gradient} bg-opacity-20`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, sublabel, color, delay = 0 }: {
  value: number; label: string; sublabel: string; color: string; suffix?: string; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="relative p-6 rounded-2xl border border-white/8 bg-gradient-to-b from-white/5 to-white/[0.01] hover:border-white/15 transition-all duration-300 text-center overflow-hidden group shadow-lg"
    >
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${color}`} />
      <div className={`text-4xl font-bold mb-1 bg-gradient-to-r ${color} bg-clip-text text-transparent`} style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        <AnimatedCounter value={value} suffix="+" />
      </div>
      <div className="text-white font-semibold text-sm">{label}</div>
      <div className="text-slate-500 text-xs mt-1">{sublabel}</div>
    </motion.div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────
function PricingCard({ plan, price, description, features, highlighted = false, delay = 0 }: {
  plan: string; price: string; description: string; features: string[]; highlighted?: boolean; delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={`relative p-8 rounded-3xl border flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 ${
        highlighted
          ? "border-teal-500/60 bg-gradient-to-b from-[#0b1c1e] to-[#070716] shadow-[0_0_50px_rgba(20,184,166,0.2)]"
          : "border-white/8 bg-gradient-to-b from-white/5 to-[#08081a] hover:border-white/15"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-3 py-1 rounded-full bg-teal-500 text-white text-xs font-bold uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}
      <div>
        <div className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">{plan}</div>
        <div className="text-4xl font-bold text-white">{price}</div>
        <div className="text-slate-400 text-sm mt-2">{description}</div>
      </div>
      <ul className="space-y-3 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className={`w-4 h-4 mt-0.5 flex-shrink-0 ${highlighted ? "text-teal-400" : "text-slate-500"}`} />
            <span className="text-slate-300 text-sm">{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/book-demo"
        className={`w-full h-12 flex items-center justify-center rounded-xl font-semibold text-sm text-center transition-all duration-300 ${
          highlighted
            ? "bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-400/35 hover:-translate-y-0.5"
            : "border border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-white/30"
        }`}
      >
        Get started
      </Link>
    </motion.div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const intakeSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [abVariant] = useState<"A" | "B">("A");
  const [formCompleted, setFormCompleted] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const leadId = params.get("leadId");
      if (leadId) router.replace(`/analysis?leadId=${leadId}`);
    }
  }, [router]);

  useEffect(() => {
    if (typeof window === "undefined" || !formCompleted) return;
    let maxScrollY = 0;
    const calculateMaxScroll = () => {
      if (intakeSectionRef.current) {
        const rect = intakeSectionRef.current.getBoundingClientRect();
        maxScrollY = window.scrollY + rect.bottom - window.innerHeight;
        maxScrollY = Math.max(maxScrollY, 0);
      }
    };
    calculateMaxScroll();

    const preventScrollBeyond = (e: WheelEvent | TouchEvent) => {
      const currentScrollY = window.scrollY;
      let scrollingDown = false;

      if (e.type === "wheel") scrollingDown = (e as WheelEvent).deltaY > 0;
      else if (e.type === "touchmove") {
        const touch = (e as TouchEvent).touches[0];
        const prevTouch = (e as TouchEvent).changedTouches[0];
        scrollingDown = touch.clientY < prevTouch.clientY;
      }
      if (scrollingDown && currentScrollY >= maxScrollY) {
        e.preventDefault();
        e.stopPropagation();
        window.scrollTo(0, maxScrollY);
      }
    };

    const preventKeyDownBeyond = (e: KeyboardEvent) => {
      const currentScrollY = window.scrollY;
      const isDownKey = ["ArrowDown", "PageDown", "Space"].includes(e.key);
      if (isDownKey && currentScrollY >= maxScrollY) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("wheel", preventScrollBeyond, { passive: false });
    window.addEventListener("touchmove", preventScrollBeyond, { passive: false });
    window.addEventListener("keydown", preventKeyDownBeyond, { passive: false });
    window.addEventListener("resize", calculateMaxScroll);

    return () => {
      window.removeEventListener("wheel", preventScrollBeyond);
      window.removeEventListener("touchmove", preventScrollBeyond);
      window.removeEventListener("keydown", preventKeyDownBeyond);
      window.removeEventListener("resize", calculateMaxScroll);
    };
  }, [formCompleted]);

  const features = [
    { icon: Brain, title: "Memory OS (Hermes)", description: "Unified memory management OS that retains deal context, buyer signals, and pipeline state across every interaction.", gradient: "bg-gradient-to-br from-violet-600/20 to-purple-800/20" },
    { icon: Database, title: "MEM Palace", description: "Centralized, structured memory storage layer. Every insight, meeting note, and signal is cataloged and instantly retrievable.", gradient: "bg-gradient-to-br from-teal-600/20 to-cyan-800/20" },
    { icon: Cpu, title: "ALMA", description: "Agent Learning & Memory Architecture — enables continuous agent improvement through adaptive memory refinement and context-aware decisions.", gradient: "bg-gradient-to-br from-blue-600/20 to-indigo-800/20" },
    { icon: Shield, title: "Clawpatrol", description: "Agent Security Firewall that monitors, audits, and controls every AI action — ensuring compliance and preventing unauthorized operations.", gradient: "bg-gradient-to-br from-rose-600/20 to-red-800/20" },
    { icon: TrendingUp, title: "GTM Intelligence", description: "Real-time pipeline analysis that identifies stall points, prioritizes opportunities, and surfaces the next best action for every deal.", gradient: "bg-gradient-to-br from-amber-600/20 to-orange-800/20" },
    { icon: GitBranch, title: "Multi-Agent Framework", description: "Orchestrate a fleet of specialized AI revenue agents — each with defined roles, permissions, and memory scopes that collaborate autonomously.", gradient: "bg-gradient-to-br from-emerald-600/20 to-green-800/20" },
  ];

  const stats = [
    { value: 142, label: "Pipeline Analyses", sublabel: "Completed this month", color: "from-teal-400 to-cyan-400" },
    { value: 87, label: "Win Rate Improvement", sublabel: "Avg. across customers", color: "from-violet-400 to-purple-400" },
    { value: 3200, label: "Deals Tracked", sublabel: "Across all organizations", color: "from-amber-400 to-orange-400" },
    { value: 99, label: "Uptime SLA", sublabel: "Enterprise reliability", color: "from-emerald-400 to-green-400" },
  ];

  const pricingPlans = [
    { plan: "Starter", price: "$499/mo", description: "For growing revenue teams ready to bring AI into their workflow.", features: ["Up to 5 AI Revenue Agents", "Memory OS (Hermes) — 30-day context", "MEM Palace — 10k records", "GTM Pipeline Analysis", "Standard Integrations (Salesforce, HubSpot)", "Email & chat support"] },
    { plan: "Growth", price: "$1,299/mo", description: "For teams scaling their GTM motion with advanced AI orchestration.", features: ["Up to 25 AI Revenue Agents", "Full Memory OS (Hermes) — unlimited context", "MEM Palace — 100k records + semantic search", "ALMA — continuous agent learning", "Clawpatrol Security Firewall", "Multi-Agent Framework", "All integrations + webhook support", "Priority support + CSM"], highlighted: true },
    { plan: "Enterprise", price: "Custom", description: "For large organizations requiring bespoke AI infrastructure and compliance.", features: ["Unlimited AI Revenue Agents", "Full platform — all features", "Custom memory architecture", "On-premise / VPC deployment", "SOC 2 Type II & HIPAA compliance", "Custom integrations & APIs", "Dedicated infrastructure", "24/7 support + SLA"] },
  ];

  const integrations = ["Salesforce", "HubSpot", "Outreach", "Gong", "Chorus", "Slack", "Linear", "Notion", "Apollo", "ZoomInfo", "Looker", "Snowflake"];

  return (
    <main className="min-h-screen text-white overflow-x-hidden" style={{ background: "#060612" }}>
      
      {/* ── HERO SECTION WITH HOLOGRAPHIC GTM ────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(20,184,166,0.12),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_50%,rgba(108,59,255,0.08),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_70%,rgba(0,212,255,0.06),transparent)]" />
          
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "80px 80px" }} />
          
          <FloatingOrb className="w-96 h-96 bg-teal-500 top-1/4 -left-20" delay={0} />
          <FloatingOrb className="w-80 h-80 bg-violet-600 top-1/3 right-0" delay={2} />
          <FloatingOrb className="w-64 h-64 bg-cyan-500 bottom-1/4 left-1/3" delay={4} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 mx-auto max-w-7xl px-6 py-20"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero text */}
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-sm font-semibold backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                </span>
                DealFlow AI GTM Engine
                <ChevronRight className="w-4 h-4" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-8"
              >
                The AI Operating
                <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400 bg-clip-text" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  System for Revenue
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-slate-400 leading-relaxed mb-10"
              >
                DealFlow AI gives your revenue team a unified intelligence layer — with persistent memory, autonomous agents, and real-time GTM analysis that turns pipeline data into closed deals.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              >
                <Link
                  href="/analysis/new"
                  onClick={() => trackEvent("cta_start_analysis", { surface: "hero_v3", abVariant })}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-semibold text-base transition-all duration-300 shadow-lg shadow-teal-500/25 hover:shadow-teal-400/35 hover:-translate-y-0.5"
                >
                  Start Pipeline Analysis
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/book-demo"
                  onClick={() => trackEvent("cta_book_demo", { surface: "hero_v3", abVariant })}
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
                >
                  Book a Demo
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right: Holographic GTM Component */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-teal-500/10 via-violet-500/5 to-cyan-500/10 rounded-[2.5rem] blur-3xl" />
              <HolographicGTM />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
            <div className="w-1 h-2.5 rounded-full bg-white/40" />
          </div>
        </motion.div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────────────────── */}
      <section className="relative border-y border-white/6 bg-white/2 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── INTAKE FORM SECTION (NEW POSITION) ───────────────────────────────────────── */}
      <section id="intake" ref={intakeSectionRef} className="relative py-20 border-b border-white/6 scroll-mt-16">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-10">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white mb-3"
            >
              Run your first GTM analysis
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-slate-400"
            >
              Two minutes to align on ICP, funnel volume, and revenue goals — we return a structured GTM readout.
            </motion.p>
          </div>
          <ErrorBoundary>
            <IntakeForm />
          </ErrorBoundary>
        </div>
      </section>

      {/* ── PLATFORM SECTION ───────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(20,184,166,0.05),transparent)] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Layers className="w-3.5 h-3.5" />
              Platform Architecture
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-5"
            >
              Everything your revenue team needs,
              <br />
              <span className="text-slate-400">unified in one intelligent OS</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-2xl mx-auto text-slate-400 text-lg"
            >
              From memory architecture to autonomous agent orchestration — DealFlow AI is a full-stack intelligence platform built for modern GTM teams.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS ───────────────────────────────────────────────────────── */}
      <section className="relative py-20 border-t border-white/6 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-sm text-slate-500 uppercase tracking-widest font-semibold mb-10"
          >
            Integrates with your existing revenue stack
          </motion.p>
          <div className="flex flex-wrap justify-center gap-3">
            {integrations.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="px-5 py-2.5 rounded-full border border-white/8 bg-white/3 text-slate-400 text-sm font-medium hover:border-white/15 hover:text-white transition-all duration-300 cursor-default"
              >
                {name}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────────── */}
      <section className="relative py-28 border-t border-white/6" id="pricing">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_80%,rgba(20,184,166,0.05),transparent)] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Pricing
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-white mb-4"
            >
              Simple, transparent pricing
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg"
            >
              Start free for 14 days. No credit card required.
            </motion.p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <PricingCard key={i} {...plan} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA SECTION ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 border-t border-white/6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(20,184,166,0.12),transparent)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_50%_50%,rgba(108,59,255,0.08),transparent)] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-300 text-xs font-semibold uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              Start Today
            </div>
            <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight">
              Ready to close deals
              <br />
              <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                at AI speed?
              </span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Join 500+ revenue teams already using DealFlow AI to accelerate their pipeline and hit quota consistently.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/analysis/new"
                onClick={() => trackEvent("cta_start_analysis", { surface: "bottom_cta_v3", abVariant })}
                className="group inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-teal-500/30 hover:shadow-teal-400/40 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/book-demo"
                onClick={() => trackEvent("cta_talk_sales", { surface: "bottom_cta_v3", abVariant })}
                className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <MessageSquare className="w-5 h-5" />
                Talk to Sales
              </Link>
            </div>
            <p className="text-slate-600 text-sm">
              14-day free trial · No credit card · Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
