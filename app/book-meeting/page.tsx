"use client";

import { useState, useEffect, Suspense } from "react";
import { Calendar, ArrowLeft, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

function BookMeetingContent() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("booking_platform_page_view");
  }, []);

  const handleSelect = (platform: string) => {
    setSelectedPlatform(platform);
    trackEvent("booking_platform_selected", { platform });
  };

  const handleCalComLoad = () => {
    setLoading(false);
  };

  const handleCalComError = () => {
    setLoading(false);
    setError("Cal.com failed to load. Please try again later.");
  };

  const handleCalendlyLoad = () => {
    setLoading(false);
  };

  const handleCalendlyError = () => {
    setLoading(false);
    setError("Calendly failed to load. Please try again later.");
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col">
      <div className="max-w-5xl mx-auto w-full px-4 py-12">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-3">
            Book a Meeting
          </h1>
          <p className="text-xl text-gray-400">
            Choose your preferred booking platform to schedule your call.
          </p>
        </div>

        {!selectedPlatform ? (
          <div className="grid md:grid-cols-2 gap-8">
            <button
              onClick={() => handleSelect("calcom")}
              className="w-full p-8 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-violet-500/20 group-hover:bg-violet-500/30 transition-colors">
                  <Calendar className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Cal.com</h3>
                  <p className="text-gray-400">Open-source scheduling platform</p>
                </div>
              </div>
              <p className="text-gray-300">
                Book a meeting using our Cal.com integration for a seamless experience.
              </p>
            </button>

            <button
              onClick={() => handleSelect("calendly")}
              className="w-full p-8 rounded-3xl border-2 border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all group text-left"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-4 rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Calendar className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Calendly</h3>
                  <p className="text-gray-400">Popular scheduling tool</p>
                </div>
              </div>
              <p className="text-gray-300">
                Use Calendly if you prefer their familiar interface and features.
              </p>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                className="border-white/10"
                onClick={() => setSelectedPlatform(null)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Change Platform
              </Button>
              <div className="text-right">
                <p className="text-sm text-gray-500">Selected Platform</p>
                <p className="font-bold text-white">
                  {selectedPlatform === "calcom" ? "Cal.com" : "Calendly"}
                </p>
              </div>
            </div>

            {error && (
              <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Failed to Load</h3>
                  <p className="text-red-400">{error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-3 border-red-500/30 text-red-300 hover:bg-red-500/10"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            {!error && (
              <Card className="overflow-hidden bg-white rounded-3xl min-h-[650px]">
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                      <div className="text-center">
                        <Loader2 className="h-10 w-10 animate-spin text-violet-500 mx-auto mb-4" />
                        <p className="text-gray-600">Loading booking widget...</p>
                      </div>
                    </div>
                  )}

                  {selectedPlatform === "calcom" ? (
                    <iframe
                      src="https://cal.com/team/dealflow/30min"
                      className="w-full min-h-[650px] border-0"
                      title="Book a Meeting via Cal.com"
                      allowFullScreen
                      onLoad={handleCalComLoad}
                      onError={handleCalComError}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  ) : (
                    <iframe
                      src="https://calendly.com/dealflow-ai/30min"
                      className="w-full min-h-[650px] border-0"
                      title="Book a Meeting via Calendly"
                      allowFullScreen
                      onLoad={handleCalendlyLoad}
                      onError={handleCalendlyError}
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookMeetingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
    </div>}>
      <BookMeetingContent />
    </Suspense>
  );
}
