"use server";

import { enrichSearchResultsWithAI } from "@/services/listing/search.service";

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
    const enriched = await enrichSearchResultsWithAI(results, searchParams);
    return { success: true, data: enriched };
  } catch (error) {
    console.error("AI_ENRICHMENT_ACTION_ERROR:", error);
    return { success: false, error: "Failed to enrich results" };
  }
}
