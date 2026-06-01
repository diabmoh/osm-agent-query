import type { Bbox } from "../guardrails/limits.js";
import type { TagFilter } from "../ontology/tags.js";

export type SearchIntent = {
  tagFilters: TagFilter[];
  bbox: Bbox;
  limit: number;
  /** Require these tag keys on matched elements (e.g. opening_hours). */
  requireTagKeys?: string[];
};
