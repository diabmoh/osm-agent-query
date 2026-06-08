import { TAGINFO_BASE } from "../config.js";
import { TAG_HINTS } from "../ontology/tags.js";
import { osmJson } from "./http.js";

export type TagExplanation = {
  key: string;
  value: string;
  description: string;
  alternatives: string[];
  wiki_url?: string;
  usage_count?: number;
};

type TaginfoKeyValues = {
  data?: Array<{ value: string; count: number; fraction: number }>;
};

type TaginfoWiki = {
  data?: Array<{ description?: string; url?: string }>;
};

export async function explainTag(
  key: string,
  value?: string,
): Promise<TagExplanation> {
  const tagKey = value !== undefined && value !== "" ? `${key}=${value}` : key;
  const hint = TAG_HINTS[tagKey] ?? TAG_HINTS[`${key}=${value}`];

  let description = hint?.description ?? "";
  let alternatives = hint?.alternatives ?? [];
  let wiki_url: string | undefined;
  let usage_count: number | undefined;

  try {
    if (value !== undefined && value !== "") {
      const wiki = await osmJson<TaginfoWiki>(
        `${TAGINFO_BASE}/tag/wiki_pages?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`,
      );
      if (wiki.data?.[0]?.description) {
        description = wiki.data[0].description;
      }
      wiki_url = wiki.data?.[0]?.url;
    }

    const kv = await osmJson<TaginfoKeyValues>(
      `${TAGINFO_BASE}/key/values?key=${encodeURIComponent(key)}&page=1&rp=10&sortname=count&sortorder=desc`,
    );
    if (kv.data?.length) {
      usage_count = kv.data.find((d) => d.value === value)?.count;
      if (alternatives.length === 0 && value) {
        alternatives = kv.data
          .filter((d) => d.value !== value)
          .slice(0, 5)
          .map((d) => `${key}=${d.value}`);
      }
    }
  } catch {
    // Taginfo optional; use local hints
  }

  if (!description) {
    description = value
      ? `OSM tag ${key}=${value}`
      : `OSM tag key "${key}"`;
  }

  return {
    key,
    value: value ?? "",
    description,
    alternatives,
    wiki_url,
    usage_count,
  };
}
