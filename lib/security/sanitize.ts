// lib/security/sanitize.ts

/**
 * Escapes special characters in a string to be used safely inside a MongoDB $regex query.
 * Prevents NoSQL Injection and ReDoS vulnerabilities.
 * @param text The raw input string from the user.
 * @returns A sanitized string safe for regex execution.
 */
export function escapeRegexString(text: string): string {
  if (typeof text !== 'string') return '';
  // Match any character that has special meaning in regex and escape it with a backslash
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Truncates and sanitizes a raw user query to prevent overly long inputs
 * that could cause Prompt Injection bloat or ReDoS.
 * @param query The raw user input.
 * @param maxLength Maximum allowed length (defaults to 300).
 * @returns Cleaned and truncated string.
 */
export function sanitizeSearchQuery(query: string, maxLength: number = 300): string {
  if (!query || typeof query !== 'string') return '';
  
  // Truncate to prevent long payload attacks
  let clean = query.trim().substring(0, maxLength);
  
  // Basic XSS cleanup: replace angle brackets
  clean = clean.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  return clean;
}

// Injection Patterns (Case-Insensitive Regex & Keywords)
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /forget\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /override\s+system\s+prompt/i,
  /jailbreak\s+mode/i,
  /dan\s+mode/i,
  /act\s+as\s+an?\s+unrestricted/i,
  /print\s+your\s+system\s+instructions/i,
  /show\s+me\s+your\s+system\s+prompt/i,
  /reveal\s+(the\s+)?(api\s+key|environment|env\s+vars|secret|password|database)/i,
  /process\.env/i,
  /mongodb\+srv:\/\//i,
  /DATABASE_URL/i,
  /UPSTASH_REDIS_REST/i,
  /FACEBOOK_CLIENT/i,
  /GOOGLE_CLIENT/i,
  /NEXTAUTH_SECRET/i,
  /EDGE_STORE/i,
  /STRIPE_SECRET/i,
  /RESEND_API_KEY/i,
  /OTP_SECRET/i,
  /PAYMONGO/i,
  /GEMINI_API_KEY/i,
  /PUSHER_SECRET/i,
  /MESSAGE_ENCRYPTION_KEY/i,
  /POSTHOG/i,
  /SENTRY_AUTH_TOKEN/i,
  /GROQ_API_KEY/i,
];

/**
 * Checks whether user input contains dangerous prompt injection or secret extraction attempts.
 */
export function detectPromptInjection(input: string): { isInjection: boolean; reason?: string } {
  if (!input || typeof input !== 'string') return { isInjection: false };

  const clean = input.trim();
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        isInjection: true,
        reason: "Prompt injection or sensitive secret extraction attempt detected."
      };
    }
  }

  return { isInjection: false };
}

/**
 * Data Loss Prevention (DLP): Scrubs sensitive tokens, credentials, and system secrets from AI output.
 */
export function sanitizeAIOutput(output: string): string {
  if (!output || typeof output !== 'string') return output;

  let sanitized = output;

  // Mask API Keys (Groq, Gemini, Stripe, SendGrid, JWTs, etc.)
  sanitized = sanitized.replace(/(gsk_[a-zA-Z0-9_-]{20,})/gi, "[REDACTED_API_KEY]");
  sanitized = sanitized.replace(/(AIzaSy[a-zA-Z0-9_-]{33})/g, "[REDACTED_API_KEY]");
  sanitized = sanitized.replace(/(sk_(?:live|test)_[a-zA-Z0-9]{24,})/gi, "[REDACTED_API_KEY]");
  sanitized = sanitized.replace(/(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,})/g, "[REDACTED_JWT_TOKEN]");

  // Mask Connection Strings (MongoDB, Redis, Postgres)
  sanitized = sanitized.replace(/(mongodb(?:\+srv)?:\/\/[^\s"']+)/gi, "[REDACTED_DB_URI]");
  sanitized = sanitized.replace(/(redis:\/\/[^\s"']+)/gi, "[REDACTED_REDIS_URI]");
  sanitized = sanitized.replace(/(postgres(?:ql)?:\/\/[^\s"']+)/gi, "[REDACTED_DB_URI]");

  // Mask Private Keys & RSA Headers
  sanitized = sanitized.replace(/-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/g, "[REDACTED_PRIVATE_KEY]");

  // Mask Process Env Leaks
  sanitized = sanitized.replace(/process\.env\.[A-Z0-9_]+/gi, "[REDACTED_ENV_VAR]");

  return sanitized;
}

/**
 * Validates and sanitizes dynamic image URLs (blob:, data:image/, http:, https:, /)
 * to prevent DOM XSS through <img> src attributes (CodeQL js/xss-through-dom).
 * Guaranteed to return a safe sanitized string URL or a safe default empty string.
 */
export function sanitizeImgUrl(url: string | null | undefined): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();

  // Reject dangerous pseudo-protocols or non-image data URIs
  if (/^(javascript|vbscript|data:(?!image\/)):/i.test(trimmed)) {
    return '';
  }

  // Allow safe image protocols and relative paths
  if (
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return encodeURI(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    if (['http:', 'https:', 'blob:'].includes(parsed.protocol) || (parsed.protocol === 'data:' && parsed.pathname.startsWith('image/'))) {
      return parsed.href;
    }
  } catch {
    return '';
  }

  return '';
}
