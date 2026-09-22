import { cookies } from "next/headers";
import { getBackendUrl } from "@/lib/backend";
import type { SessionResponse } from "@/lib/auth-api";

const ANONYMOUS: SessionResponse = { authenticated: false };

/**
 * Server-side session boundary: resolves the current visitor's session by
 * forwarding their cookies to the backend session endpoint. Never throws —
 * an unreachable backend or invalid session both resolve to anonymous.
 */
export async function getSession(): Promise<SessionResponse> {
  const cookieHeader = (await cookies()).toString();
  const response = await fetch(`${getBackendUrl()}/api/auth/session`, {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  }).catch(() => null);

  if (!response || !response.ok) return ANONYMOUS;
  const body = (await response.json().catch(() => null)) as SessionResponse | null;
  return body ?? ANONYMOUS;
}
