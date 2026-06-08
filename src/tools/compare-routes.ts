import { z } from "zod";
import { validateCoordinates } from "../guardrails/limits.js";
import * as osrm from "../clients/osrm.js";
import { osmDirectionUrl } from "../osm/links.js";
import { toolSuccess } from "../mcp/response.js";

export const compareRoutesSchema = z.object({
  from_lat: z.number(),
  from_lon: z.number(),
  to_lat: z.number(),
  to_lon: z.number(),
});

export async function handleCompareRoutes(
  args: z.infer<typeof compareRoutesSchema>,
) {
  validateCoordinates(args.from_lat, args.from_lon);
  validateCoordinates(args.to_lat, args.to_lon);
  const from = { lat: args.from_lat, lon: args.from_lon };
  const to = { lat: args.to_lat, lon: args.to_lon };

  const [foot, driving, cycling] = await Promise.all([
    osrm.getRoute(from, to, "foot"),
    osrm.getRoute(from, to, "driving"),
    osrm.getRoute(from, to, "cycling"),
  ]);

  const slim = (r: osrm.RouteResult) => ({
    distance_m: r.distance_m,
    duration_s: r.duration_s,
    duration_min: Math.round(r.duration_s / 60),
  });

  const data = {
    from,
    to,
    options: [
      { profile: "foot" as const, ...slim(foot) },
      { profile: "driving" as const, ...slim(driving) },
      { profile: "cycling" as const, ...slim(cycling) },
    ],
    links: {
      directions_foot: osmDirectionUrl(from, to, "foot"),
      directions_car: osmDirectionUrl(from, to, "car"),
      directions_bike: osmDirectionUrl(from, to, "bike"),
    },
  };

  const best = data.options.reduce((a, b) =>
    a.duration_s < b.duration_s ? a : b,
  );
  return toolSuccess(
    `Fastest: ${best.profile} (~${best.duration_min} min, ${best.distance_m} m). Also compared driving and cycling.`,
    data,
  );
}
