"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { headers } from "next/headers";
import { strictLimiter } from "@/lib/rate-limit";
import { captureAIGeneration } from "@/lib/posthog-ai";
import { getCurrentUser } from "@/services/user";

/**
 * Re-implemented AI enrichment logic directly inside the server action.
 * Evaluates listings against user search parameters to provide tailored highlights.
 */
async function enrichSearchResultsWithAI(results: any[], searchParams: Record<string, string>) {
  if (!results.length || !searchParams) return results;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const searchContext = JSON.stringify(searchParams);
    const listingsMin = results.map(r => ({ id: r.id, title: r.title, description: r.description }));

    const prompt = `You are a matching assistant. A user searched with these parameters: ${searchContext}.
    Here are the listings they got back: ${JSON.stringify(listingsMin)}
    For each listing, write a short, 1-sentence "aiHighlight" explaining why it's a good match for this user's specific search.
    Return ONLY a raw JSON array of objects with "id" and "aiHighlight" fields. No markdown formatting or \`\`\`.`;

    let text = "";
    let latency = 0;
    
    // Safely wrap the generation call so 429 Rate Limits don't crash the server component
    try {
      const t0 = Date.now();
      const response = await model.generateContent(prompt);
      latency = (Date.now() - t0) / 1000;
      text = response.response.text();
      
      const user = await getCurrentUser();
      await captureAIGeneration({
        distinctId: user?.id ?? "anon:enrichment",
        model: "gemini-3-flash-preview",
        spanName: "ai_enrichment",
        input: [{ role: "user", content: prompt }],
        output: text,
        inputTokens: response.response.usageMetadata?.promptTokenCount,
        outputTokens: response.response.usageMetadata?.candidatesTokenCount,
        latencySeconds: latency,
      });
    } catch (apiError: any) {
      console.warn("AI Quota or API Error (safely caught):", apiError.message);
      return results; // Return original results without highlights
    }

    text = text.replace(/^```json/g, "").replace(/```$/g, "").trim();
    
    let highlights = [];
    try {
      highlights = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI highlights JSON");
      return results;
    }

    return results.map(listing => {
      const match = highlights.find((h: any) => h.id === listing.id);
      return { ...listing, aiHighlight: match ? match.aiHighlight : null };
    });
  } catch (error) {
    console.error("AI_ENRICHMENT_ERROR:", error);
    return results;
  }
}

/**
 * HI-2 FIX: Server Action wrapper for async AI enrichment.
 * This allows the client to trigger AI processing after the initial search results
 * are rendered, preventing search latency.
 */
export async function getAIEnrichmentAction(
  results: any[],
  searchParams: Record<string, string>
) {
  try {
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
    
    // Use the same strict limiter as other AI routes to prevent abuse
    const { success } = await strictLimiter.limit(`ai_enrichment_ratelimit_${ip}`);
    if (!success) {
      console.warn(`Rate limit exceeded for AI enrichment: ${ip}`);
      // Fail silently for the user so it just doesn't show highlights, rather than throwing an error page
      return { success: true, data: results }; 
    }

    const enriched = await enrichSearchResultsWithAI(results, searchParams);
    return { success: true, data: enriched };
  } catch (error) {
    console.error("AI_ENRICHMENT_ACTION_ERROR:", error);
    return { success: false, error: "Failed to enrich results" };
  }
}
