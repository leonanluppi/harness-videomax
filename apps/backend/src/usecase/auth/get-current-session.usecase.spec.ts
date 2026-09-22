import { describe, expect, it } from "vitest";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type {
  GeneratedSessionToken,
  SessionTokenGateway,
} from "@/domain/session/session-token.gateway";
import type { CurrentUserView, UserQueries } from "@/domain/user/user.queries";
import { GetCurrentSessionUseCase } from "./get-current-session.usecase";

describe("GetCurrentSessionUseCase", () => {
  it("returns_authenticated_user_for_active_session", async () => {
    const tokenGateway = new FakeSessionTokenGateway();
    const sessionRepo = new FakeSessionRepository();
    const session = Session.create({
      userId: "user-1",
      tokenHash: tokenGateway.hash("token-1"),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);
    const userQueries = new FakeUserQueries({
      "user-1": { id: "user-1", name: "Session User", email: "session@example.com", isAdmin: false },
    });
    const useCase = new GetCurrentSessionUseCase(sessionRepo, tokenGateway, userQueries);

    await expect(useCase.execute({ token: "token-1" })).resolves.toEqual({
      authenticated: true,
      user: { id: "user-1", name: "Session User", email: "session@example.com", isAdmin: false },
    });
  });

  it("returns_anonymous_for_expired_or_revoked_session", async () => {
    const tokenGateway = new FakeSessionTokenGateway();
    const sessionRepo = new FakeSessionRepository();
    const revoked = Session.create({
      userId: "user-1",
      tokenHash: tokenGateway.hash("token-1"),
      expiresAt: new Date(Date.now() + 60_000),
    });
    revoked.revoke(new Date());
    await sessionRepo.save(revoked);
    const useCase = new GetCurrentSessionUseCase(sessionRepo, tokenGateway, new FakeUserQueries({}));

    await expect(useCase.execute({ token: "token-1" })).resolves.toEqual({ authenticated: false });
  });

  it("returns anonymous for a missing token without throwing", async () => {
    const useCase = new GetCurrentSessionUseCase(
      new FakeSessionRepository(),
      new FakeSessionTokenGateway(),
      new FakeUserQueries({}),
    );

    await expect(useCase.execute({ token: undefined })).resolves.toEqual({ authenticated: false });
  });

  it("returns anonymous for an unknown token", async () => {
    const useCase = new GetCurrentSessionUseCase(
      new FakeSessionRepository(),
      new FakeSessionTokenGateway(),
      new FakeUserQueries({}),
    );

    await expect(useCase.execute({ token: "unknown-token" })).resolves.toEqual({ authenticated: false });
  });
});

class FakeSessionRepository implements SessionRepository {
  private readonly store = new Map<string, Session>();

  findById(id: string): Promise<Session | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    for (const session of this.store.values()) {
      if (session.tokenHash === tokenHash) return Promise.resolve(session);
    }
    return Promise.resolve(null);
  }

  save(session: Session): Promise<void> {
    this.store.set(session.id, session);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}

class FakeSessionTokenGateway implements SessionTokenGateway {
  generate(): GeneratedSessionToken {
    const token = "generated-token";
    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return `hash:${token}`;
  }
}

class FakeUserQueries implements UserQueries {
  constructor(private readonly usersById: Record<string, CurrentUserView>) {}

  currentUserById(id: string): Promise<CurrentUserView | null> {
    return Promise.resolve(this.usersById[id] ?? null);
  }
}
