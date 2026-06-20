// Define command types
export interface Command {
  id: string;
  type: "text" | "voice";
  input: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  startTime: Date;
  endTime?: Date;
  output?: string;
  error?: string;
}

// Define browser actions
export type BrowserAction =
  | "open_page"
  | "click_element"
  | "fill_form"
  | "run_analysis"
  | "book_demo"
  | "check_notifications"
  | "navigate_back"
  | "navigate_forward";

export interface BrowserAgentAction {
  action: BrowserAction;
  payload?: any;
  targetUrl?: string;
}

// Generic router interface to avoid importing useRouter
interface Router {
  push: (url: string) => void;
}

export class UnifiedBrowserAgentController {
  private router: Router | null = null;
  private connectionStatus: "connected" | "connecting" | "disconnected" = "connected";

  constructor() {
    // Setup any persistent connections here
    this.initializeConnection();
  }

  private initializeConnection() {
    // Simulate persistent connection
    setTimeout(() => {
      this.connectionStatus = "connected";
    }, 500);
  }

  setRouter(router: Router) {
    this.router = router;
  }

  getConnectionStatus() {
    return this.connectionStatus;
  }

  // Parse natural language commands
  parseCommand(input: string): BrowserAgentAction | null {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes("gtm analysis") || lowerInput.includes("go-to-market")) {
      return {
        action: "open_page",
        targetUrl: "/solutions/gtm",
      };
    }
    
    if (lowerInput.includes("sales pipeline")) {
      return {
        action: "open_page",
        targetUrl: "/solutions/sales",
      };
    }
    
    if (lowerInput.includes("marketing")) {
      return {
        action: "open_page",
        targetUrl: "/solutions/marketing",
      };
    }
    
    if (lowerInput.includes("book demo")) {
      return {
        action: "book_demo",
        targetUrl: "/book-demo",
      };
    }
    
    if (lowerInput.includes("admin portal") || lowerInput.includes("login admin")) {
      return {
        action: "open_page",
        targetUrl: "/portal/admin/login",
      };
    }
    
    if (lowerInput.includes("home") || lowerInput.includes("main page")) {
      return {
        action: "open_page",
        targetUrl: "/",
      };
    }

    // If no specific match, return a default
    return {
      action: "run_analysis",
      payload: { type: "generic", input },
    };
  }

  // Execute a browser action
  async executeAction(action: BrowserAgentAction): Promise<string> {
    switch (action.action) {
      case "open_page":
        if (this.router && action.targetUrl) {
          this.router.push(action.targetUrl);
          return `Navigating to ${action.targetUrl}...`;
        }
        return "Unable to navigate: router not initialized";
      case "book_demo":
        if (this.router && action.targetUrl) {
          this.router.push(action.targetUrl);
          return "Booking a demo...";
        }
        return "Unable to book demo";
      case "check_notifications":
        return "Checking notifications...";
      case "run_analysis":
        return `Running analysis with input: ${JSON.stringify(action.payload)}`;
      default:
        return "Unrecognized action";
    }
  }

  // Unified command processing
  async processCommand(input: string, type: "text" | "voice"): Promise<Command> {
    const command: Command = {
      id: Date.now().toString(),
      type,
      input,
      status: "in_progress",
      startTime: new Date(),
    };

    try {
      // 1. Parse command
      const action = this.parseCommand(input);
      if (!action) {
        throw new Error("Failed to parse command. Please rephrase your instruction.");
      }

      // 2. Execute parsed action
      const result = await this.executeAction(action);

      // 3. Complete command
      return {
        ...command,
        status: "completed",
        endTime: new Date(),
        output: result,
      };
    } catch (error) {
      return {
        ...command,
        status: "failed",
        endTime: new Date(),
        error: (error as Error).message,
      };
    }
  }
}

// Singleton instance
let controllerInstance: UnifiedBrowserAgentController | null = null;
export function getBrowserAgentController() {
  if (!controllerInstance) {
    controllerInstance = new UnifiedBrowserAgentController();
  }
  return controllerInstance;
}
