"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ChevronRight, HelpCircle, Sparkles, ArrowRight, Shield, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/immersive";
import Link from "next/link";

interface PricingTier {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
  color: string;
  glow: string;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    description: "Perfect for small teams and startups scaling initial pipeline.",
    features: [
      { text: "6-step intelligent intake form", included: true },
      { text: "AI GTM analysis reports", included: true },
      { text: "Basic booking pipeline flow", included: true },
      { text: "Up to 50 active leads/month", included: true },
      { text: "Email support (24h SLA)", included: true },
      { text: "ROI attribution calculator", included: false },
      { text: "Smart email sequence generator", included: false },
      { text: "ALMA adaptive learning models", included: false },
    ],
    cta: "Get Started",
    color: "border-slate-200 dark:border-white/15 hover:border-slate-300 dark:hover:border-white/20 bg-slate-50 dark:bg-slate-900",
    glow: "shadow-slate-200/50 dark:shadow-white/5"
  },
  {
    name: "Growth",
    price: { monthly: 199, annual: 159 },
    description: "Ideal for growing sales organizations needing automated memory systems.",
    features: [
      { text: "6-step intelligent intake form", included: true },
      { text: "AI GTM analysis reports", included: true },
      { text: "Advanced booking pipeline flow", included: true },
      { text: "Up to 500 active leads/month", included: true },
      { text: "Priority support (4h SLA)", included: true },
      { text: "ROI attribution calculator", included: true },
      { text: "Smart email sequence generator", included: true },
      { text: "ALMA adaptive learning models", included: true },
    ],
    cta: "Start 14-Day Free Trial",
    popular: true,
    color: "border-teal-300 dark:border-teal-500/30 bg-teal-50 dark:bg-slate-900 hover:border-teal-500",
    glow: "shadow-teal-500/10 dark:shadow-teal-500/5"
  },
  {
    name: "Enterprise",
    price: { monthly: 499, annual: 399 },
    description: "For large companies requiring custom controls, SOC2 compliance, and SLAs.",
    features: [
      { text: "Everything included in Growth", included: true },
      { text: "Unlimited active lead volume", included: true },
      { text: "Dedicated account strategist", included: true },
      { text: "Custom webhook & CRM integrations", included: true },
      { text: "SOC2 Compliance Auditing (Clawpatrol)", included: true },
      { text: "99.9% availability SLA guarantee", included: true },
      { text: "On-premise secure deployment option", included: true },
      { text: "Custom system fine-tuning (ALMA)", included: true },
    ],
    cta: "Contact Sales",
    color: "border-violet-300 dark:border-violet-500/30 bg-violet-50 dark:bg-slate-900 hover:border-violet-500",
    glow: "shadow-violet-500/10 dark:shadow-violet-500/5"
  }
];

const faqItems = [
  {
    question: "Can I switch plans or cancel at any time?",
    answer: "Yes, absolutely. You can upgrade, downgrade, or cancel your subscription directly from your account billing dashboard. If you upgrade, the new rate is prorated for the remainder of the billing cycle. If you cancel, your access continues until the end of your current paid period."
  },
  {
    question: "Is there a free trial period?",
    answer: "Yes, we offer a 14-day free trial on the Growth plan. No credit card is required to set up your sandbox and test out autonomous lead intake, GTM plans, and basic memory features. You can transition to a paid plan at any time during the trial."
  },
  {
    question: "How does the memory synchronization (Hermes) scale across multiple agents?",
    answer: "Memory OS (Hermes) and MEM Palace utilize structured semantic storage pipelines. This allows state variables to sync instantly regardless of the number of active agents. All data is isolated within secure namespaces, preventing cross-tenant leakage while assuring sub-50ms query operations."
  },
  {
    question: "What is your refund policy and guarantee?",
    answer: "We offer a 30-day money-back guarantee on all subscription plans. If you find that DealFlow.AI is not a fit for your revenue operations workflow, contact our support team within the first 30 days of activation for a full refund."
  },
  {
    question: "How does the SOC2 compliance firewall (Clawpatrol) secure my customer data?",
    answer: "Clawpatrol intercepts all outbound and inbound messages, automatically redacting PII (personally identifiable information), verifying context boundaries to prevent hallucinations, and recording audit transactions to an immutable log. Our infrastructure is hosted on AWS SOC2 certified networks."
  }
];

const featureCategories = [
  {
    name: "Pipeline & Data Intake",
    items: [
      { name: "Intelligent Lead Intake Form", starter: "6-step basic", growth: "Advanced validation", enterprise: "Customizable dynamic forms" },
      { name: "Auto-Enrichment Insights", starter: "Basic", growth: "Standard database", enterprise: "Deep enrichment vectors" },
      { name: "CRM Bidirectional Sync", starter: "❌", growth: "HubSpot & Salesforce", enterprise: "Custom APIs & webhooks" },
    ]
  },
  {
    name: "AI & Learning Models",
    items: [
      { name: "Memory OS (Hermes) Sync", starter: "Standard", growth: "Real-time state", enterprise: "Enterprise cluster allocation" },
      { name: "MEM Palace Indexing", starter: "❌", growth: "500 assets", enterprise: "Unlimited assets + semantic routing" },
      { name: "ALMA Self-Supervision", starter: "❌", growth: "Standard model", enterprise: "Dedicated fine-tuning layers" },
      { name: "Verification validation", starter: "Standard", growth: "Advanced logic", enterprise: "Zero-compromise custom rules" },
    ]
  },
  {
    name: "Security & Ops",
    items: [
      { name: "PII Redaction Guardrails", starter: "❌", growth: "Standard logs", enterprise: "Enterprise-wide compliance" },
      { name: "Security Firewall (Clawpatrol)", starter: "Basic policy", growth: "Full isolation", enterprise: "Immutable compliance logs & SOC2" },
      { name: "Support Channels", starter: "Email (24h)", growth: "Priority (4h SLA)", enterprise: "Dedicated account strategist" },
      { name: "Uptime SLA", starter: "❌", growth: "❌", enterprise: "99.9% guaranteed" },
    ]
  }
];

function FAQAccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-white/5 py-4.5">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 text-slate-800 dark:text-white font-semibold hover:text-teal-650 dark:hover:text-teal-400 transition-colors focus:outline-none"
      >
        <span className="text-base sm:text-lg flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-slate-500 shrink-0" />
          {question}
        </span>
        <span className="text-xl text-slate-500 font-light select-none ml-4 transition-transform duration-300">
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-slate-650 dark:text-slate-400 text-sm pl-8 pr-4 py-2.5 leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[10%] left-[-15%] w-[35rem] h-[35rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 text-center border-b border-slate-200 dark:border-white/5">
        <div className="max-w-4xl mx-auto px-6 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 text-teal-600 dark:text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5 text-teal-500 dark:text-teal-400" />
            <span>Pricing Packages</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight font-sans">
            Transparent Pricing for{" "}
            <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-violet-700 dark:from-teal-400 dark:via-cyan-400 dark:to-violet-500 bg-clip-text text-transparent">
              Any Scale
            </span>
          </h1>
          <p className="text-slate-650 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Choose the operational framework that fits your sales team. Deploy fully compliant autonomous agents in under 10 minutes.
          </p>

          {/* Monthly/Annual Toggle Switch */}
          <div className="pt-6">
            <div className="inline-flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-white/15">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  !isAnnual 
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-300 flex items-center gap-1.5 ${
                  isAnnual 
                    ? "bg-teal-500 text-white shadow-lg shadow-teal-500/20" 
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span>Annual</span>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-normal">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, idx) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="h-full"
            >
              <GlassPanel
                material={tier.popular ? "neon" : "glass"}
                glow={tier.popular ? "accent" : "none"}
                className={`h-full flex flex-col justify-between p-8 border ${tier.color} transition-all duration-500 shadow-2xl relative ${tier.glow}`}
                tilt={true}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-violet-600 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-bl-xl shadow-lg z-20 border-l border-b border-teal-500/30">
                    Most Popular
                  </div>
                )}
                
                <div>
                  <div className="mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tier.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed min-h-[40px]">{tier.description}</p>
                    <div className="mt-6 flex items-baseline">
                      <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-sans">
                        ${isAnnual ? tier.price.annual : tier.price.monthly}
                      </span>
                      <span className="text-slate-500 dark:text-slate-450 ml-2 text-sm">/ month</span>
                    </div>
                    {isAnnual && (
                      <p className="text-[10px] text-emerald-650 dark:text-emerald-400 mt-1.5 font-bold uppercase tracking-wider">Billed annually</p>
                    )}
                  </div>

                  <div className="border-t border-slate-200 dark:border-white/5 my-6"></div>

                  <ul className="space-y-4 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={`text-sm leading-tight ${feature.included ? "text-slate-700 dark:text-slate-200" : "text-slate-400 dark:text-slate-500 line-through"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/5">
                  <Link href={tier.name === "Enterprise" ? "/book-demo" : "/book-demo?trial=true"}>
                    <Button
                      className={`w-full h-13 rounded-xl font-semibold uppercase tracking-wider text-xs transition-all duration-300 ${
                        tier.popular 
                          ? "bg-teal-600 dark:bg-teal-500 hover:bg-teal-500 dark:hover:bg-teal-400 text-white shadow-lg shadow-teal-500/25" 
                          : "bg-slate-100 dark:bg-white/3 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/5 text-slate-800 dark:text-white"
                      }`}
                      variant={tier.popular ? "default" : "outline"}
                    >
                      <span>{tier.cta}</span>
                      <ChevronRight className="ml-1.5 h-4 w-4 shrink-0" />
                    </Button>
                  </Link>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Table Section */}
      <section className="py-16 max-w-7xl mx-auto px-6 border-t border-slate-200 dark:border-white/5">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white">Compare Plan Features</h2>
          <p className="text-slate-605 dark:text-slate-400">Deep-dive comparison matrix of active modules, SLAs, and technical limitations.</p>
        </div>

        <GlassPanel material="glass" depth="mid" tilt={false} className="border-slate-200 dark:border-white/8 p-0 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-white/2 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="py-5 px-6">Operational Capabilities</th>
                  <th className="py-5 px-6 w-[20%]">Starter</th>
                  <th className="py-5 px-6 w-[20%]">Growth</th>
                  <th className="py-5 px-6 w-[20%]">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {featureCategories.map((category) => (
                  <Fragment key={category.name}>
                    <tr className="bg-slate-50/50 dark:bg-[#070715]/40 text-sm">
                      <td colSpan={4} className="py-4 px-6 font-bold text-teal-650 dark:text-teal-400 bg-slate-100/10 dark:bg-white/[0.01] uppercase tracking-wider text-xs border-b border-slate-200 dark:border-white/5">
                        {category.name}
                      </td>
                    </tr>
                    {category.items.map((item) => (
                      <tr key={item.name} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors text-sm">
                        <td className="py-4.5 px-6 text-slate-705 dark:text-slate-300 font-medium">{item.name}</td>
                        <td className="py-4.5 px-6 text-slate-500 dark:text-slate-400 text-xs">{item.starter}</td>
                        <td className="py-4.5 px-6 text-slate-800 dark:text-slate-200 text-xs font-semibold">{item.growth}</td>
                        <td className="py-4.5 px-6 text-teal-600 dark:text-teal-300 text-xs font-semibold">{item.enterprise}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      </section>

      {/* Interactive FAQ Accordion */}
      <section className="py-20 max-w-4xl mx-auto px-6 border-t border-slate-200 dark:border-white/5">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-slate-605 dark:text-slate-400">Everything you need to know about billing, architecture sync, and data guardrails.</p>
        </div>

        <GlassPanel material="glass" depth="mid" tilt={false} className="border-slate-200 dark:border-white/8 p-6 sm:p-8">
          <div className="divide-y divide-slate-200 dark:divide-white/5">
            {faqItems.map((item, idx) => (
              <FAQAccordionItem 
                key={idx}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </div>
        </GlassPanel>
      </section>

      {/* Trust Badges Bar */}
      <section className="py-12 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-around gap-8 text-center text-slate-550 dark:text-slate-500 font-semibold uppercase tracking-widest text-[10px]">
          <div className="flex items-center gap-2.5">
            <Shield className="h-5 w-5 text-teal-600/70 dark:text-teal-500/50" />
            <span>SOC2 Type II Compliant</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-teal-600/70 dark:text-teal-500/50" />
            <span>GDPR Ready Infrastructure</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Award className="h-5 w-5 text-teal-600/70 dark:text-teal-500/50" />
            <span>30-Day Money-Back Guarantee</span>
          </div>
        </div>
      </section>
    </div>
  );
}
