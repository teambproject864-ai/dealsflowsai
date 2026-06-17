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
  ClipboardList,
  UserPlus,
  UserX,
  FolderOpen,
  Check,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoUsers,
  demoTasks,
  demoChatMessages,
  demoCallRecords,
  demoCustomerFeedback,
  demoAgentMetrics,
  demoRequirements,
  demoGTMReports,
  demoCustomerGTMData,
  demoCustomers,
  demoCustomerResignations,
  demoDocuments,
  demoAuditLogs,
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
import { db, getDb } from "@/lib/firebase-client";
import { type AgentSession, type AgentAssignmentNotification, getRevenueAgentCatalog, AGENT_FULL_NAMES } from "@/lib/types";
import { type AuditLogEntry } from "@/lib/portal-types";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: Activity },
  { id: "llm-manager", label: "LLM Manager", icon: BarChart3 },
  { id: "bot-monitor", label: "Bot Monitor", icon: Phone },
  { id: "tasks", label: "Tasks", icon: ClipboardList },
  { id: "customers", label: "Customers", icon: Users },
  { id: "resignations", label: "Resignations", icon: UserX },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "requirements", label: "Requirements", icon: FileText },
  { id: "gtm-reports", label: "GTM Reports", icon: BarChart3 },
  { id: "agents", label: "Agents", icon: UserPlus },
  { id: "interactions", label: "Interactions", icon: MessageSquare },
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
  const [requirements, setRequirements] = useState(demoRequirements);
  const [gtmReports, setGtmReports] = useState(demoGTMReports);
  const [customerGTMData, setCustomerGTMData] = useState(demoCustomerGTMData);
  const [showReassignReqModal, setShowReassignReqModal] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [addingAgentFromReassign, setAddingAgentFromReassign] = useState(false);
  
  // Tasks state
  const [tasks, setTasks] = useState(demoTasks);
  const [taskSearch, setTaskSearch] = useState("");
  const [filterTaskStatus, setFilterTaskStatus] = useState("all");
  const [filterTaskPriority, setFilterTaskPriority] = useState("all");
  const [filterTaskAssignee, setFilterTaskAssignee] = useState("all");
  
  // Customers state
  const [customers, setCustomers] = useState(demoCustomers);
  const [customerSearch, setCustomerSearch] = useState("");
  const [filterCustomerStatus, setFilterCustomerStatus] = useState("all");
  const [showOnboardCustomer, setShowOnboardCustomer] = useState(false);
  const [onboardFormData, setOnboardFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    industry: "",
    assignedAgentId: "",
    serviceConfigs: {
      gtmReports: true,
      leadScoring: false,
      aiCalls: false,
    },
  });
  
  // Resignations state
  const [resignations, setResignations] = useState(demoCustomerResignations);
  const [showProcessResignation, setShowProcessResignation] = useState(false);
  const [selectedResignationCustomer, setSelectedResignationCustomer] = useState<string | null>(null);
  const [resignationFormData, setResignationFormData] = useState({
    requestDate: new Date().toISOString().split("T")[0],
    effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    terminationReason: "",
    notes: "",
  });
  
  // Documents state
  const [documents, setDocuments] = useState(demoDocuments);
  const [documentSearch, setDocumentSearch] = useState("");
  const [filterDocumentType, setFilterDocumentType] = useState("all");
  
  // Audit logs
  const [localAuditLogs, setLocalAuditLogs] = useState(demoAuditLogs);
  
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

  const [leads, setLeads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignLeadId, setReassignLeadId] = useState<string | null>(null);
  const [reassigning, setReassigning] = useState(false);
  const [selectedNewAgentKey, setSelectedNewAgentKey] = useState<string>("");
  
  // Search & Filters state
  const [reqSearch, setReqSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      if (data.success) {
        setLeads(data.leads);
      }
    } catch (error) {
      console.error("Failed to load leads:", error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to load audit logs:", error);
    }
  };
  
  const addAuditLog = (actionType: AuditLogEntry["actionType"], actionDetails: string, targetId?: string, targetType?: string) => {
    const newLog = {
      id: `audit-${Date.now()}`,
      actionType,
      actionDetails,
      performedBy: "demo-admin-1",
      performedByRole: "admin",
      targetId,
      targetType,
      createdAt: new Date().toISOString(),
    };
    setLocalAuditLogs([newLog, ...localAuditLogs]);
  };

  useEffect(() => {
    fetchLeads();
    fetchAuditLogs();
  }, []);

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignLeadId || !selectedNewAgentKey) return;
    setReassigning(true);
    try {
      const res = await fetch("/api/admin/reassign-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: reassignLeadId, newAgentKey: selectedNewAgentKey }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({
          type: "success",
          title: "Agent Reassigned",
          message: `Successfully reassigned to ${data.newAgentName}`,
        });
        setShowReassignModal(false);
        setReassignLeadId(null);
        setSelectedNewAgentKey("");
        fetchLeads();
        fetchAuditLogs();
      } else {
        setNotification({
          type: "error",
          title: "Reassignment Failed",
          message: data.error || "Failed to reassign agent",
        });
      }
    } catch (error) {
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to connect to server for reassignment",
      });
    } finally {
      setReassigning(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleReassignReq = (reqId: string) => {
    setSelectedReqId(reqId);
    setShowReassignReqModal(true);
  };

  const confirmReassignReq = (newAgentId: string) => {
    const agent = agents.find(a => a.id === newAgentId);
    setRequirements(requirements.map(req => {
      if (req.id === selectedReqId) {
        return {
          ...req,
          assignedAgentId: newAgentId,
          assignedAgentName: agent?.name,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
    setShowReassignReqModal(false);
    setSelectedReqId(null);
    setNotification({
      type: "success",
      title: "Agent Reassigned",
      message: `Requirement reassigned to ${agent?.name}`,
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleUpdateReqStatus = (reqId: string, newStatus: string) => {
    setRequirements(requirements.map(req => {
      if (req.id === reqId) {
        return { ...req, status: newStatus as any, updatedAt: new Date().toISOString() };
      }
      return req;
    }));
    setNotification({
      type: "success",
      title: "Status Updated",
      message: "Requirement status has been updated",
    });
    setTimeout(() => setNotification(null), 5000);
  };

  const autoAssignReq = (reqId: string) => {
    // Auto-assign based on workload - pick the agent with the least requirements
    const agentWorkloads = new Map();
    agents.forEach(agent => {
      const agentReqs = requirements.filter(r => r.assignedAgentId === agent.id);
      agentWorkloads.set(agent.id, agentReqs.length);
    });
    
    let bestAgent: typeof agents[0] | undefined;
    let minWorkload = Infinity;
    agents.forEach(agent => {
      const workload = agentWorkloads.get(agent.id) || 0;
      if (workload < minWorkload) {
        minWorkload = workload;
        bestAgent = agent;
      }
    });

    if (bestAgent) {
      setRequirements(requirements.map(req => {
        if (req.id === reqId) {
          return {
            ...req,
            assignedAgentId: bestAgent!.id,
            assignedAgentName: bestAgent!.name,
            status: "In Progress" as const,
            updatedAt: new Date().toISOString(),
          };
        }
        return req;
      }));
      setNotification({
        type: "success",
        title: "Agent Assigned",
        message: `Requirement auto-assigned to ${bestAgent.name}`,
      });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  // Load real-time agent notifications from Firebase (only if configured)
  useEffect(() => {
    const firestore = getDb();
    if (!firestore) {
      console.log("[Admin Portal] Firebase not configured, skipping real-time updates");
      return;
    }

    const notificationsQuery = query(
      collection(firestore, "agent_notifications"),
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
      collection(firestore, "agentSessions"),
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
        
        // If adding agent from reassign modal, assign new agent to selected requirement
        if (addingAgentFromReassign && selectedReqId) {
          setRequirements(requirements.map(req => {
            if (req.id === selectedReqId) {
              return {
                ...req,
                assignedAgentId: data.agent.id,
                assignedAgentName: data.agent.name,
                updatedAt: new Date().toISOString(),
              };
            }
            return req;
          }));
          setShowReassignReqModal(false);
          setSelectedReqId(null);
          setAddingAgentFromReassign(false);
          setNotification({
            type: "success",
            title: "Agent Created & Assigned",
            message: `${data.agent.name}'s account created and assigned to requirement`,
          });
        } else {
          setNotification({
            type: "success",
            title: "Agent Created",
            message: `${data.agent.name}'s account has been created successfully`,
          });
        }
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
  
  // Task handlers
  const handleUpdateTaskStatus = (taskId: string, newStatus: any) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task));
    addAuditLog("task_update", `Updated task ${taskId} status to ${newStatus}`, taskId, "task");
    setNotification({ type: "success", title: "Task Updated", message: "Task status has been updated" });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Customer onboarding handler
  const handleOnboardCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer = {
      id: `customer-${Date.now()}`,
      name: onboardFormData.name,
      email: onboardFormData.email,
      phone: onboardFormData.phone,
      companyName: onboardFormData.companyName,
      industry: onboardFormData.industry,
      status: "onboarding" as const,
      assignedAgentId: onboardFormData.assignedAgentId || undefined,
      assignedAgentName: agents.find(a => a.id === onboardFormData.assignedAgentId)?.name,
      serviceConfigurations: onboardFormData.serviceConfigs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCustomers([newCustomer, ...customers]);
    addAuditLog("customer_onboard", `Onboarded new customer: ${onboardFormData.name}`, newCustomer.id, "customer");
    setShowOnboardCustomer(false);
    setOnboardFormData({
      name: "",
      email: "",
      phone: "",
      companyName: "",
      industry: "",
      assignedAgentId: "",
      serviceConfigs: {
        gtmReports: true,
        leadScoring: false,
        aiCalls: false,
      },
    });
    setNotification({ type: "success", title: "Customer Onboarded", message: `${onboardFormData.name} has been onboarded successfully` });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Resignation handlers
  const handleInitiateResignation = (customerId: string) => {
    setSelectedResignationCustomer(customerId);
    setShowProcessResignation(true);
  };
  
  const handleProcessResignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResignationCustomer) return;
    const customer = customers.find(c => c.id === selectedResignationCustomer);
    if (!customer) return;
    
    const newResignation = {
      id: `resign-${Date.now()}`,
      customerId: selectedResignationCustomer,
      customerName: customer.name,
      requestDate: resignationFormData.requestDate,
      effectiveDate: resignationFormData.effectiveDate,
      terminationReason: resignationFormData.terminationReason,
      notes: resignationFormData.notes,
      documentsArchived: true,
      accountClosed: true,
      processedBy: "demo-admin-1",
      processedAt: new Date().toISOString(),
    };
    
    setResignations([newResignation, ...resignations]);
    setCustomers(customers.map(c => c.id === selectedResignationCustomer ? { ...c, status: "resigned" as const, updatedAt: new Date().toISOString() } : c));
    addAuditLog("customer_resign", `Processed resignation for ${customer.name}`, selectedResignationCustomer, "customer");
    setShowProcessResignation(false);
    setSelectedResignationCustomer(null);
    setResignationFormData({
      requestDate: new Date().toISOString().split("T")[0],
      effectiveDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      terminationReason: "",
      notes: "",
    });
    setNotification({ type: "success", title: "Resignation Processed", message: `${customer.name}'s resignation has been processed` });
    setTimeout(() => setNotification(null), 5000);
  };
  
  // Document handler
  const handleDocumentAccess = (docId: string, docTitle: string) => {
    addAuditLog("document_access", `Accessed document: ${docTitle}`, docId, "document");
    setNotification({ type: "info", title: "Document Accessed", message: `You have accessed ${docTitle}` });
    setTimeout(() => setNotification(null), 5000);
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

        {/* Onboard Customer Modal */}
        {showOnboardCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <GlassPanel tilt={false} className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-100 font-bold">Onboard New Customer</CardTitle>
                <button
                  className="text-slate-400 hover:text-white p-1"
                  onClick={() => setShowOnboardCustomer(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOnboardCustomer} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer-name" className="text-slate-300">Customer Name</Label>
                    <Input
                      id="customer-name"
                      placeholder="Enter customer's full name"
                      value={onboardFormData.name}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, name: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-email" className="text-slate-300">Email Address</Label>
                    <Input
                      id="customer-email"
                      type="email"
                      placeholder="customer@example.com"
                      value={onboardFormData.email}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, email: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-phone" className="text-slate-300">Phone Number</Label>
                    <Input
                      id="customer-phone"
                      placeholder="+1-555-123-4567"
                      value={onboardFormData.phone}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, phone: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-company" className="text-slate-300">Company Name</Label>
                    <Input
                      id="customer-company"
                      placeholder="Company Inc."
                      value={onboardFormData.companyName}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, companyName: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customer-industry" className="text-slate-300">Industry</Label>
                    <Input
                      id="customer-industry"
                      placeholder="e.g., SaaS, Fintech"
                      value={onboardFormData.industry}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, industry: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assigned-agent" className="text-slate-300">Assign Agent</Label>
                    <select
                      id="assigned-agent"
                      value={onboardFormData.assignedAgentId}
                      onChange={(e) => setOnboardFormData({ ...onboardFormData, assignedAgentId: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select an agent (optional)</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Service Configurations</Label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={onboardFormData.serviceConfigs.gtmReports}
                          onChange={(e) => setOnboardFormData({ 
                            ...onboardFormData, 
                            serviceConfigs: { ...onboardFormData.serviceConfigs, gtmReports: e.target.checked } 
                          })}
                          className="w-4 h-4 text-teal-600 bg-slate-800 border-slate-700 rounded focus:ring-teal-500"
                        />
                        <span className="text-slate-300 text-sm">GTM Reports</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={onboardFormData.serviceConfigs.leadScoring}
                          onChange={(e) => setOnboardFormData({ 
                            ...onboardFormData, 
                            serviceConfigs: { ...onboardFormData.serviceConfigs, leadScoring: e.target.checked } 
                          })}
                          className="w-4 h-4 text-teal-600 bg-slate-800 border-slate-700 rounded focus:ring-teal-500"
                        />
                        <span className="text-slate-300 text-sm">Lead Scoring</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={onboardFormData.serviceConfigs.aiCalls}
                          onChange={(e) => setOnboardFormData({ 
                            ...onboardFormData, 
                            serviceConfigs: { ...onboardFormData.serviceConfigs, aiCalls: e.target.checked } 
                          })}
                          className="w-4 h-4 text-teal-600 bg-slate-800 border-slate-700 rounded focus:ring-teal-500"
                        />
                        <span className="text-slate-300 text-sm">AI Calls</span>
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <ExtrudedButton
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowOnboardCustomer(false)}
                    >
                      Cancel
                    </ExtrudedButton>
                    <ExtrudedButton
                      type="submit"
                      className="flex-1 bg-teal-600 hover:bg-teal-700 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Onboard Customer
                    </ExtrudedButton>
                  </div>
                </form>
              </CardContent>
            </GlassPanel>
          </div>
        )}

        {/* Process Resignation Modal */}
        {showProcessResignation && selectedResignationCustomer && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <GlassPanel tilt={false} className="w-full max-w-lg bg-slate-900 border-slate-700 shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl text-slate-100 font-bold">Process Customer Resignation</CardTitle>
                <button
                  className="text-slate-400 hover:text-white p-1"
                  onClick={() => {
                    setShowProcessResignation(false);
                    setSelectedResignationCustomer(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProcessResignation} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resignation-request-date" className="text-slate-300">Request Date</Label>
                    <Input
                      id="resignation-request-date"
                      type="date"
                      value={resignationFormData.requestDate}
                      onChange={(e) => setResignationFormData({ ...resignationFormData, requestDate: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resignation-effective-date" className="text-slate-300">Effective Date</Label>
                    <Input
                      id="resignation-effective-date"
                      type="date"
                      value={resignationFormData.effectiveDate}
                      onChange={(e) => setResignationFormData({ ...resignationFormData, effectiveDate: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resignation-reason" className="text-slate-300">Termination Reason</Label>
                    <Input
                      id="resignation-reason"
                      placeholder="Reason for resignation"
                      value={resignationFormData.terminationReason}
                      onChange={(e) => setResignationFormData({ ...resignationFormData, terminationReason: e.target.value })}
                      className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resignation-notes" className="text-slate-300">Additional Notes</Label>
                    <textarea
                      id="resignation-notes"
                      placeholder="Any additional notes..."
                      value={resignationFormData.notes}
                      onChange={(e) => setResignationFormData({ ...resignationFormData, notes: e.target.value })}
                      className="w-full bg-slate-850/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <ExtrudedButton
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowProcessResignation(false);
                        setSelectedResignationCustomer(null);
                      }}
                    >
                      Cancel
                    </ExtrudedButton>
                    <ExtrudedButton
                      type="submit"
                      className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Process Resignation
                    </ExtrudedButton>
                  </div>
                </form>
              </CardContent>
            </GlassPanel>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Real-time Audit logs */}
            {localAuditLogs.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-teal-400" />
                  Recent System Activity & Audit Trail
                </h2>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 mb-6">
                  {localAuditLogs.slice(0, 10).map((log) => (
                    <GlassPanel key={log.id} tilt={false} className="border-slate-800 bg-slate-900/40">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">
                              {log.actionDetails}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">
                              By: {log.performedBy} ({log.performedByRole}) • {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400">
                            Success
                          </span>
                        </div>
                      </CardContent>
                    </GlassPanel>
                  ))}
                </div>
              </div>
            )}

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

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-slate-100">Task Management</h2>
              
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap items-center w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Input
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    placeholder="Search tasks..."
                    className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                  />
                </div>
                <select
                  value={filterTaskStatus}
                  onChange={(e) => setFilterTaskStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
                <select
                  value={filterTaskPriority}
                  onChange={(e) => setFilterTaskPriority(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filterTaskAssignee}
                  onChange={(e) => setFilterTaskAssignee(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Assignees</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tasks Listing */}
            <div className="grid grid-cols-1 gap-4">
              {tasks
                .filter(task => {
                  const searchMatches = 
                    task.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                    task.description.toLowerCase().includes(taskSearch.toLowerCase());
                  const statusMatches = filterTaskStatus === "all" || task.status === filterTaskStatus;
                  const priorityMatches = filterTaskPriority === "all" || task.priority === filterTaskPriority;
                  const assigneeMatches = filterTaskAssignee === "all" || task.assignedAgentId === filterTaskAssignee;
                  return searchMatches && statusMatches && priorityMatches && assigneeMatches;
                })
                .map((task) => (
                  <GlassPanel key={task.id} tilt={false} className="border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-100">{task.title}</h3>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                task.status === "completed"
                                  ? "bg-green-500/15 text-green-400"
                                  : task.status === "in-progress"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : task.status === "blocked"
                                  ? "bg-red-500/15 text-red-400"
                                  : "bg-slate-500/15 text-slate-400"
                              )}
                            >
                              {task.status}
                            </span>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                task.priority === "urgent"
                                  ? "bg-red-500/15 text-red-400"
                                  : task.priority === "high"
                                  ? "bg-orange-500/15 text-orange-400"
                                  : "bg-blue-500/15 text-blue-400"
                              )}
                            >
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-2">{task.description}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Assigned to: <strong>{demoUsers.find((u) => u.id === task.assignedAgentId)?.name}</strong><br/>
                            Created: {new Date(task.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {task.status !== "completed" && task.status !== "blocked" && (
                            <ExtrudedButton
                              className="bg-green-600 hover:bg-green-700 text-xs px-4 h-9 gap-1"
                              onClick={() => handleUpdateTaskStatus(task.id, "completed")}
                            >
                              <Check className="h-4 w-4" />
                              Complete
                            </ExtrudedButton>
                          )}
                          {task.status === "todo" && (
                            <ExtrudedButton
                              className="bg-yellow-600 hover:bg-yellow-700 text-xs px-4 h-9 gap-1"
                              onClick={() => handleUpdateTaskStatus(task.id, "in-progress")}
                            >
                              Start
                            </ExtrudedButton>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-slate-100">Customer Management</h2>
              <ExtrudedButton
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => setShowOnboardCustomer(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Onboard New Customer
              </ExtrudedButton>
              
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap items-center w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                  />
                </div>
                <select
                  value={filterCustomerStatus}
                  onChange={(e) => setFilterCustomerStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="resigned">Resigned</option>
                </select>
              </div>
            </div>

            {/* Customers Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customers
                .filter(customer => {
                  const searchMatches = 
                    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    customer.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
                    customer.companyName.toLowerCase().includes(customerSearch.toLowerCase());
                  const statusMatches = filterCustomerStatus === "all" || customer.status === filterCustomerStatus;
                  return searchMatches && statusMatches;
                })
                .map((customer) => (
                  <GlassPanel key={customer.id} tilt={false} className="border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-100">{customer.name}</h3>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                customer.status === "active"
                                  ? "bg-green-500/15 text-green-400"
                                  : customer.status === "onboarding"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-red-500/15 text-red-400"
                              )}
                            >
                              {customer.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{customer.companyName}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Email: {customer.email}<br/>
                            Phone: {customer.phone || "N/A"}<br/>
                            Industry: {customer.industry || "N/A"}<br/>
                            Agent: {customer.assignedAgentName || "Unassigned"}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {customer.status !== "resigned" && (
                            <ExtrudedButton
                              className="bg-red-600 hover:bg-red-700 text-xs px-4 h-9 gap-1"
                              onClick={() => handleInitiateResignation(customer.id)}
                            >
                              <UserX className="h-4 w-4" />
                              Process Resignation
                            </ExtrudedButton>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
            </div>
          </div>
        )}

        {/* Resignations Tab */}
        {activeTab === "resignations" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Customer Resignations</h2>

            {/* Resignations Listing */}
            <div className="grid grid-cols-1 gap-4">
              {resignations.map((resignation) => (
                <GlassPanel key={resignation.id} tilt={false} className="border-slate-700/50">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start flex-wrap gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-100">{resignation.customerName}</h3>
                        <p className="text-xs text-slate-400 mt-2">
                          Request Date: {new Date(resignation.requestDate).toLocaleDateString()}<br/>
                          Effective Date: {new Date(resignation.effectiveDate).toLocaleDateString()}<br/>
                          Reason: {resignation.terminationReason}
                        </p>
                        {resignation.notes && (
                          <p className="text-sm text-slate-300 mt-2">{resignation.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            resignation.documentsArchived
                              ? "bg-green-500/15 text-green-400"
                              : "bg-yellow-500/15 text-yellow-400"
                          )}>
                            {resignation.documentsArchived ? "Documents Archived" : "Pending Archive"}
                          </span>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            resignation.accountClosed
                              ? "bg-green-500/15 text-green-400"
                              : "bg-yellow-500/15 text-yellow-400"
                          )}>
                            {resignation.accountClosed ? "Account Closed" : "Pending Closure"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-slate-100">Document Repository</h2>
              
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap items-center w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Input
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    placeholder="Search documents..."
                    className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                  />
                </div>
                <select
                  value={filterDocumentType}
                  onChange={(e) => setFilterDocumentType(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="icp">ICP</option>
                  <option value="requirement">Requirements</option>
                  <option value="contract">Contracts</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Documents Listing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents
                .filter(doc => {
                  const searchMatches = 
                    doc.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
                    doc.description.toLowerCase().includes(documentSearch.toLowerCase());
                  const typeMatches = filterDocumentType === "all" || doc.documentType === filterDocumentType;
                  return searchMatches && typeMatches;
                })
                .map((doc) => (
                  <GlassPanel key={doc.id} tilt={false} className="border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-100">{doc.title}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-purple-500/15 text-purple-400">
                              {doc.documentType}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mt-1">{doc.description}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Access: {doc.accessRoles.join(", ")}<br/>
                            Created: {new Date(doc.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <ExtrudedButton
                            className="bg-teal-600 hover:bg-teal-700 text-xs px-4 h-9 gap-1"
                            onClick={() => handleDocumentAccess(doc.id, doc.title)}
                          >
                            <FolderOpen className="h-4 w-4" />
                            View Document
                          </ExtrudedButton>
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
            </div>
          </div>
        )}

        {/* LLM Manager Tab */}
        {activeTab === "llm-manager" && (
          <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-100">LLM Manager Dashboard</h2>
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <GlassPanel tilt={true} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-300 text-lg">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-extrabold text-teal-400">
                  {localAuditLogs.filter(log => log.actionType.startsWith("llm")).length + 10}
                </p>
              </CardContent>
            </GlassPanel>

            <GlassPanel tilt={true} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-300 text-lg">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-extrabold text-blue-400">$0.42</p>
              </CardContent>
            </GlassPanel>

            <GlassPanel tilt={true} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-300 text-lg">Avg Latency</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-extrabold text-amber-400">1.4s</p>
              </CardContent>
            </GlassPanel>

            <GlassPanel tilt={true} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-300 text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-5xl font-extrabold text-green-400">98.2%</p>
              </CardContent>
            </GlassPanel>
          </div>

          {/* Model Catalog */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-100">Available Models</h3>
              <ExtrudedButton className="bg-purple-600 hover:bg-purple-700" onClick={async () => {
                try {
                  const res = await fetch("/api/llm-manager/retrain", { method: "POST" });
                  const data = await res.json();
                  if (data.success) {
                    alert("Retraining initiated!");
                  }
                } catch (e) {
                  console.error(e);
                }
              }}>
                Retrain Model
              </ExtrudedButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: "1", name: "Gemma 4 31B", provider: "HuggingFace", score: "92" },
                { id: "2", name: "Llama 3.1 70B", provider: "HuggingFace", score: "95" },
                { id: "3", name: "Llama 3.1 70B", provider: "NVIDIA", score: "94" },
                { id: "4", name: "Mixtral 8x7B", provider: "NVIDIA", score: "88" },
              ].map(model => (
                <GlassPanel key={model.id} tilt={false} className="border-slate-700/50">
                  <CardContent className="p-6 space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-slate-100">{model.name}</h4>
                        <p className="text-xs text-slate-400">{model.provider}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Performance</p>
                        <p className="font-bold text-amber-400">{model.score}/100</p>
                      </div>
                    </div>
                  </CardContent>
                </GlassPanel>
              ))}
            </div>
          </div>

          {/* Recent Interactions */}
          <div>
            <h3 className="text-xl font-bold text-slate-100 mb-4">Recent Interactions</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {localAuditLogs.filter(log => log.actionType.startsWith("llm")).map(log => (
              <GlassPanel key={log.id} tilt={false} className="border-slate-800 bg-slate-900/40">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{log.actionDetails}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        By: {log.performedBy} • {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400">
                      {log.actionType}
                    </span>
                  </div>
                </CardContent>
              </GlassPanel>
            ))}
          </div>
        </div>
      </div>
      )}

        {/* Bot Monitor Tab */}
        {activeTab === "bot-monitor" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">Meeting Bot Monitor</h2>
            
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Total Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-teal-400">
                    {localAuditLogs.filter(log => log.actionType === "customer_onboard").length + 3}
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Successful Joins</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-green-400">
                    {localAuditLogs.filter(log => log.actionType === "customer_onboard").length + 2}
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Deal Closures</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-purple-400">
                    {localAuditLogs.filter(log => log.actionType === "customer_resign").length}
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-300 text-lg">Avg Join Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-amber-400">1.2s</p>
                </CardContent>
              </GlassPanel>
            </div>

            {/* Active Sessions */}
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-4">Active Bot Sessions</h3>
              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    id: "session-123",
                    callId: "call-456",
                    status: "in_meeting",
                    duration: "15m 30s",
                    participants: 3,
                    transcriptSegments: 42,
                  },
                  {
                    id: "session-789",
                    callId: "call-012",
                    status: "in_meeting",
                    duration: "8m 15s",
                    participants: 2,
                    transcriptSegments: 18,
                  },
                ].map((session) => (
                  <GlassPanel key={session.id} tilt={false} className="border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-100">
                              Call {session.callId}
                            </h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-green-500/15 text-green-400">
                              {session.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            Duration: {session.duration}<br />
                            Participants: {session.participants}<br />
                            Transcript Segments: {session.transcriptSegments}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <ExtrudedButton
                            className="bg-red-600 hover:bg-red-700 text-xs px-4 h-9 gap-1"
                          >
                            <X className="h-4 w-4" />
                            End Session
                          </ExtrudedButton>
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
              </div>
            </div>

            {/* Audit Logs */}
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-4">Bot Activity Logs</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {localAuditLogs.map((log) => (
                  <GlassPanel key={log.id} tilt={false} className="border-slate-800 bg-slate-900/40">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">
                            {log.actionDetails}
                          </h4>
                          <p className="text-xs text-slate-400 mt-1">
                            By: {log.performedBy} ({log.performedByRole}) • {new Date(log.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-400">
                          {log.actionType}
                        </span>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "requirements" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-slate-100">Customer Requirements</h2>
              
              {/* Search and Filters */}
              <div className="flex gap-3 flex-wrap items-center w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Input
                    value={reqSearch}
                    onChange={(e) => setReqSearch(e.target.value)}
                    placeholder="Search by customer or description..."
                    className="bg-slate-850/60 border-slate-700 focus:border-teal-500 text-white placeholder-slate-500 rounded-xl"
                  />
                </div>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Categories</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="Billing Issue">Billing Issue</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Requirements Listing */}
            <div className="grid grid-cols-1 gap-4">
              {requirements
                .filter(req => {
                  const searchMatches = 
                    req.customerName?.toLowerCase().includes(reqSearch.toLowerCase()) ||
                    req.description?.toLowerCase().includes(reqSearch.toLowerCase());
                  const categoryMatches = filterCategory === "all" || req.category === filterCategory;
                  const priorityMatches = filterPriority === "all" || req.priority === filterPriority;
                  const statusMatches = filterStatus === "all" || req.status === filterStatus;
                  return searchMatches && categoryMatches && priorityMatches && statusMatches;
                })
                .map((req) => (
                  <GlassPanel key={req.id} tilt={false} className="border-slate-700/50">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-start flex-wrap gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-bold text-slate-100">{req.category}</h3>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold",
                                req.priority === "Critical"
                                  ? "bg-red-500/15 text-red-400"
                                  : req.priority === "High"
                                  ? "bg-orange-500/15 text-orange-400"
                                  : req.priority === "Medium"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-green-500/15 text-green-400"
                              )}
                            >
                              {req.priority}
                            </span>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                                req.status === "Resolved"
                                  ? "bg-green-500/15 text-green-400"
                                  : req.status === "In Progress"
                                  ? "bg-yellow-500/15 text-yellow-400"
                                  : "bg-slate-500/15 text-slate-400"
                              )}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-2">
                            Customer: <strong>{req.customerName}</strong> ({req.requesterEmail})<br/>
                            Submitted: {new Date(req.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="bg-slate-800 border border-slate-750 px-4 py-2 rounded-xl text-right">
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Assigned Agent</p>
                            <p className="text-sm font-semibold text-slate-200 mt-0.5">
                              {req.assignedAgentName || "Unassigned"}
                            </p>
                          </div>
                          {!req.assignedAgentId && (
                            <ExtrudedButton
                              className="bg-teal-600 hover:bg-teal-700 text-xs px-4 h-9 gap-1"
                              onClick={() => autoAssignReq(req.id)}
                            >
                              Auto-Assign
                            </ExtrudedButton>
                          )}
                          {req.assignedAgentId && (
                            <ExtrudedButton
                              className="bg-teal-600 hover:bg-teal-700 text-xs px-4 h-9 gap-1"
                              onClick={() => handleReassignReq(req.id)}
                            >
                              Reassign Agent
                            </ExtrudedButton>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-slate-800 pt-4">
                        <p className="text-slate-300 mb-4">{req.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {req.status !== "Resolved" && req.status !== "Closed" && (
                            <>
                              <ExtrudedButton
                                className="bg-green-600 hover:bg-green-700 text-xs px-3 h-8 gap-1"
                                onClick={() => handleUpdateReqStatus(req.id, "Resolved")}
                              >
                                Mark Resolved
                              </ExtrudedButton>
                              {req.status === "Open" && (
                                <ExtrudedButton
                                  className="bg-yellow-600 hover:bg-yellow-700 text-xs px-3 h-8 gap-1"
                                  onClick={() => handleUpdateReqStatus(req.id, "In Progress")}
                                >
                                  Start Progress
                                </ExtrudedButton>
                              )}
                            </>
                          )}
                          {req.status === "Resolved" && (
                            <ExtrudedButton
                              className="bg-blue-600 hover:bg-blue-700 text-xs px-3 h-8 gap-1"
                              onClick={() => handleUpdateReqStatus(req.id, "Closed")}
                            >
                              Close
                            </ExtrudedButton>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
            </div>

            {/* Reassign Requirement Modal */}
            {showReassignReqModal && selectedReqId && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                <GlassPanel tilt={false} className="w-full max-w-md bg-slate-900 border-slate-700 shadow-2xl">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-xl text-slate-100 font-bold">Reassign Agent</CardTitle>
                    <button
                      className="text-slate-400 hover:text-white p-1"
                      onClick={() => {
                        setShowReassignReqModal(false);
                        setSelectedReqId(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Select New Agent</Label>
                        <select
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          onChange={(e) => {
                            if (e.target.value) {
                              confirmReassignReq(e.target.value);
                            }
                          }}
                        >
                          <option value="">Select Agent...</option>
                          {agents.map(agent => (
                            <option key={agent.id} value={agent.id}>{agent.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <ExtrudedButton
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setAddingAgentFromReassign(true);
                            setShowCreateAgent(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Agent
                        </ExtrudedButton>
                        <ExtrudedButton
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setShowReassignReqModal(false);
                            setSelectedReqId(null);
                          }}
                        >
                          Cancel
                        </ExtrudedButton>
                      </div>
                    </div>
                  </CardContent>
                </GlassPanel>
              </div>
            )}
          </div>
        )}

        {activeTab === "gtm-reports" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-100">GTM Analysis Reports</h2>
            
            {/* Customer-Submitted GTM Data */}
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4">Customer-Submitted GTM Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customerGTMData.map((data) => (
                  <GlassPanel key={data.id} tilt={true} className="border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-100 font-bold">
                          {demoUsers.find(u => u.id === data.customerId)?.name || "Customer"}'s Submission
                        </CardTitle>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted by {data.submittedBy} on {new Date(data.submittedAt).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(data.data).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-sm text-slate-400 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            <p className="text-slate-200">
                              {Array.isArray(value) ? value.join(", ") : value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
              </div>
            </div>

            {/* All GTM Reports */}
            <div>
              <h3 className="text-lg font-bold text-slate-100 mb-4">All GTM Reports</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {gtmReports.map((report) => (
                  <GlassPanel key={report.id} tilt={true} className="border-slate-700">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl text-slate-100 font-bold">
                          {demoUsers.find(u => u.id === report.customerId)?.name || "Customer"} - {report.reportName}
                        </CardTitle>
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold",
                            report.reportType === "internal"
                              ? "bg-blue-500/15 text-blue-400"
                              : "bg-green-500/15 text-green-400"
                          )}
                        >
                          {report.reportType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(report.dateRange.start).toLocaleDateString()} - {new Date(report.dateRange.end).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase tracking-wider">Lead Conversion</p>
                          <p className="text-2xl font-bold text-green-400">{report.leadConversionRate}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase tracking-wider">Market Penetration</p>
                          <p className="text-2xl font-bold text-blue-400">{report.marketPenetration}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase tracking-wider">Pipeline Value</p>
                          <p className="text-2xl font-bold text-purple-400">${report.pipelineValue.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400 text-xs uppercase tracking-wider">Campaign Effectiveness</p>
                          <p className="text-2xl font-bold text-amber-400">{report.campaignEffectiveness}%</p>
                        </div>
                      </div>
                      {report.region && <p className="text-sm text-slate-400 mb-1"><strong>Region:</strong> {report.region}</p>}
                      {report.segment && <p className="text-sm text-slate-400"><strong>Segment:</strong> {report.segment}</p>}
                      <div className="flex gap-2 mt-4">
                        <ExtrudedButton
                          className="bg-teal-600 hover:bg-teal-700"
                          onClick={() => {
                            const csv = [
                              ["Metric", "Value"],
                              ["Report Name", report.reportName],
                              ["Report Type", report.reportType],
                              ["Lead Conversion Rate", `${report.leadConversionRate}%`],
                              ["Market Penetration", `${report.marketPenetration}%`],
                              ["Pipeline Value", `$${report.pipelineValue.toLocaleString()}`],
                              ["Campaign Effectiveness", `${report.campaignEffectiveness}%`],
                              ["Region", report.region || "N/A"],
                              ["Segment", report.segment || "N/A"],
                            ].map(row => row.join(",")).join("\n");
                            const blob = new Blob([csv], { type: "text/csv" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${report.reportName.replace(/\s+/g, "_")}.csv`;
                            a.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Export CSV
                        </ExtrudedButton>
                      </div>
                    </CardContent>
                  </GlassPanel>
                ))}
              </div>
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
                        {new Date(msg.timestamp || "").toLocaleString()}
                      </p>
                    </div>
                  ))}
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
