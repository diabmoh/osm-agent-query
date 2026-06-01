import { z } from "zod";
import { OsmAgentError } from "../errors.js";
import * as nominatim from "../clients/nominatim.js";
import { toolSuccess } from "../mcp/response.js";
import { summarizeGeocode } from "../summarize/results.js";

export const geocodeSchema = z.object({
  query: z.string().min(1).describe("Place name or address to geocode"),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

export async function handleGeocode(args: z.infer<typeof geocodeSchema>) {
  const results = await nominatim.geocodeQuery(args.query, args.limit);
  if (!results.length) {
    throw new OsmAgentError(`No results for: ${args.query}`, "NOT_FOUND");
  }
  const data = summarizeGeocode(args.query, results);
  const top = data.results[0];
  return toolSuccess(
    `Found ${data.results.length} result(s); best match: ${top.name} (${top.lat.toFixed(5)}, ${top.lon.toFixed(5)}).`,
    data,
  );
}
