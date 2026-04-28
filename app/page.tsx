"use client";

import Link from "next/link";
import { IntakeForm } from "@/components/IntakeForm";
import { LandingTrust } from "@/components/LandingTrust";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, PhoneCall, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0A0F1E] text-white selection:bg-violet-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0A0F1E]/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-violet-600 p-1.5 rounded-lg shadow-lg shadow-violet-600/20">
              <Zap className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight">Dealflow.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#intake" className="hover:text-white transition-colors">Intake</Link>
            <Link href="#results" className="hover:text-white transition-colors">Results</Link>
            <Button asChild variant="outline" className="border-white/10 hover:bg-white/5">
              <Link href="#intake">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-[460px] w-[860px] rounded-full bg-violet-600/15 blur-[130px]" />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-[1.05fr,0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI Revenue Orchestration
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              Close More Deals
              <span className="block bg-gradient-to-r from-violet-300 to-white bg-clip-text text-transparent">
                with Less Friction
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-gray-300 sm:text-xl">
              Analyze your GTM setup, generate tailored recommendations, and launch AI-powered deal conversations in minutes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 bg-violet-600 px-7 font-semibold hover:bg-violet-700">
                <Link href="#intake">
                  Start 2-Min Intake
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 border-white/15 px-6 text-white hover:bg-white/5">
                <Link href="/features">
                  See All Features
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Fastest Path to Value</p>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Live
              </span>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">1. Complete Intake</p>
                <p className="mt-1 text-xs text-gray-400">Tell us your context in 2 minutes.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="text-sm font-semibold text-white">2. Get AI Analysis</p>
                <p className="mt-1 text-xs text-gray-400">Receive pains, missed revenue, and solution map.</p>
              </div>
              <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-200">3. Immediate Call Option</p>
                  <PhoneCall className="h-4 w-4 text-emerald-300" />
                </div>
                <p className="mt-1 text-xs text-emerald-100/80">
                  Connect on demand when slots are available, or schedule via Calendly/Cal.com.
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 text-xs text-gray-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-300" />
                One unified booking flow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-300" />
                Mobile-first responsive interface
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-violet-300" />
                Real-time availability status
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      <section id="results" className="mx-auto mb-16 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:grid-cols-4 md:gap-6 md:p-8">
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">45%</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Avg. Revenue Lift</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">12k+</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">Leads Analyzed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">3.5x</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">ROI Potential</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-white">24/7</p>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-bold">AI Assist Coverage</p>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto mb-14 max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Contextual Analysis</p>
            <p className="mt-2 text-xs text-gray-400">Maps GTM pain points to practical automation strategies in one dashboard.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Flexible Scheduling</p>
            <p className="mt-2 text-xs text-gray-400">Calendly, Cal.com, or any custom meeting link, all in the same user journey.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm font-semibold text-white">Immediate Call Path</p>
            <p className="mt-2 text-xs text-gray-400">Prominent one-click “Start Now” call option with live availability checks.</p>
          </div>
        </div>
      </section>

      {/* Intake Section */}
      <section
        id="intake"
        className="mx-auto mt-8 mb-28 max-w-3xl scroll-mt-28"
      >
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 blur-3xl -z-10" />
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white">Company Intake</h2>
            <p className="mt-2 text-gray-400">
              Complete this 2-minute form to receive your custom AI analysis.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="h-12 w-full sm:w-auto bg-white/10 hover:bg-white/15 text-white border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                <Link href="/book-demo?skip=1">
                  Skip intake form → Book meeting directly
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-xs text-muted-foreground">
                Prefer to book first? You can fill details later.
              </p>
            </div>
          </div>
          <IntakeForm />
        </div>
      </section>

      <LandingTrust />
      
      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-black/40">
        <div className="mx-auto max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-500 fill-current" />
            <span className="font-bold">Dealflow.ai</span>
          </div>
          <p className="text-sm text-gray-500">© 2024 Dealflow.ai. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
