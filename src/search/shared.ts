import {
  bboxAroundPoint,
  clampLimit,
  validateCoordinates,
  MAX_RESULTS,
} from "../guardrails/limits.js";
import {
  parseTagPair,
  resolveCategory,
} from "../ontology/tags.js";
import type { TagFilter } from "../ontology/tags.js";

export function resolveSearchCategory(
  category: string,
  tag_key?: string,
  tag_value?: string,
): { tagFilters: TagFilter[]; label: string } {
  if (category.toLowerCase() === "custom") {
    const custom = parseTagPair(tag_key, tag_value);
    if (!custom) throw new Error("custom category requires tag_key");
    return { tagFilters: [custom], label: tag_key ?? "custom" };
  }
  const spec = resolveCategory(category);
  return { tagFilters: spec.tags, label: spec.label };
}

export function prepareNearbySearch(args: {
  lat: number;
  lon: number;
  radius_m: number;
  limit?: number;
  fetch_pool?: number;
}) {
  validateCoordinates(args.lat, args.lon);
  const resultLimit = clampLimit(args.limit);
  const fetchLimit = Math.min(
    MAX_RESULTS,
    Math.max(resultLimit, args.fetch_pool ?? resultLimit * 3),
  );
  const bbox = bboxAroundPoint(args.lat, args.lon, args.radius_m);
  return { resultLimit, fetchLimit, bbox };
}
