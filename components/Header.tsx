"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Calendar, User, Shield, Users, Menu, X, ChevronDown, ChevronRight } from "lucide-react";

import { ExtrudedButton } from "@/components/immersive/ExtrudedButton";
import {
  IconDealflowLogo,
  IconShieldCompliance,
  IconRevenueAcceleration,
} from "@/components/gtm/GtmIcons";

import { NotificationCenter } from "./header/NotificationCenter";
import { AccountMenu } from "./header/AccountMenu";
import { MobileCommandDrawer } from "./header/MobileCommandDrawer";

interface NavLink {
  name: string;
  href: string;
  icon?: React.ElementType;
  subOptions?: { name: string; href: string; description?: string }[];
}

function NavDropdown({ 
  link, 
  isOpen, 
  onToggle, 
  onOpen,
  pathname, 
  onClose 
}: { 
  link: NavLink; 
  isOpen: boolean; 
  onToggle: () => void; 
  onOpen: () => void; 
  pathname: string; 
  onClose: () => void; 
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onOpen();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleFocus = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onOpen();
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (!containerRef.current?.contains(e.relatedTarget as Node)) {
      onClose();
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      buttonRef.current?.focus();
    }
  }, [onClose]);

  const isActive = pathname.startsWith(link.href);

  const contentAnimationProps = shouldReduceMotion
    ? { initial: false as any, animate: false as any, exit: false as any }
    : {
        initial: { opacity: 0, y: 12, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.96 },
        transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
      };

  return (
    <div
      ref={containerRef}
      className="relative animate-fade-in"
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      <button
        ref={buttonRef}
        onClick={onToggle}
        className={`group relative inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
          isActive
            ? "text-teal-400 bg-teal-400/5"
            : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {link.name}
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-teal-400" : "text-slate-500 group-hover:text-slate-400"
          }`}
          aria-hidden="true"
        />
        {isActive && (
          <motion.div
            layoutId="nav-underline"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400"
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...contentAnimationProps}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] rounded-2xl border border-white/10 bg-[#060612]/95 backdrop-blur-3xl shadow-2xl shadow-black/50 overflow-hidden z-[100] p-2"
            role="menu"
            aria-label={`${link.name} Submenu`}
          >
            {/* Header/Overview button */}
            <Link
              href={link.href}
              onClick={onClose}
              className="flex items-center justify-between px-3.5 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold group"
            >
              <span className="flex items-center gap-2">
                <span>View All {link.name}</span>
                <span className="text-[9px] font-semibold text-teal-400 border border-teal-500/30 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Overview
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-teal-400 transition-colors group-hover:translate-x-0.5" />
            </Link>

            <div className="border-t border-white/10 my-1 mx-2" />

            <div className="space-y-0.5">
              {link.subOptions?.map((option) => (
                <Link
                  key={option.href}
                  href={option.href}
                  onClick={onClose}
                  className="block px-3.5 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                  role="menuitem"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-teal-300 transition-colors">
                      {option.name}
                    </span>
                    {option.description && (
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 mt-1 leading-relaxed">
                        {option.description}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const navLinks: NavLink[] = [
    {
      name: "Solutions",
      href: "/solutions",
      icon: IconRevenueAcceleration,
      subOptions: [
        { name: "GTM Playbooks", href: "/solutions/gtm", description: "Go-to-market strategy automation" },
        { name: "Sales Acceleration", href: "/solutions/sales", description: "AI-powered sales workflows" },
        { name: "Marketing Optimization", href: "/solutions/marketing", description: "Intelligent marketing automation" },
      ],
    },
    {
      name: "Features",
      href: "/features",
      icon: IconShieldCompliance,
      subOptions: [
        { name: "AI Revenue Agents", href: "/ai-revenue-agents", description: "Autonomous sales agents" },
        { name: "RAG Analysis", href: "/rag", description: "Intelligent document analysis" },
        { name: "Meeting Intelligence", href: "/meeting-agent/live", description: "Real-time meeting insights" },
      ],
    },
  ];

  const portalLinks = [
    {
      name: "Admin Portal",
      href: "/portal/admin/login",
      icon: Shield,
      description: "For system administrators",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      name: "Agent Portal",
      href: "/portal/agent/login",
      icon: User,
      description: "For AI Revenue Agents",
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
    },
    {
      name: "Customer Portal",
      href: "/portal/customer/login",
      icon: Users,
      description: "For DealFlow customers",
      color: "text-violet-400",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/20",
    },
  ];

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Get Started button clicked!");
  };

  const handleBookMeeting = (e: React.MouseEvent) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-voice-call"));
  };

  // Scroll handler for header transformation
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns on path change
  useEffect(() => {
    setOpenDropdown(null);
  }, [pathname]);

  const headerClasses = isScrolled
    ? "sticky top-0 z-50 w-full border-b border-white/10 bg-[#060612]/90 df-glass backdrop-blur-xl !overflow-visible"
    : "sticky top-0 z-50 w-full border-b border-white/5 bg-[#060612]/70 df-glass backdrop-blur-lg !overflow-visible";

  return (
    <header className={headerClasses}>
      <div
        className={`container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 transition-all duration-300 ${
          isScrolled ? "h-14" : "h-16"
        }`}
      >
        {/* Left Side: Logo & Main Navigation Links */}
        <div className="flex items-center gap-6 xl:gap-8 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 rounded-xl"
            aria-label="Go to DealFlow.AI homepage"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]">
              <IconDealflowLogo className="h-6 w-6" aria-hidden />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight text-white hidden sm:inline-block">
              DealFlow<span className="text-teal-400">.AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.subOptions) {
                return (
                  <NavDropdown
                    key={link.name}
                    link={link}
                    isOpen={openDropdown === link.name}
                    onToggle={() => setOpenDropdown(openDropdown === link.name ? null : link.name)}
                    onOpen={() => setOpenDropdown(link.name)}
                    pathname={pathname}
                    onClose={() => setOpenDropdown(null)}
                  />
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-teal-400 bg-teal-400/5"
                      : "text-slate-400 hover:text-teal-300 hover:bg-white/5"
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-teal-500 via-teal-400 to-amber-400"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side: Quick Access Icons, Actions, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Notifications Center (Tablet & Desktop) */}
          <div className="hidden sm:block">
            <NotificationCenter />
          </div>

          {/* Streamlined Account management menu (Tablet & Desktop) */}
          <div className="hidden sm:block">
            <AccountMenu />
          </div>

          {/* Action CTAs (Desktop Only) */}
          <div className="hidden xl:flex items-center gap-2.5 pl-2 border-l border-white/10">
            <ExtrudedButton
              variant="outline"
              className="border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold px-4 py-2 h-9 flex items-center gap-2 shadow-[0_0_15px_rgba(20,184,166,0.1)] text-xs rounded-xl"
              onClick={handleBookMeeting}
            >
              <Calendar className="h-4 w-4" />
              Book Meeting
            </ExtrudedButton>

            <ExtrudedButton
              className="bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-semibold px-5 py-2 h-9 shadow-lg shadow-teal-600/25 transition-all hover:shadow-teal-500/35 text-xs rounded-xl"
              onClick={handleGetStarted}
            >
              Get Started
            </ExtrudedButton>
          </div>

          {/* Mobile hamburger triggers full command drawer */}
          <button
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
            aria-label="Open main menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Slide-out Mobile Command Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <MobileCommandDrawer
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            navLinks={navLinks}
            portalLinks={portalLinks}
            handleBookMeeting={handleBookMeeting}
            handleGetStarted={handleGetStarted}
          />
        )}
      </AnimatePresence>
    </header>
  );
}
