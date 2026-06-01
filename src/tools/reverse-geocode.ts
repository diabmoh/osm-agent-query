import { z } from "zod";
import * as nominatim from "../clients/nominatim.js";
import { summarizeReverse } from "../summarize/results.js";

export const reverseGeocodeSchema = z.object({
  lat: z.number().describe("Latitude (-90 to 90)"),
  lon: z.number().describe("Longitude (-180 to 180)"),
});

export async function handleReverseGeocode(
  args: z.infer<typeof reverseGeocodeSchema>,
) {
  const result = await nominatim.reverseGeocode(args.lat, args.lon);
  return summarizeReverse(result);
}
