export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

const TOKEN_KEY = "purpleworld-admin-token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {},
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
}

// Called when the token is rejected, so the app can return to the login page
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = tokenStore.get();
  if (token) headers.set("authorization", `Bearer ${token}`);
  let body = init.body;
  if (init.json !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.json);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, { ...init, headers, body });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is purple-backend running?");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    throw new ApiError(res.status, data.error ?? "Request failed", data.fields ?? {}, data);
  }
  return data as T;
}

/** Stored image paths are relative to the API ("/uploads/…"). */
export function imageUrl(path: string): string {
  return path.startsWith("/uploads/") ? `${API_URL}${path}` : path;
}
