import { z } from "zod";
import { validateCoordinates } from "../guardrails/limits.js";
import {
  osmDirectionUrl,
  osmMapUrl,
  osmBrowseUrl,
} from "../osm/links.js";
import { toolSuccess } from "../mcp/response.js";

export const mapLinksSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  zoom: z.number().int().min(1).max(19).optional().default(17),
  from_lat: z.number().optional().describe("Origin for directions link"),
  from_lon: z.number().optional(),
  osm_type: z.enum(["node", "way", "relation"]).optional(),
  osm_id: z.number().int().optional(),
});

export async function handleMapLinks(args: z.infer<typeof mapLinksSchema>) {
  validateCoordinates(args.lat, args.lon);
  const links: Record<string, string> = {
    map: osmMapUrl(args.lat, args.lon, args.zoom),
  };
  if (args.osm_type && args.osm_id) {
    links.element = osmBrowseUrl(args.osm_type, args.osm_id);
  }
  if (args.from_lat !== undefined && args.from_lon !== undefined) {
    validateCoordinates(args.from_lat, args.from_lon);
    links.directions_foot = osmDirectionUrl(
      { lat: args.from_lat, lon: args.from_lon },
      { lat: args.lat, lon: args.lon },
      "foot",
    );
    links.directions_car = osmDirectionUrl(
      { lat: args.from_lat, lon: args.from_lon },
      { lat: args.lat, lon: args.lon },
      "car",
    );
  }
  return toolSuccess(`Map links for (${args.lat.toFixed(5)}, ${args.lon.toFixed(5)}).`, {
    lat: args.lat,
    lon: args.lon,
    links,
  });
}
