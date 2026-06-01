import { OVERPASS_BASE } from "../config.js";
import { osmFetch } from "./http.js";
import { withRetry } from "./retry.js";
import { buildOverpassQuery } from "../planner/overpass.js";
import type { SearchIntent } from "../planner/types.js";

export type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export type OverpassResponse = {
  elements: OverpassElement[];
};

export async function executeSearchIntent(
  intent: SearchIntent,
): Promise<OverpassResponse> {
  const query = buildOverpassQuery(intent);
  return withRetry(async () => {
    const res = await osmFetch(OVERPASS_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      timeoutMs: 35_000,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Overpass error ${res.status}: ${text.slice(0, 300)}`);
    }
    return res.json() as Promise<OverpassResponse>;
  });
}
