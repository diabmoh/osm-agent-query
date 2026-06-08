const HIGHLIGHT_KEYS = [
  "phone",
  "contact:phone",
  "website",
  "contact:website",
  "opening_hours",
  "wheelchair",
  "cuisine",
  "brand",
  "operator",
  "addr:street",
  "addr:housenumber",
  "addr:city",
] as const;

export function extractHighlights(
  tags: Record<string, string>,
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const key of HIGHLIGHT_KEYS) {
    if (tags[key]) out[key] = tags[key];
  }
  return Object.keys(out).length ? out : undefined;
}
