// app/features/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Sparkles, 
  Search, 
  Filter,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Target,
  Rocket,
  ShieldCheck,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Feature, 
  FEATURE_CATEGORIES, 
  getIconComponent 
} from "@/lib/features";
import { useFeatures } from "@/lib/feature-hooks";
import Link from "next/link";
import { MemoryPalaceMapping } from "@/components/MemoryPalaceMapping";

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
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        <p className="mt-4 text-muted-foreground animate-pulse">Loading Dealflow.ai capabilities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-white">Unable to load features</h2>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-24">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400"
        >
          <Sparkles className="h-4 w-4" />
          <span>Product Capabilities</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl"
        >
          The Future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-emerald-400 to-blue-400">Autonomous Sales.</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Scale your Go-To-Market strategy with AI agents that analyze, engage, and close deals while you sleep.
        </motion.p>
      </section>

      {/* Competitive Advantages */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          {
            title: "Unmatched Accuracy",
            desc: "Our integrated validation layer ensures 99.9% factual accuracy in all AI-driven customer interactions.",
            icon: Trophy,
            color: "text-amber-400",
            bg: "bg-amber-400/10"
          },
          {
            title: "Infinite Scalability",
            desc: "Deploy thousands of autonomous agents simultaneously across multiple timezones and languages.",
            icon: Rocket,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10"
          },
          {
            title: "Data Intelligence",
            desc: "Leverage vector-based semantic search and intelligent data integration for deep lead understanding.",
            icon: Target,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
          }
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
          >
            <div className={`p-3 rounded-2xl w-fit mb-6 ${item.bg} ${item.color}`}>
              <item.icon className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Feature Explorer */}
      <section className="space-y-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between border-b border-white/10 pb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Explore our platform</h2>
            <p className="text-muted-foreground">Discover the tools powering the next generation of sales.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search features..." 
                className="pl-10 w-full sm:w-[300px] bg-white/5 border-white/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    (selectedCategory === cat || (cat === "All" && !selectedCategory))
                      ? "bg-violet-600 text-white"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full bg-white/5 border-white/10 hover:bg-white/[0.08] transition-all group overflow-hidden">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors">
                          <Icon className="h-6 w-6" />
                        </div>
                        {f.isNew && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">New</Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl text-white group-hover:text-violet-400 transition-colors">
                        {f.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {f.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-violet-300/50">
                          <Cpu className="h-3 w-3" />
                          {f.category}
                        </div>
                        {f.version && (
                          <div className="text-[10px] font-mono text-slate-500">
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

      {/* Memory Palace Integration */}
      <section id="memory-palace">
        <MemoryPalaceMapping />
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-b from-violet-600/20 to-transparent p-12 md:p-24 rounded-[3rem] border border-violet-500/20 text-center space-y-12">
        <h2 className="text-4xl font-bold text-white">Why leading teams choose DealFlow.ai</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Revenue Growth", value: "40%", desc: "Increase in sales velocity" },
            { label: "Cost Reduction", value: "65%", desc: "Lower GTM overhead costs" },
            { label: "Agent Response", value: "< 2s", desc: "Instant lead engagement" },
            { label: "Data Accuracy", value: "100%", desc: "Secure & compliant analysis" }
          ].map((stat) => (
            <div key={stat.label} className="space-y-2">
              <div className="text-4xl font-black text-violet-400">{stat.value}</div>
              <div className="text-lg font-bold text-white">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.desc}</div>
            </div>
          ))}
        </div>
        <div className="pt-8">
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-white px-12 h-14 rounded-full text-lg font-bold">
            Get Started for Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
        </div>
      }>
        <FeaturesContent />
      </Suspense>
    </div>
  );
}
