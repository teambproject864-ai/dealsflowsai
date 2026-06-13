"use client";

import React, { useState, useRef } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassPanel, ExtrudedButton, StaggerReveal } from "@/components/immersive";
import {
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  demoUsers,
  demoTasks,
  demoChatMessages,
  demoAgentMetrics,
  demoAgentCredits,
} from "@/lib/portal-demo-data";
import type { TaskStatus, AgentCredits, FileAttachment } from "@/lib/types";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { Unibox } from "@/components/Unibox";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const tabs = [
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "calls", label: "Calls", icon: Phone },
  { id: "metrics", label: "My Metrics", icon: Star },
  { id: "credits", label: "Credits", icon: Zap },
] as const;

function AgentPortalContent() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("tasks");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newNote, setNewNote] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatMessages, setChatMessages] = useState([...demoChatMessages]);
  const [tasks, setTasks] = useState([...demoTasks]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotification, setShowNotification] = useState<{
    type: "success" | "error" | "info";
    title: string;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
              milestones: t.milestones.map((m) =>
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
          <p className="text-slate-400 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
          <div
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-lg shadow-xl border max-w-sm",
              showNotification.type === "success"
                ? "bg-green-900/90 border-green-600"
                : showNotification.type === "error"
                ? "bg-red-900/90 border-red-600"
                : "bg-blue-900/90 border-blue-600"
            )}
          >
            <div className="mt-0.5">
              {showNotification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-400" />
              ) : showNotification.type === "error" ? (
                <AlertCircle className="h-5 w-5 text-red-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white text-sm">{showNotification.title}</p>
              <p className="text-slate-300 text-xs mt-0.5">{showNotification.message}</p>
            </div>
            <button
              onClick={() => setShowNotification(null)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-100 tracking-tight">
              Agent Workspace
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Welcome back, <span className="text-teal-400 font-semibold">{currentAgentName}</span>!
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Quick Stats */}
            <div className="bg-slate-800 border border-slate-700 px-5 py-3 rounded-xl flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Tasks</p>
                <p className="text-2xl font-bold text-teal-400">{agentTasks.length}</p>
              </div>
              <div className="h-10 w-px bg-slate-700" />
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Rating</p>
                <p className="text-2xl font-bold text-amber-400">
                  {agentMetrics?.averageRating.toFixed(1) || "0"}
                </p>
              </div>
              {agentCredits && (
                <>
                  <div className="h-10 w-px bg-slate-700" />
                  <div className="text-center">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Credits</p>
                    <p className="text-2xl font-bold text-violet-400">{agentCredits.balance}</p>
                  </div>
                </>
              )}
            </div>
            <LogoutButton />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-slate-800 text-white shadow-lg border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "tasks" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Task List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-semibold text-slate-100">Your Tasks</h3>
                    <ExtrudedButton
                      className="bg-teal-600 hover:bg-teal-700 gap-2 transition-transform active:scale-95"
                      onClick={() => showToast("info", "Coming Soon", "Task creation feature is under development")}
                    >
                      <Plus className="h-4 w-4" />
                      New Task
                    </ExtrudedButton>
                  </div>
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search tasks..."
                      className="bg-slate-900 border-slate-800 pl-9 text-sm rounded-xl"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  {agentTasks.length === 0 ? (
                    <GlassPanel tilt={false} className="border-slate-700/50">
                      <CardContent className="py-10 text-center">
                        <CheckCircle2 className="h-12 w-12 text-slate-700 mx-auto mb-3" />
                        <p className="text-slate-400 font-medium">No tasks found</p>
                        <p className="text-slate-600 text-xs mt-1">Try a different search term</p>
                      </CardContent>
                    </GlassPanel>
                  ) : (
                    agentTasks.map((task) => (
                      <GlassPanel
                        key={task.id}
                        tilt={true}
                        className={cn(
                          "cursor-pointer border-slate-700/50 hover:border-teal-500/50 transition-all duration-200 hover:shadow-md",
                          selectedTaskId === task.id ? "border-teal-500 shadow-lg shadow-teal-500/20" : ""
                        )}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-3">
                            <CardTitle className="text-lg text-slate-100 font-bold">{task.title}</CardTitle>
                            <span
                              className={cn(
                                "px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap",
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
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Updated {new Date(task.updatedAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </CardHeader>
                      </GlassPanel>
                    ))
                  )}
                </div>
              </div>

              {/* Task Details */}
              <div className="lg:col-span-2">
                {selectedTaskId ? (
                  (() => {
                    const task = agentTasks.find((t) => t.id === selectedTaskId);
                    if (!task) return null;
                    return (
                      <GlassPanel tilt={false} className="border-slate-700/50">
                        <CardHeader>
                          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                            <CardTitle className="text-2xl text-slate-100 font-bold">{task.title}</CardTitle>
                            <select
                              value={task.status}
                              onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                              className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            >
                              <option value="todo">To Do</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          </div>
                          <p className="text-slate-300 leading-relaxed">{task.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Status Actions */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "todo")}
                              className="border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              To Do
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "in-progress")}
                              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500 gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              In Progress
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              onClick={() => updateTaskStatus(task.id, "completed")}
                              className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:border-green-500 gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Complete
                            </ExtrudedButton>
                            <ExtrudedButton
                              variant="outline"
                              className="border-slate-600 hover:border-slate-500 hover:bg-slate-700/50 gap-2"
                              onClick={() => showToast("info", "Coming Soon", "Call customer feature is under development")}
                            >
                              <Phone className="h-4 w-4" />
                              Call Customer
                            </ExtrudedButton>
                          </div>

                          {/* Milestones */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-100">Milestones</h4>
                            <div className="space-y-2">
                              {task.milestones.map((milestone) => (
                                <div
                                  key={milestone.id}
                                  className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl border border-slate-700/50"
                                >
                                  <div className="flex items-center gap-3">
                                    <button
                                      onClick={() => toggleMilestone(task.id, milestone.id)}
                                      className={cn(
                                        "flex items-center justify-center h-6 w-6 rounded-full border-2 transition-all duration-200 hover:scale-110",
                                        milestone.completed
                                          ? "bg-green-500 border-green-500"
                                          : "border-slate-500 hover:border-teal-500"
                                      )}
                                    >
                                      {milestone.completed && <Check className="h-4 w-4 text-white" />}
                                    </button>
                                    <span
                                      className={cn(
                                        "font-medium transition-all duration-200",
                                        milestone.completed ? "text-slate-400 line-through" : "text-slate-100"
                                      )}
                                    >
                                      {milestone.title}
                                    </span>
                                  </div>
                                  {milestone.completedAt && (
                                    <span className="text-xs text-slate-500">
                                      {new Date(milestone.completedAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div className="space-y-3">
                            <h4 className="text-lg font-semibold text-slate-100">Progress Notes</h4>
                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                              {task.progressNotes.length === 0 ? (
                                <p className="text-sm text-slate-500 italic">No progress notes yet</p>
                              ) : (
                                task.progressNotes.map((note, idx) => (
                                  <div
                                    key={idx}
                                    className="p-4 bg-slate-700/30 rounded-xl text-sm text-slate-200 border border-slate-700/30"
                                  >
                                    {note}
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Textarea
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a progress note..."
                                className="bg-slate-700/50 border-slate-600 focus:border-teal-500 resize-none rounded-xl"
                                rows={2}
                              />
                              <ExtrudedButton
                                onClick={handleAddNote}
                                disabled={isAddingNote || !newNote.trim()}
                                className="bg-teal-600 hover:bg-teal-700 gap-2 min-w-[100px] transition-all disabled:opacity-50"
                              >
                                {isAddingNote ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Add Note"
                                )}
                              </ExtrudedButton>
                            </div>
                          </div>
                        </CardContent>
                      </GlassPanel>
                    );
                  })()
                ) : (
                  <GlassPanel tilt={false} className="border-slate-700/50">
                    <CardContent className="py-16 text-center">
                      <CheckCircle2 className="h-20 w-20 text-slate-700 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-300 mb-1">Select a task to view details</h3>
                      <p className="text-slate-500">Choose a task from the list on the left to get started</p>
                    </CardContent>
                  </GlassPanel>
                )}
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <GlassPanel tilt={false} className="border-slate-700/50 h-[650px] flex flex-col overflow-hidden">
              <CardHeader className="border-b border-slate-700/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Chat with {customerName}
                  </CardTitle>
                  <p className="text-slate-500 text-sm mt-1">Online</p>
                </div>
                <ExtrudedButton variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Info
                </ExtrudedButton>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.senderId === currentAgentId ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] p-4 rounded-2xl shadow-sm",
                          msg.senderId === currentAgentId
                            ? "bg-teal-600 text-white rounded-tr-md"
                            : "bg-slate-700 text-slate-100 rounded-tl-md"
                        )}
                      >
                        <p className="font-semibold text-xs mb-1 opacity-90">{msg.senderName}</p>
                        {msg.content && <p className="leading-relaxed">{msg.content}</p>}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {msg.attachments.map((attachment) => (
                              <a
                                key={attachment.id}
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={cn(
                                  "flex items-center gap-2 p-3 rounded-xl border",
                                  msg.senderId === currentAgentId
                                    ? "bg-teal-700 border-teal-500 hover:bg-teal-800"
                                    : "bg-slate-800 border-slate-600 hover:bg-slate-900"
                                )}
                              >
                                <FileText className="h-6 w-6" />
                                <div className="flex-1">
                                  <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                  <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
                                </div>
                                <Download className="h-5 w-5" />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-xs mt-2 opacity-70 text-right">
                          {new Date(msg.createdAt || msg.timestamp || "").toLocaleTimeString(undefined, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/30">
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-700 px-3 py-1 rounded-full text-sm">
                          <FileText className="h-4 w-4" />
                          <span className="truncate max-w-[150px]">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-white"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Chat Input */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-800/50">
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <ExtrudedButton
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Attach
                    </ExtrudedButton>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="bg-slate-700 border-slate-600 focus:border-teal-500 flex-1 rounded-xl"
                    />
                    <ExtrudedButton
                      onClick={handleSendMessage}
                      disabled={isSendingMessage || (!newMessage.trim() && selectedFiles.length === 0)}
                      className="bg-teal-600 hover:bg-teal-700 gap-2 min-w-[100px] disabled:opacity-50"
                    >
                      {isSendingMessage ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Send"
                      )}
                    </ExtrudedButton>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "calls" && (
            <GlassPanel tilt={false} className="border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-slate-100 font-bold">Start a New Call</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 w-56 h-56 rounded-full mx-auto mb-6 flex items-center justify-center border border-slate-700/50 shadow-2xl">
                      <Users className="h-28 w-28 text-slate-600" />
                    </div>
                    <h4 className="text-xl font-semibold text-slate-100 mb-2">{customerName}</h4>
                    <p className="text-slate-400 mb-6 max-w-xs mx-auto">Click to start a call with {customerName}</p>
                    <div className="flex justify-center gap-4 flex-wrap">
                      <ExtrudedButton
                        className="bg-green-600 hover:bg-green-700 px-8 h-12 gap-2 transition-transform active:scale-95 shadow-lg shadow-green-600/10"
                        onClick={() => showToast("info", "Coming Soon", "Call feature is under development")}
                      >
                        <Phone className="h-5 w-5" />
                        Start Call
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="px-8 h-12 gap-2"
                        onClick={() => setActiveTab("chat")}
                      >
                        <MessageSquare className="h-5 w-5" />
                        Message
                      </ExtrudedButton>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-lg font-semibold text-slate-100">Call Controls</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Mute feature is under development")}
                      >
                        <Phone className="h-5 w-5" />
                        Mute/Unmute
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Video toggle is under development")}
                      >
                        <Users className="h-5 w-5" />
                        Toggle Video
                      </ExtrudedButton>
                      <ExtrudedButton
                        variant="outline"
                        className="h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "Add participant is under development")}
                      >
                        <Users className="h-5 w-5" />
                        Add Participant
                      </ExtrudedButton>
                      <ExtrudedButton
                        className="bg-red-600 hover:bg-red-700 h-14 gap-2"
                        onClick={() => showToast("info", "Coming Soon", "End call feature is under development")}
                      >
                        <Check className="h-5 w-5" />
                        End Call
                      </ExtrudedButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </GlassPanel>
          )}

          {activeTab === "metrics" && agentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    Tasks Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-teal-400">{agentMetrics.tasksCompleted}</p>
                  <p className="text-slate-500 text-sm mt-2">
                    out of {agentMetrics.totalTasks} total tasks
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Avg Resolution Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-blue-400">
                    {Math.round(agentMetrics.averageResolutionTime / 60)}h
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    per task on average
                  </p>
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <Star className="h-5 w-5 text-amber-500" />
                    Average Rating
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-baseline gap-2">
                  <p className="text-5xl font-extrabold text-amber-400">
                    {agentMetrics.averageRating.toFixed(1)}
                  </p>
                  <Star className="h-10 w-10 text-amber-400 fill-amber-400" />
                </CardContent>
              </GlassPanel>

              <GlassPanel tilt={true} className="border-slate-700/50">
                <CardHeader>
                  <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                    Total Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-5xl font-extrabold text-purple-400">
                    {agentMetrics.totalInteractions}
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    calls & messages combined
                  </p>
                </CardContent>
              </GlassPanel>
            </div>
          )}

          {activeTab === "credits" && agentCredits && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Credits Overview */}
              <div className="lg:col-span-1 space-y-6">
                <GlassPanel tilt={true} className="border-violet-700/30">
                  <CardContent className="pt-8 pb-6">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-violet-600/20 border border-violet-500/30">
                        <Zap className="h-10 w-10 text-violet-400" />
                      </div>
                      <div>
                        <p className="text-violet-300 text-sm uppercase tracking-wider font-semibold">Available Credits</p>
                        <p className="text-6xl font-black text-white mt-1">{agentCredits.balance}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-slate-700">
                      <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Earned</p>
                        <p className="text-xl font-bold text-green-400">{agentCredits.totalEarned}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-wider">Spent</p>
                        <p className="text-xl font-bold text-red-400">{agentCredits.totalSpent}</p>
                      </div>
                    </div>
                    <ExtrudedButton className="w-full mt-6 bg-violet-600 hover:bg-violet-500 h-12 gap-2">
                      Add Credits
                    </ExtrudedButton>
                  </CardContent>
                </GlassPanel>
              </div>

              {/* Transactions */}
              <div className="lg:col-span-2">
                <GlassPanel tilt={false} className="border-slate-700/50">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-slate-100 font-bold">Transaction History</CardTitle>
                    <ExtrudedButton variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filter
                    </ExtrudedButton>
                  </CardHeader>
                  <CardContent className="divide-y divide-slate-700">
                    {agentCredits.transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center",
                            tx.amount > 0 ? "bg-green-500/10" : "bg-red-500/10"
                          )}>
                            <Zap className={cn(
                              "h-5 w-5",
                              tx.amount > 0 ? "text-green-400" : "text-red-400"
                            )} />
                          </div>
                          <div>
                            <p className="text-slate-200 font-medium">{tx.description}</p>
                            <p className="text-slate-500 text-xs">
                              {new Date(tx.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p className={cn(
                          "text-lg font-bold",
                          tx.amount > 0 ? "text-green-400" : "text-red-400"
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
        </div>
      </div>
      <Unibox />
    </div>
  );
}

export default function AgentPortal() {
  return (
    <AuthProvider allowedRoles={["agent"]}>
      <AgentPortalContent />
    </AuthProvider>
  );
}
