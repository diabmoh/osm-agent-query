export const DEFAULT_USER_AGENT =
  process.env.OSM_USER_AGENT ??
  "osm-agent-query/0.1.0 (MCP server; https://github.com/osm-agent-query/osm-agent-query)";

export const NOMINATIM_BASE =
  process.env.NOMINATIM_URL ?? "https://nominatim.openstreetmap.org";

export const OVERPASS_BASE =
  process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";

export const OSRM_BASE =
  process.env.OSRM_URL ?? "https://router.project-osrm.org";

export const TAGINFO_BASE =
  process.env.TAGINFO_URL ?? "https://taginfo.openstreetmap.org/api/4";

/** Minimum seconds between Nominatim requests (usage policy). */
export const NOMINATIM_MIN_INTERVAL_MS = 1100;
