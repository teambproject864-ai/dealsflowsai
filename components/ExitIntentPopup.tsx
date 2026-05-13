"use client";

import { useEffect, useState, useRef } from "react";
import { X, Calendar, Zap, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";

const POPUP_COOKIE_NAME = "df_exit_intent_shown";
const POPUP_DURATION_DAYS = 7;

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(name: string) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [schedulingVisible, setSchedulingVisible] = useState(false);
  const hasShownRef = useRef(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const cookie = getCookie(POPUP_COOKIE_NAME);
    if (cookie) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !hasShownRef.current) {
        hasShownRef.current = true;
        setIsVisible(true);
        trackEvent("exit_intent_shown", { source: "mouse_leave" });
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        handleClose();
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    setSchedulingVisible(false);
    setCookie(POPUP_COOKIE_NAME, "true", POPUP_DURATION_DAYS);
    trackEvent("exit_intent_closed");
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleScheduleClick = () => {
    setSchedulingVisible(true);
    trackEvent("exit_intent_schedule_clicked");
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleOutsideClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exit-intent-title"
    >
      <Card
        ref={popupRef}
        className="relative w-full max-w-3xl overflow-hidden bg-[#0F172A] border-2 border-violet-500/30 shadow-2xl shadow-violet-500/20 rounded-3xl"
      >
        <button
          ref={closeBtnRef}
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
          aria-label="Close popup"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {!schedulingVisible ? (
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-violet-300">LIMITED TIME OFFER</span>
              </div>
              <h2
                id="exit-intent-title"
                className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight"
              >
                Wait! Do not leave yet!
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Get a free sales strategy consultation and see how DealFlow AI can help you grow your revenue.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-10">
              {[
                { icon: TrendingUp, label: "2x Pipeline", desc: "Average increase" },
                { icon: Zap, label: "AI Powered", desc: "No more manual work" },
                { icon: Calendar, label: "30 min call", desc: "Free consultation" },
              ].map((feature, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                  <feature.icon className="w-8 h-8 text-violet-400 mb-3" />
                  <h3 className="font-bold text-white mb-1">{feature.label}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleScheduleClick}
                size="lg"
                className="h-14 px-10 text-lg font-bold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/30 rounded-2xl"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Free Consultation
              </Button>
              <Button
                onClick={handleClose}
                size="lg"
                variant="outline"
                className="h-14 px-10 text-lg border-white/20 hover:bg-white/5"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Book Your Free Consultation</h3>
              <p className="text-gray-400">Pick a time that works for you</p>
            </div>
            <div className="bg-white rounded-2xl overflow-hidden min-h-[500px]">
              <iframe
                src="https://cal.com/team/dealflow/30min"
                className="w-full h-[500px] border-0"
                title="Schedule Free Consultation"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
