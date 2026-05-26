"use client";

import { X, Calendar, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "next/navigation";

interface BookMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId?: string;
}

export function BookMeetingModal({ isOpen, onClose, leadId }: BookMeetingModalProps) {
  const router = useRouter();
  
  if (!isOpen) return null;

  const handleOption1 = () => {
    trackEvent("book_meeting_option_ai_agent", { leadId });
    onClose();
    router.push(`/meeting-agent/setup?leadId=${leadId || ""}`);
  };

  const handleOption2 = () => {
    trackEvent("book_meeting_option_schedule", { leadId });
    onClose();
    const url = leadId ? `/book-demo?leadId=${leadId}` : "/book-demo";
    router.push(url);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-meeting-title"
    >
      <Card className="relative w-full max-w-lg overflow-hidden bg-[#0F172A] border-2 border-violet-500/30 shadow-2xl shadow-violet-500/20 rounded-3xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close modal"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        <div className="p-8">
          <h2
            id="book-meeting-title"
            className="text-3xl font-bold text-white mb-6 text-center"
          >
            Choose Your Next Step
          </h2>

          <div className="space-y-4">
            <button
              onClick={handleOption1}
              className="w-full p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                  <Bot className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Meeting with AI Agent
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Initiate an immediate AI agent consultation
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={handleOption2}
              className="w-full p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                  <Calendar className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Schedule a Call
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Book a time slot via Calendly or Cal.com
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
