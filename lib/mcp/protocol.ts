/**
 * Model Context Protocol (MCP) Specification
 * Formal definition of message formats, request/response patterns, and state management.
 */

export type JSONRPCId = string | number | null;

export interface JSONRPCRequest {
  jsonrpc: "2.0";
  id: JSONRPCId;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: "2.0";
  id: JSONRPCId;
  result?: any;
  error?: JSONRPCError;
}

export interface JSONRPCNotification {
  jsonrpc: "2.0";
  method: string;
  params?: any;
}

export interface JSONRPCError {
  code: number;
  message: string;
  data?: any;
}

export enum MCPErrorCode {
  ParseError = -32700,
  InvalidRequest = -32600,
  MethodNotFound = -32601,
  InvalidParams = -32602,
  InternalError = -32603,
  // Custom MCP codes
  Timeout = -32000,
  Unauthorized = -32001,
  ResourceNotFound = -32002,
  RateLimited = -32003,
}

// MCP Methods
export type MCPMethod = 
  | "initialize"
  | "resources/list"
  | "resources/read"
  | "prompts/list"
  | "prompts/get"
  | "tools/list"
  | "tools/call"
  | "logging/setLevel"
  | "notifications/cancelled";

// Initialization Types
export interface InitializeParams {
  protocolVersion: string;
  capabilities: {
    resources?: boolean;
    prompts?: boolean;
    tools?: boolean;
    logging?: boolean;
  };
  clientInfo: {
    name: string;
    version: string;
  };
}

export interface InitializeResult {
  protocolVersion: string;
  capabilities: {
    resources?: {
      subscribe?: boolean;
      listChanged?: boolean;
    };
    prompts?: {
      listChanged?: boolean;
    };
    tools?: {
      listChanged?: boolean;
    };
    logging?: Record<string, any>;
  };
  serverInfo: {
    name: string;
    version: string;
  };
}

// Tool Types
export interface Tool {
  name: string;
  description?: string;
  inputSchema: any; // JSON Schema
}

export interface CallToolParams {
  name: string;
  arguments: Record<string, any>;
}

export interface CallToolResult {
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
    resource?: Resource;
  }>;
  isError?: boolean;
}

// Resource Types
export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface ReadResourceParams {
  uri: string;
}

export interface ReadResourceResult {
  contents: Array<{
    uri: string;
    mimeType?: string;
    text?: string;
    blob?: string;
  }>;
}
