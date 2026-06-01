#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  geocodeSchema,
  handleGeocode,
} from "./tools/geocode.js";
import {
  reverseGeocodeSchema,
  handleReverseGeocode,
} from "./tools/reverse-geocode.js";
import {
  searchNearbySchema,
  handleSearchNearby,
} from "./tools/search-nearby.js";
import {
  searchInAreaSchema,
  handleSearchInArea,
} from "./tools/search-in-area.js";
import { routeSchema, handleRoute } from "./tools/route.js";
import {
  explainTagsSchema,
  handleExplainTags,
} from "./tools/explain-tags.js";

const server = new McpServer({
  name: "osm-agent-query",
  version: "0.1.0",
});

async function main() {
  server.tool(
    "geocode",
    "Convert a place name or address to coordinates and bounding box (Nominatim).",
    geocodeSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await handleGeocode(geocodeSchema.parse(args)), null, 2),
        },
      ],
    }),
  );

  server.tool(
    "reverse_geocode",
    "Convert coordinates to a human-readable address and place name.",
    reverseGeocodeSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await handleReverseGeocode(reverseGeocodeSchema.parse(args)),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "search_nearby",
    "Find OSM points of interest by category within a radius of a location. Uses structured Overpass queries (no raw OverpassQL).",
    searchNearbySchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await handleSearchNearby(searchNearbySchema.parse(args)),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "search_in_area",
    "Find OSM points of interest by category within a named place or bounding box.",
    searchInAreaSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await handleSearchInArea(searchInAreaSchema.parse(args)),
            null,
            2,
          ),
        },
      ],
    }),
  );

  server.tool(
    "route",
    "Get route distance and duration between two points via OSRM (foot, driving, cycling).",
    routeSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(await handleRoute(routeSchema.parse(args)), null, 2),
        },
      ],
    }),
  );

  server.tool(
    "explain_osm_tags",
    "Explain OSM tag keys/values and list supported search categories.",
    explainTagsSchema.shape,
    async (args) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify(
            await handleExplainTags(explainTagsSchema.parse(args)),
            null,
            2,
          ),
        },
      ],
    }),
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
