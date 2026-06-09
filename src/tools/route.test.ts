import { describe, it, expect, vi, beforeEach } from "vitest";

const { getRoute } = vi.hoisted(() => ({
  getRoute: vi.fn(),
}));

vi.mock("../clients/osrm.js", () => ({
  getRoute,
}));

import { handleRoute, routeSchema } from "./route.js";

describe("route", () => {
  beforeEach(() => {
    getRoute.mockReset();
    getRoute.mockResolvedValue({
      profile: "foot",
      distance_m: 1200,
      duration_s: 900,
      geometry_encoded: "encoded_polyline_data",
    });
  });

  it("omits geometry by default", async () => {
    const args = routeSchema.parse({
      from_lat: 48.8584,
      from_lon: 2.2945,
      to_lat: 48.8606,
      to_lon: 2.3376,
    });
    const r = await handleRoute(args);
    expect(r.ok).toBe(true);
    const data = r.data as Record<string, unknown>;
    expect(data.geometry_encoded).toBeUndefined();
    expect(data.distance_m).toBe(1200);
    expect(getRoute).toHaveBeenCalledWith(
      { lat: 48.8584, lon: 2.2945 },
      { lat: 48.8606, lon: 2.3376 },
      "foot",
      { includeGeometry: false },
    );
  });

  it("includes geometry when requested", async () => {
    const args = routeSchema.parse({
      from_lat: 48.8584,
      from_lon: 2.2945,
      to_lat: 48.8606,
      to_lon: 2.3376,
      include_geometry: true,
    });
    const r = await handleRoute(args);
    expect(r.ok).toBe(true);
    const data = r.data as Record<string, unknown>;
    expect(data.geometry_encoded).toBe("encoded_polyline_data");
    expect(getRoute).toHaveBeenCalledWith(
      { lat: 48.8584, lon: 2.2945 },
      { lat: 48.8606, lon: 2.3376 },
      "foot",
      { includeGeometry: true },
    );
  });
});
