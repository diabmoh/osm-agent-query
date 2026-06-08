import { z } from "zod";
import {
  bboxAroundPoint,
  clampLimit,
  validateCoordinates,
} from "../guardrails/limits.js";
import {
  parseTagPair,
  resolveCategory,
} from "../ontology/tags.js";
import { intentFromBbox } from "../planner/overpass.js";
import { executeSearchIntent } from "../clients/overpass.js";
import { toolSuccess } from "../mcp/response.js";
import { summarizeSearch } from "../summarize/results.js";

export const searchNearbySchema = z.object({
  category: z
    .string()
    .describe(
      "Category: restaurant, cafe, pharmacy, supermarket, hospital, school, parking, ev_charging, hotel, bank, fuel, park, library, museum, dentist, bakery, atm, post_office, bar, cinema",
    ),
  lat: z.number(),
  lon: z.number(),
  radius_m: z
    .number()
    .optional()
    .default(800)
    .describe("Search radius in meters (10-5000)"),
  limit: z.number().int().optional(),
  tag_key: z.string().optional().describe("Custom OSM tag key (with category custom)"),
  tag_value: z.string().optional().describe("Custom OSM tag value"),
  format: z
    .enum(["compact", "full"])
    .optional()
    .default("compact")
    .describe("compact: links + highlights; full: includes raw tags"),
});

export async function handleSearchNearby(
  args: z.infer<typeof searchNearbySchema>,
) {
  validateCoordinates(args.lat, args.lon);
  const limit = clampLimit(args.limit);
  const bbox = bboxAroundPoint(args.lat, args.lon, args.radius_m);

  let tagFilters;
  let label: string;
  if (args.category.toLowerCase() === "custom") {
    const custom = parseTagPair(args.tag_key, args.tag_value);
    if (!custom) throw new Error("custom category requires tag_key");
    tagFilters = [custom];
    label = args.tag_key ?? "custom";
  } else {
    const spec = resolveCategory(args.category);
    tagFilters = spec.tags;
    label = spec.label;
  }

  const intent = intentFromBbox(bbox, tagFilters, limit);
  const data = await executeSearchIntent(intent);
  const summary = summarizeSearch(data.elements, label, {
    centerLat: args.lat,
    centerLon: args.lon,
    format: args.format,
  });
  return toolSuccess(
    `Found ${summary.count} ${label}(s) within ${args.radius_m}m.`,
    summary,
  );
}
