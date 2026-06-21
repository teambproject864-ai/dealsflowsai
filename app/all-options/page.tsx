"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, BarChart3, TrendingUp, Shield, Users, Calendar, User } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  href: string;
  description: string;
  category: string;
}

const ALL_OPTIONS: OptionItem[] = [
  { id: "browser-agent", name: "Browser Agent", href: "/browser-agent", description: "Autonomous browser agent", category: "AI & Automation" },
  { id: "gtm-analysis", name: "GTM Analysis", href: "/llm-comparison", description: "LLM performance comparison", category: "AI & Automation" },
  { id: "gtm-playbooks", name: "GTM Playbooks", href: "/solutions/gtm", description: "Go-to-market playbooks", category: "Solutions" },
  { id: "sales-acceleration", name: "Sales Acceleration", href: "/solutions/sales", description: "AI sales workflows", category: "Solutions" },
  { id: "marketing-optimization", name: "Marketing Optimization", href: "/solutions/marketing", description: "Marketing automation", category: "Solutions" },
  { id: "admin-portal", name: "Admin Portal", href: "/portal/admin/login", description: "System admin center", category: "Portals" },
  { id: "agent-portal", name: "Agent Portal", href: "/portal/agent/login", description: "AI agent workspace", category: "Portals" },
  { id: "customer-portal", name: "Customer Portal", href: "/portal/customer/login", description: "Client dashboard", category: "Portals" },
  { id: "book-demo", name: "Book a Demo", href: "/book-demo", description: "Schedule demo", category: "Other Options" },
  { id: "features", name: "Features", href: "/features", description: "All features", category: "Other Options" },
  { id: "support", name: "Support", href: "/support", description: "Help center", category: "Other Options" },
];

export default function AllOptionsPage() {
  const router = useRouter();

  // Group options by category without filtering
  const groupedOptions: Record<string, OptionItem[]> = {};
  ALL_OPTIONS.forEach(item => {
    if (!groupedOptions[item.category]) {
      groupedOptions[item.category] = [];
    }
    groupedOptions[item.category].push(item);
  });

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>

        <h1 className="text-4xl font-bold mb-2">All Options</h1>
        <p className="text-slate-400 text-lg mb-8">Explore all DealFlow.AI features and options</p>

        {/* Groups */}
        {Object.keys(groupedOptions).map(category => (
          <div key={category} className="mb-10">
            <h2 className="text-2xl font-bold text-slate-200 mb-4">{category}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedOptions[category].map(item => {
                return (
                  <div key={item.id} className="bg-[#070718] border border-white/10 rounded-3xl p-6 hover:border-teal-500/30 transition-all duration-300">
                    <Link href={item.href} className="text-lg font-semibold hover:text-teal-300 transition-colors duration-300">
                      {item.name}
                    </Link>
                    <p className="text-slate-400 text-sm mt-2">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
