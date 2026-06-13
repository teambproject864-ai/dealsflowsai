"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Star, Check, Plus, Trash2, ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface FavoriteItem {
  id: string;
  name: string;
  href: string;
}

const DEFAULT_FAVORITES: FavoriteItem[] = [
  { id: "solutions", name: "Solutions Workspace", href: "/solutions" },
  { id: "features", name: "Capabilities (Features)", href: "/features" },
  { id: "rag", name: "RAG Scraper Analysis", href: "/rag" },
];

export function FavoritesDropdown() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const animationProps = shouldReduceMotion
    ? {
        initial: { opacity: 1, y: 0, scale: 1 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 1, y: 0, scale: 1 },
        transition: { duration: 0, ease: "linear" as any }
      }
    : {
        initial: { opacity: 0, y: 8, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 8, scale: 0.97 },
        transition: { duration: 0.15, ease: "easeOut" as any },
      };

  useEffect(() => {
    const saved = localStorage.getItem("df_favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites(DEFAULT_FAVORITES);
      }
    } else {
      setFavorites(DEFAULT_FAVORITES);
      localStorage.setItem("df_favorites", JSON.stringify(DEFAULT_FAVORITES));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveFavorites = (updated: FavoriteItem[]) => {
    setFavorites(updated);
    localStorage.setItem("df_favorites", JSON.stringify(updated));
  };

  const isCurrentPageFavorite = favorites.some(fav => fav.href === pathname);

  const toggleCurrentPage = () => {
    if (isCurrentPageFavorite) {
      const updated = favorites.filter(fav => fav.href !== pathname);
      saveFavorites(updated);
    } else {
      let name = "Custom Page";
      if (pathname === "/") name = "Home Dashboard";
      else if (pathname === "/solutions") name = "Solutions";
      else if (pathname === "/features") name = "Capabilities";
      else if (pathname === "/rag") name = "RAG Analysis";
      else if (pathname.includes("/solutions/gtm")) name = "GTM Playbook";
      else {
        const parts = pathname.split("/").filter(Boolean);
        name = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" > ");
      }

      const updated = [...favorites, { id: `fav-${Date.now()}`, name, href: pathname }];
      saveFavorites(updated);
    }
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favorites.filter(fav => fav.id !== id);
    saveFavorites(updated);
  };

  return (
    <div ref={containerRef} className="relative z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50 ${
          isOpen
            ? "border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20"
        }`}
        aria-label="View favorites"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Star className={`h-4.5 w-4.5 ${isCurrentPageFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...animationProps}
            className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-[#060612]/98 backdrop-blur-3xl shadow-2xl shadow-black/30 overflow-hidden z-[100]"
            role="menu"
            aria-orientation="vertical"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-white/[0.02]">
              <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" /> Favorites
              </span>
              <button
                onClick={toggleCurrentPage}
                className="text-[10px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-semibold transition-colors bg-teal-500/10 hover:bg-teal-500/20 px-2.5 py-1.5 rounded-xl border border-teal-500/20"
              >
                {isCurrentPageFavorite ? (
                  <>
                    <Check className="h-3 w-3" /> Unfavorite page
                  </>
                ) : (
                  <>
                    <Plus className="h-3 w-3" /> Favorite current page
                  </>
                )}
              </button>
            </div>

            <div className="p-2 space-y-1 max-h-[320px] overflow-y-auto">
              {favorites.length === 0 ? (
                <div className="text-center p-6 text-slate-500 text-xs">
                  No bookmarks saved. Click the button above to pin pages.
                </div>
              ) : (
                favorites.map((fav) => (
                  <Link
                    key={fav.id}
                    href={fav.href}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center justify-between px-3 py-2.5 rounded-xl border border-transparent hover:border-white/10 hover:bg-white/5 text-slate-300 hover:text-white transition-all duration-200 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/50"
                    role="menuitem"
                  >
                    <span className="truncate leading-none font-medium flex-grow">{fav.name}</span>
                    <div className="flex items-center gap-2">
                      <ArrowUpRight className="h-3 w-3 text-slate-500 group-hover:text-teal-400 transition-colors" />
                      <button
                        onClick={(e) => removeFavorite(fav.id, e)}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                        aria-label="Remove favorite"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
