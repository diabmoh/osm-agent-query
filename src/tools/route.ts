import { z } from "zod";
import { validateCoordinates } from "../guardrails/limits.js";
import * as osrm from "../clients/osrm.js";
import { toolSuccess } from "../mcp/response.js";

export const routeSchema = z.object({
  from_lat: z.number(),
  from_lon: z.number(),
  to_lat: z.number(),
  to_lon: z.number(),
  profile: z
    .enum(["foot", "driving", "cycling"])
    .optional()
    .default("foot"),
});

export async function handleRoute(args: z.infer<typeof routeSchema>) {
  validateCoordinates(args.from_lat, args.from_lon);
  validateCoordinates(args.to_lat, args.to_lon);
  const route = await osrm.getRoute(
    { lat: args.from_lat, lon: args.from_lon },
    { lat: args.to_lat, lon: args.to_lon },
    args.profile,
  );
  const minutes = Math.round(route.duration_s / 60);
  const data = {
    profile: route.profile,
    distance_m: route.distance_m,
    duration_s: route.duration_s,
    duration_human: `${minutes} min`,
    geometry_encoded: route.geometry_encoded,
  };
  return toolSuccess(
    `${args.profile} route: ${route.distance_m} m, ~${minutes} min.`,
    data,
  );
}
