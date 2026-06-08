export type ErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "RATE_LIMIT"
  | "UPSTREAM"
  | "CONFIG";

export class OsmAgentError extends Error {
  readonly code: ErrorCode;

  constructor(message: string, code: ErrorCode = "VALIDATION") {
    super(message);
    this.name = "OsmAgentError";
    this.code = code;
  }
}

export function toToolError(err: unknown): {
  error: true;
  code: ErrorCode;
  message: string;
} {
  if (err instanceof OsmAgentError) {
    return { error: true, code: err.code, message: err.message };
  }
  if (err instanceof Error) {
    const code: ErrorCode = err.message.includes("abort")
      ? "UPSTREAM"
      : "UPSTREAM";
    return { error: true, code, message: err.message };
  }
  return { error: true, code: "UPSTREAM", message: String(err) };
}
