import { describe, it, expect } from "vitest";
import { osmBrowseUrl, osmMapUrl, linksForPlace } from "./links.js";

describe("osm links", () => {
  it("builds browse url", () => {
    expect(osmBrowseUrl("node", 123)).toBe(
      "https://www.openstreetmap.org/node/123",
    );
  });

  it("builds map url", () => {
    expect(osmMapUrl(48.85, 2.35)).toContain("openstreetmap.org");
  });

  it("includes directions when from point set", () => {
    const l = linksForPlace(48.86, 2.36, "node", 1, { lat: 48.85, lon: 2.35 });
    expect(l.directions_from).toContain("directions");
  });
});
