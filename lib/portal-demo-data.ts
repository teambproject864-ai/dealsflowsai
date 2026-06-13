import type {
  PortalUser,
  Task,
  ChatMessage,
  PortalCallRecord,
  CustomerFeedback,
  AgentPerformanceMetrics,
  AgentCredits,
} from "@/lib/types";

// Demo users
export const demoUsers: PortalUser[] = [
  {
    id: "demo-admin-1",
    email: "admin@dealflow.ai",
    name: "DealFlow.AI Admin",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "agent-ashok",
    email: "ashok@dealflow.ai",
    name: "Ashok",
    role: "agent",
    createdAt: "2024-02-15T00:00:00Z",
  },
  {
    id: "agent-harsha",
    email: "harsha@dealflow.ai",
    name: "Harsha",
    role: "agent",
    createdAt: "2024-02-20T00:00:00Z",
  },
  {
    id: "agent-kiran",
    email: "kiran@dealflow.ai",
    name: "Kiran",
    role: "agent",
    createdAt: "2024-03-01T00:00:00Z",
  },
  {
    id: "agent-vijay",
    email: "vijay@dealflow.ai",
    name: "Vijay",
    role: "agent",
    createdAt: "2024-03-10T00:00:00Z",
  },
  {
    id: "agent-avinash",
    email: "avinash@dealflow.ai",
    name: "Avinash",
    role: "agent",
    createdAt: "2024-03-15T00:00:00Z",
  },
  {
    id: "agent-kunal",
    email: "kunal@dealflow.ai",
    name: "Kunal",
    role: "agent",
    createdAt: "2024-03-20T00:00:00Z",
  },
  {
    id: "agent-praneeth",
    email: "praneeth@dealflow.ai",
    name: "Praneeth",
    role: "agent",
    createdAt: "2024-02-10T00:00:00Z",
  },
  {
    id: "customer-demo",
    email: "demo@customer.com",
    name: "Demo Customer",
    role: "customer",
    createdAt: "2024-03-10T00:00:00Z",
  },
];

// Demo tasks
export const demoTasks: Task[] = [
  {
    id: "task-1",
    title: "Follow up with Demo Customer",
    description: "Contact Demo Customer to discuss GTM strategy",
    status: "in-progress",
    assignedAgentId: "agent-praneeth",
    customerId: "customer-demo",
    customerName: "Demo Customer",
    priority: "high",
    progressNotes: ["Initial contact made", "Schedule meeting for next week"],
    milestones: [
      { id: "m1", title: "Initial outreach", completed: true, completedAt: "2024-05-10T09:30:00Z" },
      { id: "m2", title: "Needs assessment", completed: false },
      { id: "m3", title: "Proposal sent", completed: false },
    ],
    createdAt: "2024-05-10T09:00:00Z",
    updatedAt: "2024-05-20T14:30:00Z",
  },
  {
    id: "task-2",
    title: "Prepare onboarding materials",
    description: "Create onboarding guide for new clients",
    status: "todo",
    assignedAgentId: "agent-ashok",
    customerId: "customer-demo",
    customerName: "Demo Customer",
    priority: "medium",
    progressNotes: [],
    milestones: [
      { id: "m1", title: "Draft guide", completed: false },
      { id: "m2", title: "Review and finalize", completed: false },
    ],
    createdAt: "2024-05-15T11:00:00Z",
    updatedAt: "2024-05-15T11:00:00Z",
  },
  {
    id: "task-3",
    title: "Collect customer feedback",
    description: "Get feedback from Demo Customer on initial meeting",
    status: "completed",
    assignedAgentId: "agent-kiran",
    customerId: "customer-demo",
    customerName: "Demo Customer",
    priority: "low",
    progressNotes: ["Feedback collected", "Analysis complete"],
    milestones: [
      { id: "m1", title: "Send survey", completed: true, completedAt: "2024-05-18T10:00:00Z" },
      { id: "m2", title: "Analyze results", completed: true, completedAt: "2024-05-19T15:00:00Z" },
    ],
    createdAt: "2024-05-17T09:00:00Z",
    updatedAt: "2024-05-19T15:00:00Z",
  },
];

// Demo chat messages
export const demoChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sessionId: "session-1",
    senderId: "customer-demo",
    senderName: "Demo Customer",
    senderRole: "customer",
    content: "Hi, I'd like to discuss my GTM strategy.",
    createdAt: "2024-05-20T10:00:00Z",
    timestamp: "2024-05-20T10:00:00Z",
    read: true,
  },
  {
    id: "msg-2",
    sessionId: "session-1",
    senderId: "agent-praneeth",
    senderName: "Praneeth",
    senderRole: "agent",
    content: "Great! Let's schedule a call this week. Here's the GTM analysis report for reference.",
    createdAt: "2024-05-20T10:15:00Z",
    timestamp: "2024-05-20T10:15:00Z",
    read: true,
    attachments: [
      {
        id: "file-1",
        fileName: "GTM_Analysis_Report.pdf",
        fileSize: 1234567,
        fileType: "application/pdf",
        url: "#", // In real app, this would be a file URL
        uploadedAt: "2024-05-20T10:14:00Z",
        uploadedBy: "agent-praneeth"
      }
    ]
  },
];

// Demo calls
export const demoCallRecords: PortalCallRecord[] = [
  {
    id: "call-1",
    sessionId: "session-1",
    callerId: "agent-praneeth",
    callerName: "Praneeth",
    callerRole: "agent",
    receiverId: "customer-demo",
    receiverName: "Demo Customer",
    receiverRole: "customer",
    status: "completed",
    duration: 960, // 16 minutes
    startedAt: "2024-05-20T11:00:00Z",
    endedAt: "2024-05-20T11:16:00Z",
  },
];

// Demo feedback
export const demoCustomerFeedback: CustomerFeedback[] = [
  {
    id: "fb-1",
    sessionId: "session-1",
    agentId: "agent-praneeth",
    customerId: "customer-demo",
    rating: 5,
    comment: "Excellent service! Very helpful.",
    createdAt: "2024-05-20T12:00:00Z",
  },
];

// Demo metrics
export const demoAgentMetrics: AgentPerformanceMetrics[] = [
  {
    agentId: "agent-vijay",
    periodStart: "2024-05-01T00:00:00Z",
    periodEnd: "2024-05-30T23:59:59Z",
    tasksCompleted: 23,
    totalTasks: 28,
    averageResolutionTime: 1440, // 24 hours
    averageRating: 4.7,
    totalInteractions: 87,
    totalFeedback: 21,
  },
  {
    agentId: "agent-ashok",
    periodStart: "2024-05-01T00:00:00Z",
    periodEnd: "2024-05-30T23:59:59Z",
    tasksCompleted: 18,
    totalTasks: 22,
    averageResolutionTime: 2880, // 48 hours
    averageRating: 4.3,
    totalInteractions: 56,
    totalFeedback: 15,
  },
  {
    agentId: "agent-kiran",
    periodStart: "2024-05-01T00:00:00Z",
    periodEnd: "2024-05-30T23:59:59Z",
    tasksCompleted: 31,
    totalTasks: 34,
    averageResolutionTime: 960, // 16 hours
    averageRating: 4.9,
    totalInteractions: 102,
    totalFeedback: 28,
  },
  {
    agentId: "agent-praneeth",
    periodStart: "2024-05-01T00:00:00Z",
    periodEnd: "2024-05-30T23:59:59Z",
    tasksCompleted: 26,
    totalTasks: 30,
    averageResolutionTime: 1200, // 20 hours
    averageRating: 4.8,
    totalInteractions: 95,
    totalFeedback: 24,
  },
];

// Demo Agent Credits
export const demoAgentCredits: AgentCredits[] = [
  {
    agentId: "agent-praneeth",
    balance: 1250,
    totalEarned: 1500,
    totalSpent: 250,
    transactions: [
      {
        id: "tx-1",
        type: "onboarding",
        amount: 500,
        description: "Initial onboarding bonus",
        createdAt: "2024-02-15T09:00:00Z",
      },
      {
        id: "tx-2",
        type: "lead",
        amount: 250,
        description: "Earned for closing demo customer",
        createdAt: "2024-03-20T14:30:00Z",
      },
      {
        id: "tx-3",
        type: "call",
        amount: -150,
        description: "Spent on 15 premium calls",
        createdAt: "2024-05-10T10:15:00Z",
      },
      {
        id: "tx-4",
        type: "analysis",
        amount: 750,
        description: "Earned for completing 3 high-value analysis",
        createdAt: "2024-05-18T16:00:00Z",
      },
      {
        id: "tx-5",
        type: "message",
        amount: -100,
        description: "Spent on 50 premium messages",
        createdAt: "2024-05-22T11:45:00Z",
      },
    ],
  },
  {
    agentId: "agent-ashok",
    balance: 950,
    totalEarned: 1200,
    totalSpent: 250,
    transactions: [
      {
        id: "tx-1",
        type: "onboarding",
        amount: 500,
        description: "Initial onboarding bonus",
        createdAt: "2024-02-20T08:30:00Z",
      },
      {
        id: "tx-2",
        type: "lead",
        amount: 300,
        description: "Earned for 3 new leads closed",
        createdAt: "2024-04-05T15:00:00Z",
      },
      {
        id: "tx-3",
        type: "call",
        amount: -200,
        description: "Spent on 20 premium calls",
        createdAt: "2024-05-08T09:00:00Z",
      },
      {
        id: "tx-4",
        type: "analysis",
        amount: 400,
        description: "Earned for 2 technical integration analyses",
        createdAt: "2024-05-19T13:30:00Z",
      },
      {
        id: "tx-5",
        type: "message",
        amount: -50,
        description: "Spent on 25 premium messages",
        createdAt: "2024-05-25T10:00:00Z",
      },
    ],
  },
  {
    agentId: "agent-kiran",
    balance: 1750,
    totalEarned: 2100,
    totalSpent: 350,
    transactions: [
      {
        id: "tx-1",
        type: "onboarding",
        amount: 500,
        description: "Initial onboarding bonus",
        createdAt: "2024-03-01T10:00:00Z",
      },
      {
        id: "tx-2",
        type: "lead",
        amount: 400,
        description: "Earned for closing 4 enterprise leads",
        createdAt: "2024-04-12T11:00:00Z",
      },
      {
        id: "tx-3",
        type: "call",
        amount: -250,
        description: "Spent on 25 premium calls",
        createdAt: "2024-05-05T14:30:00Z",
      },
      {
        id: "tx-4",
        type: "analysis",
        amount: 1200,
        description: "Earned for 5 executive strategy analyses",
        createdAt: "2024-05-20T09:15:00Z",
      },
      {
        id: "tx-5",
        type: "message",
        amount: -100,
        description: "Spent on 50 premium messages",
        createdAt: "2024-05-28T16:45:00Z",
      },
    ],
  },
  {
    agentId: "agent-praneeth",
    balance: 1400,
    totalEarned: 1650,
    totalSpent: 250,
    transactions: [
      {
        id: "tx-1",
        type: "onboarding",
        amount: 500,
        description: "Initial onboarding bonus",
        createdAt: "2024-03-15T10:00:00Z",
      },
      {
        id: "tx-2",
        type: "lead",
        amount: 350,
        description: "Earned for closing 3 GTM strategy leads",
        createdAt: "2024-04-25T13:30:00Z",
      },
      {
        id: "tx-3",
        type: "call",
        amount: -200,
        description: "Spent on 20 premium calls",
        createdAt: "2024-05-12T09:45:00Z",
      },
      {
        id: "tx-4",
        type: "analysis",
        amount: 800,
        description: "Earned for 4 RevOps and pipeline analyses",
        createdAt: "2024-05-23T16:00:00Z",
      },
      {
        id: "tx-5",
        type: "message",
        amount: -50,
        description: "Spent on 25 premium messages",
        createdAt: "2024-05-29T11:15:00Z",
      },
    ],
  },
];
