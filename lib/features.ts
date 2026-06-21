// Feature management and capability definitions
import { getGtmFeatureIcon } from "@/components/gtm/GtmIcons";

export type FeatureStatus = "active" | "beta" | "planned" | "deprecated";

export interface Feature {
  id: string;
  name: string;
  description: string;
  category: string;
  iconName: string;
  status: FeatureStatus;
  isNew?: boolean;
  updatedAt: string;
  version?: number;
}

export interface DeploymentEvent {
  id: string;
  featureId: string;
  type: "deploy" | "rollback" | "patch";
  status: "success" | "failure" | "in-progress";
  timestamp: string;
  version: number;
  author: string;
  changes?: string;
}

export const FEATURE_CATEGORIES = [
  "Core Platform",
  "AI & Automation",
  "Outreach & Communication",
  "Analytics & Reporting",
  "Security & Compliance",
  "Integrations",
];

export const FEATURES_COLLECTION = "features";
export const DEPLOYMENTS_COLLECTION = "deployments";

export const APP_FEATURES: Feature[] = [
  {
    id: "lead-intake",
    name: "Intelligent Lead Intake",
    description: "Multi-step intake forms with real-time validation and enrichment of lead data.",
    category: "Core Platform",
    iconName: "Workflow",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1,
  },
  {
    id: "pipeline-view",
    name: "Unified Pipeline View",
    description: "Get a bird's-eye view of your entire sales pipeline with intuitive drag-and-drop management.",
    category: "Core Platform",
    iconName: "Layers",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1,
  },
  {
    id: "ai-analysis",
    name: "AI-Powered GTM Analysis",
    description: "Analyze company websites to generate a complete GTM plan with ICPs, brand overview, outreach strategy, and journey pipeline.",
    category: "AI & Automation",
    iconName: "Zap",
    status: "active",
    isNew: true,
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1,
  },
  {
    id: "agent-brain",
    name: "Autonomous Agent Brain",
    description: "Advanced AI reasoning that handles complex decision-making during customer interactions.",
    category: "AI & Automation",
    iconName: "Bot",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1,
  },
  {
    id: "veritas-trust",
    name: "Agent Validation Layer",
    description: "Security-first AI validation ensuring truthfulness, persona compliance, and length constraints.",
    category: "AI & Automation",
    iconName: "Shield",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1,
  },
  {
    id: "smart-email",
    name: "Smart Email Sequencing",
    description: "Dynamic email follow-ups that adapt based on recipient behavior and analysis.",
    category: "Outreach & Communication",
    iconName: "Mail",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "sms-automation",
    name: "SMS Engagement",
    description: "Automated text messaging to reach leads where they are most responsive.",
    category: "Outreach & Communication",
    iconName: "MessageSquare",
    status: "beta",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "sentiment-analysis",
    name: "Sentiment & Tone Detection",
    description: "Analyze customer sentiment in real-time to adjust outreach strategies dynamically.",
    category: "Analytics & Reporting",
    iconName: "TrendingUp",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "roi-tracking",
    name: "ROI & Attribution",
    description: "Clear attribution and ROI estimates for every automated campaign and agent interaction.",
    category: "Analytics & Reporting",
    iconName: "BarChart",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "e2e-encryption",
    name: "Enterprise Encryption",
    description: "End-to-end encryption for all sensitive lead data and conversation transcripts.",
    category: "Security & Compliance",
    iconName: "Lock",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "immutable-logs",
    name: "Audit Logging",
    description: "Immutable logs for all system actions to ensure compliance and accountability.",
    category: "Security & Compliance",
    iconName: "Shield",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "crm-sync",
    name: "Bi-directional CRM Sync",
    description: "Seamless integration with Salesforce, HubSpot, and Pipedrive for real-time data sync.",
    category: "Integrations",
    iconName: "Workflow",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "calendar-integration",
    name: "Smart Scheduling",
    description: "Automatic meeting booking integrated directly with Google Calendar and Calendly.",
    category: "Integrations",
    iconName: "Calendar",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
  },
  {
    id: "pinecone-search",
    name: "Vector-Based Semantic Search",
    description:
      "Leverage semantic indexing to find similar leads, behavior patterns, and relevant historical context instantly.",
    category: "AI & Automation",
    iconName: "Search",
    status: "active",
    isNew: true,
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: "autonomous-scheduler",
    name: "Autonomous Meeting Scheduler",
    description: "AI agents that proactively book meetings on your calendar based on lead intent and availability.",
    category: "Integrations",
    iconName: "Calendar",
    status: "active",
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: "realtime-notifications",
    name: "Real-time Event Streams",
    description: "Get notified instantly when a lead engages, a call ends, or a new analysis is ready.",
    category: "Core Platform",
    iconName: "Bell",
    status: "active",
    updatedAt: "2024-05-01T00:00:00Z",
  },
  {
    id: "memory-palace",
    name: "AI Memory Palace",
    description:
      "A functional mapping of platform capabilities and system intelligence, focusing on operational outcomes.",
    category: "AI & Automation",
    iconName: "Layers",
    status: "active",
    isNew: true,
    updatedAt: "2024-05-03T00:00:00Z",
  },
  {
    id: "sms-notifications-premium",
    name: "SMS Notifications",
    description: "Instant transaction alerts, calendar summaries, and pre-call prep links sent directly to lead cellphones.",
    category: "Outreach & Communication",
    iconName: "MessageSquare",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 2,
  },
  {
    id: "otp-authentication-secure",
    name: "OTP Authentication",
    description: "Highly secure, Firestore-powered 6-digit verification codes to authenticate users and protect registration streams.",
    category: "Security & Compliance",
    iconName: "Lock",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "voice-call-alerts",
    name: "Voice Call Alerts",
    description: "Personalized outbound text-to-speech confirmation calls triggering on booking slots with phonetic Meet pronunciation.",
    category: "Outreach & Communication",
    iconName: "Phone",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "whatsapp-messaging",
    name: "WhatsApp Messaging",
    description: "Enterprise WhatsApp integration to reach international clients and sync outbound followups dynamically.",
    category: "Outreach & Communication",
    iconName: "Workflow",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "realtime-communication",
    name: "Real-time Communication",
    description: "Fully synchronized bi-directional communication channels that deliver messaging instantaneously across SMS, Email, and WhatsApp.",
    category: "Core Platform",
    iconName: "Bell",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 2,
  },
  {
    id: "delivery-status-tracking",
    name: "Delivery Status Tracking",
    description: "Continuous webhook callbacks tracking Twilio carrier-level delivery logs, update success rates, and errors in real-time.",
    category: "Analytics & Reporting",
    iconName: "TrendingUp",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "secure-twilio-integration",
    name: "Secure Twilio Integration",
    description: "State-of-the-art backend orchestration wrapping the Twilio Node SDK with retry policies, backoffs, and secure credentials.",
    category: "Security & Compliance",
    iconName: "Shield",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "automated-alerts-notifications",
    name: "Automated Alerts & Notifications",
    description: "Intelligent workflow rules scheduling event-driven confirmation sequences and fail-safe channel notifications automatically.",
    category: "AI & Automation",
    iconName: "Zap",
    status: "active",
    isNew: true,
    updatedAt: "2026-05-22T00:00:00Z",
    version: 1,
  },
  {
    id: "header-command-search",
    name: "Persistent Search Bar with Autocomplete",
    description: "Real-time, category-grouped search and autocomplete interface allowing quick navigation across platform capabilities and solutions.",
    category: "Core Platform",
    iconName: "Search",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-05T00:00:00Z",
    version: 1,
  },
  {
    id: "header-notification-center",
    name: "Unified Notification Center",
    description: "Real-time event notification stream displaying security alerts, sync status, and lead engagements with read/unread statuses.",
    category: "Core Platform",
    iconName: "Bell",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-05T00:00:00Z",
    version: 1,
  },
  {
    id: "header-favorites-quick-access",
    name: "Quick-Access Dropdown for Favorite Pages",
    description: "Customizable page bookmarking system with localStorage persistence to easily pin and switch between hot workspace views.",
    category: "Core Platform",
    iconName: "Star",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-05T00:00:00Z",
    version: 1,
  },
  {
    id: "header-theme-language",
    name: "Multi-Language & Theme Toggle Controls",
    description: "Responsive controls for switching color theme profiles and localizing app states across major international interfaces.",
    category: "Core Platform",
    iconName: "Globe",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-05T00:00:00Z",
    version: 1,
  },
  {
    id: "header-account-management",
    name: "Streamlined Account Management Menu",
    description: "Unified sign-in, profile navigation, and multi-role dashboard switching configured for secure enterprise portal systems.",
    category: "Security & Compliance",
    iconName: "User",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-05T00:00:00Z",
    version: 1,
  },
  {
    id: "fapo-autonomous-prompt-optimization",
    name: "Fully Autonomous Prompt Optimization (FAPO)",
    description: "AI-driven prompt optimization system that automatically generates, tests, and refines prompts to maximize accuracy, relevance, and performance across multiple LLM providers (Hugging Face, NVIDIA, KIMI, etc.).",
    category: "AI & Automation",
    iconName: "Sparkles",
    status: "active",
    isNew: true,
    updatedAt: "2026-06-21T00:00:00Z",
    version: 1,
  },
];

export const getIconComponent = (iconName: string) => getGtmFeatureIcon(iconName);


