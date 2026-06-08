import { OVERPASS_TIMEOUT_S } from "../guardrails/limits.js";
import type { Bbox } from "../guardrails/limits.js";
import type { TagFilter } from "../ontology/tags.js";
import type { SearchIntent } from "./types.js";

function tagToOverpassSelector(
  tags: TagFilter,
  requireTagKeys?: string[],
): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(tags)) {
    if (v === "*") {
      parts.push(`["${k}"]`);
    } else {
      parts.push(`["${k}"="${v}"]`);
    }
  }
  for (const key of requireTagKeys ?? []) {
    parts.push(`["${key}"]`);
  }
  return parts.join("");
}

/** Build Overpass QL from structured intent (never exposed to agents). */
export function buildOverpassQuery(intent: SearchIntent): string {
  const { bbox, tagFilters, limit, requireTagKeys } = intent;
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const selectors = tagFilters.map((tags) => {
    const sel = tagToOverpassSelector(tags, requireTagKeys);
    return `  node${sel}(${bboxStr});\n  way${sel}(${bboxStr});\n`;
  });

  const body = selectors.join("\n");
  return `[out:json][timeout:${OVERPASS_TIMEOUT_S}];
(
${body});
out center ${limit};`;
}

export function intentFromBbox(
  bbox: Bbox,
  tagFilters: TagFilter[],
  limit: number,
  requireTagKeys?: string[],
): SearchIntent {
  return { bbox, tagFilters, limit, requireTagKeys };
}
