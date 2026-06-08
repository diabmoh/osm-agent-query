import { describe, it, expect } from "vitest";
import { handlePreviewQuery } from "./preview-query.js";

describe("preview_query", () => {
  it("returns overpass preview without network", async () => {
    const r = await handlePreviewQuery({
      category: "pharmacy",
      lat: 48.85,
      lon: 2.35,
      radius_m: 400,
      limit: 3,
    });
    expect(r.ok).toBe(true);
    const data = r.data as { overpass_preview: string };
    expect(data.overpass_preview).toContain("amenity");
    expect(data.overpass_preview).toContain("[out:json]");
  });
});
