// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
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
});
