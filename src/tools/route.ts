import { z } from "zod";
import { validateCoordinates } from "../guardrails/limits.js";
import * as osrm from "../clients/osrm.js";
import { osmDirectionUrl } from "../osm/links.js";
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
  include_geometry: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Include encoded polyline geometry (large). Default false to save tokens; set true only when drawing the route on a map.",
    ),
});

export async function handleRoute(args: z.infer<typeof routeSchema>) {
  validateCoordinates(args.from_lat, args.from_lon);
  validateCoordinates(args.to_lat, args.to_lon);
  const route = await osrm.getRoute(
    { lat: args.from_lat, lon: args.from_lon },
    { lat: args.to_lat, lon: args.to_lon },
    args.profile,
    { includeGeometry: args.include_geometry },
  );
  const minutes = Math.round(route.duration_s / 60);
  const from = { lat: args.from_lat, lon: args.from_lon };
  const to = { lat: args.to_lat, lon: args.to_lon };
  const data: Record<string, unknown> = {
    profile: route.profile,
    distance_m: route.distance_m,
    duration_s: route.duration_s,
    duration_human: `${minutes} min`,
    links: {
      directions: osmDirectionUrl(
        from,
        to,
        args.profile === "driving"
          ? "car"
          : args.profile === "cycling"
            ? "bike"
            : "foot",
      ),
    },
  };
  if (args.include_geometry && route.geometry_encoded) {
    data.geometry_encoded = route.geometry_encoded;
  }
  return toolSuccess(
    `${args.profile} route: ${route.distance_m} m, ~${minutes} min.`,
    data,
  );
}
