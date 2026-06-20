"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Bot, BarChart3, TrendingUp, Shield, Users, Calendar, User, Edit2, CheckCircle2, XCircle } from "lucide-react";

interface OptionStatus {
  id: string;
  status: "working" | "not-working";
  notes: string;
  lastVerified: string;
}

interface Category {
  name: string;
  items: { id: string; name: string; href: string; icon?: React.ElementType; description: string }[];
}

export default function AllOptionsPage() {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const categories: Category[] = [
    {
      name: "AI & Automation",
      items: [
        { id: "browser-agent", name: "Browser Agent", href: "/browser-agent", icon: Bot, description: "Autonomous browser agent for GTM tasks" },
        { id: "gtm-analysis", name: "GTM Analysis", href: "/llm-comparison", icon: BarChart3, description: "LLM performance comparison & GTM insights" },
      ],
    },
    {
      name: "Solutions",
      items: [
        { id: "gtm-playbooks", name: "GTM Playbooks", href: "/solutions/gtm", icon: TrendingUp, description: "Go-to-market strategy automation" },
        { id: "sales-acceleration", name: "Sales Acceleration", href: "/solutions/sales", icon: TrendingUp, description: "AI-powered sales workflows" },
        { id: "marketing-optimization", name: "Marketing Optimization", href: "/solutions/marketing", icon: TrendingUp, description: "Intelligent marketing automation" },
      ],
    },
    {
      name: "Portals",
      items: [
        { id: "admin-portal", name: "Admin Portal", href: "/portal/admin/login", icon: Shield, description: "System administrators control center" },
        { id: "agent-portal", name: "Agent Portal", href: "/portal/agent/login", icon: User, description: "Workspace for AI Revenue Agents" },
        { id: "customer-portal", name: "Customer Portal", href: "/portal/customer/login", icon: Users, description: "Access client dashboard and metrics" },
      ],
    },
    {
      name: "Other Options",
      items: [
        { id: "book-demo", name: "Book a Demo", href: "/book-demo", icon: Calendar, description: "Schedule a personalized product demo" },
        { id: "features", name: "Features", href: "/features", icon: TrendingUp, description: "All available platform features" },
        { id: "support", name: "Support", href: "/support", icon: TrendingUp, description: "Help center and customer support" },
      ],
    },
  ];

  // Create default statuses
  const createDefaultStatuses = (): Record<string, OptionStatus> => {
    const defaultStatuses: Record<string, OptionStatus> = {};
    categories.forEach(category => {
      category.items.forEach(item => {
        defaultStatuses[item.id] = {
          id: item.id,
          status: "working",
          notes: "Initial status set to working",
          lastVerified: new Date().toISOString(),
        };
      });
    });
    return defaultStatuses;
  };

  const [statuses, setStatuses] = useState<Record<string, OptionStatus>>(createDefaultStatuses);

  // Load from localStorage on client after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("optionStatuses");
        if (saved) {
          setStatuses(JSON.parse(saved));
        }
      } catch {
        // No saved data
      }
    }
  }, []);
  const [filter, setFilter] = useState<"all" | "working" | "not-working">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<OptionStatus, "id" | "lastVerified">>({ status: "working", notes: "" });

  // Save statuses to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("optionStatuses", JSON.stringify(statuses));
  }, [statuses]);

  const handleEdit = (itemId: string) => {
    const currentStatus = statuses[itemId];
    setEditForm({ status: currentStatus.status, notes: currentStatus.notes });
    setEditingId(itemId);
  };

  const handleSave = () => {
    if (!editingId) return;
    
    setStatuses(prev => ({
      ...prev,
      [editingId]: {
        ...prev[editingId],
        ...editForm,
        lastVerified: new Date().toISOString(),
      },
    }));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  // Filter items based on selected filter
  const getItemStatus = (itemId: string) => statuses[itemId]?.status || "working";
  const getFilteredCategories = (): Category[] => {
    return categories.map(category => ({
      ...category,
      items: category.items.filter(item => {
        if (filter === "all") return true;
        return getItemStatus(item.id) === filter;
      }),
    })).filter(category => category.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="min-h-screen bg-[#060612] text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 mb-8"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back</span>
        </button>

        <h1 className="text-4xl md:text-5xl font-bold mb-2">All Application Options</h1>
        <p className="text-slate-400 text-lg mb-8">Explore all available features and sections with status tracking</p>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { label: "All Options", value: "all" },
            { label: "Working Only", value: "working" },
            { label: "Not Working", value: "not-working" },
          ].map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value as "all" | "working" | "not-working")}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                filter === filterOption.value
                  ? "bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-lg shadow-teal-600/30"
                  : "bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {filteredCategories.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <h2 className="text-2xl font-bold text-slate-200 mb-4">{category.name}</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.items.map((item, itemIndex) => {
                  const status = getItemStatus(item.id);
                  const isEditing = editingId === item.id;

                  return (
                    <div
                      key={itemIndex}
                      className="p-6 rounded-3xl bg-[#070718] border border-white/10 hover:border-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        {item.icon && (
                          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-r from-teal-500/15 to-cyan-500/10 border border-teal-500/20 flex items-center justify-center text-teal-300">
                            <item.icon className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-teal-300 transition-colors duration-300">
                              <Link href={item.href}>{item.name}</Link>
                            </h3>
                            {/* Status Label */}
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              status === "working"
                                ? "bg-green-500/15 text-green-300 border border-green-500/20"
                                : "bg-red-500/15 text-red-300 border border-red-500/20"
                            }`}>
                              {status === "working" ? (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              {status === "working" ? "Working" : "Not Working"}
                            </span>
                          </div>
                          
                          {/* Description */}
                          <p className="text-slate-400 text-sm mb-3">{item.description}</p>

                          {/* Status Notes & Edit */}
                          {isEditing ? (
                            <div className="space-y-3">
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "working" | "not-working" })}
                                className="w-full bg-[#060612] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                              >
                                <option value="working">Working</option>
                                <option value="not-working">Not Working</option>
                              </select>
                              <textarea
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                placeholder="Add notes about the current status"
                                className="w-full bg-[#060612] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-teal-500 resize-none h-24"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSave}
                                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-500 hover:from-teal-500 hover:to-cyan-400 text-white font-semibold text-sm py-2 rounded-xl transition-all duration-300"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="flex-1 bg-white/6 border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 text-sm py-2 rounded-xl transition-all duration-300"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="text-xs text-slate-500">
                                Last verified: {isHydrated ? new Date(statuses[item.id].lastVerified).toLocaleString() : "--"}
                              </div>
                              <button
                                onClick={() => handleEdit(item.id)}
                                className="text-xs text-teal-300 hover:text-teal-200 transition-colors duration-300 flex items-center gap-1"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit Status
                              </button>
                            </div>
                          )}

                          {!isEditing && statuses[item.id].notes && (
                            <p className="text-xs text-slate-400 mt-2 bg-white/4 rounded-lg px-3 py-2">
                              {statuses[item.id].notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
