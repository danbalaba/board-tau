// Global in-memory cache for search modal step load states
const stepLoadCache = new Set<string>();

export function isStepCached(stepKey: string): boolean {
  return stepLoadCache.has(stepKey);
}

export function markStepCached(stepKey: string): void {
  stepLoadCache.add(stepKey);
}

export function clearStepCache(): void {
  stepLoadCache.clear();
}
