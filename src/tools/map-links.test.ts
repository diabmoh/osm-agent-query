import { describe, it, expect } from "vitest";
import { handleMapLinks } from "./map-links.js";

describe("map_links", () => {
  it("returns map and direction links", async () => {
    const r = await handleMapLinks({
      lat: 48.8584,
      lon: 2.2945,
      from_lat: 48.86,
      from_lon: 2.3,
    });
    expect(r.ok).toBe(true);
    const data = r.data as { links: Record<string, string> };
    expect(data.links.map).toContain("openstreetmap.org");
    expect(data.links.directions_foot).toBeDefined();
  });
});
