import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { LogoutUserInput, LogoutUserOutput } from "./logout-user.dto";

export class LogoutUserUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly sessionToken: SessionTokenGateway,
  ) {}

  async execute(input: LogoutUserInput): Promise<LogoutUserOutput> {
    if (!input.token) return { success: true };

    const tokenHash = this.sessionToken.hash(input.token);
    const session = await this.sessionRepo.findByTokenHash(tokenHash);
    const now = new Date();
    if (session && session.isActive(now)) {
      session.revoke(now);
      await this.sessionRepo.save(session);
    }

    return { success: true };
  }
}
