import { describe, it, expect } from "vitest";
import {
  bboxAroundPoint,
  validateBbox,
  clampLimit,
} from "./limits.js";

describe("guardrails", () => {
  it("clamps limit", () => {
    expect(clampLimit(undefined)).toBe(20);
    expect(clampLimit(100)).toBe(50);
  });

  it("rejects oversized bbox", () => {
    expect(() =>
      validateBbox({ south: 0, west: 0, north: 2, east: 2 }),
    ).toThrow(/too large/);
  });

  it("builds bbox around point", () => {
    const b = bboxAroundPoint(48.8566, 2.3522, 500);
    expect(b.north).toBeGreaterThan(b.south);
    expect(b.east).toBeGreaterThan(b.west);
  });
});
