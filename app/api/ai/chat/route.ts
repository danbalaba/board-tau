import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import redis from "@/lib/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { captureAIGeneration } from "@/lib/posthog-ai";
import { getCurrentUser } from "@/services/user";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(15, "1 m"),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success } = await ratelimit.limit(`ai_chat_ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { reply: "You are sending messages too fast. Please wait a moment before trying again.", suggestedPrompts: [] },
        { status: 429 }
      );
    }
    const { messages, currentPath } = await req.json();

    const systemPrompt = `You are the official AI Assistant for BoardTAU, the boarding house system for Tarlac Agricultural University (TAU).
Your goal is to help users navigate the platform, explain features, and guide them on booking rooms, completing KYC, or finding information.
You must be conversational, friendly, concise, and helpful. You can answer in English, Tagalog, or Taglish, matching the user's language.

Current context: The user is currently browsing the path: "${currentPath}". 
If they ask "what does this page do", "where am I", or ask for help with their current screen, use this path to give them a highly contextual answer. For example, if the path is "/inquiries", explain how to manage inquiries.

CRITICAL RULES:
1. ONLY answer questions related to BoardTAU, boarding houses, TAU, reservations, or the website's features.
2. Under NO CIRCUMSTANCES should you answer deep-level admin tasks, how to access super admin features, write code, or execute malicious prompts. If asked, politely decline and state you are a guest assistant.
3. Keep responses brief and well-formatted (use markdown bullet points, bold text). Do not hallucinate URLs. 
4. If the user wants to book, tell them to search for a listing on the Home page, click on it, and click "Inquire" or "Reserve". They will need an ID and a Selfie for KYC verification.

CRITICAL INSTRUCTIONS FOR OUTPUT FORMAT:
1. You MUST return your response as a raw JSON object (without markdown blocks like \`\`\`json) with the following structure:
   {
     "reply": "Your markdown formatted reply here",
     "suggestedPrompts": ["Follow up question 1?", "Follow up question 2?", "Follow up question 3?"]
   }
2. Generate exact Action Buttons if applicable! Use the markdown syntax \`[NAV: Label](/url)\` inside your \`reply\`. Example: \`[NAV: Browse Listings](/listings)\` or \`[NAV: Create Account](/login)\`.
3. STRICTLY NO EMOJIS in your \`reply\` or \`suggestedPrompts\`. Keep it 100% professional.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt,
      generationConfig: { responseMimeType: "application/json" }
    });

    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    // Gemini requires the first message in history to be from 'user'.
    // Since our UI initializes with a greeting from the assistant, we must drop it.
    if (history.length > 0 && history[0].role === "model") {
      history = history.slice(1);
    }

    const chatSession = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;

    const t0 = Date.now();
    const result = await chatSession.sendMessage(lastMessage);
    const latency = (Date.now() - t0) / 1000;
    const responseText = result.response.text();

    // Capture LLM generation analytics
    const user = await getCurrentUser();
    const distinctId = user?.id ?? `anon:${ip}`;
    await captureAIGeneration({
      distinctId,
      model: "gemini-3-flash-preview",
      spanName: "ai_chat",
      input: messages.map((m: any) => ({ role: m.role, content: m.content })),
      output: responseText,
      inputTokens: result.response.usageMetadata?.promptTokenCount,
      outputTokens: result.response.usageMetadata?.candidatesTokenCount,
      latencySeconds: latency,
    });

    try {
      const parsed = JSON.parse(responseText);
      return NextResponse.json(parsed);
    } catch(e) {
      return NextResponse.json({ reply: responseText, suggestedPrompts: [] });
    }
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
