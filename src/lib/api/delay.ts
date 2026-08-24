/**
 * Simulated network latency for the mock API layer, so loading/skeleton states
 * are visible and honest during frontend-first development. Real backend calls
 * will replace this delay with actual request latency — no caller-side changes
 * needed since every call already awaits a Promise.
 */
export function networkDelay(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
