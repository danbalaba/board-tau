"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    workbox?: {
      register: () => Promise<ServiceWorkerRegistration | undefined>;
      [key: string]: any;
    };
  }
}

/**
 * Custom PWA registration component with graceful error handling.
 * Avoids unhandled promise rejections ("Error: Rejected") when service workers
 * are blocked by Incognito mode, security scanners (e.g. wrsParams), or restricted WebViews.
 */
export default function RegisterPWA() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox !== undefined
    ) {
      window.workbox.register().catch((error: unknown) => {
        // Benign: Service worker registration is rejected in incognito mode,
        // restricted WebViews, or by automated crawlers/security scanners (e.g. wrsParams).
        if (process.env.NODE_ENV === "development") {
          console.debug("PWA service worker registration skipped or rejected:", error);
        }
      });
    }
  }, []);

  return null;
}
