import { z } from "zod";
import * as nominatim from "../clients/nominatim.js";
import { summarizeGeocode } from "../summarize/results.js";

export const geocodeSchema = z.object({
  query: z.string().min(1).describe("Place name or address to geocode"),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

export async function handleGeocode(args: z.infer<typeof geocodeSchema>) {
  const results = await nominatim.geocodeQuery(args.query, args.limit);
  if (!results.length) {
    return { error: "No results found", query: args.query };
  }
  return summarizeGeocode(args.query, results);
}
