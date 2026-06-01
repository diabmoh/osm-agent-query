import { z } from "zod";
import { OsmAgentError } from "../errors.js";
import {
  clampLimit,
  validateBbox,
  type Bbox,
} from "../guardrails/limits.js";
import * as nominatim from "../clients/nominatim.js";
import {
  parseTagPair,
  resolveCategory,
} from "../ontology/tags.js";
import { intentFromBbox } from "../planner/overpass.js";
import { executeSearchIntent } from "../clients/overpass.js";
import { toolSuccess } from "../mcp/response.js";
import { summarizeSearch } from "../summarize/results.js";

export const searchInAreaSchema = z.object({
  category: z.string(),
  place: z
    .string()
    .optional()
    .describe("Named place or neighborhood to search within"),
  south: z.number().optional(),
  west: z.number().optional(),
  north: z.number().optional(),
  east: z.number().optional(),
  limit: z.number().int().optional(),
  tag_key: z.string().optional(),
  tag_value: z.string().optional(),
});

async function bboxFromPlace(place: string): Promise<Bbox> {
  const results = await nominatim.geocodeQuery(place, 1);
  if (!results.length) {
    throw new OsmAgentError(`Place not found: ${place}`, "NOT_FOUND");
  }
  const bb = nominatim.bboxFromNominatim(results[0]);
  if (!bb) {
    throw new OsmAgentError(`No bounding box for place: ${place}`, "NOT_FOUND");
  }
  validateBbox(bb);
  return bb;
}

export async function handleSearchInArea(
  args: z.infer<typeof searchInAreaSchema>,
) {
  const limit = clampLimit(args.limit);

  let bbox: Bbox;
  let areaLabel: string;
  if (args.place) {
    bbox = await bboxFromPlace(args.place);
    areaLabel = args.place;
  } else if (
    args.south !== undefined &&
    args.west !== undefined &&
    args.north !== undefined &&
    args.east !== undefined
  ) {
    bbox = {
      south: args.south,
      west: args.west,
      north: args.north,
      east: args.east,
    };
    validateBbox(bbox);
    areaLabel = "custom bbox";
  } else {
    throw new Error("Provide either place name or south/west/north/east bbox");
  }

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
  const summary = summarizeSearch(data.elements, label);
  return toolSuccess(
    `Found ${summary.count} ${label}(s) in ${areaLabel}.`,
    summary,
  );
}
