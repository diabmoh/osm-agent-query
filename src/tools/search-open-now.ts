import { z } from "zod";
import { intentFromBbox } from "../planner/overpass.js";
import { executeSearchIntent } from "../clients/overpass.js";
import { toolSuccess } from "../mcp/response.js";
import { haversineM } from "../geo/haversine.js";
import { linksForPlace } from "../osm/links.js";
import { extractHighlights } from "../osm/tag-highlights.js";
import {
  filterElementsOpenNow,
  type PlaceWithHours,
} from "../opening-hours/filter-places.js";
import { prepareNearbySearch, resolveSearchCategory } from "../search/shared.js";
import type { OutputFormat } from "../summarize/results.js";

export const searchOpenNowSchema = z.object({
  category: z
    .string()
    .describe(
      "POI category (same as search_nearby): cafe, pharmacy, restaurant, etc.",
    ),
  lat: z.number(),
  lon: z.number(),
  radius_m: z.number().optional().default(800),
  limit: z
    .number()
    .int()
    .optional()
    .describe("Max open places to return (default 20)"),
  tag_key: z.string().optional(),
  tag_value: z.string().optional(),
  at_time: z
    .string()
    .optional()
    .describe(
      "ISO 8601 datetime with timezone for evaluation, e.g. 2026-06-01T19:30:00+02:00. Defaults to now.",
    ),
  include_unknown: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "If true, include POIs without opening_hours or with unknown state (not only open)",
    ),
  country_code: z
    .string()
    .length(2)
    .optional()
    .describe("ISO country code (e.g. de, fr) for holiday-aware opening_hours"),
  format: z.enum(["compact", "full"]).optional().default("compact"),
});

function enrichPlaces(
  places: PlaceWithHours[],
  center: { lat: number; lon: number },
  format: OutputFormat,
  resultLimit: number,
): PlaceWithHours[] {
  const enriched = places.map((p) => {
    const distance_m = haversineM(center.lat, center.lon, p.lat, p.lon);
    const links = linksForPlace(
      p.lat,
      p.lon,
      p.osm_type as "node" | "way" | "relation" | undefined,
      p.osm_id,
      center,
    );
    const row: PlaceWithHours = {
      ...p,
      distance_m,
      links,
    };
    if (format === "full" && p.opening_hours) {
      row.highlights = {
        opening_hours: p.opening_hours,
        ...(p.hours_prettified ? { hours_prettified: p.hours_prettified } : {}),
      };
    }
    return row;
  });

  enriched.sort((a, b) => (a.distance_m ?? 0) - (b.distance_m ?? 0));
  return enriched.slice(0, resultLimit);
}

export async function handleSearchOpenNow(
  args: z.infer<typeof searchOpenNowSchema>,
) {
  const { tagFilters, label } = resolveSearchCategory(
    args.category,
    args.tag_key,
    args.tag_value,
  );
  const { resultLimit, fetchLimit, bbox } = prepareNearbySearch({
    lat: args.lat,
    lon: args.lon,
    radius_m: args.radius_m,
    limit: args.limit,
    fetch_pool: 60,
  });

  const intent = intentFromBbox(bbox, tagFilters, fetchLimit, ["opening_hours"]);
  const data = await executeSearchIntent(intent);

  const mode = args.include_unknown ? "open_and_unknown" : "open_only";
  const filtered = filterElementsOpenNow(data.elements, {
    at_time: args.at_time,
    mode,
    location: {
      lat: args.lat,
      lon: args.lon,
      country_code: args.country_code?.toLowerCase(),
    },
  });

  let places = enrichPlaces(
    filtered.places,
    { lat: args.lat, lon: args.lon },
    args.format,
    resultLimit,
  );

  for (const p of places) {
    const tagHighlights = p.opening_hours
      ? extractHighlights({ opening_hours: p.opening_hours })
      : undefined;
    if (tagHighlights) {
      p.highlights = { ...p.highlights, ...tagHighlights };
    }
  }

  const payload = {
    category: label,
    evaluated_at: filtered.at_iso,
    radius_m: args.radius_m,
    count: places.length,
    places,
    stats: filtered.stats,
    note: args.include_unknown
      ? "Includes open, unknown, and POIs missing opening_hours tag."
      : "Only POIs with opening_hours tag evaluated as open at evaluated_at.",
  };

  return toolSuccess(
    `${places.length} ${label}(s) open now within ${args.radius_m}m (${filtered.stats.open} open of ${filtered.stats.candidates} with hours data).`,
    payload,
  );
}
