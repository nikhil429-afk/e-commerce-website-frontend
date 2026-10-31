import BASE_URL from "./baseapi";
import { getToken, clearToken } from "./tokenUtils";

/** Thrown for every failed request, so callers can simply use try/catch and show `error.message`. */
export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(message: string, status = 0, detail: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Turns whatever the backend sent as `detail` (string, {field: message}, list of errors) into one readable sentence. */
export function messageFromDetail(detail: unknown, fallback = "Something went wrong. Please try again."): string {
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((d) => (typeof d === "string" ? d : (d as { msg?: string })?.msg)).filter(Boolean);
    return parts.length ? parts.join("; ") : fallback;
  }
  if (typeof detail === "object") {
    const values = Object.values(detail as Record<string, unknown>).filter((v) => typeof v === "string");
    if (values.length) return values.join("; ");
    const inner = (detail as { detail?: unknown; message?: unknown }).detail ?? (detail as { message?: unknown }).message;
    if (inner) return messageFromDetail(inner, fallback);
  }
  return fallback;
}

interface ApiOptions {
  method?: string;
  /** Sent as JSON. */
  json?: unknown;
  /** Sent as multipart/form-data. NEVER set Content-Type yourself for this: the browser must add the boundary. */
  form?: FormData;
  /** Attach the login token (default true). */
  auth?: boolean;
  signal?: AbortSignal;
}

/**
 * One place for every API call:
 *  - adds the Authorization header,
 *  - sets Content-Type only for JSON bodies (a hand-written JSON header on a FormData body breaks uploads),
 *  - throws ApiError with a readable message on network errors AND on every non-2xx response,
 *  - on 401 with a token (expired / invalid session) clears it and sends the user to /login.
 */
export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = options.auth === false ? null : getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.json);
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { method: options.method ?? "GET", headers, body, signal: options.signal });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") throw err;
    throw new ApiError("Cannot reach the server. Check your connection and that the backend is running.", 0);
  }

  let data: any = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      if (!window.location.pathname.startsWith("/login")) window.location.replace("/login");
      throw new ApiError("Your session has expired. Please log in again.", 401, data);
    }
    const detail = data && typeof data === "object" ? (data.detail ?? data.message ?? data) : data;
    throw new ApiError(messageFromDetail(detail, `Request failed (${res.status}).`), res.status, data);
  }

  return data as T;
}
