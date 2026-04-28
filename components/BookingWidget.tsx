"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { normalizeCalLink } from "@/lib/cal-link";
import { InlineWidget, useCalendlyEventListener } from "react-calendly";
import { formatAnalysisSummaryText } from "@/lib/report-formatter";

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
  
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL;
  const calLink = normalizeCalLink(process.env.NEXT_PUBLIC_CAL_LINK);

  // Fetch analysis summary for pre-filling meeting notes
  useEffect(() => {
    if (!analysisId) return;

    async function fetchAndFormatAnalysis() {
      try {
        const res = await fetch(`/api/analysis/${analysisId}`);
        const data = await res.json();
        if (data.success) {
          const summary = formatAnalysisSummaryText(data);
          setAnalysisSummary(summary);
        }
      } catch (err) {
        console.error("Error fetching analysis for booking prefill:", err);
      }
    }

    fetchAndFormatAnalysis();
  }, [analysisId]);

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

  useEffect(() => {
    // Standard Cal.com snippet to ensure window.Cal is defined
    (function (C: any, A: any, L: any) {
      if (C[L]) return;
      C[L] = function () {
        var cal = C[L];
        var ar = arguments;
        if (!cal.loaded) {
          cal.q = cal.q || [];
          cal.q.push(ar);
          cal.loaded = true;
        } else {
          cal.q.push(ar);
        }
      };
    })(window, "https://app.cal.com/embed/embed.js", "Cal");

    if (useCalendly) return;

    // @ts-ignore
    const cal = window.Cal;
    if (!cal) return;

    try {
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
      }
    } catch (err) {
      console.error("Cal.com initialization error:", err);
    }
  }, [email, fallbackCalLink, handleBookingSuccess, name, useCalendly, defaultGuests, analysisSummary]);

  if (useCalendly) {
    return (
      <div className="min-h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        <InlineWidget 
          url={calendlyUrl!} 
          styles={{ height: '600px', width: '100%' }}
          prefill={{
            name: name,
            email: email,
            guests: defaultGuests,
            customAnswers: {
              a1: analysisSummary // Automatically populates "Please share anything that will help prepare for our meeting"
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
      />
      <div
        ref={containerRef}
        id="cal-inline-container"
        className="min-h-[600px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    </>
  );
}
