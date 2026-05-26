"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronDown, ExternalLink, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/analytics";

interface BookDemoToggleProps {
  className?: string;
  leadId?: string;
  analysisId?: string;
}

export function BookDemoToggle({ className = "", leadId, analysisId }: BookDemoToggleProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleRedirect = () => {
    trackEvent("book_demo_redirect", { leadId, analysisId });
    const url = analysisId ? `/book-demo?analysisId=${analysisId}` : "/book-demo";
    router.push(url);
  };

  const handleDropdownSelect = (option: string) => {
    setSelectedOption(option);
    setIsDropdownOpen(false);
    trackEvent("book_demo_dropdown_select", { option, leadId, analysisId });
    const url = option === "calcom" 
      ? "https://cal.com/team/dealflow/30min"
      : "https://calendly.com/dealflow-ai/30min";
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleRedirect}
          size="lg"
          className="bg-violet-600 hover:bg-violet-700 px-8 h-12 rounded-2xl font-bold text-lg shadow-lg shadow-violet-600/20"
        >
          Go to Book Demo Page
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <div className="relative">
          <Button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            variant="outline"
            size="lg"
            className="border-white/10 bg-white/5 hover:bg-white/10 px-8 h-12 rounded-2xl font-semibold text-lg flex items-center gap-2"
            aria-expanded={isDropdownOpen}
            aria-haspopup="listbox"
          >
            <Calendar className="h-5 w-5 text-violet-400" />
            Quick Book
            <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </Button>

          {isDropdownOpen && (
            <div
              className="absolute top-full right-0 mt-3 w-72 z-50 rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl shadow-black/50 overflow-hidden"
              role="listbox"
              aria-label="Booking options"
            >
              <div className="p-3">
                <button
                  onClick={() => handleDropdownSelect("calcom")}
                  className="w-full p-4 rounded-xl text-left hover:bg-white/5 transition-colors flex items-center gap-3"
                  role="option"
                  aria-selected={selectedOption === "calcom"}
                >
                  <div className="p-2 rounded-lg bg-violet-500/20">
                    <Calendar className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Book via Cal.com</p>
                    <p className="text-xs text-gray-400">Open-source scheduling</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>

                <button
                  onClick={() => handleDropdownSelect("calendly")}
                  className="w-full p-4 rounded-xl text-left hover:bg-white/5 transition-colors flex items-center gap-3"
                  role="option"
                  aria-selected={selectedOption === "calendly"}
                >
                  <div className="p-2 rounded-lg bg-blue-500/20">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white">Book via Calendly</p>
                    <p className="text-xs text-gray-400">Popular scheduling tool</p>
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
