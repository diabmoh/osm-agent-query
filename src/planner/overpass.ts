import { OVERPASS_TIMEOUT_S } from "../guardrails/limits.js";
import type { Bbox } from "../guardrails/limits.js";
import type { TagFilter } from "../ontology/tags.js";
import type { SearchIntent } from "./types.js";

function tagToOverpassSelector(tags: TagFilter): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(tags)) {
    if (v === "*") {
      parts.push(`["${k}"]`);
    } else {
      parts.push(`["${k}"="${v}"]`);
    }
  }
  return parts.join("");
}

/** Build Overpass QL from structured intent (never exposed to agents). */
export function buildOverpassQuery(intent: SearchIntent): string {
  const { bbox, tagFilters, limit } = intent;
  const bboxStr = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;

  const selectors = tagFilters.map((tags) => {
    const sel = tagToOverpassSelector(tags);
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
): SearchIntent {
  return { bbox, tagFilters, limit };
}
