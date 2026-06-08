import { describe, it, expect } from "vitest";
import { filterElementsOpenNow } from "./filter-places.js";

describe("filterElementsOpenNow", () => {
  const elements = [
    {
      type: "node" as const,
      id: 1,
      lat: 48.85,
      lon: 2.35,
      tags: { name: "Open Cafe", amenity: "cafe", opening_hours: "24/7" },
    },
    {
      type: "node" as const,
      id: 2,
      lat: 48.86,
      lon: 2.36,
      tags: {
        name: "Closed Shop",
        amenity: "cafe",
        opening_hours: "Mo-Fr 09:00-10:00",
      },
    },
  ];

  it("returns only open places in open_only mode", () => {
    const noon = "2026-06-01T12:00:00+00:00";
    const { places, stats } = filterElementsOpenNow(elements, {
      at_time: noon,
      mode: "open_only",
    });
    expect(stats.open).toBeGreaterThanOrEqual(1);
    expect(places.every((p) => p.open_status === "open")).toBe(true);
  });
});
