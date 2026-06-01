import { OSRM_BASE } from "../config.js";
import { osmJson } from "./http.js";

export type RouteProfile = "foot" | "driving" | "cycling";

const PROFILE_MAP: Record<RouteProfile, string> = {
  foot: "foot",
  driving: "driving",
  cycling: "bike",
};

export type RouteResult = {
  distance_m: number;
  duration_s: number;
  geometry_encoded: string;
  profile: RouteProfile;
};

type OsrmRouteResponse = {
  routes?: Array<{
    distance: number;
    duration: number;
    geometry: string;
  }>;
  code?: string;
  message?: string;
};

export async function getRoute(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number },
  profile: RouteProfile = "foot",
): Promise<RouteResult> {
  const p = PROFILE_MAP[profile];
  const coords = `${from.lon},${from.lat};${to.lon},${to.lat}`;
  const url = `${OSRM_BASE}/route/v1/${p}/${coords}?overview=full&geometries=polyline`;
  const data = await osmJson<OsrmRouteResponse>(url);
  if (!data.routes?.length) {
    throw new Error(
      data.message ?? `No route found (${data.code ?? "unknown"})`,
    );
  }
  const route = data.routes[0];
  return {
    distance_m: Math.round(route.distance),
    duration_s: Math.round(route.duration),
    geometry_encoded: route.geometry,
    profile,
  };
}
