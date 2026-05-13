"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface PricingTier {
  name: string;
  price: { monthly: number; annual: number };
  description: string;
  features: { text: string; included: boolean }[];
  cta: string;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Starter",
    price: { monthly: 49, annual: 39 },
    description: "Perfect for small teams and startups",
    features: [
      { text: "6-step intake form", included: true },
      { text: "AI analysis output", included: true },
      { text: "Basic booking flow", included: true },
      { text: "Up to 50 leads/month", included: true },
      { text: "Email support", included: true },
      { text: "ROI calculator", included: false },
      { text: "Email sequence generator", included: false },
      { text: "Live calls", included: false },
    ],
    cta: "Get Started"
  },
  {
    name: "Growth",
    price: { monthly: 199, annual: 159 },
    description: "Ideal for growing sales teams",
    features: [
      { text: "6-step intake form", included: true },
      { text: "AI analysis output", included: true },
      { text: "Advanced booking flow", included: true },
      { text: "Up to 500 leads/month", included: true },
      { text: "Priority support", included: true },
      { text: "ROI calculator", included: true },
      { text: "Email sequence generator", included: true },
      { text: "Live calls (5 seats)", included: true },
    ],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: { monthly: 499, annual: 399 },
    description: "For large organizations with custom needs",
    features: [
      { text: "Everything in Growth", included: true },
      { text: "Unlimited leads", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Custom integrations", included: true },
      { text: "SLA guarantee", included: true },
      { text: "White-labeling", included: true },
      { text: "Unlimited live call seats", included: true },
      { text: "On-premise deployment", included: true },
    ],
    cta: "Contact Sales"
  }
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Choose the plan that fits your team needs. All plans include our core features.
          </p>
          <div className="inline-flex items-center bg-white/5 rounded-full p-1 border border-white/10">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                !isAnnual ? "bg-violet-600 text-white" : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                isAnnual ? "bg-violet-600 text-white" : "text-muted-foreground"
              }`}
            >
              Annual <span className="ml-1 text-emerald-400 text-xs">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`h-full border ${tier.popular ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-white/[0.03]"} backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] relative overflow-hidden`}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      ${isAnnual ? tier.price.annual : tier.price.monthly}
                    </span>
                    <span className="text-muted-foreground ml-2">/month</span>
                    {isAnnual && (
                      <p className="text-sm text-emerald-400 mt-1">Billed annually</p>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${tier.popular ? "bg-violet-600 hover:bg-violet-700" : ""}`}
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {tier.cta}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Can I change plans later?</h3>
                  <p className="text-muted-foreground">Yes, you can upgrade or downgrade your plan at any time.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                  <p className="text-muted-foreground">Yes, the Growth plan comes with a 14-day free trial.</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
                  <p className="text-muted-foreground">We offer a 30-day money-back guarantee on all plans.</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">How do I get support?</h3>
                  <p className="text-muted-foreground">Support is available via email, and priority support for paid plans.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
