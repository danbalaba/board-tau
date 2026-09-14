import { generateAIResponse } from "@/lib/ai/ai-provider";
import { z } from "zod";

// Mock global fetch for testing AI failover logic
global.fetch = jest.fn();

describe("AI Provider & Route Integration Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should successfully parse JSON response from primary Groq provider", async () => {
    process.env.GROQ_API_KEY = "test_groq_key";
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({ reply: "Hello from Groq!", suggestedPrompts: ["Help?"] })
            }
          }
        ]
      })
    });

    const schema = z.object({
      reply: z.string(),
      suggestedPrompts: z.array(z.string()).optional()
    });

    const result = await generateAIResponse({
      prompt: "Test question",
      schema
    });

    expect(result.provider).toBe("groq");
    expect(result.data).toEqual({ reply: "Hello from Groq!", suggestedPrompts: ["Help?"] });
  });

  it("should automatically failover when primary provider returns 429 Rate Limit", async () => {
    process.env.GROQ_API_KEY = "test_groq_key";
    process.env.GEMINI_API_KEY = "test_gemini_key";

    // 1st fetch call (Groq) returns 429 Rate Limit
    // 2nd fetch call (Gemini SDK internal fetch) returns Gemini response format
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => "Rate limit exceeded"
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ message: "Hello from Gemini Failover" }),
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [{ text: JSON.stringify({ message: "Hello from Gemini Failover" }) }]
              }
            }
          ]
        })
      });

    const schema = z.object({
      message: z.string()
    });

    // Expect failover to execute
    const result = await generateAIResponse({
      prompt: "Recommend alternatives",
      schema
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(result.provider).toBe("gemini");
    expect(result.data).toEqual({ message: "Hello from Gemini Failover" });
  });
});
