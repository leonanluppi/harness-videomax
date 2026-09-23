import type { HttpRequest } from "@/infra/http/types";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import {
  ExpiredSessionError,
  InvalidSessionTokenError,
  MissingSessionTokenError,
  RevokedSessionError,
} from "@/domain/session/errors";

export type AuthenticatedUser = {
  id: string;
  isAdmin: boolean;
};

/** Reads the already-resolved user off the request (populated by a preHandler, if any). */
export function currentUser(req: HttpRequest): AuthenticatedUser | undefined {
  return req.user;
}

/**
 * Resolves the session cookie into a request-scoped user context.
 *
 * `resolveOptional` never throws — it is what SVC-SESSION-01/02 and the public
 * `/api/auth/session` endpoint exercise. `resolveRequired` is provided for future
 * downstream authenticated routes (F03+) that must 401 on a missing/invalid session;
 * no F02 route wires it yet.
 */
export class SessionAuthMiddleware {
  constructor(
    private readonly getCurrentSession: GetCurrentSessionUseCase,
    private readonly sessionRepo: SessionRepository,
    private readonly sessionToken: SessionTokenGateway,
  ) {}

  async resolveOptional(cookieToken: string | undefined): Promise<AuthenticatedUser | undefined> {
    const result = await this.getCurrentSession.execute({ sessionToken: cookieToken });
    if (!result.authenticated) return undefined;
    return { id: result.user.id, isAdmin: result.user.isAdmin };
  }

  async resolveRequired(cookieToken: string | undefined): Promise<AuthenticatedUser> {
    if (!cookieToken) throw new MissingSessionTokenError();

    const tokenHash = this.sessionToken.hashToken(cookieToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session) throw new InvalidSessionTokenError();
    if (session.revokedAt) throw new RevokedSessionError(session.id);
    if (!session.isActive()) throw new ExpiredSessionError(session.id, session.expiresAt);

    const result = await this.getCurrentSession.execute({ sessionToken: cookieToken });
    if (!result.authenticated) throw new InvalidSessionTokenError();
    return { id: result.user.id, isAdmin: result.user.isAdmin };
  }
}
