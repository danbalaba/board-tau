// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://42e2b94f6ce7cdb709afe1486307cbb7@o4511358253203456.ingest.us.sentry.io/4511358255235072",
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV || process.env.NODE_ENV || "production",
  enabled: process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "production",
  tracesSampleRate: 0.1,
  enableLogs: true,
  sendDefaultPii: true,
});
