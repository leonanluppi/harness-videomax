import { getBackendUrl } from "@/lib/backend";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type AuthResponse = {
  user: AuthUser;
  session: { expiresAt: string };
};

export type SessionResponse = { authenticated: true; user: AuthUser } | { authenticated: false };

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ProxyResult = {
  status: number;
  body: unknown;
  setCookie: string | null;
};

type ProxyInit = {
  method: "GET" | "POST";
  body?: unknown;
  cookie?: string | null;
};

/** Forwards a browser auth request to the backend, preserving cookies both ways. */
export async function proxyToBackend(path: string, init: ProxyInit): Promise<ProxyResult> {
  // Only declare a JSON content-type when an actual body is sent — Fastify's
  // JSON body parser rejects an empty body when content-type is set to
  // application/json (FST_ERR_CTP_EMPTY_JSON_BODY), which surfaced as a 500
  // on the bodiless logout request.
  const response = await fetch(`${getBackendUrl()}${path}`, {
    method: init.method,
    headers: {
      ...(init.body !== undefined ? { "content-type": "application/json" } : {}),
      ...(init.cookie ? { cookie: init.cookie } : {}),
    },
    ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    cache: "no-store",
  });

  const setCookie = response.headers.get("set-cookie");
  const body = response.status === 204 ? null : await readJsonSafely(response);
  return { status: response.status, body, setCookie };
}

async function readJsonSafely(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text) as unknown;
}
