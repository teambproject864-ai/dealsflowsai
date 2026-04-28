import { MCPServer } from "../lib/mcp/server";
import { MCPClient, LocalTransport } from "../lib/mcp/client";
import { MCPErrorCode } from "../lib/mcp/protocol";
import assert from "assert";

async function runMCPTests() {
  console.log("--- Starting MCP Compliance Tests ---");

  // 1. Setup Server & Client
  const server = new MCPServer("TestServer", "1.0.0");
  const transport = new LocalTransport(server);
  const client = new MCPClient(transport);

  // 2. Register a test tool
  server.registerTool(
    {
      name: "echo",
      description: "Echoes the input back",
      inputSchema: {
        type: "object",
        properties: { message: { type: "string" } }
      }
    },
    async (args: any) => ({
      content: [{ type: "text", text: `Echo: ${args.message}` }]
    })
  );

  // 3. Register a test resource
  server.registerResource(
    {
      uri: "test://info",
      name: "Server Info",
      mimeType: "text/plain"
    },
    async () => ({
      contents: [{ uri: "test://info", text: "MCP Test Server v1.0.0" }]
    })
  );

  try {
    // Test: Uninitialized call fails
    console.log("Test: Uninitialized call should fail...");
    try {
      await client.listTools();
      assert.fail("Should have thrown error");
    } catch (err: any) {
      assert.strictEqual(err.code, MCPErrorCode.InvalidRequest);
      console.log("✓ Success: Correctly failed uninitialized call.");
    }

    // Test: Initialization
    console.log("Test: Initialization...");
    const initResult = await client.initialize("TestClient", "1.0.0");
    assert.strictEqual(initResult.serverInfo.name, "TestServer");
    console.log("✓ Success: Initialized.");

    // Test: List Tools
    console.log("Test: List Tools...");
    const tools = await client.listTools();
    assert.strictEqual(tools.length, 1);
    assert.strictEqual(tools[0].name, "echo");
    console.log("✓ Success: Tools listed.");

    // Test: Call Tool
    console.log("Test: Call Tool...");
    const toolResult = await client.callTool("echo", { message: "Hello MCP" });
    assert.strictEqual(toolResult.content[0].text, "Echo: Hello MCP");
    console.log("✓ Success: Tool called.");

    // Test: List Resources
    console.log("Test: List Resources...");
    const resources = await client.listResources();
    assert.strictEqual(resources.length, 1);
    assert.strictEqual(resources[0].uri, "test://info");
    console.log("✓ Success: Resources listed.");

    // Test: Read Resource
    console.log("Test: Read Resource...");
    const resourceResult = await client.readResource("test://info");
    assert.strictEqual(resourceResult.contents[0].text, "MCP Test Server v1.0.0");
    console.log("✓ Success: Resource read.");

    console.log("\n--- All MCP Compliance Tests Passed ---");
  } catch (error) {
    console.error("\n--- MCP Test Suite Failed ---");
    console.error(error);
    process.exit(1);
  }
}

runMCPTests();
