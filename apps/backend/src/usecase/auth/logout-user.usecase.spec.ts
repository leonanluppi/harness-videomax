import { describe, expect, it } from "vitest";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type {
  GeneratedSessionToken,
  SessionTokenGateway,
} from "@/domain/session/session-token.gateway";
import { LogoutUserUseCase } from "./logout-user.usecase";

describe("LogoutUserUseCase", () => {
  it("revokes_active_session_on_logout", async () => {
    const sessionRepo = new FakeSessionRepository();
    const tokenGateway = new FakeSessionTokenGateway();
    const session = Session.create({
      userId: "user-1",
      tokenHash: tokenGateway.hash("token-1"),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);
    const useCase = new LogoutUserUseCase(sessionRepo, tokenGateway);

    const output = await useCase.execute({ token: "token-1" });

    expect(output).toEqual({ success: true });
    const found = await sessionRepo.findByTokenHash(tokenGateway.hash("token-1"));
    expect(found?.isActive(new Date())).toBe(false);
  });

  it("is idempotent when no session token is present", async () => {
    const useCase = new LogoutUserUseCase(new FakeSessionRepository(), new FakeSessionTokenGateway());

    await expect(useCase.execute({ token: undefined })).resolves.toEqual({ success: true });
  });

  it("is idempotent when the session token is unknown or already revoked", async () => {
    const useCase = new LogoutUserUseCase(new FakeSessionRepository(), new FakeSessionTokenGateway());

    await expect(useCase.execute({ token: "unknown-token" })).resolves.toEqual({ success: true });
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
