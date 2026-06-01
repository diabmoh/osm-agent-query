export type ToolSuccess<T> = {
  ok: true;
  summary: string;
  data: T;
};

export function toolSuccess<T>(summary: string, data: T): ToolSuccess<T> {
  return { ok: true, summary, data };
}

export function formatToolPayload(payload: unknown): string {
  return JSON.stringify(payload, null, 2);
}
