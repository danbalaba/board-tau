"use client";

import { ReactLenis } from '@studio-freight/react-lenis';

/**
 * Auto-detect scrollable containers so Lenis never intercepts wheel events
 * on any element with overflow-y: auto or scroll. This covers all modals,
 * dropdowns, and scrollable panels globally — no data-lenis-prevent needed.
 */
function preventLenis(node: Element): boolean {
  const style = window.getComputedStyle(node);
  const overflowY = style.overflowY;
  return overflowY === 'auto' || overflowY === 'scroll';
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.08, duration: 1.5, smoothWheel: true, prevent: preventLenis }}>
      <>{children}</>
    </ReactLenis>
  );
}
