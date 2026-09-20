import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import * as Sentry from "@sentry/nextjs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface AIProviderOptions<T> {
  prompt: string;
  systemInstruction?: string;
  schema?: z.ZodSchema<T>;
  spanName?: string;
}

interface AIResponseResult<T> {
  data: T | null;
  rawText: string;
  provider: "groq" | "gemini" | "fallback";
}

/**
 * Executes a call to Groq API (llama-3.3-70b-versatile) with automatic failover to Gemini 3 Flash.
 * Guarantees zero downtime and bypasses single-provider 429 Rate Limits.
 * Wrapped in Sentry AI Spans for AI Agent Monitoring.
 */
export async function generateAIResponse<T = any>(
  options: AIProviderOptions<T>
): Promise<AIResponseResult<T>> {
  return Sentry.startSpan(
    {
      name: options.spanName || "ai.chat_completion",
      op: "gen_ai.chat",
      attributes: {
        "gen_ai.system": "groq_gemini_fallback",
        "gen_ai.request.model": "openai/gpt-oss-20b",
      },
    },
    async (span) => {
      const groqApiKey = process.env.GROQ_API_KEY;
      const geminiApiKey = process.env.GEMINI_API_KEY;

      // Try Groq API first if GROQ_API_KEY is available
      if (groqApiKey) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-oss-20b",
              response_format: { type: "json_object" },
              max_tokens: 2048,
              messages: [
                { 
                  role: "system", 
                  content: (options.systemInstruction || "You are a helpful AI assistant.") + "\n\nCRITICAL: You MUST respond in raw valid JSON format." 
                },
                { role: "user", content: options.prompt }
              ],
              temperature: 0.2,
            }),
          });

          if (response.ok) {
            const json = await response.json();
            const rawText = json.choices?.[0]?.message?.content || "";
            
            let parsedData: T | null = null;
            if (options.schema) {
              try {
                const jsonParsed = JSON.parse(rawText);
                parsedData = options.schema.parse(jsonParsed);
              } catch (err) {
                console.warn("[AIProvider] Groq output failed Zod validation, trying raw parse", err);
                parsedData = JSON.parse(rawText) as T;
              }
            } else {
              try {
                parsedData = JSON.parse(rawText) as T;
              } catch {
                parsedData = rawText as any;
              }
            }

            span.setAttribute("gen_ai.response.model", "groq/gpt-oss-20b");
            span.setAttribute("gen_ai.provider", "groq");
            if (json.usage) {
              span.setAttribute("gen_ai.usage.prompt_tokens", json.usage.prompt_tokens || 0);
              span.setAttribute("gen_ai.usage.completion_tokens", json.usage.completion_tokens || 0);
            }

            return { data: parsedData, rawText, provider: "groq" };
          } else {
            const errorText = await response.text();
            console.warn(`[AIProvider] Groq returned status ${response.status}: ${errorText}. Failing over to Gemini...`);
            span.setAttribute("gen_ai.groq_failed", true);
          }
        } catch (groqErr) {
          console.warn("[AIProvider] Groq API call failed. Failing over to Gemini...", groqErr);
          span.setAttribute("gen_ai.groq_failed", true);
        }
      }

      // Fallback to Gemini 3 Flash
      if (geminiApiKey) {
        try {
          const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: options.systemInstruction,
            generationConfig: { responseMimeType: "application/json" }
          });

          const result = await model.generateContent(options.prompt);
          let rawText = result.response.text().trim();

          // Clean markdown formatting if present
          if (rawText.startsWith("```json")) rawText = rawText.replace("```json", "");
          if (rawText.startsWith("```")) rawText = rawText.replace("```", "");
          if (rawText.endsWith("```")) rawText = rawText.substring(0, rawText.length - 3).trim();

          let parsedData: T | null = null;
          if (options.schema) {
            try {
              const jsonParsed = JSON.parse(rawText);
              parsedData = options.schema.parse(jsonParsed);
            } catch (err) {
              console.warn("[AIProvider] Gemini output failed Zod validation", err);
              parsedData = JSON.parse(rawText) as T;
            }
          } else {
            try {
              parsedData = JSON.parse(rawText) as T;
            } catch {
              parsedData = rawText as any;
            }
          }

          span.setAttribute("gen_ai.response.model", "gemini-3-flash-preview");
          span.setAttribute("gen_ai.provider", "gemini");

          return { data: parsedData, rawText, provider: "gemini" };
        } catch (geminiErr) {
          console.error("[AIProvider] Gemini API call also failed", geminiErr);
          Sentry.captureException(geminiErr, { tags: { feature: "ai_provider" } });
        }
      }

      span.setAttribute("gen_ai.provider", "fallback");
      return { data: null, rawText: "", provider: "fallback" };
    }
  );
}
