import { describe, it, expect } from "vitest";
import { resolveCategory, listCategories } from "./tags.js";

describe("tags ontology", () => {
  it("resolves known categories", () => {
    const spec = resolveCategory("pharmacy");
    expect(spec.tags).toContainEqual({ amenity: "pharmacy" });
  });

  it("throws on unknown category", () => {
    expect(() => resolveCategory("unknown_xyz")).toThrow(/Unknown category/);
  });

  it("lists categories", () => {
    expect(listCategories()).toContain("cafe");
  });
});
