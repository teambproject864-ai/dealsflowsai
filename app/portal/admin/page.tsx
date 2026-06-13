"use client";

import React, { useState, useEffect } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";
import {
  Users,
  Activity,
  BarChart3,
  MessageSquare,
  Phone,
  FileText,
  Download,
  Bell,
  Star,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoUsers,
  demoTasks,
  demoChatMessages,
  demoCallRecords,
  demoCustomerFeedback,
  demoAgentMetrics,
} from "@/lib/portal-demo-data";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import type { AgentSession, AgentAssignmentNotification } from "@/lib/types";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "agents", label: "Agents", icon: Users },
  { id: "interactions", label: "Interactions", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: BarChart3 },
] as const;

function AdminPortalContent() {
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("dashboard");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [agents, setAgents] = useState(demoUsers.filter(u => u.role === "agent"));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  
  // Get dynamic names from demo data
  const firstAgent = demoUsers.find(u => u.role === "agent");
  const secondAgent = demoUsers.find(u => u.role === "agent" && u.id !== firstAgent?.id);
  const firstCustomer = demoUsers.find(u => u.role === "customer");
  
  const [notifications] = useState<string[]>([
    `Agent ${firstAgent?.name || "Agent"} completed task #3`,
    `New feedback received from ${firstCustomer?.name || "Customer"}`,
    `Agent ${secondAgent?.name || "Agent"} started a new session`,
  ]);
  const [agentAssignments, setAgentAssignments] = useState<AgentAssignmentNotification[]>([]);
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Load real-time agent notifications from Firebase
  useEffect(() => {
    const notificationsQuery = query(
      collection(db, "agent_notifications"),
      orderBy("sentAt", "desc"),
      limit(20)
    );

    const unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      const newAssignments = snapshot.docs.map(doc => ({
        ...doc.data(),
        sessionId: doc.id,
      })) as AgentAssignmentNotification[];
      setAgentAssignments(newAssignments);
    });

    // Load real-time agent sessions from Firebase
    const sessionsQuery = query(
      collection(db, "agentSessions"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const newSessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AgentSession[];
      setAgentSessions(newSessions);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeSessions();
    };
  }, []);

  // Load agents from API
  useEffect(() => {
    const loadAgents = async () => {
      try {
        const res = await fetch("/api/admin/agents");
        const data = await res.json();
        if (data.success && data.agents.length > 0) {
          setAgents(data.agents);
        }
      } catch (error) {
        console.error("Failed to load agents:", error);
      }
    };
    loadAgents();
  }, []);

  const totalAgents = agents.length;
  const totalTasks = demoTasks.length;
  const completedTasks = demoTasks.filter((t) => t.status === "completed").length;
  const avgRating = demoCustomerFeedback.length
    ? (demoCustomerFeedback.reduce((sum, f) => sum + f.rating, 0) / demoCustomerFeedback.length).toFixed(1)
    : "0";

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setAgents([...agents, data.agent]);
        setShowCreateAgent(false);
        setFormData({ name: "", email: "", password: "" });
        setNotification({
          type: "success",
          title: "Agent Created",
          message: `${data.agent.name}'s account has been created successfully`,
        });
      } else {
        setNotification({
          type: "error",
          title: "Error",
          message: data.error || "Failed to create agent",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to create agent account",
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <GlassPanel tilt={false} depth="front" className={cn(
            "w-80 shadow-xl border",
            notification.type === "success" ? "border-green-500/30 bg-green-950/80" :
            notification.type === "error" ? "border-red-500/30 bg-red-950/80" :
            "border-blue-500/30 bg-blue-950/80"
          )}>
            <CardContent className="p-4 flex items-start gap-3">
              {notification.type === "success" ? <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5" /> :
               notification.type === "error" ? <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" /> :
               <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />}
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">{notification.title}</p>
                <p className="text-slate-300 text-xs mt-1">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </GlassPanel>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100">Administrator Dashboard</h1>
          <p className="text-slate-400 mt-2">Manage agents, track performance, and view feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <ExtrudedButton variant="outline" className="relative">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {(agentAssignments.length + notifications.length) > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white px-2 py-0.5 rounded-full">
                {agentAssignments.length + notifications.length}
              </span>
            )}
          </ExtrudedButton>
          <LogoutButton />
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <ExtrudedButton
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "bg-teal-600 hover:bg-teal-700" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </ExtrudedButton>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Create Agent Modal */}
        {showCreateAgent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <GlassPanel tilt={false} className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-100">Create New Agent</CardTitle>
                <button
                  className="text-slate-400 hover:text-white p-1"
                  onClick={() => setShowCreateAgent(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateAgent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent-name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="agent-name"
                      placeholder="Enter agent's full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="agent-email"
                      type="email"
                      placeholder="agent@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agent-password" className="text-slate-300">Password</Label>
                    <Input
                      id="agent-password"
                      type="password"
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <ExtrudedButton
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCreateAgent(false)}
                    >
                      Cancel
                    </ExtrudedButton>
                    <ExtrudedButton
                      type="submit"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      {isSubmitting ? "Creating..." : "Create Agent"}
                    </ExtrudedButton>
                  </div>
                </form>
              </CardContent>
            </GlassPanel>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Recent Agent Assignments */}
            {agentAssignments.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Recent Agent Assignments
                </h2>
                <div className="space-y-3">
                  {agentAssignments.map((assignment) => (
                    <GlassPanel key={assignment.sessionId} tilt={false} className="border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {assignment.agentKey} assigned to {assignment.companyName}
                            </h4>
                            <p className="text-sm text-slate-400">
                              Customer: {assignment.customerName} • {new Date(assignment.startedAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">
                            Active
                          </span>
                        </div>
                      </CardContent>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Total Agents</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-teal-400">{totalAgents}</p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Total Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-purple-400">{totalTasks}</p>
                  <p className="text-sm text-slate-500 mt-2">
                    {completedTasks} completed, {totalTasks - completedTasks} in progress
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Average Rating</CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <p className="text-5xl font-extrabold text-amber-400">{avgRating}</p>
                  <Star className="h-8 w-8 text-amber-400 fill-amber-400" />
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Total Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-green-400">{demoCustomerFeedback.length}</p>
                </CardContent>
              </GlassPanel>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <GlassPanel tilt={false} className="border-slate-700/50 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-slate-100 text-xl font-bold">Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-slate-700/40 border border-slate-700/30 rounded-xl">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100">{task.title}</h4>
                        <p className="text-sm text-slate-400 mt-1">
                          Assigned to: {demoUsers.find((u) => u.id === task.assignedAgentId)?.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                          task.status === "completed"
                            ? "bg-green-500/15 text-green-400"
                            : task.status === "in-progress"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-slate-500/15 text-slate-400"
                        )}>
                          {task.status}
                        </span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                          task.priority === "urgent"
                            ? "bg-red-500/15 text-red-400"
                            : task.priority === "high"
                            ? "bg-orange-500/15 text-orange-400"
                            : "bg-blue-500/15 text-blue-400"
                        )}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 text-xl font-bold">Recent Feedback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {demoCustomerFeedback.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-slate-700/40 border border-slate-700/30 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              "h-4 w-4",
                              star <= feedback.rating
                                ? "text-amber-400 fill-amber-400"
                                : "text-slate-500"
                            )}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-slate-300">{feedback.comment}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </GlassPanel>
            </div>
          </div>
        )}

        {activeTab === "agents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-100">Agent Management</h2>
              <ExtrudedButton
                className="bg-teal-600 hover:bg-teal-700 gap-2"
                onClick={() => setShowCreateAgent(true)}
              >
                <Plus className="h-4 w-4" />
                Add New Agent
              </ExtrudedButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => {
                const metrics = demoAgentMetrics.find((m) => m.agentId === agent.id);
                const agentTasks = demoTasks.filter((t) => t.assignedAgentId === agent.id);
                return (
                  <GlassPanel
                    key={agent.id}
                    tilt={true}
                    className={cn(
                      "cursor-pointer border-slate-700/50 hover:border-teal-500/50 transition-all",
                      selectedAgentId === agent.id ? "border-teal-500 shadow-lg shadow-teal-500/20" : ""
                    )}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-100 font-bold">{agent.name}</CardTitle>
                        <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse" />
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{agent.email}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500">Tasks Completed</p>
                          <p className="text-xl font-bold text-teal-400">
                            {metrics?.tasksCompleted || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Avg Rating</p>
                          <p className="text-xl font-bold text-amber-400">
                            {metrics?.averageRating.toFixed(1) || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Total Tasks</p>
                          <p className="text-xl font-bold text-purple-400">
                            {metrics?.totalTasks || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Interactions</p>
                          <p className="text-xl font-bold text-blue-400">
                            {metrics?.totalInteractions || 0}
                          </p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Active Tasks</h4>
                        <div className="space-y-1">
                          {agentTasks.slice(0, 2).map((task) => (
                            <div key={task.id} className="text-xs text-slate-400 flex items-center gap-2">
                              <div className={cn(
                                "h-2 w-2 rounded-full",
                                task.status === "in-progress" ? "bg-yellow-400" : "bg-blue-400"
                              )} />
                              {task.title}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                );
              })}
            </div>

            {selectedAgentId && (
              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-slate-100 font-bold">
                    {agents.find((u) => u.id === selectedAgentId)?.name} - Detailed Performance
                  </CardTitle>
                  <ExtrudedButton variant="outline" size="sm" onClick={() => setSelectedAgentId(null)}>
                    Close
                  </ExtrudedButton>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">Detailed performance metrics would be shown here.</p>
                </CardContent>
              </GlassPanel>
            )}
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <Phone className="h-5 w-5 text-teal-400" />
                    Call History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoCallRecords.map((call) => (
                    <div key={call.id} className="p-4 bg-slate-700/40 border border-slate-700/30 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold text-slate-100">
                            {call.callerName} → {call.receiverName}
                          </p>
                          <p className="text-sm text-slate-400 mt-1">
                            {new Date(call.startedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                            call.status === "completed"
                              ? "bg-green-500/15 text-green-400"
                              : "bg-red-500/15 text-red-400"
                          )}>
                            {call.status}
                          </span>
                          <p className="text-sm text-slate-400 mt-1.5">
                            {call.duration ? `${Math.round(call.duration / 60)} min` : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                    Chat Transcripts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {demoChatMessages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-slate-700/40 border border-slate-700/30 rounded-xl">
                      <p className="font-semibold text-slate-100">
                        {msg.senderName} ({msg.senderRole})
                      </p>
                      <p className="text-sm text-slate-300 mt-1">{msg.content}</p>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(msg.createdAt || msg.timestamp || "").toLocaleString()}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </GlassPanel>
            </div>
          </div>
        )}

        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold">Performance Report</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">Generate team performance reports.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <ExtrudedButton className="bg-teal-600 hover:bg-teal-700">
                      Generate Daily Report
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      Generate Weekly Report
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      Generate Monthly Report
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      Custom Range
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={false} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 font-bold">Export Data</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">Export portal data to various formats.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <ExtrudedButton variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Tasks (CSV)
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Feedback (CSV)
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Metrics (JSON)
                    </ExtrudedButton>
                    <ExtrudedButton variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Export Calls (JSON)
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPortal() {
  return (
    <AuthProvider allowedRoles={["admin"]}>
      <AdminPortalContent />
    </AuthProvider>
  );
}
