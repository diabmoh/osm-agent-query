import { NOMINATIM_BASE } from "../config.js";
import { waitForNominatimSlot } from "../guardrails/rate-limiter.js";
import { validateCoordinates } from "../guardrails/limits.js";
import { osmJson } from "./http.js";

export type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  boundingbox?: [string, string, string, string];
  osm_type?: string;
  osm_id?: number;
  type?: string;
  class?: string;
};

export async function geocodeQuery(
  query: string,
  limit = 5,
): Promise<NominatimResult[]> {
  await waitForNominatimSlot();
  const params = new URLSearchParams({
    q: query,
    format: "json",
    addressdetails: "1",
    limit: String(Math.min(limit, 10)),
  });
  return osmJson<NominatimResult[]>(
    `${NOMINATIM_BASE}/search?${params}`,
  );
}

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<NominatimResult> {
  validateCoordinates(lat, lon);
  await waitForNominatimSlot();
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    format: "json",
    addressdetails: "1",
  });
  const results = await osmJson<NominatimResult>(
    `${NOMINATIM_BASE}/reverse?${params}`,
  );
  return results;
}

export function bboxFromNominatim(r: NominatimResult): {
  south: number;
  west: number;
  north: number;
  east: number;
} | null {
  if (!r.boundingbox || r.boundingbox.length < 4) return null;
  const [south, north, west, east] = r.boundingbox.map(Number);
  return { south, north, west, east };
}
