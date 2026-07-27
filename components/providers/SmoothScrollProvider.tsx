"use client";

/**
 * SmoothScrollProvider: Lenis was removed because it hijacked wheel events
 * in every modal and scrollable container across the app.
 * Smooth scrolling is now handled natively via `scroll-behavior: smooth` in globals.css.
 */
export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
