"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { normalizeCalLink } from "@/lib/cal-link";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { formatAnalysisSummaryText } from "@/lib/report-formatter";
import { getAnalysis } from "@/lib/memory-storage";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Cal?: any;
  }
}

type Props = {
  name: string;
  email: string;
  companyName?: string;
  leadId?: string;
  analysisId?: string;
  skipAiAgent?: boolean;
  forcedMeetingType?: "cal" | "calendly";
};

export function BookingWidget({ name, email, companyName, leadId, analysisId, skipAiAgent, forcedMeetingType }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [analysisSummary, setAnalysisSummary] = useState<string>("");
  const [calLoaded, setCalLoaded] = useState(false);
  const [calError, setCalError] = useState<string | null>(null);
  
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  const calLink = normalizeCalLink(process.env.NEXT_PUBLIC_CAL_LINK);

  // Check if all required details are present for analysis summary
  const hasAllRequiredDetails = useMemo(() => {
    return name && email && (companyName || leadId);
  }, [name, email, companyName, leadId]);

  // Fetch analysis summary for pre-filling meeting notes
  useEffect(() => {
    if (!analysisId || !hasAllRequiredDetails) {
      setAnalysisSummary("");
      return;
    }

    async function fetchAndFormatAnalysis() {
      try {
        // Try to get from in-memory storage first
        const inMemoryAnalysis = getAnalysis(analysisId!);
        
        if (inMemoryAnalysis) {
          const summary = formatAnalysisSummaryText(inMemoryAnalysis);
          setAnalysisSummary(summary);
          return;
        }

        // Fallback to API if not in memory
        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();
        if (data.success) {
          const summary = formatAnalysisSummaryText(data);
          setAnalysisSummary(summary);
        }
      } catch (err) {
        console.error("Error fetching analysis for booking prefill:", err);
        setAnalysisSummary("");
      }
    }

    fetchAndFormatAnalysis();
  }, [analysisId, hasAllRequiredDetails]);

  // Use Calendly if the URL is provided and valid
  const useCalendly =
    forcedMeetingType === "calendly"
      ? true
      : forcedMeetingType === "cal"
        ? false
        : !!calendlyUrl && calendlyUrl.includes("calendly.com");
  const fallbackCalLink = calLink || "dealflow-ai/demoApp";

  const defaultGuests = useMemo(() => {
    const raw = process.env.NEXT_PUBLIC_DEFAULT_BOOKING_GUESTS;
    const parsed = raw
      ? raw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    if (parsed.length) return parsed;
    return [
      "praneethburada@gmail.com",
      "praneeth@growstack.ai",
      "teambproject864@gmail.com",
      "kunal@growstack.ai",
    ];
  }, []);

  const handleBookingSuccess = useCallback(async (meetingUrl: string, startTime: string) => {
    try {
      let resolvedLeadId = leadId;
      if (!resolvedLeadId) {
        const resLead = await fetch("/api/leads/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: (companyName || "").trim() || "Prospect",
            contactName: (name || "").trim() || "Guest",
            contactEmail: (email || "").trim(),
            contactPhone: "",
            source: "skip_intake_booking",
          }),
        });
        const leadJson = await resLead.json().catch(() => ({}));
        if (resLead.ok && leadJson?.leadId) {
          resolvedLeadId = String(leadJson.leadId);
        } else {
          throw new Error(leadJson?.error || "lead_create_failed");
        }
      }

      const res = await fetch("/api/calls/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: resolvedLeadId,
          analysisId: analysisId || "",
          meetingUrl,
          scheduledAt: startTime,
          guests: defaultGuests,
        }),
      });
      const data = await res.json();
      if (data.callId) {
        if (skipAiAgent) {
          router.push(`/`);
        } else {
          router.push(`/ai-agent-call?callId=${data.callId}`);
        }
      }
    } catch (err) {
      console.error("Error creating call record:", err);
      router.push(`/`);
    }
  }, [analysisId, companyName, email, leadId, name, router, skipAiAgent, defaultGuests]);

  useCalendlyEventListener({
    onEventScheduled: (e) => {
      console.log("Calendly Booking successful", e);
      const payload = (e as any)?.data?.payload;
      const event = payload?.event;
      const resource = payload?.resource;

      const meetingUrl =
        event?.location_url ||
        event?.location ||
        resource?.location_url ||
        resource?.location ||
        event?.uri ||
        "";

      const startTime =
        event?.start_time ||
        event?.startTime ||
        resource?.start_time ||
        resource?.startTime ||
        new Date().toISOString();

      handleBookingSuccess(meetingUrl, startTime);
    },
  });

  // Initialize Cal.com
  useEffect(() => {
    if (useCalendly) return;

    let timeoutId: NodeJS.Timeout;
    
    const initCal = () => {
      try {
        // @ts-ignore
        const cal = window.Cal;
        if (!cal) return;

        console.log("Initializing Cal.com with link:", fallbackCalLink);
        
        cal("init", "30min", { origin: "https://cal.com" });
        
        cal("ui", {
          theme: "dark",
          styles: { branding: { brandColor: "#8b5cf6" } },
          hideEventTypeDetails: false,
          layout: "month_view"
        });

        if (containerRef.current) {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          cal("inline", {
            elementOrSelector: containerRef.current || "#cal-inline-container",
            calLink: fallbackCalLink,
            namespace: "30min",
            config: {
              name,
              email,
              guests: defaultGuests,
              theme: "dark",
              notes: analysisSummary,
              timeZone: tz,
              timezone: tz,
            },
          });

          cal("on", {
            action: "bookingSuccessful",
            callback: (e: any) => {
              console.log("Cal.com Booking successful", e);
              handleBookingSuccess(e.data.booking.location || "", e.data.booking.startTime);
            },
          });

          setCalLoaded(true);
        }
      } catch (err) {
        console.error("Cal.com initialization error:", err);
        setCalError("Failed to load calendar. Please try again.");
      }
    };

    // Poll for window.Cal to be available, max 3 seconds
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      // @ts-ignore
      if (window.Cal) {
        clearInterval(checkInterval);
        clearTimeout(timeoutId);
        initCal();
      } else if (attempts >= 30) { // 30 attempts * 100ms = 3 seconds
        clearInterval(checkInterval);
        setCalError("Calendar failed to load. Please refresh or try again later.");
      }
    }, 100);

    // Timeout after 3 seconds
    timeoutId = setTimeout(() => {
      clearInterval(checkInterval);
      if (!calLoaded) {
        setCalError("Calendar is taking too long to load. Please refresh the page.");
      }
    }, 3000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeoutId);
    };
  }, [email, fallbackCalLink, handleBookingSuccess, name, useCalendly, defaultGuests, analysisSummary, calLoaded]);

  if (useCalendly) {
    return (
      <div 
        className="min-h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20"
        role="region"
        aria-label="Calendly booking calendar"
      >
        <InlineWidget 
          url={calendlyUrl!} 
          styles={{ height: '600px', width: '100%' }}
          prefill={{
            name: name,
            email: email,
            guests: defaultGuests,
            customAnswers: {
              a1: hasAllRequiredDetails ? analysisSummary : ""
            }
          }}
          pageSettings={{
            backgroundColor: '1a1a1a', 
            hideEventTypeDetails: false,
            hideLandingPageDetails: false,
            primaryColor: '8b5cf6',
            textColor: 'ffffff'
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Script
        id="cal-embed"
        src="https://app.cal.com/embed/embed.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Cal.com script loaded");
        }}
        onError={() => {
          console.error("Cal.com script failed to load");
          setCalError("Failed to load calendar script. Please try again later.");
        }}
      />
      <div
        ref={containerRef}
        id="cal-inline-container"
        className="min-h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 relative"
        role="region"
        aria-label="Cal.com booking calendar"
      >
        {!calLoaded && !calError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10">
            <div className="flex flex-col items-center gap-3">
              <div 
                className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">Loading calendar...</p>
            </div>
          </div>
        )}
        
        {calError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 p-6">
            <div className="max-w-md text-center">
              <div className="text-red-400 mb-3">
                <AlertCircle className="h-10 w-10 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Calendar Unavailable</h3>
              <p className="text-sm text-gray-300 mb-4">{calError}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="bg-violet-600 hover:bg-violet-700"
              >
                Refresh Page
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
