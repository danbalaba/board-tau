import { getPostHogClient } from "@/lib/posthog-server";
import { v4 as uuidv4 } from "uuid";

interface CaptureAIGenerationParams {
  /** Authenticated user ID, or a session/IP-derived string for anonymous calls. */
  distinctId: string;
  /** Gemini model name (e.g. "gemini-3-flash-preview"). */
  model: string;
  /** Logical name for this generation (e.g. "ai_chat", "ai_compare"). */
  spanName: string;
  /** The full prompt text or messages array sent to the model. */
  input: string | object[];
  /** The raw text response from the model. */
  output: string;
  /** Input token count from response.usageMetadata.promptTokenCount. */
  inputTokens?: number;
  /** Output token count from response.usageMetadata.candidatesTokenCount. */
  outputTokens?: number;
  /** Elapsed time in seconds. */
  latencySeconds: number;
  /** Whether the LLM call resulted in an error. */
  isError?: boolean;
  /** Error message string if isError is true. */
  error?: string;
}

export async function captureAIGeneration(params: CaptureAIGenerationParams): Promise<void> {
  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId: params.distinctId,
      event: "$ai_generation",
      properties: {
        $ai_trace_id: uuidv4(),
        $ai_span_name: params.spanName,
        $ai_model: params.model,
        $ai_provider: "google",
        $ai_input: params.input,
        $ai_output_choices: [{ role: "model", content: params.output }],
        $ai_input_tokens: params.inputTokens,
        $ai_output_tokens: params.outputTokens,
        $ai_latency: params.latencySeconds,
        ...(params.isError && { $ai_is_error: true, $ai_error: params.error }),
      },
    });
    await posthog.flush();
  } catch (err) {
    console.error("PostHog $ai_generation capture failed:", err);
  }
}
