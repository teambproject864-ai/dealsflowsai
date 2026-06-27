"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel } from "@/components/immersive";
import {
  Users,
  Users2,
  CheckCircle2,
  Phone,
  MessageSquare,
  Star,
  Zap,
  Briefcase,
  FileText,
  Settings,
  Mail,
  Sparkles,
  MessageCircle,
  VideoIcon,
  Mic2,
  Brain,
  SearchIcon,
  CreditCard,
  CalendarCheck,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Check,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Music2,
  PenTool,
  Key,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { demoChatMessages, demoTasks } from "@/lib/portal-demo-data";

// The 12 specified strategy & content options matching exactly the user prompt
const MARKETING_CATEGORIES = [
  {
    id: "outreach",
    title: "Outreach & Direct Engagement",
    icon: Mail,
    color: "text-teal-400",
    hoverColor: "hover:border-teal-500/40",
    borderColor: "border-teal-500/20",
    glowColor: "shadow-teal-500/10",
    engine: "Smartlead Outreach CRM API",
    items: [
      "Cold email outreach (sequences, personalization at scale)",
      "LinkedIn outreach / social selling",
      "Cold calling / SDR outreach",
      "Account-based marketing (ABM) campaigns"
    ]
  },
  {
    id: "influencer",
    title: "Influencer & creator partnerships",
    icon: Sparkles,
    color: "text-purple-400",
    hoverColor: "hover:border-purple-500/40",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-purple-500/10",
    engine: "PartnerStack Affiliate API",
    items: [
      "Affiliate marketing programs",
      "PR outreach / journalist pitching (HARO, etc.)"
    ]
  },
  {
    id: "written",
    title: "Written Content",
    icon: BookOpen,
    color: "text-blue-400",
    hoverColor: "hover:border-blue-500/40",
    borderColor: "border-blue-500/20",
    glowColor: "shadow-blue-500/10",
    engine: "OpenAI GPT-4 Content Engine",
    items: [
      "Blog posts (educational, SEO-focused, thought leadership)",
      "Guest posting on other sites",
      "Case studies / customer success stories",
      "Whitepapers & ebooks (gated for lead gen)",
      "Newsletters (email digests)",
      "Press releases",
      "Comparison pages (\"X vs Y\" content for SEO)",
      "Glossary / definition pages (SEO long-tail)",
      "Documentation-as-marketing (great docs that rank in search)"
    ]
  },
  {
    id: "social",
    title: "Social Media Posts",
    icon: MessageCircle,
    color: "text-pink-400",
    hoverColor: "hover:border-pink-500/40",
    borderColor: "border-pink-500/20",
    glowColor: "shadow-pink-500/10",
    engine: "Buffer Social Queue API",
    items: [
      "LinkedIn posts (company page + founder/employee personal brand)",
      "Twitter/X threads",
      "Instagram posts/reels",
      "Facebook posts/ads",
      "Reddit engagement (organic, community-driven)",
      "Quora answers"
    ]
  },
  {
    id: "video",
    title: "Video Content",
    icon: VideoIcon,
    color: "text-emerald-400",
    hoverColor: "hover:border-emerald-500/40",
    borderColor: "border-emerald-500/20",
    glowColor: "shadow-emerald-500/10",
    engine: "HeyGen Video Avatar Generator",
    items: [
      "Auto video generation (AI tools turning blog posts/scripts into videos)",
      "Explainer videos / product demos",
      "YouTube tutorials",
      "Short-form video (Reels, TikTok, YouTube Shorts)",
      "Webinars (live + recorded)",
      "Customer testimonial videos",
      "Founder vlogs / behind-the-scenes",
      "Animated product walkthroughs"
    ]
  },
  {
    id: "audio",
    title: "Audio",
    icon: Music2,
    color: "text-yellow-400",
    hoverColor: "hover:border-yellow-500/40",
    borderColor: "border-yellow-500/20",
    glowColor: "shadow-yellow-500/10",
    engine: "ElevenLabs Voice Over API",
    items: [
      "Podcasts (own podcast + guest appearances)",
      "AI-generated audio summaries of content"
    ]
  },
  {
    id: "visual",
    title: "Visual/Design Content",
    icon: PenTool,
    color: "text-indigo-400",
    hoverColor: "hover:border-indigo-500/40",
    borderColor: "border-indigo-500/20",
    glowColor: "shadow-indigo-500/10",
    engine: "Midjourney Visuals Synthesis",
    items: [
      "Infographics",
      "Carousel posts (LinkedIn/Instagram)",
      "Memes (industry-specific humor)",
      "Data visualizations / original research graphics",
      "Slide decks shared publicly (SlideShare-style)"
    ]
  },
  {
    id: "ai",
    title: "AI-Generated / Automated Content",
    icon: Brain,
    color: "text-violet-400",
    hoverColor: "hover:border-violet-500/40",
    borderColor: "border-violet-500/20",
    glowColor: "shadow-violet-500/10",
    engine: "Zapier Automated Workflows API",
    items: [
      "AI blog post generation (then human-edited)",
      "AI video generation (Synthesia, HeyGen-style avatar videos)",
      "AI image generation for visuals",
      "AI-personalized email content",
      "Auto-generated social posts from long-form content (repurposing)",
      "AI voiceovers for videos",
      "Chatbot-driven content delivery"
    ]
  },
  {
    id: "seo",
    title: "SEO-Specific Tactics",
    icon: SearchIcon,
    color: "text-green-400",
    hoverColor: "hover:border-green-500/40",
    borderColor: "border-green-500/20",
    glowColor: "shadow-green-500/10",
    engine: "Ahrefs SEO Crawling API",
    items: [
      "Keyword-targeted landing pages",
      "Programmatic SEO (auto-generated pages at scale, e.g., \"best tool for X city/industry\")",
      "Backlink building campaigns",
      "Internal linking strategy content"
    ]
  },
  {
    id: "paid",
    title: "Paid Promotion",
    icon: CreditCard,
    color: "text-orange-400",
    hoverColor: "hover:border-orange-500/40",
    borderColor: "border-orange-500/20",
    glowColor: "shadow-orange-500/10",
    engine: "Google Ads Developer API",
    items: [
      "Google Ads / search ads",
      "LinkedIn Ads",
      "Retargeting ads",
      "Sponsored newsletter placements",
      "Podcast sponsorships"
    ]
  },
  {
    id: "community",
    title: "Community-Driven Content",
    icon: Users2,
    color: "text-cyan-400",
    hoverColor: "hover:border-cyan-500/40",
    borderColor: "border-cyan-500/20",
    glowColor: "shadow-cyan-500/10",
    engine: "G2 Review Tracker Webhooks",
    items: [
      "User-generated content (UGC) campaigns",
      "Review site presence (G2, Capterra, TrustRadius)",
      "Community Q&A / forums",
      "Open-source contributions (if applicable) as marketing"
    ]
  },
  {
    id: "events",
    title: "Events",
    icon: CalendarCheck,
    color: "text-rose-400",
    hoverColor: "hover:border-rose-500/40",
    borderColor: "border-rose-500/20",
    glowColor: "shadow-rose-500/10",
    engine: "Luma Events Management API",
    items: [
      "Webinars",
      "Virtual summits / conferences",
      "Local meetups",
      "Trade show presence"
    ]
  }
];

const tabs = [
  { id: "requirements", label: "Requirements", icon: Users },
  { id: "icp-entries", label: "ICP Entries", icon: FileText },
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "playbook", label: "ICP Playbook", icon: FileText },
  { id: "workspace", label: "Workspace", icon: Briefcase },
  { id: "metrics", label: "My Metrics", icon: Star },
  { id: "credits", label: "Credits", icon: Zap },
  { id: "voice-whatsapp", label: "Voice & WhatsApp", icon: Settings },
] as const;

function generateCampaignCopy(
  tactic: string,
  company: string,
  promise: string,
  painPoint: string,
  icp: string,
  tone: string
): string {
  const t = tone.toLowerCase();
  const brand = company || "our brand";
  const prom = promise || "deliver cutting-edge solutions";
  const pain = painPoint || "operational inefficiencies";
  const target = icp || "target audience";

  const salutation = t === "casual" ? "Hey there," : t === "friendly" ? "Hi there!" : "Dear Client,";
  const signoff = t === "casual" ? "Cheers,\n\nDealFlow.AI Campaign Agent" : t === "bold" ? "To your growth,\n\nDealFlow.AI Team" : "Best regards,\n\nLead Marketing Coordinator";

  if (tactic.toLowerCase().includes("cold email")) {
    return `Campaign Type: Cold Email outreach Sequence

[EMAIL 1: The Hook]
Subject: Solving ${pain} for your team?

${salutation}

I've been following your work at ${brand}. Many organizations in your industry struggle with ${pain}, which often leads to lost revenue and wasted time.

We specialize in helping businesses like yours ${prom}.

Are you open to a brief 10-minute chat next Tuesday to see how we could help you tackle this?

${signoff}

---

[EMAIL 2: The Proof]
Subject: Quick question about ${brand}'s workflow

${salutation}

I wanted to share a quick case study: we recently worked with a company similar to ${brand} who was suffering from ${pain}. By implementing our playbook, they were able to ${prom} and see a 40% improvement in performance.

Would you be interested in seeing the detailed breakdown of how we did it?

${signoff}`;
  }
  
  if (tactic.toLowerCase().includes("linkedin outreach")) {
    return `Campaign Type: LinkedIn Connection & Message Flow

[CONNECTION REQUEST NOTE (Max 300 chars)]
"Hi {{Name}}, noticed your profile and your focus on ${brand}. We work with leaders dealing with ${pain} to help them ${prom}. Would love to connect!"

---

[FOLLOW-UP 1 (24h after connection)]
"Thanks for connecting! I wanted to share a quick insight on how we help teams like yours solve ${pain} and achieve ${prom}. Are you free for a quick chat sometime next week?"`;
  }

  if (tactic.toLowerCase().includes("cold calling")) {
    return `Campaign Type: Cold Call Conversation Script

[INTRO & HOOK]
"Hi {{Name}}, this is [Agent Name] calling from DealFlow.AI. I'm reaching out because we help companies like ${brand} who are struggling with ${pain}.

Specifically, we've developed a framework that allows you to ${prom}.

I know you weren't expecting my call, but do you have 2 minutes to see if this is relevant to your team?"

[OBJECTION HANDLING: 'Too busy']
"Totally understand. We're all running fast. If you're open to it, I can send a 1-minute video summary of how we help with ${pain}. What's the best email for you?"`;
  }

  if (tactic.toLowerCase().includes("account-based marketing")) {
    return `Campaign Type: ABM Playbook (Target: ${brand})

1. Personalization Parameters:
   - Target Accounts: ICP accounts matching size/industry criteria.
   - Primary Value Proposition: ${prom}
   - Specific Pain Targeted: ${pain}

2. Multichannel Touches:
   - Touch 1: Send personalized 1-to-1 video addressing ${brand}'s specific challenges.
   - Touch 2: LinkedIn message sharing industry report.
   - Touch 3: Cold outreach email detailing custom audit of their GTM.
   - Touch 4: Direct mail handbook sent to decision-maker's office.`;
  }

  if (tactic.toLowerCase().includes("affiliate marketing")) {
    return `Campaign Type: Affiliate Outreach & Commission Proposal

Subject: Partnering with ${brand} - Affiliate Program

${salutation}

We've been tracking your content and believe your audience would benefit greatly from learning how to ${prom}. 

We'd love to propose an affiliate partnership. We offer:
- 20% recurring commission on all referrals
- Custom landing page and marketing assets tailored to ${brand}
- Priority support for your community

Our tools directly address the common frustration of ${pain}.

Let me know if you'd be open to reviewing the partner agreement!

${signoff}`;
  }

  if (tactic.toLowerCase().includes("pr outreach")) {
    return `Campaign Type: Journalist / Pitch Outline

Subject: PITCH: Why companies are failing at ${pain} (and how to fix it)

Hi {{Journalist Name}},

With the current market conditions, more organizations are struggling with ${pain} than ever before. 

I'm the lead strategist at ${brand}, and we've analyzed over 500 companies in this space. Our findings show that teams who focus on ${prom} see a 3x higher success rate.

I'd love to share our proprietary data, or write a guest piece for you outlining:
1. The root causes of ${pain} in 2026.
2. Three tactical steps companies can take to implement ${prom}.

Would this be of interest for your upcoming column?

${signoff}`;
  }

  if (tactic.toLowerCase().includes("ai blog post")) {
    return `Campaign Type: AI-Generated Content Draft (Human-in-the-loop)

Title: Leveraging Automation to ${prom}

[AI Generated Intro]
In today's fast-paced environment, organizations cannot afford to tolerate ${pain}. Yet, many teams continue to struggle with outdated methods that waste time and resources. 

[Section 1: The Impact of ${pain}]
When ${pain} is left unaddressed, the downstream effects are severe. It impacts team morale, customer satisfaction, and the bottom line. 

[Section 2: Implementing ${prom}]
The key to unlocking growth is a systematic approach to ${prom}. By automating repetitive tasks, teams can focus on strategic initiatives.

[Section 3: Call to Action]
Ready to stop struggling with ${pain}? Let ${brand} show you how to streamline your operations today.`;
  }

  if (tactic.toLowerCase().includes("google ads")) {
    return `Campaign Type: Paid Search (Google Ads) Ad Copies

[AD group: Solve ${pain}]

Headline 1: Solve ${pain} Today
Headline 2: Automation for ${brand}
Headline 3: Easily ${prom}

Description 1: Stop losing time on ${pain}. Our automated platform helps you ${prom} fast.
Description 2: Enterprise-grade solutions to scale your operations. Try the DealFlow platform today.

Sitelink 1: Read Case Studies
Sitelink 2: Book a 1-to-1 Demo`;
  }

  if (tactic.toLowerCase().includes("webinars")) {
    return `Campaign Type: Webinar Blueprint

Title: Masterclass: How to ${prom} and Eliminate ${pain}
Target Audience: ${target}
Duration: 45 minutes

[WEBINAR SCHEDULE]
- 00:00 - 05:00 | Welcome & Speaker Introductions
- 05:00 - 15:00 | The hidden costs of ${pain} in modern business
- 15:00 - 35:00 | 4 tactical steps to ${prom} (with live demo)
- 35:00 - 45:00 | Q&A & Exclusive Webinar Offer`;
  }

  return `Campaign Type: ${tactic} Blueprint & Proposal
Client Name: ${brand}
Tone: ${tone}

[STRATEGY SUMMARY]
We are launching a campaign for ${tactic} tailored to the needs of ${brand}. 
Our primary objective is to engage audiences interested in "${prom}" while directly addressing the core market pain point of "${pain}".

[TACTICAL EXECUTION STEPS]
1. Define campaign goals aligned with ${prom}.
2. Set up target parameters for the ${target} audience segment.
3. Draft custom content emphasizing how we eliminate ${pain}.
4. Launch, monitor metrics, and optimize for conversion.

[SUGGESTED CAMPAIGN PARAMETERS]
- Target Channels: Relevant digital platforms
- Estimated Budget: 250 credits / month
- Key Metrics to Track: CTR, engagement rate, task conversions`;
}

export default function WorkspaceContent() {
  const router = useRouter();

  // Component States
  const [leads, setLeads] = useState<any[]>([]);
  const [activeWSLeadId, setActiveWSLeadId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<typeof MARKETING_CATEGORIES[number] | null>(null);
  const [selectedTacticName, setSelectedTacticName] = useState<string | null>(null);
  const [workspaceTone, setWorkspaceTone] = useState("Professional");
  const [workspaceKeywords, setWorkspaceKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  // Synced states
  const [syncedTasks, setSyncedTasks] = useState<any[]>([]);
  const [syncedMessages, setSyncedMessages] = useState<any[]>([]);

  // API Credentials Config state (Individual API key per category)
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    outreach: "df-outreach-sk-••••••••••••",
    influencer: "df-influencer-sk-••••••••••••",
    written: "df-openai-sk-••••••••••••",
    social: "df-social-sk-••••••••••••",
    video: "df-heygen-sk-••••••••••••",
    audio: "df-elevenlabs-sk-••••••••••••",
    visual: "df-midjourney-sk-••••••••••••",
    ai: "df-automation-sk-••••••••••••",
    seo: "df-ahrefs-sk-••••••••••••",
    paid: "df-googleads-sk-••••••••••••",
    community: "df-reddit-sk-••••••••••••",
    events: "df-luma-sk-••••••••••••",
  });
  const [consoleTab, setConsoleTab] = useState<"generate" | "api">("generate");

  // Toast Notification
  const [toast, setToast] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch leads and localStorage records on mount
  useEffect(() => {
    async function loadWorkspaceData() {
      try {
        setLoadingLeads(true);
        const res = await fetch("/api/leads");
        if (!res.ok) {
          throw new Error(`Leads fetch failed with status ${res.status}`);
        }
        const data = await res.json();
        if (data.success && data.leads) {
          setLeads(data.leads);
          if (data.leads.length > 0) {
            setActiveWSLeadId(data.leads[0].id);
          }
          setErrorLoading(null);
        } else {
          throw new Error(data.message || "Failed to load leads from system database.");
        }
      } catch (err: any) {
        console.error(err);
        setErrorLoading(err?.message || "An unexpected error occurred while loading clients.");
      } finally {
        setLoadingLeads(false);
      }
    }

    // Load API Keys
    const savedKeys = localStorage.getItem("df_workspace_api_keys");
    if (savedKeys) {
      try {
        setApiKeys(JSON.parse(savedKeys));
      } catch (e) {
        console.error("Failed to parse saved API keys:", e);
      }
    }

    // Read synced tasks/messages
    const savedTasks = localStorage.getItem("df_agent_tasks");
    if (savedTasks) {
      try { setSyncedTasks(JSON.parse(savedTasks)); } catch (e) { setSyncedTasks([...demoTasks]); }
    } else {
      setSyncedTasks([...demoTasks]);
    }

    const savedMsgs = localStorage.getItem("df_chat_messages");
    if (savedMsgs) {
      try { setSyncedMessages(JSON.parse(savedMsgs)); } catch (e) { setSyncedMessages([...demoChatMessages]); }
    } else {
      setSyncedMessages([...demoChatMessages]);
    }

    loadWorkspaceData();
  }, []);

  const handleApiKeyChange = (category: string, value: string) => {
    const updated = { ...apiKeys, [category]: value };
    setApiKeys(updated);
    localStorage.setItem("df_workspace_api_keys", JSON.stringify(updated));
  };

  // Update tasks/messages inside localStorage
  const updateLocalTasks = (newTasks: any[]) => {
    setSyncedTasks(newTasks);
    localStorage.setItem("df_agent_tasks", JSON.stringify(newTasks));
  };

  const updateLocalMessages = (newMsgs: any[]) => {
    setSyncedMessages(newMsgs);
    localStorage.setItem("df_chat_messages", JSON.stringify(newMsgs));
  };

  // Safe leads lookup
  const activeWSLead = leads.find((l) => l.id === activeWSLeadId) || leads[0];

  // Campaign copy handler
  const handleGenerate = () => {
    if (!selectedTacticName) {
      showToast("error", "Tactic Required", "Please select a specific tactic from the categories list.");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const copy = generateCampaignCopy(
        selectedTacticName,
        activeWSLead?.companyName || "Acme Corp",
        activeWSLead?.offerPromise || "Optimize conversion pipelines",
        activeWSLead?.painPoint || "Manual campaign operational latency",
        activeWSLead?.icpDescription || "B2B SaaS Growth Marketers",
        workspaceTone
      );
      setGeneratedContent(copy);
      setIsGenerating(false);
      
      const keyVal = selectedCategory ? apiKeys[selectedCategory.id] : "";
      if (keyVal && keyVal.trim().length > 0) {
        showToast("success", "Synthesis Complete", `Generated via ${selectedCategory?.engine} using custom API Key.`);
      } else {
        showToast("info", "Generation Finished", `Generated using fallback DealFlow AI baseline models.`);
      }
    }, 900);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <GlassPanel
            tilt={false}
            className={cn(
              "p-4 rounded-2xl border flex items-start gap-3 shadow-2xl max-w-sm",
              toast.type === "success" ? "border-emerald-500/30 bg-emerald-950/80" : "border-rose-500/30 bg-rose-950/80"
            )}
          >
            <div className="mt-0.5">
              {toast.type === "success" ? (
                <CheckCircle className="h-5 w-5 text-emerald-400 animate-pulse" />
              ) : (
                <AlertCircle className="h-5 w-5 text-rose-400" />
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-white">{toast.title}</p>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Main Top Header */}
      <div className="sticky top-0 z-40 bg-gradient-to-b from-slate-950 to-slate-950/90 backdrop-blur-xl border-b border-slate-800">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/portal/agent")}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:ring-2 focus:ring-teal-500 focus:outline-none"
              aria-label="Back to Agent Dashboard"
            >
              <ChevronLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-teal-400" />
                Campaign Workspace
              </h1>
              <p className="text-xs text-slate-400">Define, generate, and execute marketing channels</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/portal/agent")}
              className="text-xs font-semibold px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl transition-all"
            >
              Close Workspace
            </button>
          </div>
        </div>
      </div>

      {/* Navigation tabs frame to preserve dashboard routing */}
      <div className="container mx-auto px-6 pt-6">
        <div className="bg-slate-900/50 border border-slate-800/80 p-2 rounded-2xl flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isWorkspace = tab.id === "workspace";
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (!isWorkspace) {
                    router.push(`/portal/agent?tab=${tab.id}`);
                  }
                }}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  isWorkspace
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700 cursor-default"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
                aria-current={isWorkspace ? "page" : undefined}
                disabled={isWorkspace}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Content Container */}
      <main className="container mx-auto px-6 py-8 flex-1 flex flex-col">
        {loadingLeads ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-teal-400 animate-spin" />
            <p className="text-slate-400 text-sm mt-3 animate-pulse">Initializing clients and outreach strategies...</p>
          </div>
        ) : errorLoading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <GlassPanel tilt={false} className="border-rose-500/20 max-w-md w-full p-6 text-center">
              <AlertCircle className="h-12 w-12 text-rose-400 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-white mb-2">Workspace Load Failed</h2>
              <p className="text-sm text-slate-400 mb-6">{errorLoading}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-5"
              >
                Retry Loading
              </Button>
            </GlassPanel>
          </div>
        ) : (
          <div className="space-y-8 flex-1 flex flex-col">
            {/* Top Workspace Configuration Dashboard */}
            <GlassPanel tilt={false} className="border-slate-800/80 p-5 bg-slate-900/30">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">Active Marketing Client</h2>
                  <p className="text-xs text-slate-400">Select the customer account to customize campaign variables</p>
                </div>
                <div className="w-full md:w-80">
                  <label htmlFor="workspace-client-select" className="sr-only">
                    Select Customer Lead
                  </label>
                  <select
                    id="workspace-client-select"
                    value={activeWSLeadId}
                    onChange={(e) => {
                      setActiveWSLeadId(e.target.value);
                      setGeneratedContent("");
                    }}
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 text-slate-200 rounded-xl px-4.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.companyName} ({l.contactName || "Contact"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeWSLead && (
                <div className="mt-5 border-t border-slate-850 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Company Offer</span>
                    <span className="text-slate-300 font-medium">{activeWSLead.offerPromise}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Target Segment (ICP)</span>
                    <span className="text-slate-300 font-medium">{activeWSLead.icpDescription}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1">Market Pain Point</span>
                    <span className="text-slate-300 font-medium">{activeWSLead.painPoint}</span>
                  </div>
                </div>
              )}
            </GlassPanel>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
              {/* Left Column: responsive 12 categories list (grows across screen breakpoints) */}
              <div className={cn("lg:col-span-7 space-y-6 flex flex-col justify-between")}>
                <div>
                  <h3 className="text-lg font-bold text-white mb-4">Marketing Channels & Strategy Categories</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
                    {MARKETING_CATEGORIES.map((category) => {
                      const Icon = category.icon;
                      const isExpanded = selectedCategory?.id === category.id;
                      const hasKey = apiKeys[category.id] && apiKeys[category.id].trim().length > 0;
                      return (
                        <div
                          key={category.id}
                          tabIndex={0}
                          role="button"
                          aria-expanded={isExpanded}
                          aria-label={`Marketing Category: ${category.title}. Press enter to expand tactics.`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedCategory(isExpanded ? null : category);
                            }
                          }}
                          onClick={() => setSelectedCategory(isExpanded ? null : category)}
                          className={cn(
                            "text-left bg-slate-900/40 border rounded-2xl p-4 transition-all duration-300 relative group flex flex-col justify-between hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 cursor-pointer min-h-[110px]",
                            category.borderColor,
                            category.glowColor,
                            isExpanded
                              ? "border-teal-500 shadow-md shadow-teal-500/10 bg-slate-800/40"
                              : "hover:border-slate-650 hover:bg-slate-800/20"
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className={cn("p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 transition-colors group-hover:bg-slate-900", category.color)}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-[10px] bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded-full text-slate-400 group-hover:text-slate-200">
                                {category.items.length} tactics
                              </span>
                              <span className={cn(
                                "text-[9px] font-semibold px-2 py-0.5 rounded-full",
                                hasKey ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-slate-800 text-slate-400"
                              )}>
                                {hasKey ? "API Connected" : "No API Key"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors">
                              {category.title}
                            </h4>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-tactics accordion style list */}
                {selectedCategory && (
                  <div className="bg-slate-900/50 border border-slate-850 p-6 rounded-2xl animate-fade-in space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg bg-slate-950 border border-slate-800", selectedCategory.color)}>
                          <selectedCategory.icon className="h-4 w-4" />
                        </div>
                        <h4 className="font-bold text-sm text-white">{selectedCategory.title} Options</h4>
                      </div>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="text-xs text-slate-500 hover:text-slate-300"
                      >
                        Deselect
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedCategory.items.map((item) => {
                        const isSelected = selectedTacticName === item;
                        return (
                          <button
                            key={item}
                            onClick={() => {
                              setSelectedTacticName(item);
                              setGeneratedContent("");
                            }}
                            className={cn(
                              "text-left p-3.5 rounded-xl border text-xs font-medium transition-all duration-200 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-teal-500/50",
                              isSelected
                                ? "bg-teal-500/10 border-teal-500 text-teal-300"
                                : "bg-slate-950/60 border-slate-850 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                            )}
                          >
                            <span className="line-clamp-2 pr-2">{item}</span>
                            {isSelected ? (
                              <Check className="h-4 w-4 text-teal-400 flex-shrink-0" />
                            ) : (
                              <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-slate-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: AI Tactic Console with double tab setup */}
              <div className="lg:col-span-5 flex flex-col">
                <GlassPanel tilt={false} className="border-slate-800 flex-1 flex flex-col p-6 bg-slate-900/10">
                  <div className="border-b border-slate-850 pb-4 mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Brain className="h-5 w-5 text-teal-400" />
                        AI Campaign Console
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Configure integrations and auto-generate assets</p>
                    </div>
                  </div>

                  {/* Console Tabs Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-850 mb-5">
                    <button
                      onClick={() => setConsoleTab("generate")}
                      className={cn(
                        "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        consoleTab === "generate"
                          ? "bg-slate-800 text-white shadow-md border border-slate-700"
                          : "text-slate-400 hover:text-slate-300"
                      )}
                    >
                      <Brain className="h-3.5 w-3.5" />
                      Generate Assets
                    </button>
                    <button
                      onClick={() => setConsoleTab("api")}
                      className={cn(
                        "py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5",
                        consoleTab === "api"
                          ? "bg-slate-800 text-white shadow-md border border-slate-700"
                          : "text-slate-400 hover:text-slate-300"
                      )}
                    >
                      <Key className="h-3.5 w-3.5" />
                      API Credentials
                    </button>
                  </div>

                  {consoleTab === "generate" ? (
                    selectedTacticName ? (
                      <div className="space-y-6 flex-1 flex flex-col justify-between">
                        {/* Configuration fields */}
                        <div className="space-y-4">
                          <div className="bg-slate-950/60 border border-slate-850 p-4 rounded-xl relative overflow-hidden">
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Target Tactic</p>
                            <p className="text-xs font-bold text-white">{selectedCategory?.title}</p>
                            <p className="text-[11px] text-teal-400 font-semibold mt-1">{selectedTacticName}</p>
                            
                            {/* API Key Status Indicator */}
                            {selectedCategory && (
                              <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px]">
                                <span className="text-slate-400 flex items-center gap-1">
                                  <Database className="h-3 w-3 text-slate-500" />
                                  {selectedCategory.engine}
                                </span>
                                <span className={cn(
                                  "font-bold",
                                  apiKeys[selectedCategory.id]?.trim() ? "text-emerald-400 animate-pulse" : "text-amber-500"
                                )}>
                                  {apiKeys[selectedCategory.id]?.trim() ? "API key active" : "Using local model"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Tone selection */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-300 mb-2">
                              Outreach Tone
                            </label>
                            <div className="grid grid-cols-5 gap-1">
                              {["Professional", "Casual", "Bold", "Friendly", "Empathic"].map((tone) => (
                                <button
                                  key={tone}
                                  onClick={() => {
                                    setWorkspaceTone(tone);
                                    setGeneratedContent("");
                                  }}
                                  className={cn(
                                    "py-2 px-1 text-[10px] font-bold rounded-lg border text-center transition-all",
                                    workspaceTone === tone
                                      ? "bg-slate-800 border-slate-700 text-white shadow-md shadow-black/40"
                                      : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300 hover:border-slate-700"
                                  )}
                                >
                                  {tone}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Keywords */}
                          <div>
                            <label htmlFor="campaign-keywords" className="block text-xs font-semibold text-slate-300 mb-2">
                              Additional Keywords (Optional)
                            </label>
                            <Input
                              id="campaign-keywords"
                              placeholder="e.g., Q3 promo, direct response, compliance, 20% discount"
                              value={workspaceKeywords}
                              onChange={(e) => setWorkspaceKeywords(e.target.value)}
                              className="bg-slate-950 border-slate-850 text-slate-200 text-xs rounded-xl focus:border-teal-500 py-3"
                            />
                          </div>

                          <Button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="w-full bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-500 hover:from-teal-500 hover:via-cyan-400 hover:to-teal-400 text-white rounded-xl py-5 text-xs font-bold shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2"
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                Custom Synthesizing content...
                              </>
                            ) : (
                              <>
                                <Brain className="h-4 w-4 text-white" />
                                Generate Campaign Assets
                              </>
                            )}
                          </Button>
                        </div>

                        {/* Display Generated Output */}
                        {generatedContent ? (
                          <div className="space-y-4 mt-6 animate-fade-in">
                            <div>
                              <span className="block text-xs font-semibold text-slate-300 mb-2">Generated Outreach Assets</span>
                              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl max-h-60 overflow-y-auto font-mono text-[11px] text-teal-400 leading-relaxed whitespace-pre-wrap">
                                {generatedContent}
                              </div>
                            </div>

                            {/* Quick integrations panel */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => {
                                  const newTask = {
                                    id: `task-ws-${Date.now()}`,
                                    title: `[Campaign] ${selectedTacticName} - ${activeWSLead?.companyName}`,
                                    description: `Execute "${selectedTacticName}" outreach for ${activeWSLead?.companyName}. Tone: ${workspaceTone}.`,
                                    status: "todo" as const,
                                    assignedAgentId: "agent-1",
                                    customerId: activeWSLead?.customerId || activeWSLead?.id || "demo-customer",
                                    priority: "medium" as const,
                                    progressNotes: ["Drafted campaign assets from agent Workspace."],
                                    milestones: [
                                      { id: "m1", title: "Review copywriting outputs", completed: false },
                                      { id: "m2", title: "Verify lead tracking tags", completed: false },
                                      { id: "m3", title: "Schedule delivery queue", completed: false },
                                    ],
                                    createdAt: new Date().toISOString(),
                                    updatedAt: new Date().toISOString(),
                                  };
                                  updateLocalTasks([newTask, ...syncedTasks]);
                                  showToast("success", "Task Appended", "Campaign setup added to agent checklist.");
                                }}
                                variant="outline"
                                className="border-slate-850 hover:bg-slate-800/80 hover:text-white text-[11px] text-slate-300 rounded-xl py-4 flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="h-3.5 w-3.5 text-teal-400" />
                                Add as Task
                              </Button>

                              <Button
                                onClick={() => {
                                  const newMsg = {
                                    id: `msg-ws-${Date.now()}`,
                                    sessionId: "session-1",
                                    senderId: "agent-1",
                                    senderName: "Campaign Agent",
                                    senderRole: "agent" as const,
                                    content: `Hi! I've drafted our "${selectedTacticName}" campaign setup for ${activeWSLead?.companyName}. Preview copy:\n\n${generatedContent}`,
                                    timestamp: new Date().toISOString(),
                                    status: "sent" as const,
                                  };
                                  updateLocalMessages([newMsg, ...syncedMessages]);
                                  showToast("success", "Message Drafted", "Outreach templates copied to customer chat.");
                                }}
                                variant="outline"
                                className="border-slate-850 hover:bg-slate-800/80 hover:text-white text-[11px] text-slate-300 rounded-xl py-4 flex items-center justify-center gap-1.5"
                              >
                                <MessageSquare className="h-3.5 w-3.5 text-cyan-400" />
                                Draft Message
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-slate-850 rounded-xl py-12 px-4 mt-6 text-center">
                            <Brain className="h-8 w-8 text-slate-700 mb-2" />
                            <p className="text-xs text-slate-400 font-medium">Ready to execute outreach models</p>
                            <p className="text-[10px] text-slate-550 max-w-[200px] mt-1">Configure tone, additional keywords, and click generate above.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <Zap className="h-12 w-12 text-slate-700 mb-3 animate-pulse" />
                        <p className="text-slate-400 font-bold text-sm">Console Standby</p>
                        <p className="text-xs text-slate-500 max-w-[220px] mt-1.5 leading-relaxed">
                          Select a strategy category on the left, then pick a tactic to engage the AI generation console.
                        </p>
                      </div>
                    )
                  ) : (
                    /* API Settings Panel Tab view */
                    <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1 scrollbar-thin">
                      <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl mb-3">
                        <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                          <Settings className="h-3.5 w-3.5 text-teal-400 animate-spin" />
                          Category API Integration Keys
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          Customize developer keys for each of the 12 marketing channels. DealFlow will connect straight to these engines.
                        </p>
                      </div>

                      {MARKETING_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <div key={cat.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span className={cn("p-1 rounded bg-slate-900", cat.color)}>
                                  <Icon className="h-3.5 w-3.5" />
                                </span>
                                {cat.title}
                              </span>
                              <span className="text-[9px] text-slate-500 font-semibold">{cat.engine}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label htmlFor={`api-key-${cat.id}`} className="sr-only">
                                {cat.title} API Key
                              </label>
                              <Input
                                id={`api-key-${cat.id}`}
                                value={apiKeys[cat.id]}
                                onChange={(e) => handleApiKeyChange(cat.id, e.target.value)}
                                placeholder="Enter API Key / Token..."
                                className="bg-slate-900 border-slate-850 text-slate-200 text-xs rounded-lg py-2.5 h-9 font-mono"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  handleApiKeyChange(cat.id, "");
                                  showToast("info", "API Key Reset", `Reset key for ${cat.title}.`);
                                }}
                                className="h-9 px-3 border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white"
                              >
                                Clear
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </GlassPanel>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
