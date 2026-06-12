"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Calendar, Bell, Shield, User, Globe, Sun, Moon, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface NavLink {
  name: string;
  href: string;
  icon?: React.ElementType;
  subOptions?: { name: string; href: string; description?: string }[];
}

interface MobileCommandDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  portalLinks: Array<{
    name: string;
    href: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
    description: string;
  }>;
  handleBookMeeting: (e: any) => void;
  handleGetStarted: (e: any) => void;
}

export function MobileCommandDrawer({
  isOpen,
  onClose,
  navLinks,
  portalLinks,
  handleBookMeeting,
  handleGetStarted,
}: MobileCommandDrawerProps) {
  const pathname = usePathname();
  const [expandedNav, setExpandedNav] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const shouldReduceMotion = useReducedMotion();

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("df_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);

    if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [theme]);

  const animationProps = shouldReduceMotion
    ? { initial: false, animate: false, exit: false }
    : {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", damping: 25, stiffness: 200, mass: 0.8 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden flex justify-end" role="dialog" aria-modal="true" aria-label="Main menu">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#040410]/95 backdrop-blur-xl"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            {...animationProps}
            className="relative w-full max-w-sm h-full bg-gradient-to-b from-[#060612] to-[#040410] border-l border-white/15 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/15 border border-teal-500/20">
                  <span className="text-teal-400 font-bold text-sm">DF</span>
                </div>
                <span className="font-display font-bold text-base text-white">
                  Menu
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
              {/* Quick Actions */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                  Quick Actions
                </h3>
                <div className="flex items-center gap-3 bg-gradient-to-r from-white/5 to-transparent p-4 rounded-3xl border border-white/10">
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 flex items-center gap-2 transition-all duration-300"
                    aria-label="Toggle system color theme"
                  >
                    {theme === "dark" ? (
                      <Moon className="h-4.5 w-4.5 text-teal-400" />
                    ) : (
                      <Sun className="h-4.5 w-4.5 text-amber-400" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-300">Theme</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {theme === "dark" ? "Dark mode" : "Light mode"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Navigation */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                  Navigation
                </h3>
                <div className="space-y-2">
                  {navLinks.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    const isExpanded = expandedNav === link.name;

                    if (link.subOptions) {
                      return (
                        <div key={link.name} className="space-y-1.5">
                          <button
                            onClick={() => setExpandedNav(isExpanded ? null : link.name)}
                            className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
                              isActive
                                ? "border-teal-500/30 bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-300"
                                : "border-transparent text-slate-300 hover:text-white hover:bg-white/8 hover:border-white/10"
                            }`}
                            aria-expanded={isExpanded}
                            aria-controls={`mobile-subnav-${link.name}`}
                          >
                            <div className="flex items-center gap-3">
                              {link.icon && <link.icon className={`h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />}
                              <span className="font-semibold text-sm">{link.name}</span>
                            </div>
                            <ChevronDown
                              className={`h-4.5 w-4.5 transition-all duration-300 ${
                                isExpanded ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                id={`mobile-subnav-${link.name}`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.2, 1, 0.3, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="pl-4 pr-1 pb-1 space-y-1.5">
                                  <Link
                                    href={link.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-300"
                                  >
                                    <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                                    <span className="font-medium">Overview</span>
                                  </Link>
                                  {link.subOptions.map((option) => (
                                    <Link
                                      key={option.href}
                                      href={option.href}
                                      onClick={onClose}
                                      className="flex flex-col gap-0.5 px-4 py-3 rounded-2xl text-xs text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-300"
                                    >
                                      <span className="font-medium">{option.name}</span>
                                      {option.description && (
                                        <span className="text-[10px] text-slate-500">
                                          {option.description}
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
                          isActive
                            ? "border-teal-500/30 bg-gradient-to-r from-teal-500/15 to-cyan-500/10 text-teal-300"
                            : "border-transparent text-slate-300 hover:text-white hover:bg-white/8 hover:border-white/10"
                        }`}
                      >
                        {link.icon && <link.icon className={`h-5 w-5 ${isActive ? "text-teal-400" : "text-slate-500"}`} />}
                        <span className="font-semibold text-sm">{link.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Portals */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2">
                  Portals
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {portalLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center gap-3.5 px-4 py-4 rounded-2xl border transition-all duration-300 hover:bg-white/8 ${link.borderColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50`}
                      >
                        <div className={`p-2.5 rounded-2xl ${link.bgColor}`}>
                          <Icon className={`h-5 w-5 ${link.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-sm text-white">{link.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{link.description}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="border-t border-white/10 p-5 space-y-3">
              <Button
                variant="outline"
                className="w-full border-teal-500/30 bg-gradient-to-r from-teal-500/15 to-cyan-500/10 hover:from-teal-500/25 hover:to-cyan-500/20 text-teal-300 font-bold h-12 flex items-center justify-center gap-2.5 rounded-3xl shadow-lg"
                onClick={(e) => {
                  onClose();
                  handleBookMeeting(e);
                }}
              >
                <Calendar className="h-4.5 w-4.5" />
                Book Meeting
              </Button>

              <Button
                className="w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 hover:from-teal-500 hover:via-cyan-400 hover:to-teal-400 text-white font-bold h-12 rounded-3xl shadow-xl shadow-teal-600/35 transition-all duration-300 hover:shadow-teal-500/50"
                onClick={(e) => {
                  onClose();
                  handleGetStarted(e);
                }}
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
