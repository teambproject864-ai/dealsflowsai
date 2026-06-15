"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  MessageSquare,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Send,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { GlassPanel, ExtrudedButton, SunkenInput, StaggerReveal } from "@/components/immersive";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How do I get started with Dealflow.ai?",
    answer: "You can sign up for an account and start using our tools immediately. We also offer a free trial.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
  },
  {
    question: "How can I contact support?",
    answer: "You can use the contact form on this page, or reach out via email at support@dealflow.ai.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 30-day money-back guarantee on all our paid plans.",
  },
];

const knowledgeBaseArticles = [
  {
    title: "Getting Started Guide",
    description: "Learn the basics of Dealflow.ai and how to set up your workspace.",
  },
  {
    title: "Dashboard Overview",
    description: "Understand all the metrics and widgets on your dashboard.",
  },
  {
    title: "Troubleshooting Common Issues",
    description: "Solutions to the most frequently reported problems.",
  },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubmitting(false);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <main className="min-h-screen bg-background py-20 px-6 relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[10%] left-[-15%] w-[35rem] h-[35rem] rounded-full bg-teal-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-15%] w-[35rem] h-[35rem] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-12">
          <Link
            href="/"
            prefetch={false}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-600 via-violet-600 to-teal-500 dark:from-teal-300 dark:via-violet-300 dark:to-teal-100 bg-clip-text text-transparent mb-4">Support Center</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Need help? We&apos;re here to assist you.
          </p>
        </div>

        <StaggerReveal className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Link href="/docs/gaps" className="group">
            <GlassPanel glow="primary" className="p-6 h-full transition-all duration-300 hover:border-teal-500/50 hover:bg-slate-100/50 dark:hover:bg-white/[0.06] hover:scale-105">
              <BookOpen className="h-10 w-10 text-teal-500 dark:text-teal-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Knowledge Base</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Explore our comprehensive documentation and setup guides.
              </p>
            </GlassPanel>
          </Link>

          <a href="https://dealflow.ai/chat" className="group">
            <GlassPanel glow="accent" className="p-6 h-full transition-all duration-300 hover:border-violet-500/50 hover:bg-slate-100/50 dark:hover:bg-white/[0.06] hover:scale-105">
              <MessageSquare className="h-10 w-10 text-violet-500 dark:text-violet-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Live Chat</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Chat with our support team in real-time.
              </p>
            </GlassPanel>
          </a>

          <a href="https://dealflow.ai" className="group" target="_blank" rel="noopener noreferrer">
            <GlassPanel className="p-6 h-full transition-all duration-300 hover:border-cyan-500/50 hover:bg-slate-100/50 dark:hover:bg-white/[0.06] hover:scale-105">
              <Globe className="h-10 w-10 text-cyan-500 dark:text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Website</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Visit our main website for more resources and contact details.
              </p>
            </GlassPanel>
          </a>
        </StaggerReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassPanel material="glass" className="border border-slate-200 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden p-0" tilt={false}>
            <div className="bg-gradient-to-r from-teal-500/10 via-violet-500/5 to-transparent border-b border-slate-200 dark:border-white/5 px-8 py-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <MessageSquare className="h-6 w-6 text-teal-500 dark:text-teal-400" />
                Contact Us
              </h2>
            </div>
            <div className="p-8">
              {submitted ? (
                <div className="flex items-center gap-3 p-6 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-8 w-8 flex-shrink-0" />
                  <div>
                    <p className="font-bold">Message sent!</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">We will get back to you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Name
                    </label>
                    <SunkenInput
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Email
                    </label>
                    <SunkenInput
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Subject
                    </label>
                    <SunkenInput
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-505 dark:text-slate-400">
                      Message
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="flex min-h-[150px] w-full rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-505 border border-slate-200 dark:border-white/5 bg-slate-100/50 dark:bg-slate-950/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.04)] dark:shadow-[inset_0_4px_12px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 dark:focus-visible:ring-teal-400/50 transition-shadow duration-300"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <ExtrudedButton
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </ExtrudedButton>
                </form>
              )}
            </div>
          </GlassPanel>

          <div className="space-y-6">
            <GlassPanel material="glass" className="border border-slate-200 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden p-0" tilt={false}>
              <div className="bg-gradient-to-r from-teal-500/10 via-violet-500/5 to-transparent border-b border-slate-200 dark:border-white/5 px-8 py-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-violet-550 dark:text-violet-400" />
                  Frequently Asked Questions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-100/30 dark:bg-slate-950/20"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                        className="w-full p-4 flex items-center justify-between text-left bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all"
                      >
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {faq.question}
                        </span>
                        <span className={cn(
                          "text-teal-650 dark:text-teal-400 transition-transform duration-200 text-xs",
                          openFaq === idx ? "rotate-180" : "rotate-0"
                        )}>
                          ▼
                        </span>
                      </button>
                      <AnimatePresence>
                        {openFaq === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 text-slate-650 dark:text-slate-300 text-sm border-t border-slate-200 dark:border-white/5 mt-1 bg-slate-100/40 dark:bg-slate-950/40">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel material="glass" className="border border-slate-200 dark:border-white/10 shadow-xl rounded-3xl overflow-hidden p-0" tilt={false}>
              <div className="px-8 py-6 border-b border-slate-200 dark:border-white/5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Popular Articles</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {knowledgeBaseArticles.map((article, idx) => (
                    <Link
                      key={idx}
                      href="/docs/gaps"
                      className="block p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/30 dark:bg-slate-950/20 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:border-teal-500/30 transition-all"
                    >
                      <p className="font-semibold text-slate-850 dark:text-white">{article.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{article.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </main>
  );
}

