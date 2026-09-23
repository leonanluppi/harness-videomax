import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { LogoutUserInput, LogoutUserOutput } from "./logout-user.dto";

export class LogoutUserUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly sessionToken: SessionTokenGateway,
  ) {}

  /** Idempotent: revoking a missing or already-revoked session still succeeds. */
  async execute(input: LogoutUserInput): Promise<LogoutUserOutput> {
    if (!input.sessionToken) return { success: true };

    const tokenHash = this.sessionToken.hashToken(input.sessionToken);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    if (!session) return { success: true };

    session.revoke();
    await this.sessionRepo.save(session);
    return { success: true };
  }
}
