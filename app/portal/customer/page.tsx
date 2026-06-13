"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassPanel, ExtrudedButton } from "@/components/immersive";
import {
  Users,
  CheckCircle2,
  Phone,
  MessageSquare,
  Star,
  FileText,
  Upload,
  XCircle,
  Download,
  Plus,
} from "lucide-react";
import type { FileAttachment } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  demoTasks,
  demoChatMessages,
  demoCustomerFeedback,
  demoUsers,
} from "@/lib/portal-demo-data";
import AuthProvider from "@/components/auth/AuthProvider";
import LogoutButton from "@/components/auth/LogoutButton";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const tabs = [
  { id: "tasks", label: "Tasks", icon: CheckCircle2 },
  { id: "credits", label: "Credits", icon: Plus },
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "feedback", label: "Feedback", icon: Star },
] as const;

function CustomerPortalContent() {
  const { user, isLoading } = useCurrentUser();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<typeof tabs[number]["id"]>("credits");
  const [newMessage, setNewMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chatMessages, setChatMessages] = useState([...demoChatMessages]);
  const [tasks, setTasks] = useState([...demoTasks]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskComments, setTaskComments] = useState<Record<string, string[]>>({});
  const [newComment, setNewComment] = useState("");
  const [credits, setCredits] = useState(10); // Demo credits
  const [showChooseVector, setShowChooseVector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const shouldShowVector = searchParams.get("showVector") === "true";
    if (shouldShowVector) {
      setShowChooseVector(true);
      setActiveTab("credits");
    }
  }, [searchParams]);
  
  const customerId = user?.id || "customer-demo";
  const customer = demoUsers.find((u) => u.id === customerId) || demoUsers.find((u) => u.id === "customer-demo");
  const customerName = customer?.name || "Customer";
  
  const customerTasks = tasks.filter((t) => t.customerId === customerId);

  // Convert File to FileAttachment (simulate upload for demo)
  const fileToAttachment = (file: File): FileAttachment => ({
    id: `file-${Date.now()}-${Math.random().toString(36)}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    url: URL.createObjectURL(file),
    uploadedAt: new Date().toISOString(),
    uploadedBy: customerId,
  });

  const handleSendMessage = () => {
    if (!newMessage.trim() && selectedFiles.length === 0) return;
    const attachments = selectedFiles.map(fileToAttachment);
    const newMsg = {
      id: `msg-${Date.now()}`,
      sessionId: "session-1",
      senderId: customerId,
      senderName: customerName,
      senderRole: "customer" as const,
      content: newMessage,
      attachments: attachments.length > 0 ? attachments : undefined,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      read: false,
    };
    setChatMessages([...chatMessages, newMsg]);
    setNewMessage("");
    setSelectedFiles([]);
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Create new task
  const handleCreateTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: "todo" as const,
      assignedAgentId: "agent-praneeth",
      customerId,
      customerName,
      priority: "medium" as const,
      progressNotes: [],
      milestones: [
        { id: `milestone-${Date.now()}-1`, title: "Task created", completed: true, completedAt: new Date().toISOString() }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks([...tasks, newTask]);
    setShowCreateTask(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
    setNewTaskDeadline("");
  };

  // Add comment to task
  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTaskId) return;
    setTaskComments({
      ...taskComments,
      [selectedTaskId]: [...(taskComments[selectedTaskId] || []), newComment],
    });
    setNewComment("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-100">Customer Portal</h1>
          <p className="text-slate-400 mt-2">Welcome back! Track your progress here.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ExtrudedButton className="bg-purple-600 hover:bg-purple-700">
            <Phone className="h-5 w-5 mr-2" />
            Request Call
          </ExtrudedButton>
          <ExtrudedButton variant="outline" className="border-slate-600">
            <MessageSquare className="h-5 w-5 mr-2" />
            Message Agent
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
              className={activeTab === tab.id ? "bg-purple-600 hover:bg-purple-700" : ""}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </ExtrudedButton>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "credits" && (
          <div className="space-y-6">
            {showChooseVector ? (
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-100 font-bold">Choose Consultation Vector</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">Select the type of consultation you&apos;d like:</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "gtm", name: "GTM Strategy", desc: "Review your go-to-market strategy" },
                      { id: "sales", name: "Sales Pipeline", desc: "Optimize your sales process" },
                      { id: "marketing", name: "Marketing Campaign", desc: "Plan your marketing initiatives" },
                    ].map((v) => (
                      <ExtrudedButton
                        key={v.id}
                        variant="outline"
                        className="border-slate-600 hover:bg-purple-600 hover:border-purple-600 h-auto py-6 flex-col"
                        onClick={() => {
                          setShowChooseVector(false);
                          alert(`Consultation vector "${v.name}" selected!`);
                        }}
                      >
                        <div className="font-bold text-lg">{v.name}</div>
                        <div className="text-xs text-slate-400 mt-1">{v.desc}</div>
                      </ExtrudedButton>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <ExtrudedButton variant="outline" className="border-slate-600" onClick={() => setShowChooseVector(false)}>
                      Back
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            ) : (
              <>
                <GlassPanel tilt={true} className="border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100 font-bold">Your Credit Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-6xl font-black text-purple-400">{credits}</div>
                    <p className="text-slate-400 mt-2">Available credits</p>
                  </CardContent>
                </GlassPanel>

                <GlassPanel tilt={true} className="border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-100 font-bold">Create Credit</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <ExtrudedButton
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => {
                          setCredits((prev) => prev + 5);
                          setShowChooseVector(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add 5 Credits & Choose Consultation
                      </ExtrudedButton>
                    </div>
                  </CardContent>
                </GlassPanel>
              </>
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-6">
            {/* Create Task Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-100">Your Tasks</h2>
              <ExtrudedButton
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowCreateTask(!showCreateTask)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Task
              </ExtrudedButton>
            </div>

            {/* Create Task Form */}
            {showCreateTask && (
              <GlassPanel tilt={false} className="border-slate-700">
                <CardHeader>
                  <CardTitle className="text-xl text-slate-100 font-bold">Create New Task</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Task Title</label>
                    <Input
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title"
                      className="bg-slate-700 border-slate-600 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Description</label>
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Enter task description"
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 text-slate-100 resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <ExtrudedButton
                      onClick={handleCreateTask}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Task
                    </ExtrudedButton>
                    <ExtrudedButton
                      variant="outline"
                      className="border-slate-600"
                      onClick={() => setShowCreateTask(false)}
                    >
                      Cancel
                    </ExtrudedButton>
                  </div>
                </CardContent>
              </GlassPanel>
            )}

            {/* Tasks List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {customerTasks.map((task) => (
                <GlassPanel
                  key={task.id}
                  tilt={true}
                  className="cursor-pointer border-slate-700 hover:border-purple-500/50 transition-all duration-200 hover:shadow-lg"
                  onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl text-slate-100 font-bold">{task.title}</CardTitle>
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                          task.status === "completed"
                            ? "bg-green-500/15 text-green-400"
                            : task.status === "in-progress"
                            ? "bg-yellow-500/15 text-yellow-400"
                            : "bg-slate-500/15 text-slate-400"
                        )}
                      >
                        {task.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300 mb-4">{task.description}</p>
                    <h4 className="text-sm font-semibold text-slate-200 mb-2">Milestones</h4>
                    <div className="space-y-2">
                      {task.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className="flex items-center gap-3"
                        >
                          <div
                            className={cn(
                              "flex items-center justify-center h-5 w-5 rounded border-2",
                              milestone.completed
                                ? "bg-green-500 border-green-500"
                                : "border-slate-500"
                            )}
                          >
                            {milestone.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
                          </div>
                          <span className={cn(
                            "text-sm",
                            milestone.completed ? "text-slate-400" : "text-slate-100"
                          )}>
                            {milestone.title}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Task Details (when expanded) */}
                    {selectedTaskId === task.id && (
                      <div className="mt-6 pt-6 border-t border-slate-700/50">
                        <h4 className="text-sm font-semibold text-slate-200 mb-3">Comments</h4>
                        <div className="space-y-2 mb-4 max-h-40 overflow-y-auto">
                          {taskComments[task.id]?.map((comment, idx) => (
                            <div key={idx} className="bg-slate-700 p-3 rounded-lg">
                              <p className="text-sm text-slate-300">{comment}</p>
                            </div>
                          )) || <p className="text-slate-500 text-sm">No comments yet</p>}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="bg-slate-700 border-slate-600 flex-1 rounded-xl"
                            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                          />
                          <ExtrudedButton
                            onClick={handleAddComment}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            Post
                          </ExtrudedButton>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </GlassPanel>
              ))}
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <GlassPanel tilt={false} className="border-slate-700 h-[600px] flex flex-col">
            <CardHeader className="border-b border-slate-700/50">
              <CardTitle className="text-slate-100 font-bold">Chat with Your Agent</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.senderRole === "customer" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] p-3 rounded-lg",
                        msg.senderRole === "customer"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 text-slate-100"
                      )}
                    >
                      <p className="font-semibold text-xs mb-1 opacity-80">{msg.senderName}</p>
                      {msg.content && <p>{msg.content}</p>}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                          {msg.attachments.map((attachment) => (
                            <a
                              key={attachment.id}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 p-2 rounded-lg border",
                                msg.senderRole === "customer"
                                  ? "bg-purple-700 border-purple-500 hover:bg-purple-800"
                                  : "bg-slate-800 border-slate-600 hover:bg-slate-900"
                              )}
                            >
                              <FileText className="h-5 w-5" />
                              <div className="flex-1">
                                <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                                <p className="text-xs opacity-70">{formatFileSize(attachment.fileSize)}</p>
                              </div>
                              <Download className="h-4 w-4" />
                            </a>
                          ))}
                        </div>
                      )}
                      <p className="text-xs mt-1 opacity-70 text-right">
                        {new Date(msg.createdAt || msg.timestamp || "").toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="px-4 py-2 border-t border-slate-700/50 bg-slate-800/50">
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
              <div className="p-4 border-t border-slate-700/50">
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
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-slate-700 border-slate-600 flex-1 rounded-xl"
                  />
                  <ExtrudedButton onClick={handleSendMessage} className="bg-purple-600 hover:bg-purple-700">
                    Send
                  </ExtrudedButton>
                </div>
              </div>
            </CardContent>
          </GlassPanel>
        )}

        {activeTab === "documents" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassPanel tilt={true} className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                  <FileText className="h-6 w-6 text-purple-400" />
                  GTM Analysis Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Comprehensive GTM strategy analysis based on your intake form.
                </p>
                <ExtrudedButton className="bg-purple-600 hover:bg-purple-700">
                  Download Report
                </ExtrudedButton>
              </CardContent>
            </GlassPanel>
            <GlassPanel tilt={true} className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2 font-bold">
                  <FileText className="h-6 w-6 text-purple-400" />
                  Customer Onboarding Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Step-by-step guide for getting started.
                </p>
                <ExtrudedButton variant="outline" className="border-slate-600">
                  Download Guide
                </ExtrudedButton>
              </CardContent>
            </GlassPanel>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassPanel tilt={false} className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 font-bold">Submit Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} className="text-slate-600 hover:text-amber-400 transition-colors">
                          <Star className="h-8 w-8" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 block mb-2">Your Comments</label>
                    <textarea
                      className="w-full bg-slate-700 border border-slate-600 rounded-xl p-3 text-slate-100"
                      rows={4}
                      placeholder="Tell us about your experience..."
                    />
                  </div>
                  <ExtrudedButton className="bg-purple-600 hover:bg-purple-700 w-full">
                    Submit Feedback
                  </ExtrudedButton>
                </div>
              </CardContent>
            </GlassPanel>

            <GlassPanel tilt={false} className="border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-100 font-bold">Your Past Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoCustomerFeedback.filter((f) => f.customerId === customerId).map((fb) => (
                  <div key={fb.id} className="p-4 bg-slate-700/40 border border-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-4 w-4",
                            star <= fb.rating
                              ? "text-amber-400 fill-amber-400"
                              : "text-slate-500"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-300">{fb.comment}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(fb.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </GlassPanel>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomerPortal() {
  return (
    <AuthProvider allowedRoles={["customer"]}>
      <CustomerPortalContent />
    </AuthProvider>
  );
}
