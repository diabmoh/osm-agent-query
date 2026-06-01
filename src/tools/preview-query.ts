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
import { buildOverpassQuery, intentFromBbox } from "../planner/overpass.js";

export const previewQuerySchema = z.object({
  category: z.string(),
  lat: z.number(),
  lon: z.number(),
  radius_m: z.number().optional().default(800),
  limit: z.number().int().optional(),
  tag_key: z.string().optional(),
  tag_value: z.string().optional(),
});

export async function handlePreviewQuery(
  args: z.infer<typeof previewQuerySchema>,
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
  const query = buildOverpassQuery(intent);

  return {
    ok: true,
    summary: `Preview Overpass plan for ${label} within ${args.radius_m}m (not executed).`,
    data: {
      category: label,
      bbox,
      tag_filters: tagFilters,
      limit,
      note: "For agent debugging. Production queries should use search_nearby.",
      overpass_preview: query,
    },
  };
}
