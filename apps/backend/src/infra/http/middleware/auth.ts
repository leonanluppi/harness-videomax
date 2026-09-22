import type { HttpRequest } from "@/infra/http/types";
import { readSessionToken } from "@/infra/http/cookies";
import type { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";

export type AuthenticatedUser = {
  id: string;
  isAdmin: boolean;
};

/** Downstream handlers/use cases read the resolved user through this — never `req.user` directly. */
export function currentUser(req: HttpRequest): AuthenticatedUser | undefined {
  return req.user;
}

/**
 * Resolves the session cookie on every request into a typed user context.
 * Wired as `fastify-server`'s `resolveUser` hook so downstream authenticated
 * features receive `req.user` without knowing sessions are cookie-backed.
 */
export async function resolveCurrentUser(
  req: HttpRequest,
  getCurrentSession: GetCurrentSessionUseCase,
): Promise<AuthenticatedUser | undefined> {
  const token = readSessionToken(req.headers["cookie"]);
  const output = await getCurrentSession.execute({ token });
  return output.authenticated ? { id: output.user.id, isAdmin: output.user.isAdmin } : undefined;
}
