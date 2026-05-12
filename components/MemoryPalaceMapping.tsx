"use client";

import { motion } from "framer-motion";
import { 
  Layout, 
  Server, 
  Database, 
  UserCircle, 
  Zap, 
  Search, 
  Shield, 
  Bot, 
  Layers, 
  Workflow 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MAPPING_DATA = [
  {
    category: "Interface Capabilities",
    icon: Layout,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    items: [
      { name: "Dynamic Information Capture", desc: "Collects and processes initial organization data", outcome: "Optimized onboarding" },
      { name: "Performance Visualization", desc: "Displays impact and strategic value metrics", outcome: "Actionable insights" },
      { name: "Interactive Communication", desc: "Enables direct engagement with logic systems", outcome: "Real-time collaboration" },
      { name: "Activity Monitoring", desc: "Oversees active engagements and operations", outcome: "Operational transparency" },
      { name: "Strategic Mapping", desc: "Aligns challenges with proposed solutions", outcome: "Value-driven strategy" }
    ]
  },
  {
    category: "Logic & Services",
    icon: Server,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
    items: [
      { name: "Decision Engine", desc: "Processes complex reasoning for interactions", outcome: "Autonomous operations" },
      { name: "Validation Layer", desc: "Ensures accuracy and adherence to standards", outcome: "System trust" },
      { name: "Lifecycle Management", desc: "Handles the end-to-end operational flow", outcome: "Seamless execution" },
      { name: "Knowledge Retrieval", desc: "Accesses and applies relevant information", outcome: "Contextual relevance" },
      { name: "Outcome Processing", desc: "Synthesizes data into final results", outcome: "Detailed reporting" }
    ]
  },
  {
    category: "Data Integrity",
    icon: Database,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    items: [
      { name: "Organization Records", desc: "Maintains comprehensive profile details", outcome: "Data persistence" },
      { name: "Strategic Assessments", desc: "Stores analysis results and findings", outcome: "Historical context" },
      { name: "Contextual Learning", desc: "Preserves operational experiences", outcome: "Adaptive intelligence" },
      { name: "Engagement Metadata", desc: "Tracks interaction status and history", outcome: "Audit readiness" },
      { name: "Information Streams", desc: "Logs real-time operational events", outcome: "Event traceability" }
    ]
  },
  {
    category: "Functional Flows",
    icon: UserCircle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    items: [
      { name: "System Initialization", desc: "Starts the primary information gathering", outcome: "Ready for analysis" },
      { name: "Logic Configuration", desc: "Sets the parameters for autonomous action", outcome: "Tailored execution" },
      { name: "Operational Oversight", desc: "Provides real-time visibility into logic", outcome: "Active control" },
      { name: "Engagement Booking", desc: "Facilitates direct human interaction", outcome: "Pipeline growth" },
      { name: "Resource Management", desc: "Handles the ingestion of knowledge assets", outcome: "Expanded capabilities" }
    ]
  }
];

export function MemoryPalaceMapping() {
  return (
    <div className="space-y-12 py-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-400">
          <Layers className="h-4 w-4" />
          <span>Platform Overview</span>
        </div>
        <h2 className="text-4xl font-bold text-white">The AI Memory Palace</h2>
        <p className="text-muted-foreground">
          A high-level functional mapping of platform capabilities, focusing on operational outcomes and system intelligence.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {MAPPING_DATA.map((section, idx) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="bg-white/5 border-white/10 h-full">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className={`p-3 rounded-xl ${section.bg} ${section.color}`}>
                  <section.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-white">{section.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {section.items.map((item) => (
                    <div key={item.name} className="flex flex-col gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-white group-hover:text-violet-400 transition-colors">
                          {item.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] opacity-50">
                          {item.outcome}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Operational Flow */}
      <Card className="bg-gradient-to-br from-violet-600/10 to-blue-600/10 border-violet-500/20 p-8">
        <div className="grid md:grid-cols-3 gap-8 items-center text-center">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
              <Zap className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-white">Capture</h4>
            <p className="text-xs text-muted-foreground">Information Gathering → Profiling → Logic Assessment</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Bot className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-white">Execute</h4>
            <p className="text-xs text-muted-foreground">Action Trigger → Autonomous Reasoning → Outcome Validation</p>
          </div>
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="font-bold text-white">Persist</h4>
            <p className="text-xs text-muted-foreground">Continuous Learning → History Maintenance → Knowledge Expansion</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
