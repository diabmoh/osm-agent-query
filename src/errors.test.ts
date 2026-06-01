import { describe, it, expect } from "vitest";
import { OsmAgentError, toToolError } from "./errors.js";

describe("errors", () => {
  it("maps OsmAgentError", () => {
    const e = toToolError(new OsmAgentError("missing", "NOT_FOUND"));
    expect(e.code).toBe("NOT_FOUND");
    expect(e.message).toBe("missing");
  });
});
