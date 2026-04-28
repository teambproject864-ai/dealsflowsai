import { 
  JSONRPCRequest, 
  JSONRPCResponse, 
  JSONRPCNotification,
  MCPErrorCode,
  InitializeParams,
  InitializeResult,
  Tool,
  CallToolParams,
  CallToolResult,
  Resource,
  ReadResourceParams,
  ReadResourceResult
} from "./protocol";

export type RequestHandler = (params: any) => Promise<any>;
export type NotificationHandler = (params: any) => void;

export class MCPServer {
  private name: string;
  private version: string;
  private tools: Map<string, { tool: Tool; handler: RequestHandler }> = new Map();
  private resources: Map<string, { resource: Resource; handler: RequestHandler }> = new Map();
  private initialized: boolean = false;

  constructor(name: string, version: string) {
    this.name = name;
    this.version = version;
  }

  /**
   * Registers a tool that the model can call.
   */
  public registerTool(tool: Tool, handler: RequestHandler) {
    this.tools.set(tool.name, { tool, handler });
  }

  /**
   * Registers a resource that the model can read.
   */
  public registerResource(resource: Resource, handler: RequestHandler) {
    this.resources.set(resource.uri, { resource, handler });
  }

  /**
   * Handles an incoming JSON-RPC request.
   */
  public async handleRequest(request: JSONRPCRequest): Promise<JSONRPCResponse> {
    const { id, method, params } = request;

    try {
      if (!this.initialized && method !== "initialize") {
        throw { code: MCPErrorCode.InvalidRequest, message: "Server not initialized" };
      }

      let result: any;

      switch (method) {
        case "initialize":
          result = await this.onInitialize(params);
          break;
        case "tools/list":
          result = { tools: Array.from(this.tools.values()).map(t => t.tool) };
          break;
        case "tools/call":
          result = await this.onCallTool(params as CallToolParams);
          break;
        case "resources/list":
          result = { resources: Array.from(this.resources.values()).map(r => r.resource) };
          break;
        case "resources/read":
          result = await this.onReadResource(params as ReadResourceParams);
          break;
        default:
          throw { code: MCPErrorCode.MethodNotFound, message: `Method not found: ${method}` };
      }

      return { jsonrpc: "2.0", id, result };
    } catch (error: any) {
      return { 
        jsonrpc: "2.0", 
        id, 
        error: {
          code: error.code || MCPErrorCode.InternalError,
          message: error.message || "Internal server error",
          data: error.data
        }
      };
    }
  }

  private async onInitialize(params: InitializeParams): Promise<InitializeResult> {
    this.initialized = true;
    return {
      protocolVersion: "2024-11-05",
      capabilities: {
        tools: { listChanged: true },
        resources: { listChanged: true }
      },
      serverInfo: {
        name: this.name,
        version: this.version
      }
    };
  }

  private async onCallTool(params: CallToolParams): Promise<CallToolResult> {
    const toolEntry = this.tools.get(params.name);
    if (!toolEntry) {
      throw { code: MCPErrorCode.MethodNotFound, message: `Tool not found: ${params.name}` };
    }
    return await toolEntry.handler(params.arguments);
  }

  private async onReadResource(params: ReadResourceParams): Promise<ReadResourceResult> {
    const resourceEntry = this.resources.get(params.uri);
    if (!resourceEntry) {
      throw { code: MCPErrorCode.ResourceNotFound, message: `Resource not found: ${params.uri}` };
    }
    return await resourceEntry.handler(params);
  }
}
