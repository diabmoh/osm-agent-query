import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { toToolError } from "../errors.js";
import { formatToolPayload } from "./response.js";
import {
  geocodeSchema,
  handleGeocode,
} from "../tools/geocode.js";
import {
  reverseGeocodeSchema,
  handleReverseGeocode,
} from "../tools/reverse-geocode.js";
import {
  searchNearbySchema,
  handleSearchNearby,
} from "../tools/search-nearby.js";
import {
  searchInAreaSchema,
  handleSearchInArea,
} from "../tools/search-in-area.js";
import { routeSchema, handleRoute } from "../tools/route.js";
import {
  explainTagsSchema,
  handleExplainTags,
} from "../tools/explain-tags.js";
import {
  previewQuerySchema,
  handlePreviewQuery,
} from "../tools/preview-query.js";
import { mapLinksSchema, handleMapLinks } from "../tools/map-links.js";
import {
  compareRoutesSchema,
  handleCompareRoutes,
} from "../tools/compare-routes.js";
import {
  searchOpenNowSchema,
  handleSearchOpenNow,
} from "../tools/search-open-now.js";

async function runTool<T>(
  handler: () => Promise<T>,
): Promise<{ content: { type: "text"; text: string }[]; isError?: boolean }> {
  try {
    const result = await handler();
    return {
      content: [{ type: "text", text: formatToolPayload(result) }],
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: "text", text: formatToolPayload(toToolError(err)) }],
    };
  }
}

export function registerOsmTools(server: McpServer): void {
  server.registerTool(
    "geocode",
    {
      description:
        "Resolve a place name or address to coordinates and bounding box using OpenStreetMap Nominatim. Use before search_nearby when you only have a name.",
      inputSchema: geocodeSchema.shape,
    },
    async (args) =>
      runTool(() => handleGeocode(geocodeSchema.parse(args))),
  );

  server.registerTool(
    "reverse_geocode",
    {
      description:
        "Convert latitude/longitude to a human-readable address and place name (Nominatim reverse geocoding).",
      inputSchema: reverseGeocodeSchema.shape,
    },
    async (args) =>
      runTool(() => handleReverseGeocode(reverseGeocodeSchema.parse(args))),
  );

  server.registerTool(
    "search_open_now",
    {
      description:
        "Find POIs that are open right now (or at at_time) using OSM opening_hours evaluation. Fetches candidates with opening_hours tags, evaluates schedule, returns only open results by default. Prefer over search_nearby when the user asks for open now / still open / late night.",
      inputSchema: searchOpenNowSchema.shape,
    },
    async (args) =>
      runTool(() => handleSearchOpenNow(searchOpenNowSchema.parse(args))),
  );

  server.registerTool(
    "search_nearby",
    {
      description:
        "Find OpenStreetMap points of interest by category within a radius (meters) of a coordinate. Uses a validated internal Overpass planner—do not write OverpassQL yourself.",
      inputSchema: searchNearbySchema.shape,
    },
    async (args) =>
      runTool(() => handleSearchNearby(searchNearbySchema.parse(args))),
  );

  server.registerTool(
    "search_in_area",
    {
      description:
        "Find POIs by category within a named place (geocoded bbox) or an explicit south/west/north/east bounding box.",
      inputSchema: searchInAreaSchema.shape,
    },
    async (args) =>
      runTool(() => handleSearchInArea(searchInAreaSchema.parse(args))),
  );

  server.registerTool(
    "route",
    {
      description:
        "Walking, driving, or cycling route between two coordinates via OSRM. Returns distance, duration, and directions link. Set include_geometry true only when you need the encoded polyline for map rendering.",
      inputSchema: routeSchema.shape,
    },
    async (args) => runTool(() => handleRoute(routeSchema.parse(args))),
  );

  server.registerTool(
    "explain_osm_tags",
    {
      description:
        "Explain OSM tag keys/values and suggest alternatives (Taginfo + curated hints). Set list_categories true to list supported search categories.",
      inputSchema: explainTagsSchema.shape,
    },
    async (args) =>
      runTool(() => handleExplainTags(explainTagsSchema.parse(args))),
  );

  server.registerTool(
    "preview_query",
    {
      description:
        "Preview the structured Overpass query that would run for a nearby search—debugging only; does not hit the network or return map data.",
      inputSchema: previewQuerySchema.shape,
    },
    async (args) =>
      runTool(() => handlePreviewQuery(previewQuerySchema.parse(args))),
  );

  server.registerTool(
    "map_links",
    {
      description:
        "Generate OpenStreetMap URLs for a coordinate: map view, element page, and optional walking/driving directions from another point. Share links with end users.",
      inputSchema: mapLinksSchema.shape,
    },
    async (args) => runTool(() => handleMapLinks(mapLinksSchema.parse(args))),
  );

  server.registerTool(
    "compare_routes",
    {
      description:
        "Compare foot, driving, and cycling routes between two points in one call. Includes OSM directions links for each mode.",
      inputSchema: compareRoutesSchema.shape,
    },
    async (args) =>
      runTool(() => handleCompareRoutes(compareRoutesSchema.parse(args))),
  );
}
