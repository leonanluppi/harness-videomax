import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { UserQueries } from "@/domain/user/user.queries";
import type { GetCurrentSessionInput, GetCurrentSessionOutput } from "./get-current-session.dto";

const ANONYMOUS: GetCurrentSessionOutput = { authenticated: false };

/**
 * Resolves a session cookie value to the authenticated user, or the
 * anonymous outcome. Never throws for missing/expired/revoked/unknown
 * tokens — those are all valid "not authenticated" outcomes, not errors.
 */
export class GetCurrentSessionUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly sessionToken: SessionTokenGateway,
    private readonly userQueries: UserQueries,
  ) {}

  async execute(input: GetCurrentSessionInput): Promise<GetCurrentSessionOutput> {
    if (!input.token) return ANONYMOUS;

    const tokenHash = this.sessionToken.hash(input.token);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session || !session.isActive(new Date())) return ANONYMOUS;

    const user = await this.userQueries.currentUserById(session.userId);
    if (!user) return ANONYMOUS;

    return { authenticated: true, user };
  }
}
