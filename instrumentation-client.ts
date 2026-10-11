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
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // EdgeStore background initialization network/API errors
    "EdgeStoreApiClientError",
    "EdgeStoreClientError",
    /EdgeStoreApiClientError/i,
    /EdgeStoreClientError/i,
    /edgestore/i,
    // Service worker registration rejections (e.g. Incognito mode, Android WebViews, wrsParams)
    /^Rejected$/,
    "Rejected",
    /serviceWorker\.register/i,
    /wrsParams/i,
  ],
  integrations: [
    Sentry.feedbackIntegration({
      autoInject: false,
      showTrigger: false,
      showBranding: false,
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
      // Filter out benign browser warnings, network drops, service worker rejections & EdgeStore background init errors
      if (
        msg === "Rejected" ||
        msg.includes("ResizeObserver loop limit exceeded") ||
        msg.includes("ResizeObserver loop completed with undelivered notifications") ||
        msg.includes("Failed to fetch") ||
        msg.includes("Load failed") ||
        msg.includes("NetworkError") ||
        msg.includes("serviceWorker") ||
        msg.includes("EdgeStoreApiClientError") ||
        msg.includes("EdgeStoreClientError") ||
        (error as any)?.name === "EdgeStoreApiClientError" ||
        (error as any)?.name === "EdgeStoreClientError"
      ) {
        return null;
      }
    }
    // Filter EdgeStore unhandled rejection exceptions
    if (
      event.exception?.values?.some((e) =>
        e.type === "EdgeStoreApiClientError" ||
        e.type === "EdgeStoreClientError" ||
        e.value?.includes("EdgeStoreApiClientError") ||
        e.value?.includes("EdgeStoreClientError") ||
        (e.value?.includes("Internal server error") && e.stacktrace?.frames?.some((f) => f.filename?.includes("edgestore")))
      )
    ) {
      return null;
    }
    // Ignore browser extension and security scanner (wrsParams) stack traces
    if (
      event.exception?.values?.some((e) =>
        e.stacktrace?.frames?.some(
          (f) =>
            f.filename?.includes("chrome-extension://") ||
            f.filename?.includes("moz-extension://") ||
            f.function?.includes("wrsParams") ||
            f.filename?.includes("wrsParams")
        )
      )
    ) {
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
