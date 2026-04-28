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
  ArrowRight
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
    <div className="space-y-12">
      {/* Header Section */}
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
          <Sparkles className="h-3 w-3" />
          <span>Product Capabilities</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-emerald-400">scale your GTM.</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Discover our comprehensive suite of AI agents, automation tools, and security features designed for modern sales teams.
        </p>
      </header>

      {/* Filters Section */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input 
            placeholder="Search features..." 
            className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-muted-foreground focus:ring-violet-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search features"
          />
        </div>
        
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat === "All" ? null : cat)}
              aria-pressed={selectedCategory === cat || (cat === "All" && !selectedCategory)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                (selectedCategory === cat || (cat === "All" && !selectedCategory))
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/20"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Section */}
      <div 
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        aria-live="polite"
        aria-busy={loading}
      >
        <AnimatePresence mode="popLayout">
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((f, i) => {
              const Icon = getIconComponent(f.iconName);
              return (
                <motion.div
                  key={f.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  role="article"
                  aria-labelledby={`feature-title-${f.id}`}
                >
                  <Card className="group h-full border-white/10 bg-white/5 hover:bg-white/[0.08] transition-all duration-300 overflow-hidden hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 group-hover:bg-violet-500 group-hover:text-white transition-colors duration-300">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="flex gap-2">
                          {f.isNew && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                              New
                            </Badge>
                          )}
                          <Badge variant="outline" className={`
                            capitalize border-white/10
                            ${f.status === 'active' ? 'text-emerald-400 bg-emerald-400/5' : 
                              f.status === 'beta' ? 'text-amber-400 bg-amber-400/5' : 
                              'text-muted-foreground bg-white/5'}
                          `}>
                            <span className="sr-only">Status: </span>
                            {f.status}
                          </Badge>
                        </div>
                      </div>
                      <CardTitle 
                        id={`feature-title-${f.id}`}
                        className="text-xl text-white group-hover:text-violet-400 transition-colors duration-300"
                      >
                        {f.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {f.description}
                      </p>
                      <div className="pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300/50">
                          <span className="sr-only">Category: </span>
                          {f.category}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 text-center space-y-4"
            >
              <div className="flex justify-center">
                <Search className="h-12 w-12 text-muted-foreground/30" />
              </div>
              <h3 className="text-xl font-medium text-white">No features found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters.</p>
              <Button 
                variant="link" 
                className="text-violet-400"
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
              >
                Clear all filters
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <section className="mt-20 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/10 p-12 text-center backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-white mb-4">Want to see these in action?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Schedule a live demo to see how our AI features can transform your specific sales workflow.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-violet-600 hover:bg-violet-700 h-14 px-10 text-lg shadow-xl shadow-violet-600/20">
            <Link href="/book-demo">
              Book a Free Demo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-14 px-10 border-white/10 hover:bg-white/5">
            <Link href="/">Back to Intake</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-[#030712] selection:bg-violet-500/30">
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-32 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
          </div>
        }>
          <FeaturesContent />
        </Suspense>
      </div>
    </main>
  );
}
