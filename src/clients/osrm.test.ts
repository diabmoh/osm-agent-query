import { describe, it, expect, vi, beforeEach } from "vitest";

const { osmJson } = vi.hoisted(() => ({
  osmJson: vi.fn(),
}));

vi.mock("./http.js", () => ({
  osmJson,
}));

import { getRoute } from "./osrm.js";

describe("osrm getRoute", () => {
  beforeEach(() => {
    osmJson.mockReset();
    osmJson.mockResolvedValue({
      routes: [{ distance: 1500, duration: 600, geometry: "abc123" }],
    });
  });

  it("requests no geometry when includeGeometry is false", async () => {
    await getRoute(
      { lat: 48.8584, lon: 2.2945 },
      { lat: 48.8606, lon: 2.3376 },
      "foot",
      { includeGeometry: false },
    );
    expect(osmJson).toHaveBeenCalledWith(
      expect.stringContaining("overview=false"),
    );
  });

  it("requests full geometry when includeGeometry is true", async () => {
    await getRoute(
      { lat: 48.8584, lon: 2.2945 },
      { lat: 48.8606, lon: 2.3376 },
      "foot",
      { includeGeometry: true },
    );
    expect(osmJson).toHaveBeenCalledWith(
      expect.stringContaining("overview=full"),
    );
  });
});
