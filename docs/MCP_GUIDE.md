# Model Context Protocol (MCP) Implementation Guide

DealFlow.ai uses a structured Model Context Protocol (MCP) to enable secure and efficient communication between AI agents (like ALMA) and the execution environment.

## Architecture

The MCP implementation is divided into four main layers:

1.  **Protocol Layer** ([protocol.ts](file:///d:/DealFlow.ai/lib/mcp/protocol.ts)): Defines the JSON-RPC 2.0 message formats, error codes, and MCP-specific methods (tools, resources, prompts).
2.  **Server Layer** ([server.ts](file:///d:/DealFlow.ai/lib/mcp/server.ts)): Handles request routing, tool registration, and resource management.
3.  **Client Layer** ([client.ts](file:///d:/DealFlow.ai/lib/mcp/client.ts)): Provides a high-level API for agents to interact with the server.
4.  **Security Layer** ([security.ts](file:///d:/DealFlow.ai/lib/mcp/security.ts)): Manages authentication and authorization for tool/resource access.
5.  **Performance Layer** ([performance.ts](file:///d:/DealFlow.ai/lib/mcp/performance.ts)): Implements request batching and resource caching.

## Usage

### 1. Setting up a Server

```typescript
import { MCPServer } from "./lib/mcp/server";

const server = new MCPServer("MyAgentServer", "1.0.0");

// Register a Tool
server.registerTool({
  name: "get_weather",
  description: "Get current weather",
  inputSchema: { ... }
}, async (args) => {
  return { content: [{ type: "text", text: "Sunny" }] };
});
```

### 2. Using the Client

```typescript
import { MCPClient, LocalTransport } from "./lib/mcp/client";

const client = new MCPClient(new LocalTransport(server));
await client.initialize("MyAgent", "1.0.0");

const result = await client.callTool("get_weather", { city: "San Francisco" });
console.log(result.content[0].text);
```

## Protocol Specifications

- **JSON-RPC Version**: 2.0
- **Base Methods**:
    - `initialize`: Establish connection and exchange capabilities.
    - `tools/list`: Retrieve available tools.
    - `tools/call`: Execute a tool with arguments.
    - `resources/list`: Retrieve available resources.
    - `resources/read`: Read content from a URI.

## Testing

Run the compliance suite to verify your implementation:

```bash
npx tsx tests/mcp-compliance.test.ts
```
