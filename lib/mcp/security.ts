import { MCPErrorCode } from "./protocol";

export interface MCPUser {
  id: string;
  roles: string[];
}

export interface AuthProvider {
  authenticate(token: string): Promise<MCPUser | null>;
  authorize(user: MCPUser, action: string, resourceId?: string): Promise<boolean>;
}

/**
 * Simple Token-based Auth Provider.
 */
export class SimpleAuthProvider implements AuthProvider {
  private tokens: Map<string, MCPUser> = new Map();

  constructor() {
    // Demo tokens
    this.tokens.set("demo-admin-token", { id: "admin", roles: ["admin"] });
    this.tokens.set("demo-user-token", { id: "user", roles: ["user"] });
  }

  async authenticate(token: string): Promise<MCPUser | null> {
    return this.tokens.get(token) || null;
  }

  async authorize(user: MCPUser, action: string, resourceId?: string): Promise<boolean> {
    if (user.roles.includes("admin")) return true;
    
    // Example: Only admins can call sensitive tools
    if (action === "tools/call" && resourceId?.startsWith("admin/")) {
      return false;
    }

    return true;
  }
}

/**
 * Middleware for the protocol server to handle authentication.
 */
export class MCPAuthMiddleware {
  private provider: AuthProvider;

  constructor(provider: AuthProvider) {
    this.provider = provider;
  }

  public async verify(token: string | undefined, method: string, resourceId?: string): Promise<MCPUser> {
    if (!token) {
      throw { code: MCPErrorCode.Unauthorized, message: "Authentication token missing" };
    }

    const user = await this.provider.authenticate(token);
    if (!user) {
      throw { code: MCPErrorCode.Unauthorized, message: "Invalid authentication token" };
    }

    const authorized = await this.provider.authorize(user, method, resourceId);
    if (!authorized) {
      throw { code: MCPErrorCode.Unauthorized, message: `Unauthorized action: ${method}` };
    }

    return user;
  }
}
