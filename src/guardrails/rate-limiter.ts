import { NOMINATIM_MIN_INTERVAL_MS } from "../config.js";

let lastNominatimAt = 0;

export async function waitForNominatimSlot(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastNominatimAt;
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((r) =>
      setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - elapsed),
    );
  }
  lastNominatimAt = Date.now();
}

/** Reset for tests. */
export function resetRateLimiter(): void {
  lastNominatimAt = 0;
}
