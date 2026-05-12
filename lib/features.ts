// Feature management and capability definitions
import { 
  Zap, 
  Shield, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Bot, 
  Layers, 
  Mail, 
  Phone, 
  BarChart, 
  Settings, 
  Lock,
  Workflow,
  Search,
  Bell,
  Calendar
} from "lucide-react";

export type FeatureStatus = 'active' | 'beta' | 'planned' | 'deprecated';

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
  type: 'deploy' | 'rollback' | 'patch';
  status: 'success' | 'failure' | 'in-progress';
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
  "Integrations"
];

export const FEATURES_COLLECTION = 'features';
export const DEPLOYMENTS_COLLECTION = 'deployments';

export const APP_FEATURES: Feature[] = [
  // Core Platform
  {
    id: "lead-intake",
    name: "Intelligent Lead Intake",
    description: "Multi-step intake forms with real-time validation and enrichment of lead data.",
    category: "Core Platform",
    iconName: "Workflow",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1
  },
  {
    id: "pipeline-view",
    name: "Unified Pipeline View",
    description: "Get a bird's-eye view of your entire sales pipeline with intuitive drag-and-drop management.",
    category: "Core Platform",
    iconName: "Layers",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1
  },
  
  // AI & Automation
  {
    id: "ai-analysis",
    name: "AI-Powered GTM Analysis",
    description: "Automatically analyze lead profiles to identify pain points, missed revenue, and stack gaps.",
    category: "AI & Automation",
    iconName: "Zap",
    status: "active",
    isNew: true,
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1
  },
  {
    id: "agent-brain",
    name: "Autonomous Agent Brain",
    description: "Advanced AI reasoning that handles complex decision-making during customer interactions.",
    category: "AI & Automation",
    iconName: "Bot",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1
  },
  {
    id: "veritas-trust",
    name: "Agent Validation Layer",
    description: "Security-first AI validation ensuring truthfulness, persona compliance, and length constraints.",
    category: "AI & Automation",
    iconName: "Shield",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z",
    version: 1
  },
  
  // Outreach & Communication
  {
    id: "voice-agent",
    name: "AI Voice Agents",
    description: "High-fidelity voice synthesis for natural-sounding sales calls and follow-ups.",
    category: "Outreach & Communication",
    iconName: "Phone",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "smart-email",
    name: "Smart Email Sequencing",
    description: "Dynamic email follow-ups that adapt based on recipient behavior and analysis.",
    category: "Outreach & Communication",
    iconName: "Mail",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "sms-automation",
    name: "SMS Engagement",
    description: "Automated text messaging to reach leads where they are most responsive.",
    category: "Outreach & Communication",
    iconName: "MessageSquare",
    status: "beta",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  
  // Analytics & Reporting
  {
    id: "sentiment-analysis",
    name: "Sentiment & Tone Detection",
    description: "Analyze customer sentiment in real-time to adjust outreach strategies dynamically.",
    category: "Analytics & Reporting",
    iconName: "TrendingUp",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "roi-tracking",
    name: "ROI & Attribution",
    description: "Clear attribution and ROI estimates for every automated campaign and agent interaction.",
    category: "Analytics & Reporting",
    iconName: "BarChart",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  
  // Security & Compliance
  {
    id: "e2e-encryption",
    name: "Enterprise Encryption",
    description: "End-to-end encryption for all sensitive lead data and conversation transcripts.",
    category: "Security & Compliance",
    iconName: "Lock",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "immutable-logs",
    name: "Audit Logging",
    description: "Immutable logs for all system actions to ensure compliance and accountability.",
    category: "Security & Compliance",
    iconName: "Shield",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  
  // Integrations
  {
    id: "crm-sync",
    name: "Bi-directional CRM Sync",
    description: "Seamless integration with Salesforce, HubSpot, and Pipedrive for real-time data sync.",
    category: "Integrations",
    iconName: "Workflow",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "calendar-integration",
    name: "Smart Scheduling",
    description: "Automatic meeting booking integrated directly with Google Calendar and Calendly.",
    category: "Integrations",
    iconName: "Calendar",
    status: "active",
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "pinecone-search",
    name: "Vector-Based Semantic Search",
    description: "Leverage semantic indexing to find similar leads, behavior patterns, and relevant historical context instantly.",
    category: "AI & Automation",
    iconName: "Search",
    status: "active",
    isNew: true,
    updatedAt: "2024-05-01T00:00:00Z"
  },
  {
    id: "autonomous-scheduler",
    name: "Autonomous Meeting Scheduler",
    description: "AI agents that proactively book meetings on your calendar based on lead intent and availability.",
    category: "Integrations",
    iconName: "Calendar",
    status: "active",
    updatedAt: "2024-05-01T00:00:00Z"
  },
  {
    id: "realtime-notifications",
    name: "Real-time Event Streams",
    description: "Get notified instantly when a lead engages, a call ends, or a new analysis is ready.",
    category: "Core Platform",
    iconName: "Bell",
    status: "active",
    updatedAt: "2024-05-01T00:00:00Z"
  },
  {
    id: "memory-palace",
    name: "AI Memory Palace",
    description: "A functional mapping of platform capabilities and system intelligence, focusing on operational outcomes.",
    category: "AI & Automation",
    iconName: "Layers",
    status: "active",
    isNew: true,
    updatedAt: "2024-05-03T00:00:00Z"
  }
];

// Helper to map icon names to Lucide components
export const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Zap, Shield, MessageSquare, TrendingUp, Users, Bot, Layers, Mail, Phone, BarChart, Settings, Lock, Workflow, Search, Bell, Calendar
  };
  return icons[iconName] || Settings;
};
