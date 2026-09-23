import { describe, expect, it } from "vitest";
import { GetCurrentSessionUseCase } from "./get-current-session.usecase";
import { Session } from "@/domain/session/session.entity";
import { UserId } from "@/domain/user/user-id.vo";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { CurrentUserDto, UserQueries } from "@/domain/user/user.queries";
import type { SessionId } from "@/domain/session/session-id.vo";

function buildFixture() {
  const sessionRepo = new FakeSessionRepository();
  const userQueries = new FakeUserQueries();
  const sessionToken = new FakeSessionTokenGateway();
  const useCase = new GetCurrentSessionUseCase(sessionRepo, userQueries, sessionToken);
  return { useCase, sessionRepo, userQueries, sessionToken };
}

describe("GetCurrentSessionUseCase", () => {
  it("returns_authenticated_user_for_active_session", async () => {
    const { useCase, sessionRepo, userQueries, sessionToken } = buildFixture();
    const userId = UserId.generate();
    userQueries.seed({ id: userId.value, name: "Session User", email: "session@example.com", isAdmin: false });

    const plainToken = sessionToken.generateToken();
    const session = Session.create({
      userId,
      tokenHash: sessionToken.hashToken(plainToken),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);

    const output = await useCase.execute({ sessionToken: plainToken });

    expect(output.authenticated).toBe(true);
    if (output.authenticated) {
      expect(output.user.email).toBe("session@example.com");
    }
  });

  it("returns_anonymous_for_expired_or_revoked_session", async () => {
    const { useCase, sessionRepo, userQueries, sessionToken } = buildFixture();
    const userId = UserId.generate();
    userQueries.seed({ id: userId.value, name: "Revoked User", email: "revoked@example.com", isAdmin: false });

    const plainToken = sessionToken.generateToken();
    const expiredSession = Session.create({
      userId,
      tokenHash: sessionToken.hashToken(plainToken),
      expiresAt: new Date(Date.now() - 1),
    });
    await sessionRepo.save(expiredSession);

    const expiredOutput = await useCase.execute({ sessionToken: plainToken });
    expect(expiredOutput).toEqual({ authenticated: false });

    const revokedToken = sessionToken.generateToken();
    const revokedSession = Session.create({
      userId,
      tokenHash: sessionToken.hashToken(revokedToken),
      expiresAt: new Date(Date.now() + 60_000),
    });
    revokedSession.revoke();
    await sessionRepo.save(revokedSession);

    const revokedOutput = await useCase.execute({ sessionToken: revokedToken });
    expect(revokedOutput).toEqual({ authenticated: false });
  });

  it("returns anonymous when no token is provided", async () => {
    const { useCase } = buildFixture();
    await expect(useCase.execute({ sessionToken: undefined })).resolves.toEqual({ authenticated: false });
  });
});

/** Named fakes co-located with the spec (usecase/ may not import infra/, even in tests). */
class FakeSessionRepository implements SessionRepository {
  private readonly sessionsById = new Map<string, Session>();

  findById(id: SessionId): Promise<Session | null> {
    return Promise.resolve(this.sessionsById.get(id.value) ?? null);
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    for (const session of this.sessionsById.values()) {
      if (session.tokenHash === tokenHash) return Promise.resolve(session);
    }
    return Promise.resolve(null);
  }

  save(session: Session): Promise<void> {
    this.sessionsById.set(session.id, session);
    return Promise.resolve();
  }
}

class FakeUserQueries implements UserQueries {
  private readonly usersById = new Map<string, CurrentUserDto>();

  seed(user: CurrentUserDto): void {
    this.usersById.set(user.id, user);
  }

  getById(id: UserId): Promise<CurrentUserDto | null> {
    return Promise.resolve(this.usersById.get(id.value) ?? null);
  }
}

class FakeSessionTokenGateway implements SessionTokenGateway {
  private counter = 0;

  generateToken(): string {
    this.counter += 1;
    return `token-${this.counter}`;
  }

  hashToken(token: string): string {
    return `hash-${token}`;
  }
}
