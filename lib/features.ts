// lib/features.ts
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
  version: number;
  updatedAt: string;
  deployedBy?: string;
  deploymentNotes?: string;
}

export interface DeploymentEvent {
  id: string;
  featureId: string;
  version: number;
  timestamp: string;
  author: string;
  changes: string;
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
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "pipeline-view",
    name: "Unified Pipeline View",
    description: "Get a bird's-eye view of your entire sales pipeline with intuitive drag-and-drop management.",
    category: "Core Platform",
    iconName: "Layers",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
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
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "agent-brain",
    name: "Autonomous Agent Brain",
    description: "Advanced AI reasoning that handles complex decision-making during customer interactions.",
    category: "AI & Automation",
    iconName: "Bot",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "veritas-trust",
    name: "Veritas Trust Layer",
    description: "Security-first AI validation ensuring truthfulness, persona compliance, and length constraints.",
    category: "AI & Automation",
    iconName: "Shield",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  
  // Outreach & Communication
  {
    id: "voice-agent",
    name: "AI Voice Agents",
    description: "High-fidelity voice synthesis for natural-sounding sales calls and follow-ups.",
    category: "Outreach & Communication",
    iconName: "Phone",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "smart-email",
    name: "Smart Email Sequencing",
    description: "Dynamic email follow-ups that adapt based on recipient behavior and analysis.",
    category: "Outreach & Communication",
    iconName: "Mail",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "sms-automation",
    name: "SMS Engagement",
    description: "Automated text messaging to reach leads where they are most responsive.",
    category: "Outreach & Communication",
    iconName: "MessageSquare",
    status: "beta",
    version: 1,
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
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "roi-tracking",
    name: "ROI & Attribution",
    description: "Clear attribution and ROI estimates for every automated campaign and agent interaction.",
    category: "Analytics & Reporting",
    iconName: "BarChart",
    status: "active",
    version: 1,
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
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "immutable-logs",
    name: "Audit Logging",
    description: "Immutable logs for all system actions to ensure compliance and accountability.",
    category: "Security & Compliance",
    iconName: "Shield",
    status: "active",
    version: 1,
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
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  },
  {
    id: "calendar-integration",
    name: "Smart Scheduling",
    description: "Automatic meeting booking integrated directly with Google Calendar and Calendly.",
    category: "Integrations",
    iconName: "Calendar",
    status: "active",
    version: 1,
    updatedAt: "2024-04-28T00:00:00Z"
  }
];

// Helper to map icon names to Lucide components
export const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Zap, Shield, MessageSquare, TrendingUp, Users, Bot, Layers, Mail, Phone, BarChart, Settings, Lock, Workflow, Search, Bell, Calendar
  };
  return icons[iconName] || Settings;
};
