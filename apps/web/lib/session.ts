import { cookies } from "next/headers";
import { getBackendUrl } from "./backend";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

export type SessionState = { authenticated: false } | { authenticated: true; user: SessionUser };

const ANONYMOUS: SessionState = { authenticated: false };

/** Resolves the current browser session through the backend session endpoint. */
export async function getSession(): Promise<SessionState> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const response = await fetch(`${getBackendUrl()}/api/auth/session`, {
    headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    cache: "no-store",
  });

  if (!response.ok) return ANONYMOUS;

  const body = (await response.json()) as SessionState;
  return body.authenticated ? body : ANONYMOUS;
}
