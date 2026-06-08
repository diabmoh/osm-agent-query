import { describe, it, expect } from "vitest";
import { haversineM } from "./haversine.js";

describe("haversineM", () => {
  it("returns ~0 for same point", () => {
    expect(haversineM(48.85, 2.35, 48.85, 2.35)).toBe(0);
  });

  it("returns plausible Paris landmark distance", () => {
    const d = haversineM(48.8584, 2.2945, 48.8606, 2.3376);
    expect(d).toBeGreaterThan(2000);
    expect(d).toBeLessThan(5000);
  });
});
