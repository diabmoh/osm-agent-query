import { describe, it, expect } from "vitest";
import { buildOverpassQuery, intentFromBbox } from "./overpass.js";

describe("buildOverpassQuery", () => {
  it("builds query from structured intent without exposing to agents", () => {
    const intent = intentFromBbox(
      { south: 48.8, west: 2.3, north: 48.9, east: 2.4 },
      [{ amenity: "pharmacy" }],
      10,
    );
    const q = buildOverpassQuery(intent);
    expect(q).toContain("[out:json]");
    expect(q).toContain('amenity"="pharmacy"');
    expect(q).toContain("out center 10");
    expect(q).not.toContain("{{");
  });
});
