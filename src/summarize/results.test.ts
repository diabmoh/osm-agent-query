import { describe, it, expect } from "vitest";
import { summarizeSearch } from "./results.js";

describe("summarizeSearch", () => {
  it("sorts by distance and adds links", () => {
    const out = summarizeSearch(
      [
        {
          type: "node",
          id: 1,
          lat: 48.86,
          lon: 2.36,
          tags: { name: "Far", amenity: "cafe", phone: "+33123456789" },
        },
        {
          type: "node",
          id: 2,
          lat: 48.8584,
          lon: 2.2945,
          tags: { name: "Near", amenity: "cafe" },
        },
      ],
      "Cafe",
      { centerLat: 48.8584, centerLon: 2.2945, format: "compact" },
    );
    expect(out.places[0].name).toBe("Near");
    expect(out.places[0].links?.map).toContain("openstreetmap.org");
    expect(out.places[1].highlights?.phone).toBeDefined();
    expect(out.places[0].tags).toBeUndefined();
  });

  it("includes tags in full format", () => {
    const out = summarizeSearch(
      [
        {
          type: "node",
          id: 1,
          lat: 48.85,
          lon: 2.35,
          tags: { name: "X", amenity: "cafe", cuisine: "italian" },
        },
      ],
      "Cafe",
      { format: "full" },
    );
    expect(out.places[0].tags?.cuisine).toBe("italian");
  });
});
