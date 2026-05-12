"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, Menu, X, BarChart3, Globe, Shield, Zap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { name: "Solutions", href: "/solutions", icon: Zap },
    { name: "Features", href: "/features", icon: Shield },
    { name: "RAG Analysis", href: "/rag", icon: Globe },
  ];

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Get Started button clicked!");
  };

  const handleUserProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link 
            href="/" 
            className="flex items-center gap-2 group"
            aria-label="Go to Dealflow.ai homepage"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 font-bold text-white shadow-lg shadow-violet-500/40 transition-transform group-hover:scale-105">
              DF
            </div>
            <span className="text-xl font-black tracking-tighter text-white uppercase">
              DEALFLOW<span className="text-violet-500">.AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold transition-all hover:text-violet-400 relative py-2 ${
                  pathname === link.href ? "text-violet-400" : "text-slate-400"
                }`}
                aria-current={pathname === link.href ? "page" : undefined}
              >
                {link.name}
                {pathname === link.href && (
                  <motion.div 
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                onClick={handleUserProfile}
                aria-label="User profile menu"
                aria-expanded={isUserMenuOpen}
              >
                <User className="h-5 w-5" />
              </Button>
              
              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 shadow-xl py-2"
                  >
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link 
                      href="/settings" 
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Settings
                    </Link>
                    <div className="border-t border-white/10 my-1" />
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <Button 
              className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-6 shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10 bg-slate-900 px-4 py-6"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-lg font-medium text-slate-300 hover:text-violet-400 transition-colors"
                >
                  <link.icon className="h-5 w-5 text-violet-500" />
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10 my-2" />
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12"
                onClick={(e) => {
                  setIsMenuOpen(false);
                  handleGetStarted(e);
                }}
              >
                Get Started
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
