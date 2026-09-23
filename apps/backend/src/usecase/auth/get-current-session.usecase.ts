import { UserId } from "@/domain/user/user-id.vo";
import type { UserQueries } from "@/domain/user/user.queries";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { GetCurrentSessionInput, GetCurrentSessionOutput } from "./get-current-session.dto";

export class GetCurrentSessionUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly userQueries: UserQueries,
    private readonly sessionToken: SessionTokenGateway,
  ) {}

  /** Never throws: expired, revoked, malformed, or unknown tokens resolve to anonymous. */
  async execute(input: GetCurrentSessionInput): Promise<GetCurrentSessionOutput> {
    if (!input.sessionToken) return { authenticated: false };

    const tokenHash = this.sessionToken.hashToken(input.sessionToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session || !session.isActive()) return { authenticated: false };

    const user = await this.userQueries.getById(UserId.from(session.userId));
    if (!user) return { authenticated: false };

    return { authenticated: true, user };
  }
}
