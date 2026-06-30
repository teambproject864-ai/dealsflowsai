"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";
import { MarketingStrategyModule } from "@/components/MarketingStrategyModule";
import { Menu,
  Users,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  Star,
  Plus,
  Check,
  Loader2,
  AlertCircle,
  X,
  Zap,
  ChevronRight,
  Filter,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Upload,
  XCircle,
  Download,
  FileText,
  Settings,
  PhoneCall,
  Send,
  ChevronDown,
  Briefcase,
  Mail,
  Linkedin,
  Mic2,
  Users2,
  BookOpen,
  Newspaper,
  FileSpreadsheet,
  MessageCircle,
  VideoIcon,
  Music2,
  PenTool,
  Brain,
  SearchIcon,
  CreditCard,
  CalendarCheck,
  Sparkles,
  PhoneOff,
  VolumeX,
  Volume2
} from "lucide-react";
import { COUNTRIES, formatPhoneNumber, isPhoneValid } from "@/lib/countries";
import { cn } from "@/lib/utils";
import {
  demoUsers,
  demoTasks,
  demoChatMessages,
  demoAgentMetrics,
  demoAgentCredits,
  demoCustomers,
} from "@/lib/portal-demo-data";
import type { AgentCredits, FileAttachment } from "@/lib/types";
import type { TaskStatus } from "@/lib/portal-types";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { Unibox } from "@/components/Unibox";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { generateICPDocument } from "@/lib/icp-document-generator";

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

// Structured marketing campaign categories & tactics mapping
const MARKETING_CATEGORIES = [
  {
    id: "outreach",
    title: "Outreach & Direct Engagement",
    icon: Mail,
    color: "text-teal-400",
    hoverColor: "hover:border-teal-500/40",
    borderColor: "border-teal-500/20",
    glowColor: "shadow-teal-500/10",
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
    icon: Users2,
    color: "text-purple-400",
    hoverColor: "hover:border-purple-500/40",
    borderColor: "border-purple-500/20",
    glowColor: "shadow-purple-500/10",
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
    items: [
      "Webinars",
      "Virtual summits / conferences",
      "Local meetups",
      "Trade show presence"
    ]
  }
];

// Contextual AI Campaign Asset Generator
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

  // Outreach & Direct Engagement
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
   - Touch 3: Cold outreach email detailing custom audit of their website/GTM.
   - Touch 4: Direct mail (educational handbook) sent to decision-maker's office.`;
  }

  // Influencer & Creator Partnerships
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

  // Written Content
  if (tactic.toLowerCase().includes("blog posts")) {
    return `Campaign Type: SEO Blog Post Brief

Title Idea: The Definitive Guide to Solving ${pain} for Good
Primary Keyword: How to solve ${pain}
Tone: ${tone}

[OUTLINE]
1. Introduction: The rising cost of ${pain} and why traditional methods fail.
2. The Core Problem: How ${pain} slows down growth for ${brand}.
3. The Solution: Step-by-step framework to ${prom}.
4. Case Study: Real-world results from implementing these steps.
5. Conclusion & Action Plan (CTA to schedule a consultation).`;
  }

  if (tactic.toLowerCase().includes("comparison pages")) {
    return `Campaign Type: Comparison Page Template ("X vs Y")

URL Slug: /vs/our-tool-competitors
Focus: Highlighting how we outperform competitors on ${prom}.

[KEY SECTIONS]
1. Header: Tired of dealing with ${pain}? Compare why our solution is built differently.
2. Side-by-Side Comparison Table:
   - Feature 1: Performance (Ours: Active / Competitors: Limited)
   - Feature 2: Support (Ours: 24/7 Dedicated / Competitors: Email only)
   - Feature 3: Solve ${pain} (Ours: Built-in automated flow / Competitors: Manual setup)
3. Deep-Dive Section: Why companies are switching from legacy tools to our platform to ${prom}.`;
  }

  if (tactic.toLowerCase().includes("ai blog post generation")) {
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

interface ICPProfile {
  id: string;
  name: string;
  industry: string;
  companySize: string;
  geography: string;
  painPoints: string[];
  metrics: {
    conversionRate: string;
    salesCycle: string;
    cac: string;
    leadResponse: string;
  };
}

const DEMO_ICP_PROFILES: ICPProfile[] = [
  {
    id: "icp-enterprise-saas",
    name: "Enterprise B2B SaaS",
    industry: "Software & Technology",
    companySize: "500-5000 employees",
    geography: "North America, Europe",
    painPoints: ["High customer churn", "Inefficient sales pipeline", "Siloed customer data"],
    metrics: {
      conversionRate: "24.5%",
      salesCycle: "45 days",
      cac: "$1,200",
      leadResponse: "< 10 mins"
    }
  },
  {
    id: "icp-midmarket-healthcare",
    name: "Mid-Market HealthTech Providers",
    industry: "Healthcare / Biotech",
    companySize: "100-500 employees",
    geography: "US East Coast",
    painPoints: ["HIPAA compliance roadblocks", "Manual patient scheduling", "Legacy EHR integrations"],
    metrics: {
      conversionRate: "18.2%",
      salesCycle: "30 days",
      cac: "$850",
      leadResponse: "< 15 mins"
    }
  },
  {
    id: "icp-fintech-seed",
    name: "Early-stage FinTech Disruptors",
    industry: "Financial Services",
    companySize: "10-100 employees",
    geography: "Global / Remote",
    painPoints: ["Fraud prevention scaling", "KYC drop-off rates", "Multi-currency processing"],
    metrics: {
      conversionRate: "12.8%",
      salesCycle: "14 days",
      cac: "$320",
      leadResponse: "< 5 mins"
    }
  }
];

function AgentPortalContent() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedIcpProfileId, setSelectedIcpProfileId] = useState<string>("icp-enterprise-saas");
  const [playbookTemplate, setPlaybookTemplate] = useState({
    gtmTactics: "",
    outreachScripts: "",
    qualifyingCriteria: ""
  });
  const [isEditingPlaybook, setIsEditingPlaybook] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("requirements");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isStateSynced, setIsStateSynced] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Dialer & Call State Additions
  const [dialedNumber, setDialedNumber] = useState("");
  const [outboundCallState, setOutboundCallState] = useState<"idle" | "ringing" | "connected">("idle");
  const [outboundCallDuration, setOutboundCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isHeld, setIsHeld] = useState(false);

  const handleGeneratePlaybook = (profileId: string) => {
    const profile = DEMO_ICP_PROFILES.find(p => p.id === profileId) || DEMO_ICP_PROFILES[0];
    
    const gtm = `1. Channels: Outbound Email, LinkedIn Social Selling, Search Retargeting
2. Target Persona: VP of Sales, Head of RevOps in ${profile.industry}
3. Monthly Budget: $2,500 (LinkedIn Ads), $500 (Cold Email Infrastructure)
4. Trigger Event: Executive job changes or recent funding announcements in ${profile.companySize} firms.`;

    const outreach = `--- EMAIL TEMPLATE ---
Subject: Solving ${profile.painPoints[0]} at {{companyName}}

Hi {{firstName}},

I noticed {{companyName}} is expanding in ${profile.geography}. Many companies in the ${profile.industry} space with ${profile.companySize} struggle with ${profile.painPoints[0]} and ${profile.painPoints[1]}.

We built DealFlow.AI specifically to help SDRs automate and personalize these sequences. Would you be open to a brief 10-minute chat next Tuesday at 2 PM?

Best,
{{agentName}}

--- COLD CALL SCRIPT ---
"Hi {{firstName}}, this is {{agentName}} from DealFlow.AI. I'm calling because we help ${profile.industry} firms with ${profile.companySize} solve ${profile.painPoints[0]}..."`;

    const qualifying = `1. Budget: Has active budget for outbound tools (minimum $500/mo).
2. Authority: Decision maker is Manager, Director, or VP level.
3. Need: Experiencing high customer churn or slow pipeline velocity.
4. Timeline: Intends to purchase/deploy a solution within 30-90 days.
5. Score threshold: Must pass 3 out of 5 BANT alignment checks.`;

    setPlaybookTemplate({
      gtmTactics: gtm,
      outreachScripts: outreach,
      qualifyingCriteria: qualifying
    });
    setIsEditingPlaybook(true);
  };

  // Sync state with localStorage to allow seamless sharing with dedicated workspace page
  useEffect(() => {
    const savedTasks = localStorage.getItem("df_agent_tasks");
    const savedMessages = localStorage.getItem("df_chat_messages");
    
    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (e) {
        setTasks([...demoTasks]);
      }
    } else {
      setTasks([...demoTasks]);
    }

    if (savedMessages) {
      try {
        setChatMessages(JSON.parse(savedMessages));
      } catch (e) {
        setChatMessages([...demoChatMessages]);
      }
    } else {
      setChatMessages([...demoChatMessages]);
    }
    
    setIsStateSynced(true);
  }, []);

  useEffect(() => {
    if (isStateSynced) {
      localStorage.setItem("df_agent_tasks", JSON.stringify(tasks));
    }
  }, [tasks, isStateSynced]);

  useEffect(() => {
    if (isStateSynced) {
      localStorage.setItem("df_chat_messages", JSON.stringify(chatMessages));
    }
  }, [chatMessages, isStateSynced]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  // Outbound call duration ticking
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (outboundCallState === "connected") {
      timer = setInterval(() => {
        setOutboundCallDuration(d => d + 1);
      }, 1000);
    } else {
      setOutboundCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [outboundCallState]);

  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interactive Workspace State
  const [activeWorkspaceLeadId, setActiveWorkspaceLeadId] = useState<string>("");
  const [selectedTactic, setSelectedTactic] = useState<{ category: string; name: string } | null>(null);
  const [workspaceTone, setWorkspaceTone] = useState<string>("Professional");
  const [workspaceKeywords, setWorkspaceKeywords] = useState<string>("");
  const [isGeneratingWorkspaceContent, setIsGeneratingWorkspaceContent] = useState(false);
  const [generatedWorkspaceContent, setGeneratedWorkspaceContent] = useState<string>("");
  const [tacticStatuses, setTacticStatuses] = useState<Record<string, string>>({});

  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [playbookContent, setPlaybookContent] = useState<string>("");
  const [icpEntries, setIcpEntries] = useState<any[]>([]);

  // Voice & WhatsApp Settings State
  const [countrySearch, setCountrySearch] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === "US") || COUNTRIES[0]);
  const [phoneInput, setPhoneInput] = useState("");
  const [callFramework, setCallFramework] = useState("");
  const [whatsAppParams, setWhatsAppParams] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  // Voice call state
  const [callToPhone, setCallToPhone] = useState("");
  const [isInitiatingCall, setIsInitiatingCall] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<{sessionId: string; callSid: string; status: string} | null>(null);
  
  // Poll call status when active call exists
  useEffect(() => {
    if (!activeCallSession) return;
    
    // If it's a mock call (callSid starts with "MOCK_CALL_"), simulate status transitions
    if (activeCallSession.callSid.startsWith("MOCK_CALL_")) {
      const timeouts: NodeJS.Timeout[] = [];
      
      // Simulate ringing → in-progress after 2s
      timeouts.push(
        setTimeout(() => {
          setActiveCallSession(prev => prev ? { ...prev, status: "in-progress" } : null);
        }, 2000)
      );
      
      // Simulate in-progress → completed after 10s
      timeouts.push(
        setTimeout(() => {
          setActiveCallSession(prev => prev ? { ...prev, status: "completed" } : null);
        }, 12000)
      );
      
      return () => {
        timeouts.forEach(clearTimeout);
      };
    }
    
    // Real call polling
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/custom-voice/call?sessionId=${encodeURIComponent(activeCallSession.sessionId)}`);
        const data = await res.json();
        if (data.session) {
          setActiveCallSession(prev => prev ? { ...prev, status: data.session.status } : null);
        }
      } catch (e) {
        console.error("Failed to poll call status:", e);
      }
    }, 2000);
    
    return () => clearInterval(pollInterval);
  }, [activeCallSession]);

  // WhatsApp state
  const [waToPhone, setWaToPhone] = useState("");
  const [waCustomerName, setWaCustomerName] = useState("");
  const [waCustomContent, setWaCustomContent] = useState("");
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [waSentMessages, setWaSentMessages] = useState<any[]>([]);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [leadsRes, playbookRes, icpRes] = await Promise.all([
          fetch("/api/leads").then((r) => r.json()),
          fetch("/api/playbook").then((r) => r.json()),
          fetch("/api/customer/icp").then((r) => r.json()),
        ]);

        if (leadsRes.success) {
          setLeads(leadsRes.leads);
          if (leadsRes.leads.length > 0) {
            setSelectedLeadId(leadsRes.leads[0].id);
            setActiveWorkspaceLeadId(leadsRes.leads[0].id);
          }
        }
        if (playbookRes.success) {
          setPlaybookContent(playbookRes.content);
        }
        if (icpRes.success) {
          setIcpEntries(icpRes.icpEntries);
        }
      } catch (err) {
        console.error("Failed to load agent workspace data:", err);
      } finally {
        setLoadingData(false);
      }
    }
    loadAllData();
  }, []);

  // Load agent Voice & WhatsApp settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/agent/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          setPhoneInput(s.phoneNumber || "");
          setCallFramework(s.callConversationFramework || "");
          setWhatsAppParams(s.whatsAppMessageParameters || "");
          const country = COUNTRIES.find(c => c.code === s.countryCode) || COUNTRIES[0];
          setSelectedCountry(country);
          setSettingsLoaded(true);
        }
      } catch (err) {
        // Settings load failed silently — use defaults
        setSettingsLoaded(true);
      }
    }
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/agent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: `${selectedCountry.prefix} ${phoneInput}`.trim(),
          countryCode: selectedCountry.code,
          callConversationFramework: callFramework,
          whatsAppMessageParameters: whatsAppParams,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Settings Saved", "Your Voice & WhatsApp settings have been saved.");
      } else {
        showToast("error", "Save Failed", data.error || "Could not save settings.");
      }
    } catch (err) {
      showToast("error", "Save Failed", "Network error while saving settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleInitiateCall = async () => {
    if (!callToPhone.trim()) {
      showToast("error", "Missing Phone", "Please enter a phone number to call.");
      return;
    }
    setIsInitiatingCall(true);
    try {
      const res = await fetch("/api/custom-voice/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: callToPhone.trim(),
          callFramework,
          agentName: currentAgentName,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveCallSession({ sessionId: data.sessionId, callSid: data.callSid, status: "ringing" });
        showToast("success", "Call Initiated", `Ringing ${callToPhone}... Session: ${data.sessionId}`);
        setCallToPhone("");
      } else {
        showToast("error", "Call Failed", data.error || "Failed to initiate call.");
      }
    } catch (err) {
      showToast("error", "Call Failed", "Network error while initiating call.");
    } finally {
      setIsInitiatingCall(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!waToPhone.trim()) {
      showToast("error", "Missing Phone", "Please enter a recipient phone number.");
      return;
    }
    setIsSendingWhatsApp(true);
    try {
      const res = await fetch("/api/custom-whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPhone: waToPhone.trim(),
          customerName: waCustomerName || "Valued Customer",
          whatsAppParameters: whatsAppParams,
          customContent: waCustomContent || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWaSentMessages(prev => [{ ...data, sentAt: new Date().toISOString() }, ...prev]);
        showToast("success", "Message Sent", "WhatsApp message sent successfully.");
        setWaToPhone("");
        setWaCustomerName("");
        setWaCustomContent("");
      } else {
        showToast("error", "Send Failed", data.error || "Failed to send WhatsApp message.");
      }
    } catch (err) {
      showToast("error", "Send Failed", "Network error while sending WhatsApp.");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.prefix.includes(countrySearch) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  // Determine current agent ID based on authenticated user
  const currentAgentId = user?.id || "agent-vijay";

  const agentTasks = tasks.filter((t) => t.assignedAgentId === currentAgentId).filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const agentMetrics = demoAgentMetrics.find((m) => m.agentId === currentAgentId);
  const agentCredits = demoAgentCredits.find((c) => c.agentId === currentAgentId);

  const currentAgent = demoUsers.find((u) => u.id === currentAgentId);
  const currentAgentName = currentAgent?.name || "Agent";
  
  // Find the customer associated with the tasks/chats (default to first customer in demo data)
  const customer = demoUsers.find((u) => u.role === "customer") || demoUsers.find((u) => u.id === "customer-demo");
  const customerName = customer?.name || "Customer";

  // Show/hide notification
  const showToast = (type: "success" | "error" | "info", title: string, message: string) => {
    setShowNotification({ type, title, message });
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  // Convert File to FileAttachment (simulate upload for demo)
  const fileToAttachment = (file: File): FileAttachment => ({
    id: `file-${Date.now()}-${Math.random().toString(36)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    uploadedBy: currentAgentId,
  });

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedTaskId) {
      showToast("error", "Error", "Please enter a note first");
      return;
    }

    setIsAddingNote(true);
    setTimeout(() => {
      setTasks(
        tasks.map((t) =>
          t.id === selectedTaskId
            ? { ...t, progressNotes: [...t.progressNotes, newNote], updatedAt: new Date().toISOString() }
            : t
        )
      );
      setNewNote("");
      setIsAddingNote(false);
      showToast("success", "Note Added", "Your progress note has been saved");
    }, 600);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) {
      showToast("error", "Error", "Please type a message or attach files first");
      return;
    }
    setIsSendingMessage(true);
    setTimeout(() => {
      const attachments = selectedFiles.map(fileToAttachment);
      const newMsg = {
        id: `msg-${Date.now()}`,
        sessionId: "session-1",
        senderId: currentAgentId,
        senderName: currentAgentName,
        senderRole: "agent" as const,
        content: newMessage,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false,
      };
      setChatMessages([...chatMessages, newMsg]);
      setNewMessage("");
      setSelectedFiles([]);
      setIsSendingMessage(false);
      showToast("success", "Message Sent", "Your message has been delivered");
    }, 500);
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t
      )
    );
    showToast("success", "Task Updated", `Task status changed to "${newStatus}"`);
  };

  const toggleMilestone = (taskId: string, milestoneId: string) => {
    setTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              milestones: t.milestones.map((m: any) =>
                m.id === milestoneId
                  ? {
                      ...m,
                      completed: !m.completed,
                      completedAt: !m.completed ? new Date().toISOString() : undefined,
                    }
                  : m
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
    showToast("success", "Milestone Updated", "Milestone status has been changed");
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-teal-500" />
          <p className="text-slate-400 font-medium animate-pulse">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Helper to dial numbers
  const appendDialDigit = (digit: string) => {
    setDialedNumber(prev => prev + digit);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white relative font-sans antialiased flex flex-col lg:flex-row">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/5 blur-[120px] pointer-events-none z-0" />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-6 duration-300">
          <GlassPanel
            tilt={false}
            className={cn(
              "flex items-start gap-3.5 px-4.5 py-3.5 rounded-2xl shadow-2xl border min-w-[320px] max-w-sm",
              showNotification.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-200"
                : showNotification.type === "error"
                ? "border-rose-500/30 bg-rose-950/80 text-rose-200"
                : "border-blue-500/30 bg-blue-950/80 text-blue-200"
            )}
          >
            <div className="mt-0.5">
              {showNotification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 animate-pulse" />
              ) : showNotification.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-rose-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-white text-sm leading-tight">{showNotification.title}</p>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">{showNotification.message}</p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </GlassPanel>
        </div>
      )}

      {/* Mobile Sticky Top Header with Hamburger and basic status */}
      <header className="lg:hidden sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-400" />
          DealFlow Agent
        </h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-teal-400 hover:text-teal-300"
          aria-label="Toggle Navigation"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Desktop Left Sidebar / Mobile Overlay Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:sticky lg:h-screen w-[280px] bg-slate-950/80 backdrop-blur-2xl border-r border-slate-900/60 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 shrink-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="space-y-8 flex-1 overflow-y-auto pr-1">
          {/* Brand/Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                <Users className="h-4.5 w-4.5 text-teal-400" />
              </div>
              DealFlow Agent
            </h2>
            <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Connected Agent info card */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Connected Agent</p>
            <p className="text-sm font-bold text-teal-300 truncate">{currentAgentName}</p>
          </div>

          {/* Structured Navigation Groups */}
          <nav className="space-y-6">
            {/* Section 1: Core Workflows */}
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold px-3">Core Workflows</p>
              <div className="space-y-1">
                {[
                  { id: "requirements", label: "Requirements", icon: Users },
                  { id: "icp-entries", label: "ICP Entries", icon: FileText },
                  { id: "playbook", label: "ICP Playbook", icon: BookOpen },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-205 text-left border border-transparent",
                        isActive
                          ? "bg-teal-500/10 text-teal-300 border-teal-500/20 shadow-md shadow-teal-500/5"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Communications */}
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold px-3">Communications</p>
              <div className="space-y-1">
                {[
                  { id: "chat", label: "Chat Support", icon: MessageSquare },
                  { id: "calls", label: "Agent Dialer", icon: Phone },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-205 text-left border border-transparent",
                        isActive
                          ? "bg-teal-500/10 text-teal-300 border-teal-500/20 shadow-md shadow-teal-500/5"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: System & Analytics */}
            <div className="space-y-2">
              <p className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold px-3">System & Analytics</p>
              <div className="space-y-1">
                {[
                  { id: "tasks", label: "Agent Tasks", icon: CheckCircle2 },
                  { id: "metrics", label: "My Metrics", icon: Star },
                  { id: "credits", label: "Credit Balance", icon: Zap },
                  { id: "voice-whatsapp", label: "Voice & WhatsApp", icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setIsSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-205 text-left border border-transparent",
                        isActive
                          ? "bg-teal-500/10 text-teal-300 border-teal-500/20 shadow-md shadow-teal-500/5"
                          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
                {/* External workspace push */}
                <button
                  type="button"
                  onClick={() => {
                    router.push("/portal/agent/workspace");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent text-left"
                >
                  <Briefcase className="h-4 w-4" />
                  Campaign Workspace
                </button>
              </div>
            </div>
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="border-t border-slate-900/60 pt-4 mt-auto">
          <LogoutButton />
        </div>
      </aside>

      {/* Sidebar background overlay on mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main content pane */}
      <main className="flex-1 min-w-0 z-10 flex flex-col">
        {/* Top bar on desktop */}
        <div className="hidden lg:flex sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 px-8 py-4.5 justify-between items-center">
          <div>
            <p className="text-xs text-slate-400">Platform Portal / <span className="text-teal-300 font-bold capitalize">{activeTab.replace("-", " ")}</span></p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 bg-slate-900/40 border border-slate-850 px-4 py-1.5 rounded-xl text-xs font-bold">
              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-normal">Active Tasks:</span>{" "}
                <span className="text-teal-400 font-extrabold">{agentTasks.length}</span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <div className="text-center">
                <span className="text-[10px] text-slate-500 font-normal">Rating:</span>{" "}
                <span className="text-amber-400 font-extrabold">{agentMetrics?.averageRating.toFixed(1) || "0"}</span>
              </div>
              {agentCredits && (
                <>
                  <div className="h-4 w-px bg-slate-800" />
                  <div className="text-center">
                    <span className="text-[10px] text-slate-500 font-normal">Credits:</span>{" "}
                    <span className="text-violet-400 font-extrabold">{agentCredits.balance}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="p-6 lg:p-8 overflow-y-auto">
          {activeTab === "requirements" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Requirements Selector */}
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-400" />
                  Assigned Requirements
                </h3>
                <div className="space-y-3">
                  {loadingData ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-850 animate-pulse space-y-3">
                          <div className="h-4 w-32 bg-slate-850 rounded" />
                          <div className="h-3 w-20 bg-slate-850 rounded" />
                          <div className="h-3.5 w-24 bg-slate-850 rounded" />
                        </div>
                      ))}
                    </div>
                  ) : leads.length === 0 ? (
                    <GlassPanel tilt={false} className="border-slate-800/50">
                      <CardContent className="py-12 text-center">
                        <Users className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 text-xs font-semibold">No requirements assigned</p>
                      </CardContent>
                    </GlassPanel>
                  ) : (
                    leads.map((lead) => (
                      <GlassPanel
                        key={lead.id}
                        tilt={true}
                        className={cn(
                          "cursor-pointer border-slate-800 hover:border-teal-500/40 transition-all duration-350 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50 rounded-2xl",
                          selectedLeadId === lead.id ? "border-teal-500/60 shadow-lg shadow-teal-500/10 bg-slate-800/20" : ""
                        )}
                        onClick={() => setSelectedLeadId(lead.id)}
                      >
                        <CardHeader className="pb-3.5 p-5">
                          <CardTitle className="text-base text-slate-100 font-extrabold">{lead.companyName}</CardTitle>
                          <p className="text-xs text-teal-400 font-semibold mt-1">{lead.websiteUrl || lead.website}</p>
                          <p className="text-[10px] text-slate-500 mt-2 font-mono">Lead contact: {lead.name}</p>
                        </CardHeader>
                      </GlassPanel>
                    ))
                  )}
                </div>
              </div>

              {/* Requirement Dossier Details */}
              <div className="lg:col-span-2">
                {selectedLeadId ? (
                  (() => {
                    const lead = leads.find((l) => l.id === selectedLeadId);
                    if (!lead) return null;
                    
                    const matchedCustomer = demoCustomers.find(
                      (c) => c.id === lead.customerId || c.companyName.toLowerCase() === lead.companyName.toLowerCase()
                    );
                    const businessModel = matchedCustomer?.businessModel || "b2b";
                    
                    return (
                      <GlassPanel tilt={false} className="border-slate-850 p-6 space-y-6">
                        <CardHeader className="border-b border-slate-850 pb-5 p-0">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-3">
                              <CardTitle className="text-xl text-slate-100 font-black">{lead.companyName}</CardTitle>
                              <span className={cn(
                                "text-[10px] px-3 py-0.5 rounded-full font-extrabold uppercase border tracking-widest",
                                businessModel === "b2b" ? "bg-indigo-950/80 border-indigo-500/30 text-indigo-400" :
                                businessModel === "b2c" ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-400" :
                                businessModel === "d2c" ? "bg-pink-950/80 border-pink-500/30 text-pink-400" :
                                "bg-amber-950/80 border-amber-800/30 text-amber-400"
                              )}>
                                {businessModel}
                              </span>
                            </div>
                            {(lead.websiteUrl || lead.website) && (
                              <a
                                href={lead.websiteUrl || lead.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-teal-400 hover:text-teal-300 font-bold hover:underline flex items-center gap-1.5"
                              >
                                View Live Site <ChevronRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6 p-0">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Offer Promise</p>
                              <p className="text-xs text-slate-200 mt-1 font-bold leading-normal">{lead.offerPromise || "Not specified"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Core Pain Point</p>
                              <p className="text-xs text-slate-200 mt-1 font-bold leading-normal">{lead.painPoint || "Not specified"}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-900 border border-slate-850">
                              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">ICP Classification</p>
                              <p className="text-xs text-slate-200 mt-1 font-bold leading-normal">{lead.icpDescription || "Not specified"}</p>
                            </div>
                          </div>

                          {/* Consensus Validation playbooks */}
                          {(() => {
                            try {
                              const blueprint = generateICPDocument(lead as any);
                              return (
                                <div className="border-t border-slate-850 pt-6 space-y-6">
                                  <h4 className="text-sm font-bold text-teal-400 flex items-center gap-1.5">
                                    <FileText className="h-4 w-4 text-teal-400" />
                                    Consensus GTM Blueprint Analysis
                                  </h4>

                                  {/* Playbook milestones outline */}
                                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-4">
                                    <h5 className="text-xs font-bold text-slate-300">Technical Execution Playbook Steps</h5>
                                    {Object.entries(blueprint["Assigned Requirements"]["Technical Execution Playbook"]).map(([phase, steps]) => (
                                      <div key={phase} className="space-y-2">
                                        <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">{phase}</p>
                                        <div className="grid grid-cols-1 gap-2.5">
                                          {steps.map((step, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-normal">
                                              <div className="mt-1 h-3.5 w-3.5 rounded-full border border-teal-500/50 flex items-center justify-center shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                                              </div>
                                              <p>{step}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Dynamic estimates */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Memory OS (Hermes) Parameters</p>
                                      <p className="text-xs text-slate-300 leading-relaxed">
                                        {blueprint["Technical Product Value Proposition Alignment"]?.["Memory OS (Hermes) Alignment"]}
                                      </p>
                                    </div>
                                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Compliance OS (Clawpatrol)</p>
                                      <p className="text-xs text-slate-300 leading-relaxed">
                                        {blueprint["Technical Product Value Proposition Alignment"]?.["Agent Security Firewall (Clawpatrol) Alignment"]}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            } catch (e) {
                              return null;
                            }
                          })()}
                        </CardContent>
                      </GlassPanel>
                    );
                  })()
                ) : (
                  <GlassPanel tilt={false} className="border-slate-800">
                    <CardContent className="py-20 text-center">
                      <Users className="h-14 w-14 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-slate-300">Select a requirement</h3>
                      <p className="text-slate-500 text-xs mt-1">Choose a requirement from the list to view its matched ICP details</p>
                    </CardContent>
                  </GlassPanel>
                )}
              </div>
            </div>
          )}

          {activeTab === "icp-entries" && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-100">Assigned ICP Entries</h2>
              {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-5 bg-slate-900/40 rounded-2xl border border-slate-850 animate-pulse space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-slate-850 rounded" />
                          <div className="h-3 w-20 bg-slate-850 rounded" />
                        </div>
                        <div className="h-5 w-12 bg-slate-850 rounded-full" />
                      </div>
                      <div className="h-10 w-full bg-slate-850 rounded" />
                    </div>
                  ))}
                </div>
              ) : icpEntries.length === 0 ? (
                <GlassPanel tilt={false} className="border-slate-800">
                  <CardContent className="py-20 text-center">
                    <FileText className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-300">No ICP entries yet</h3>
                    <p className="text-slate-500 text-xs mt-1">ICP entries submitted by customers will appear here</p>
                  </CardContent>
                </GlassPanel>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {icpEntries.map((entry) => (
                    <GlassPanel key={entry.id} tilt={true} className="border-slate-800/80 p-5 rounded-2xl space-y-4">
                      <CardHeader className="p-0 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-base text-slate-100 font-extrabold">{entry.name}</CardTitle>
                          <p className="text-xs text-slate-500 mt-1">Submitter: {entry.customerName}</p>
                        </div>
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border",
                          entry.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : entry.status === "draft" ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            : "bg-slate-800 border-slate-750 text-slate-400"
                        )}>{entry.status}</span>
                      </CardHeader>
                      <CardContent className="p-0 space-y-3">
                        <p className="text-xs text-slate-300 leading-relaxed">{entry.description}</p>
                        <div className="border-t border-slate-850 pt-3 grid grid-cols-2 gap-2 text-[10px] leading-snug">
                          {entry.targetIndustries?.length > 0 && (
                            <div>
                              <span className="text-slate-500 block uppercase font-bold mb-0.5">Industries</span>
                              <span className="text-slate-300">{entry.targetIndustries.join(", ")}</span>
                            </div>
                          )}
                          {entry.targetCompanySizes?.length > 0 && (
                            <div>
                              <span className="text-slate-500 block uppercase font-bold mb-0.5">Sizes</span>
                              <span className="text-slate-300">{entry.targetCompanySizes.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </GlassPanel>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              {/* Task Controls Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Interactive Kanban Board</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Drag, click, and manage campaign task milestones</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="bg-slate-900 border-slate-850 pl-9 text-xs rounded-xl h-9"
                    />
                  </div>
                  <ExtrudedButton
                    className="bg-teal-600 hover:bg-teal-700 text-xs gap-1.5 h-9"
                    onClick={() => {
                      const demoTask = {
                        id: `task-new-${Date.now()}`,
                        title: `Custom SDR Outreach - ${customerName}`,
                        description: "Initiate outreach sequence targeting newly imported decision makers.",
                        status: "todo" as const,
                        assignedAgentId: currentAgentId,
                        customerId: "customer-demo",
                        priority: "high" as const,
                        progressNotes: ["Manually triggered from task planner."],
                        milestones: [
                          { id: "m1", title: "Map company decision makers", completed: false },
                          { id: "m2", title: "Draft outreach script templates", completed: false }
                        ],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      setTasks([demoTask, ...tasks]);
                      showToast("success", "Task Created", "Appended new item to your Todo column.");
                    }}
                  >
                    <Plus className="h-4 w-4" /> Add Task
                  </ExtrudedButton>
                </div>
              </div>

              {/* 3-Column Kanban Board Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column lists (10 cols combined) */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Column 1: TODO */}
                  <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-slate-500" />
                        <span className="text-xs font-bold text-slate-300">To Do</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                        {agentTasks.filter(t => t.status === "todo").length}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {agentTasks.filter(t => t.status === "todo").map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={cn(
                            "p-4 rounded-xl border bg-slate-900/60 transition-all cursor-pointer hover:border-slate-650",
                            selectedTaskId === t.id ? "border-teal-500 bg-slate-800/40" : "border-slate-850"
                          )}
                        >
                          <h4 className="text-xs font-bold text-white line-clamp-1">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2">{t.description}</p>
                          <div className="mt-3 flex items-center justify-between text-[9px]">
                            <span className="bg-red-500/10 border border-red-500/25 px-2 py-0.5 rounded-full text-red-400 font-extrabold uppercase">
                              {t.priority}
                            </span>
                            <span className="text-slate-500">
                              {t.milestones.filter((m: any) => m.completed).length}/{t.milestones.length} milestones
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: IN PROGRESS & BLOCKED */}
                  <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span className="text-xs font-bold text-amber-300">In Progress</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                        {agentTasks.filter(t => t.status === "in-progress" || t.status === "blocked").length}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {agentTasks.filter(t => t.status === "in-progress" || t.status === "blocked").map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={cn(
                            "p-4 rounded-xl border bg-slate-900/60 transition-all cursor-pointer hover:border-slate-650",
                            selectedTaskId === t.id ? "border-teal-500 bg-slate-800/40" : "border-slate-850"
                          )}
                        >
                          <h4 className="text-xs font-bold text-white line-clamp-1">{t.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-1.5 line-clamp-2">{t.description}</p>
                          <div className="mt-3 flex items-center justify-between text-[9px]">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full font-extrabold uppercase border",
                              t.status === "blocked" ? "bg-rose-500/10 border-rose-500/20 text-rose-400" : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            )}>
                              {t.status === "blocked" ? "Blocked" : t.priority}
                            </span>
                            <span className="text-slate-500">
                              {t.milestones.filter((m: any) => m.completed).length}/{t.milestones.length} milestones
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: COMPLETED */}
                  <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold text-emerald-300">Completed</span>
                      </div>
                      <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400 font-bold">
                        {agentTasks.filter(t => t.status === "completed").length}
                      </span>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                      {agentTasks.filter(t => t.status === "completed").map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className={cn(
                            "p-4 rounded-xl border bg-slate-900/60 transition-all cursor-pointer hover:border-slate-650 opacity-75",
                            selectedTaskId === t.id ? "border-teal-500 bg-slate-800/40" : "border-slate-850"
                          )}
                        >
                          <h4 className="text-xs font-bold text-white line-clamp-1 line-through">{t.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-1.5 line-clamp-2">{t.description}</p>
                          <div className="mt-3 flex items-center justify-between text-[9px]">
                            <span className="bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-emerald-400 font-extrabold uppercase">
                              Done
                            </span>
                            <span className="text-slate-500">
                              All done
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Task Inspector Sidebar (4 cols) */}
                <div className="lg:col-span-4">
                  {selectedTaskId ? (
                    (() => {
                      const task = tasks.find((t) => t.id === selectedTaskId);
                      if (!task) return null;
                      return (
                        <GlassPanel tilt={false} className="border-slate-855 p-5 space-y-5">
                          <div className="flex items-start justify-between border-b border-slate-850 pb-4">
                            <div>
                              <h4 className="text-sm font-extrabold text-white leading-snug">{task.title}</h4>
                              <p className="text-[9px] text-slate-500 font-mono mt-1">ID: {task.id}</p>
                            </div>
                            <button
                              onClick={() => setSelectedTaskId(null)}
                              className="text-slate-500 hover:text-white"
                            >
                              <X className="h-4.5 w-4.5" />
                            </button>
                          </div>

                          {/* Quick details */}
                          <div className="space-y-3">
                            <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Task Description</label>
                            <p className="text-xs text-slate-300 leading-normal bg-slate-950 p-3 rounded-lg border border-slate-900">{task.description}</p>
                          </div>

                          {/* Status selectors */}
                          <div className="space-y-2">
                            <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Workflow Status</label>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>

                          {/* Milestones list */}
                          <div className="space-y-2">
                            <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">Requirement Checklists</label>
                            <div className="space-y-2">
                              {task.milestones.map((m: any) => (
                                <button
                                  key={m.id}
                                  onClick={() => toggleMilestone(task.id, m.id)}
                                  className="w-full text-left flex items-center gap-2.5 p-2 bg-slate-950/60 hover:bg-slate-900 border border-slate-900 rounded-lg text-xs transition-colors"
                                >
                                  <div className={cn(
                                    "h-4 w-4 rounded border flex items-center justify-center",
                                    m.completed ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "border-slate-700"
                                  )}>
                                    {m.completed && <Check className="h-3 w-3" />}
                                  </div>
                                  <span className={cn(m.completed && "line-through text-slate-500")}>{m.title}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Progress notes */}
                          <div className="space-y-3">
                            <label className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold block">SDR Log Notes</label>
                            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                              {task.progressNotes.map((note: string, i: number) => (
                                <div key={i} className="p-2.5 bg-slate-950/90 text-[11px] border border-slate-900 rounded-lg text-slate-300 leading-normal">
                                  {note}
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-1.5 mt-2">
                              <Input
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add note..."
                                className="bg-slate-950 border-slate-850 text-xs rounded-xl h-8 py-0"
                              />
                              <Button
                                onClick={handleAddNote}
                                disabled={isAddingNote || !newNote.trim()}
                                className="bg-slate-800 hover:bg-slate-700 h-8 text-[11px] px-3 font-semibold rounded-xl"
                              >
                                Log
                              </Button>
                            </div>
                          </div>
                        </GlassPanel>
                      );
                    })()
                  ) : (
                    <GlassPanel tilt={false} className="border-slate-850 p-6 text-center h-48 flex flex-col items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-slate-700 mb-2" />
                      <p className="text-slate-400 text-xs font-semibold">Select a task card</p>
                      <p className="text-slate-550 text-[10px] max-w-[150px] mt-1 mx-auto leading-normal">
                        Click on any card in the Kanban columns to inspect and complete milestones.
                      </p>
                    </GlassPanel>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <GlassPanel tilt={false} className="border-slate-850 h-[650px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-850 p-5 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-black text-lg">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    Secure Customer Console
                  </CardTitle>
                  <p className="text-slate-400 text-xs">Chatting with {customerName} (Online)</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-slate-400">
                    ID: {currentAgentId}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin">
                  {chatMessages.map((msg) => {
                    const isSelf = msg.senderId === currentAgentId;
                    return (
                      <div
                        key={msg.id}
                        className={cn("flex", isSelf ? "justify-end" : "justify-start")}
                      >
                        <div className={cn(
                          "max-w-[70%] p-4 rounded-2xl shadow-lg border",
                          isSelf
                            ? "bg-teal-600/10 border-teal-500/20 text-teal-200 rounded-tr-sm"
                            : "bg-slate-900 border-slate-850 text-slate-100 rounded-tl-sm"
                        )}>
                          <p className="text-[9px] font-extrabold opacity-75 uppercase tracking-widest mb-1.5">{msg.senderName}</p>
                          <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-1.5">
                              {msg.attachments.map((file: any) => (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-850 rounded-lg hover:border-slate-650 transition-colors"
                                >
                                  <FileText className="h-4.5 w-4.5 text-teal-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold truncate text-slate-200">{file.fileName}</p>
                                    <p className="text-[9px] text-slate-500">{formatFileSize(file.fileSize)}</p>
                                  </div>
                                  <Download className="h-3.5 w-3.5 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          )}
                          <p className="text-[8px] text-slate-500 mt-2 text-right">
                            {new Date(msg.timestamp || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected File Attachments */}
                {selectedFiles.length > 0 && (
                  <div className="px-5 py-2.5 border-t border-slate-850 bg-slate-950/80 flex flex-wrap gap-2">
                    {selectedFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full text-[10px]">
                        <FileText className="h-3.5 w-3.5 text-teal-400" />
                        <span className="truncate max-w-[120px] font-medium">{file.name}</span>
                        <button onClick={() => removeFile(i)} className="text-slate-500 hover:text-white">
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Editor Footer */}
                <div className="p-4 border-t border-slate-850 bg-slate-900/60 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 w-10 border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                      title="Attach documents"
                    >
                      <Upload className="h-4.5 w-4.5" />
                    </Button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send message to client..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="bg-slate-950 border-slate-850 text-xs rounded-xl h-10 focus:border-teal-500 flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!newMessage.trim() && selectedFiles.length === 0)}
                      className="bg-teal-600 hover:bg-teal-500 text-xs font-bold rounded-xl h-10 px-5 flex items-center justify-center gap-1.5"
                    >
                      {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "calls" && (
            <GlassPanel tilt={false} className="border-slate-850">
              <CardHeader className="border-b border-slate-850 p-5">
                <CardTitle className="text-slate-100 font-black text-lg">Integrated Outbound SDR Dialer</CardTitle>
                <p className="text-xs text-slate-400 mt-1">Initiate high-performance AI calls and manage active voice states</p>
              </CardHeader>
              
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Interactive phone dials (7 cols) */}
                  <div className="lg:col-span-7 flex flex-col md:flex-row items-center justify-center gap-10 bg-slate-950/60 p-6 rounded-2xl border border-slate-850">
                    
                    {/* Ringing animations or Standby display */}
                    <div className="text-center space-y-4">
                      <div className="relative flex items-center justify-center">
                        {outboundCallState !== "idle" && (
                          <div className="absolute inset-0 rounded-full border border-teal-500/20 animate-ping pointer-events-none scale-150" />
                        )}
                        <div className={cn(
                          "w-48 h-48 rounded-full border flex items-center justify-center transition-all duration-500 shadow-2xl relative",
                          outboundCallState === "ringing" ? "border-amber-500/40 bg-amber-950/20 shadow-amber-500/5 animate-pulse" :
                          outboundCallState === "connected" ? "border-emerald-500/40 bg-emerald-950/20 shadow-emerald-500/5" :
                          "border-slate-800 bg-slate-900 shadow-black/60"
                        )}>
                          <Phone className={cn(
                            "h-20 w-20",
                            outboundCallState === "ringing" ? "text-amber-400" :
                            outboundCallState === "connected" ? "text-emerald-400" :
                            "text-slate-600"
                          )} />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-base font-extrabold text-white">{customerName}</h4>
                        <p className="text-[11px] text-slate-500 font-mono mt-1">{dialedNumber || "+1 (555) SDR-DIAL"}</p>
                        
                        {outboundCallState !== "idle" && (
                          <div className="mt-3 flex flex-col items-center gap-1">
                            <span className={cn(
                              "text-xs font-bold px-3 py-0.5 rounded-full uppercase border",
                              outboundCallState === "ringing" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            )}>
                              {outboundCallState}
                            </span>
                            {outboundCallState === "connected" && (
                              <span className="text-xs font-mono text-slate-400 mt-1">
                                Duration: {Math.floor(outboundCallDuration / 60)}:{(outboundCallDuration % 60).toString().padStart(2, "0")}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Touch dial pad */}
                    <div className="w-60 grid grid-cols-3 gap-3">
                      {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                        <button
                          key={digit}
                          onClick={() => appendDialDigit(digit)}
                          disabled={outboundCallState !== "idle"}
                          className="h-14 rounded-xl border border-slate-850 bg-slate-900/50 hover:bg-slate-800 text-sm font-bold text-slate-200 transition-all flex items-center justify-center outline-none focus:ring-1 focus:ring-teal-500 active:scale-95 disabled:opacity-50"
                        >
                          {digit}
                        </button>
                      ))}
                      <button
                        onClick={() => setDialedNumber("")}
                        disabled={outboundCallState !== "idle"}
                        className="h-10 text-[10px] text-slate-500 hover:text-slate-300 font-bold col-span-3 border border-slate-900 bg-slate-950 rounded-lg text-center"
                      >
                        Reset Number
                      </button>
                    </div>
                  </div>

                  {/* Outbound call controls (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 space-y-5">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Voice Call Controller</h4>
                      
                      <div className="flex gap-2">
                        <Input
                          placeholder="Phone (e.g. +1 555 000 0000)"
                          value={dialedNumber}
                          onChange={(e) => setDialedNumber(e.target.value)}
                          disabled={outboundCallState !== "idle"}
                          className="bg-slate-950 border-slate-850 text-xs rounded-xl h-10 font-mono"
                        />
                        {outboundCallState === "idle" ? (
                          <Button
                            onClick={() => {
                              if (!dialedNumber.trim()) {
                                showToast("error", "Dial Required", "Please dial a number first.");
                                return;
                              }
                              setOutboundCallState("ringing");
                              showToast("success", "Connecting Call", `SDR channel calling ${dialedNumber}...`);
                              // Simulate connection
                              setTimeout(() => {
                                setOutboundCallState("connected");
                              }, 3000);
                            }}
                            className="bg-green-600 hover:bg-green-500 h-10 px-5 text-xs font-bold rounded-xl flex items-center gap-1.5"
                          >
                            <Phone className="h-4 w-4" /> Dial
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setOutboundCallState("idle");
                              showToast("info", "Call Terminated", "Voice connection closed.");
                            }}
                            className="bg-rose-600 hover:bg-rose-500 h-10 px-5 text-xs font-bold rounded-xl flex items-center gap-1.5"
                          >
                            <PhoneOff className="h-4 w-4" /> Hangup
                          </Button>
                        )}
                      </div>

                      {/* Interactive audio switches */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-850">
                        <button
                          onClick={() => {
                            setIsMuted(!isMuted);
                            showToast("info", isMuted ? "Mic Unmuted" : "Mic Muted", "");
                          }}
                          disabled={outboundCallState !== "connected"}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                            isMuted ? "bg-red-500/10 border-red-500/35 text-red-400 animate-pulse" : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                          )}
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {isMuted ? "Muted" : "Mute"}
                        </button>
                        <button
                          onClick={() => {
                            setIsHeld(!isHeld);
                            showToast("info", isHeld ? "Call Retrieved" : "Call on Hold", "");
                          }}
                          disabled={outboundCallState !== "connected"}
                          className={cn(
                            "py-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-colors",
                            isHeld ? "bg-amber-500/10 border-amber-500/35 text-amber-400 animate-pulse" : "bg-slate-950 border-slate-900 text-slate-400 hover:bg-slate-900"
                          )}
                        >
                          {isHeld ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                          {isHeld ? "On Hold" : "Hold"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "metrics" && agentMetrics && (
            <div className="space-y-6">
              {/* Numerical summary metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <GlassPanel tilt={true} className="border-slate-850 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tasks Resolved</span>
                    <CheckCircle2 className="h-5 w-5 text-teal-400" />
                  </div>
                  <p className="text-4xl font-black text-white">{agentMetrics.tasksCompleted}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">Total scope: {agentMetrics.totalTasks} tasks assigned</p>
                </GlassPanel>

                <GlassPanel tilt={true} className="border-slate-850 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SDR Avg Speed</span>
                    <Clock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <p className="text-4xl font-black text-white">{Math.round(agentMetrics.averageResolutionTime / 60)}h</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">Target benchmark: under 24 hours</p>
                </GlassPanel>

                <GlassPanel tilt={true} className="border-slate-850 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">CSAT Rating</span>
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-4xl font-black text-white">{agentMetrics.averageRating.toFixed(1)}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">Consensus: 5-star lead rating</p>
                </GlassPanel>

                <GlassPanel tilt={true} className="border-slate-850 p-5 rounded-2xl relative overflow-hidden group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Outreach Touches</span>
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-4xl font-black text-white">{agentMetrics.totalInteractions}</p>
                  <p className="text-[10px] text-slate-500 mt-2 font-mono">Total emails, calls & chats logged</p>
                </GlassPanel>
              </div>

              {/* Responsive SVG Charts section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* SVG Area Chart: Monthly Outreach Volumes */}
                <GlassPanel tilt={false} className="border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">SDR Interactions Volume (Last 6 Months)</h4>
                    <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">Active</span>
                  </div>
                  
                  <div className="h-60 w-full relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
                          <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="50" y1="30" x2="480" y2="30" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="50" y1="80" x2="480" y2="80" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="50" y1="130" x2="480" y2="130" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="50" y1="180" x2="480" y2="180" stroke="#0f172a" />
                      
                      {/* Y-Axis Labels */}
                      <text x="15" y="35" fill="#64748b" fontSize="9" fontWeight="bold">150</text>
                      <text x="15" y="85" fill="#64748b" fontSize="9" fontWeight="bold">100</text>
                      <text x="15" y="135" fill="#64748b" fontSize="9" fontWeight="bold">50</text>
                      <text x="15" y="185" fill="#64748b" fontSize="9" fontWeight="bold">0</text>

                      {/* Area Path */}
                      <path
                        d="M 50 180 Q 120 120 150 90 T 250 110 T 350 50 T 450 60 T 480 180 Z"
                        fill="url(#areaGrad)"
                      />

                      {/* Line Path */}
                      <path
                        d="M 50 180 Q 120 120 150 90 T 250 110 T 350 50 T 450 60 T 480 70"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      {/* Data Dots */}
                      <circle cx="150" cy="90" r="5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
                      <circle cx="250" cy="110" r="5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
                      <circle cx="350" cy="50" r="5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />
                      <circle cx="450" cy="60" r="5" fill="#0f172a" stroke="#14b8a6" strokeWidth="2.5" />

                      {/* X-Axis Labels */}
                      <text x="45" y="205" fill="#64748b" fontSize="9" fontWeight="bold">Jan</text>
                      <text x="135" y="205" fill="#64748b" fontSize="9" fontWeight="bold">Feb</text>
                      <text x="235" y="205" fill="#64748b" fontSize="9" fontWeight="bold">Mar</text>
                      <text x="335" y="205" fill="#64748b" fontSize="9" fontWeight="bold">Apr</text>
                      <text x="435" y="205" fill="#64748b" fontSize="9" fontWeight="bold">May</text>
                    </svg>
                  </div>
                </GlassPanel>

                {/* SVG Bar Chart: Task Resolution Speeds by Category */}
                <GlassPanel tilt={false} className="border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">SDR Campaign Task Speed (Hours)</h4>
                    <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">Target: &lt;24h</span>
                  </div>

                  <div className="h-60 w-full relative flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                      </defs>
                      
                      {/* Grid Lines */}
                      <line x1="120" y1="20" x2="120" y2="180" stroke="#1e293b" />
                      <line x1="210" y1="20" x2="210" y2="180" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="300" y1="20" x2="300" y2="180" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="390" y1="20" x2="390" y2="180" stroke="#1e293b" strokeDasharray="3" />
                      <line x1="480" y1="20" x2="480" y2="180" stroke="#1e293b" strokeDasharray="3" />

                      {/* Bar 1 */}
                      <text x="10" y="45" fill="#94a3b8" fontSize="10" fontWeight="bold">Outreach</text>
                      <rect x="120" y="32" width="280" height="18" fill="url(#barGrad)" rx="4" />
                      <text x="410" y="45" fill="#06b6d4" fontSize="10" fontWeight="bold">14 hrs</text>

                      {/* Bar 2 */}
                      <text x="10" y="85" fill="#94a3b8" fontSize="10" fontWeight="bold">Written</text>
                      <rect x="120" y="72" width="180" height="18" fill="url(#barGrad)" rx="4" />
                      <text x="310" y="85" fill="#06b6d4" fontSize="10" fontWeight="bold">9 hrs</text>

                      {/* Bar 3 */}
                      <text x="10" y="125" fill="#94a3b8" fontSize="10" fontWeight="bold">Social Media</text>
                      <rect x="120" y="112" width="340" height="18" fill="url(#barGrad)" rx="4" />
                      <text x="470" y="125" fill="#06b6d4" fontSize="10" fontWeight="bold">18 hrs</text>

                      {/* Bar 4 */}
                      <text x="10" y="165" fill="#94a3b8" fontSize="10" fontWeight="bold">Audio/Video</text>
                      <rect x="120" y="152" width="220" height="18" fill="url(#barGrad)" rx="4" />
                      <text x="350" y="165" fill="#06b6d4" fontSize="10" fontWeight="bold">11 hrs</text>
                      
                      {/* Scale Labels */}
                      <text x="115" y="200" fill="#64748b" fontSize="8" fontWeight="bold">0h</text>
                      <text x="205" y="200" fill="#64748b" fontSize="8" fontWeight="bold">6h</text>
                      <text x="295" y="200" fill="#64748b" fontSize="8" fontWeight="bold">12h</text>
                      <text x="385" y="200" fill="#64748b" fontSize="8" fontWeight="bold">18h</text>
                      <text x="470" y="200" fill="#64748b" fontSize="8" fontWeight="bold">24h</text>
                    </svg>
                  </div>
                </GlassPanel>

              </div>
            </div>
          )}

          {activeTab === "credits" && agentCredits && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credits Overview */}
              <div className="lg:col-span-1 space-y-6">
                <GlassPanel tilt={true} className="border-violet-800/40">
                  <CardContent className="pt-8 pb-6 p-5">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-violet-600/10 border border-violet-500/20">
                        <Zap className="h-10 w-10 text-violet-400 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-violet-300 text-xs uppercase tracking-wider font-extrabold">Available Credits</p>
                        <p className="text-6xl font-black text-white mt-1.5">{agentCredits.balance}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-850 text-center">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Total Earned</p>
                        <p className="text-lg font-extrabold text-emerald-400 mt-1">{agentCredits.totalEarned}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Total Spent</p>
                        <p className="text-lg font-extrabold text-rose-400 mt-1">{agentCredits.totalSpent}</p>
                      </div>
                    </div>
                    <ExtrudedButton className="w-full mt-6 bg-violet-600 hover:bg-violet-500 h-11 text-xs gap-2">
                      Purchase Resource Credits
                    </ExtrudedButton>
                  </CardContent>
                </GlassPanel>
              </div>

              {/* Transactions list */}
              <div className="lg:col-span-2">
                <GlassPanel tilt={false} className="border-slate-850 p-5 rounded-2xl">
                  <CardHeader className="p-0 flex flex-row items-center justify-between mb-5">
                    <CardTitle className="text-slate-100 font-extrabold text-base">Transaction Logs</CardTitle>
                    <ExtrudedButton variant="outline" size="sm" className="gap-1.5 h-8 text-[11px]">
                      <Filter className="h-3.5 w-3.5" />
                      Filter Logs
                    </ExtrudedButton>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-900 p-0">
                    {agentCredits.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 text-xs"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-9.5 w-9.5 rounded-full flex items-center justify-center border",
                            tx.amount > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
                          )}>
                            <Zap className={cn(
                              "h-4 w-4",
                              tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                            )} />
                          </div>
                          <div>
                            <p className="text-slate-200 font-bold">{tx.description}</p>
                            <p className="text-slate-500 text-[10px] mt-1">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-base font-extrabold",
                          tx.amount > 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {tx.amount > 0 ? "+" : ""}{tx.amount}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </GlassPanel>
              </div>
            </div>
          )}

          {activeTab === "playbook" && (
            <div className="space-y-6">
              {/* Top row: ICP Profiles Browser */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-teal-400" />
                  ICP Profiles & Performance Hub
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DEMO_ICP_PROFILES.map((profile) => (
                    <GlassPanel
                      key={profile.id}
                      tilt={false}
                      className={cn(
                        "border p-4 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between",
                        selectedIcpProfileId === profile.id
                          ? "border-teal-500 bg-teal-950/20 shadow-lg shadow-teal-500/5"
                          : "border-slate-850 bg-slate-900/30 hover:border-slate-700"
                      )}
                      onClick={() => {
                        setSelectedIcpProfileId(profile.id);
                        handleGeneratePlaybook(profile.id);
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-200">{profile.name}</h4>
                          <span className="text-[10px] text-teal-400 font-extrabold uppercase bg-teal-500/10 px-2 py-0.5 rounded">
                            {profile.industry.split(" ")[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {profile.companySize} • {profile.geography}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {profile.painPoints.map((pain, i) => (
                            <span key={i} className="text-[9px] bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                              {pain}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-center">
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Conversion</p>
                          <p className="text-xs font-bold text-teal-400">{profile.metrics.conversionRate}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Sales Cycle</p>
                          <p className="text-xs font-bold text-slate-300">{profile.metrics.salesCycle}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">CAC</p>
                          <p className="text-xs font-bold text-violet-400">{profile.metrics.cac}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-500 uppercase tracking-widest">Response</p>
                          <p className="text-xs font-bold text-amber-400">{profile.metrics.leadResponse}</p>
                        </div>
                      </div>
                    </GlassPanel>
                  ))}
                </div>
              </div>

              {/* Bottom row: Playbook Editor & Marketing Strategy Module */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GlassPanel tilt={false} className="border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-850 pb-4 flex-wrap gap-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-200">Playbook Generator Canvas</h4>
                        <p className="text-[10px] text-slate-400">Configure customized outreach templates and scripts</p>
                      </div>
                      {isEditingPlaybook && (
                        <ExtrudedButton
                          size="sm"
                          className="bg-gradient-to-r from-violet-600 to-pink-600 text-white font-bold h-8 text-xs"
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(playbookTemplate, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${selectedIcpProfileId}-playbook.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" /> Export JSON
                        </ExtrudedButton>
                      )}
                    </div>

                    {!isEditingPlaybook ? (
                      <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center space-y-3">
                        <BookOpen className="h-10 w-10 opacity-30 text-teal-400 animate-pulse" />
                        <p className="text-xs">Select an ICP Profile card above to generate and edit the playbook template</p>
                        <ExtrudedButton size="sm" className="bg-teal-600 hover:bg-teal-500" onClick={() => handleGeneratePlaybook(selectedIcpProfileId)}>
                          Generate Default Playbook
                        </ExtrudedButton>
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs">
                        <div className="space-y-1.5">
                          <Label className="text-slate-300 font-bold">1. Go-to-Market (GTM) Tactics</Label>
                          <Textarea
                            value={playbookTemplate.gtmTactics}
                            onChange={(e) => setPlaybookTemplate({ ...playbookTemplate, gtmTactics: e.target.value })}
                            rows={4}
                            className="bg-slate-950 border-slate-800 text-slate-300 leading-normal"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-300 font-bold">2. Outreach Strategies & Scripts</Label>
                          <Textarea
                            value={playbookTemplate.outreachScripts}
                            onChange={(e) => setPlaybookTemplate({ ...playbookTemplate, outreachScripts: e.target.value })}
                            rows={6}
                            className="bg-slate-950 border-slate-800 text-slate-300 font-mono leading-normal"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-slate-300 font-bold">3. BANT Qualifying Criteria</Label>
                          <Textarea
                            value={playbookTemplate.qualifyingCriteria}
                            onChange={(e) => setPlaybookTemplate({ ...playbookTemplate, qualifyingCriteria: e.target.value })}
                            rows={4}
                            className="bg-slate-950 border-slate-800 text-slate-300 leading-normal"
                          />
                        </div>

                        <div className="pt-2">
                          <ExtrudedButton
                            className="w-full bg-teal-600 hover:bg-teal-500 font-bold text-xs"
                            onClick={() => {
                              showToast("success", "Playbook Saved", "ICP playbook template changes have been updated successfully.");
                            }}
                          >
                            Save Playbook Template
                          </ExtrudedButton>
                        </div>
                      </div>
                    )}
                  </div>
                </GlassPanel>

                {/* Live Channel Fit & Tactics Recommendations nested next to it */}
                <div className="space-y-4">
                  <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-xl space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-200">Playbook Live Recommendations</h4>
                    <p className="text-[10px] text-slate-400">Dynamically scored channels mapping to the active ICP parameters</p>
                  </div>
                  <MarketingStrategyModule
                    initialIcpData={{
                      industry: DEMO_ICP_PROFILES.find(p => p.id === selectedIcpProfileId)?.industry || "Software",
                      companySize: DEMO_ICP_PROFILES.find(p => p.id === selectedIcpProfileId)?.companySize || "10-100",
                      geography: DEMO_ICP_PROFILES.find(p => p.id === selectedIcpProfileId)?.geography || "US",
                      businessModel: "b2b"
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "voice-whatsapp" && (
            <div className="space-y-6">
              {/* Settings configuration form */}
              <GlassPanel tilt={false} className="border-slate-850 p-5 rounded-2xl">
                <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-slate-850 pb-5 mb-5">
                  <CardTitle className="text-slate-100 font-black text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-teal-400" />
                    System Configuration
                  </CardTitle>
                  <ExtrudedButton
                    className="bg-teal-600 hover:bg-teal-700 text-xs font-bold h-9 gap-1.5"
                    onClick={handleSaveSettings}
                    disabled={isSavingSettings}
                  >
                    {isSavingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Save Config
                  </ExtrudedButton>
                </CardHeader>

                <CardContent className="p-0 space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold uppercase">Agent Caller ID Prefix</label>
                    <div className="flex gap-2">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="h-10 px-4 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center gap-2 min-w-[120px]"
                        >
                          <span className="font-mono">{selectedCountry.prefix}</span>
                          <ChevronDown className="h-3.5 w-3.5 ml-auto text-slate-500" />
                        </button>
                        {showCountryDropdown && (
                          <div className="absolute top-11 left-0 z-50 w-60 bg-slate-900 border border-slate-850 rounded-xl shadow-2xl p-1">
                            <Input
                              value={countrySearch}
                              onChange={(e) => setCountrySearch(e.target.value)}
                              placeholder="Search country..."
                              className="bg-slate-950 border-slate-850 text-[11px] h-8 mb-1 py-1 px-3"
                            />
                            <div className="max-h-40 overflow-y-auto">
                              {filteredCountries.map(c => (
                                <button
                                  key={c.code}
                                  onClick={() => {
                                    setSelectedCountry(c);
                                    setShowCountryDropdown(false);
                                    setPhoneInput("");
                                  }}
                                  className="w-full text-left px-3 py-2 text-[11px] font-medium hover:bg-slate-850 rounded-lg text-slate-300 hover:text-white"
                                >
                                  {c.name} ({c.prefix})
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <Input
                        placeholder={selectedCountry.placeholder}
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(formatPhoneNumber(e.target.value, selectedCountry.mask))}
                        className="bg-slate-950 border-slate-850 text-xs rounded-xl h-10 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold uppercase">Voice Conversation Framework</label>
                    <Textarea
                      value={callFramework}
                      onChange={(e) => setCallFramework(e.target.value)}
                      placeholder="Enter conversational directives..."
                      rows={5}
                      className="bg-slate-950 border-slate-850 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold uppercase">WhatsApp Message Framework</label>
                    <Textarea
                      value={whatsAppParams}
                      onChange={(e) => setWhatsAppParams(e.target.value)}
                      placeholder="Specify WhatsApp templates..."
                      rows={4}
                      className="bg-slate-950 border-slate-850 text-xs rounded-xl"
                    />
                  </div>
                </CardContent>
              </GlassPanel>
            </div>
          )}

        </div>
      </main>
      <Unibox />
    </div>
  );
}

export default function AgentPortal() {
  return (
    <AuthProvider allowedRoles={["agent"]}>
      <React.Suspense fallback={
        <div className="flex items-center justify-center min-h-[50vh] immersive-scene">
          <div className="text-white text-sm font-semibold tracking-wide animate-pulse">Loading platform workspace...</div>
        </div>
      }>
        <AgentPortalContent />
      </React.Suspense>
    </AuthProvider>
  );
}
