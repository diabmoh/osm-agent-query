import { describe, it, expect } from "vitest";
import { summarizeSearch } from "./results.js";

describe("summarizeSearch", () => {
  it("sorts by distance when center provided", () => {
    const out = summarizeSearch(
      [
        {
          type: "node",
          id: 1,
          lat: 48.86,
          lon: 2.36,
          tags: { name: "Far", amenity: "cafe" },
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
      { centerLat: 48.8584, centerLon: 2.2945 },
    );
    expect(out.places[0].name).toBe("Near");
    expect(out.places[0].distance_m).toBeDefined();
  });
});
