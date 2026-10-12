// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

Sentry.init({
  dsn: "https://42e2b94f6ce7cdb709afe1486307cbb7@o4511358253203456.ingest.us.sentry.io/4511358255235072",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
  enabled: !isCI && (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production"),
  tracesSampleRate: 0.1,
  enableLogs: true,
  sendDefaultPii: true,
  ignoreErrors: [
    "EdgeStoreApiClientError",
    "EdgeStoreClientError",
    /EdgeStoreApiClientError/i,
    /edgestore/i,
  ],
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error && typeof error === "object" && "message" in error) {
      const msg = String(error.message);
      if (
        msg.includes("EdgeStoreApiClientError") ||
        msg.includes("EdgeStoreClientError") ||
        (error as any)?.name === "EdgeStoreApiClientError"
      ) {
        return null;
      }
    }
    return event;
  },
});
