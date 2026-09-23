import { getBackendUrl } from "./backend";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type AuthSuccess = {
  user: AuthUser;
  session: { expiresAt: string };
};

export type ApiErrorBody = {
  code: string;
  message: string;
};

export type AuthResult = { ok: true; data: AuthSuccess } | { ok: false; error: ApiErrorBody };

const UNKNOWN_ERROR: ApiErrorBody = { code: "unknown_error", message: "Something went wrong. Please try again." };

/**
 * Server-side: forwards a Route Handler request to the backend, preserving the
 * method, JSON body, and Cookie header. The caller mirrors status/body/Set-Cookie
 * from the returned Response back to the browser via `mirrorBackendResponse`.
 */
export function forwardToBackend(
  path: string,
  init: { method: string; body?: unknown; cookie?: string | null },
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (init.cookie) headers["Cookie"] = init.cookie;

  return fetch(`${getBackendUrl()}${path}`, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
}

/** Mirrors a backend Response (status, JSON body, Set-Cookie headers) into a browser-facing Response. */
export async function mirrorBackendResponse(backendResponse: Response): Promise<Response> {
  const hasBody = backendResponse.status !== 204;
  const body = hasBody ? await backendResponse.text() : null;

  const headers = new Headers();
  for (const cookie of readSetCookies(backendResponse)) headers.append("Set-Cookie", cookie);
  if (hasBody) headers.set("Content-Type", "application/json");

  return new Response(body, { status: backendResponse.status, headers });
}

function readSetCookies(response: Response): string[] {
  if (typeof response.headers.getSetCookie === "function") return response.headers.getSetCookie();
  const single = response.headers.get("set-cookie");
  return single ? [single] : [];
}

/** Client-side: typed POST helpers used by the register/login forms. */
async function postAuth(path: string, payload: unknown): Promise<AuthResult> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) return { ok: false, error: isApiErrorBody(body) ? body : UNKNOWN_ERROR };
  return { ok: true, data: body as AuthSuccess };
}

export function registerRequest(input: { name: string; email: string; password: string }): Promise<AuthResult> {
  return postAuth("/api/auth/register", input);
}

export function loginRequest(input: { email: string; password: string }): Promise<AuthResult> {
  return postAuth("/api/auth/login", input);
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>)["code"] === "string" &&
    typeof (value as Record<string, unknown>)["message"] === "string"
  );
}
