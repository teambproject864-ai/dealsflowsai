import { KimiClient } from "../lib/kimi";

// Mock fetch
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    id: "test-id",
    object: "chat.completion",
    created: Date.now(),
    model: "moonshot-v1-8k",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: "Test response" },
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
  }),
});

describe("KimiClient", () => {
  let client: KimiClient;

  beforeEach(() => {
    client = new KimiClient("test-api-key");
    jest.clearAllMocks();
  });

  test("should initialize with default values", () => {
    expect(client).toBeDefined();
  });

  test("should make chat completion request", async () => {
    const response = await client.chatCompletion({
      model: "moonshot-v1-8k",
      messages: [{ role: "user", content: "Hello" }],
    });
    expect(response.choices[0].message.content).toBe("Test response");
  });

  test("should cache responses", async () => {
    const request = {
      model: "moonshot-v1-8k",
      messages: [{ role: "user" as const, content: "Hello" }],
    };
    await client.chatCompletion(request);
    await client.chatCompletion(request);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});
