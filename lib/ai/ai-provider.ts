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
 * Executes a call to Groq API (openai/gpt-oss-20b) with automatic failover to Gemini 3 Flash (gemini-3-flash-preview).
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
        "gen_ai.request.model": process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      },
    },
    async (span) => {
      const groqApiKey = process.env.GROQ_API_KEY;
      const geminiApiKey = process.env.GEMINI_API_KEY;

      // Try Groq API first if GROQ_API_KEY is available
      if (groqApiKey) {
        const primaryGroqModel = process.env.GROQ_MODEL || "openai/gpt-oss-20b";
        const groqCandidateModels = Array.from(new Set([
          primaryGroqModel,
          "openai/gpt-oss-20b",
          "qwen/qwen3.8-27b",
        ])).filter(Boolean);

        for (let i = 0; i < groqCandidateModels.length; i++) {
          const groqModelName = groqCandidateModels[i];
          try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${groqApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: groqModelName,
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
                  console.warn(`[AIProvider] Groq (${groqModelName}) output failed Zod validation, trying raw parse`, err);
                  parsedData = JSON.parse(rawText) as T;
                }
              } else {
                try {
                  parsedData = JSON.parse(rawText) as T;
                } catch {
                  parsedData = rawText as any;
                }
              }

              span.setAttribute("gen_ai.response.model", groqModelName);
              span.setAttribute("gen_ai.provider", "groq");
              if (json.usage) {
                span.setAttribute("gen_ai.usage.prompt_tokens", json.usage.prompt_tokens || 0);
                span.setAttribute("gen_ai.usage.completion_tokens", json.usage.completion_tokens || 0);
              }

              return { data: parsedData, rawText, provider: "groq" };
            } else {
              const errorText = await response.text();
              console.warn(`[AIProvider] Groq (${groqModelName}) returned status ${response.status}: ${errorText}`);
              // If model was not found (404) and we have other Groq models to try, try next Groq candidate
              if (response.status === 404 && i < groqCandidateModels.length - 1) {
                console.info(`[AIProvider] Falling over to next Groq candidate: ${groqCandidateModels[i + 1]}`);
                continue;
              }
              // For 429 or other errors, break out to failover to Gemini
              span.setAttribute("gen_ai.groq_failed", true);
              break;
            }
          } catch (groqErr) {
            console.warn(`[AIProvider] Groq (${groqModelName}) API call failed.`, groqErr);
            if (i < groqCandidateModels.length - 1) {
              continue;
            }
            span.setAttribute("gen_ai.groq_failed", true);
            break;
          }
        }
      }

      // Fallback to Gemini with multi-model cascade (e.g. gemini-3-flash-preview -> gemini-2.5-flash)
      if (geminiApiKey) {
        const configuredModel = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
        const candidateModels = Array.from(new Set([
          configuredModel,
          "gemini-3-flash-preview",
          "gemini-2.5-flash",
          "gemini-3.8-flash",
        ])).filter(Boolean);

        const genAIInstance = new GoogleGenerativeAI(geminiApiKey);

        for (let i = 0; i < candidateModels.length; i++) {
          const modelName = candidateModels[i];
          try {
            const model = genAIInstance.getGenerativeModel({
              model: modelName,
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
                console.warn(`[AIProvider] Gemini (${modelName}) output failed Zod validation`, err);
                parsedData = JSON.parse(rawText) as T;
              }
            } else {
              try {
                parsedData = JSON.parse(rawText) as T;
              } catch {
                parsedData = rawText as any;
              }
            }

            span.setAttribute("gen_ai.response.model", modelName);
            span.setAttribute("gen_ai.provider", "gemini");

            return { data: parsedData, rawText, provider: "gemini" };
          } catch (geminiErr: any) {
            const isTransient =
              geminiErr?.status === 503 ||
              geminiErr?.status === 429 ||
              geminiErr?.message?.includes("503") ||
              geminiErr?.message?.includes("429") ||
              geminiErr?.message?.includes("high demand") ||
              geminiErr?.message?.includes("quota") ||
              geminiErr?.message?.includes("RESOURCE_EXHAUSTED") ||
              geminiErr?.message?.includes("UNAVAILABLE") ||
              geminiErr?.message?.includes("Service Unavailable");

            console.warn(
              `[AIProvider] Gemini (${modelName}) call failed (${isTransient ? "Transient Capacity/High Demand" : "Error"}):`,
              geminiErr?.message || geminiErr
            );

            // If there's another candidate model to try in the cascade, continue to it!
            if (i < candidateModels.length - 1) {
              console.info(`[AIProvider] Failing over to next Gemini candidate: ${candidateModels[i + 1]}`);
              continue;
            }

            // Only report to Sentry if all models exhausted and it's an unexpected non-transient bug
            if (!isTransient) {
              Sentry.captureException(geminiErr, { tags: { feature: "ai_provider" } });
            }
          }
        }
      }

      span.setAttribute("gen_ai.provider", "fallback");
      return { data: null, rawText: "", provider: "fallback" };
    }
  );
}
