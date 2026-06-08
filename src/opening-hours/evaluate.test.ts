import { describe, it, expect } from "vitest";
import { evaluateOpeningHours } from "./evaluate.js";

describe("evaluateOpeningHours", () => {
  it("marks open during weekday business hours", () => {
    const monday10 = new Date("2026-06-01T10:00:00+00:00");
    const r = evaluateOpeningHours("Mo-Fr 09:00-17:00", monday10);
    expect(r.status).toBe("open");
    expect(r.prettified).toBeDefined();
  });

  it("marks closed outside hours", () => {
    const monday20 = new Date("2026-06-01T20:00:00+00:00");
    const r = evaluateOpeningHours("Mo-Fr 09:00-17:00", monday20);
    expect(r.status).toBe("closed");
    expect(r.next_change_iso).toBeDefined();
  });

  it("handles missing tag", () => {
    const r = evaluateOpeningHours(undefined, new Date());
    expect(r.status).toBe("no_hours_tag");
  });

  it("handles invalid syntax", () => {
    const r = evaluateOpeningHours("not valid hours {{{", new Date());
    expect(r.status).toBe("invalid_hours");
  });
});
