import { DEFAULT_USER_AGENT } from "../config.js";

export async function osmFetch(
  url: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<Response> {
  const timeoutMs = init?.timeoutMs ?? 30_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const headers = new Headers(init?.headers);
    if (!headers.has("User-Agent")) {
      headers.set("User-Agent", DEFAULT_USER_AGENT);
    }
    if (!headers.has("Accept")) {
      headers.set("Accept", "application/json");
    }
    return await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function osmJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await osmFetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} from ${url}: ${text.slice(0, 200)}`);
  }
  return res.json() as Promise<T>;
}
