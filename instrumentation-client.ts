// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isCI = process.env.CI === "true" || process.env.NEXT_PUBLIC_VERCEL_ENV === "development";

Sentry.init({
  dsn: "https://42e2b94f6ce7cdb709afe1486307cbb7@o4511358253203456.ingest.us.sentry.io/4511358255235072",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
  enabled: !isCI && (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production"),
  tracesSampleRate: 0.1,
  enableLogs: true,
  sendDefaultPii: true,
  integrations: [
    Sentry.feedbackIntegration({
      autoInject: false,
      showTrigger: false,
      showBranding: false,
      colorScheme: "system",
      themeLight: {
        background: "#ffffff",
        foreground: "#111827",
        inputBackground: "#ffffff",
        inputColor: "#111827",
        inputBorder: "#d1d5db",
        inputFocusBorder: "#2f7d6d",
        submitBackground: "#2f7d6d",
        submitHoverBackground: "#1e5146",
        submitColor: "#ffffff",
        submitBorder: "#2f7d6d",
        submitOutline: "#2f7d6d",
        cancelBackground: "#f3f4f6",
        cancelHoverBackground: "#e5e7eb",
        cancelColor: "#374151",
        highlightColor: "#2f7d6d",
      },
      themeDark: {
        background: "#0f172a",
        foreground: "#f8fafc",
        inputBackground: "#1e293b",
        inputColor: "#f8fafc",
        inputBorder: "#334155",
        inputFocusBorder: "#2f7d6d",
        submitBackground: "#2f7d6d",
        submitHoverBackground: "#1e5146",
        submitColor: "#ffffff",
        submitBorder: "#2f7d6d",
        submitOutline: "#2f7d6d",
        cancelBackground: "#1e293b",
        cancelHoverBackground: "#334155",
        cancelColor: "#cbd5e1",
        highlightColor: "#2f7d6d",
      },
    }),
  ],
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error && typeof error === "object" && "message" in error) {
      const msg = String(error.message);
      // Filter out benign browser warnings & network drops
      if (
        msg.includes("ResizeObserver loop limit exceeded") ||
        msg.includes("ResizeObserver loop completed with undelivered notifications") ||
        msg.includes("Failed to fetch") ||
        msg.includes("Load failed") ||
        msg.includes("NetworkError")
      ) {
        return null;
      }
    }
    // Ignore browser extension stack traces
    if (event.exception?.values?.some((e) => e.stacktrace?.frames?.some((f) => f.filename?.includes("chrome-extension://") || f.filename?.includes("moz-extension://")))) {
      return null;
    }
    return event;
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

import posthog from "posthog-js";

const isProduction = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

if (process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN && isProduction) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: "/ingest",
    ui_host: "https://us.posthog.com",
    defaults: "2026-01-30",
    capture_exceptions: true,
  });
}
