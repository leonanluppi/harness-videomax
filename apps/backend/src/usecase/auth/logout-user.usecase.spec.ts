import { describe, expect, it } from "vitest";
import { LogoutUserUseCase } from "./logout-user.usecase";
import { RegisterUserUseCase } from "./register-user.usecase";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { User } from "@/domain/user/user.entity";
import type { UserId } from "@/domain/user/user-id.vo";
import type { Session } from "@/domain/session/session.entity";
import type { SessionId } from "@/domain/session/session-id.vo";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function buildFixture() {
  const userRepo = new FakeUserRepository();
  const sessionRepo = new FakeSessionRepository();
  const passwordHasher = new FakePasswordHasherGateway();
  const sessionToken = new FakeSessionTokenGateway();
  const registerUseCase = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);
  const logoutUseCase = new LogoutUserUseCase(sessionRepo, sessionToken);

  const registered = await registerUseCase.execute({
    name: "Session User",
    email: "session@example.com",
    password: "Pass1234",
  });

  return { logoutUseCase, sessionRepo, sessionToken, sessionTokenPlain: registered.sessionToken };
}

describe("LogoutUserUseCase", () => {
  it("revokes_active_session_on_logout", async () => {
    const { logoutUseCase, sessionRepo, sessionToken, sessionTokenPlain } = await buildFixture();

    const output = await logoutUseCase.execute({ sessionToken: sessionTokenPlain });

    expect(output.success).toBe(true);
    const session = await sessionRepo.findByTokenHash(sessionToken.hashToken(sessionTokenPlain));
    expect(session?.isActive()).toBe(false);
  });

  it("is idempotent when no session token is provided", async () => {
    const { logoutUseCase } = await buildFixture();

    await expect(logoutUseCase.execute({ sessionToken: undefined })).resolves.toEqual({ success: true });
  });

  it("is idempotent when the session token is unknown", async () => {
    const { logoutUseCase } = await buildFixture();

    await expect(logoutUseCase.execute({ sessionToken: "unknown-token" })).resolves.toEqual({ success: true });
  });
});

/** Named fakes co-located with the spec (usecase/ may not import infra/, even in tests). */
class FakeUserRepository implements UserRepository {
  private readonly usersById = new Map<string, User>();

  findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.usersById.get(id.value) ?? null);
  }

  findByEmail(normalizedEmail: string): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.email === normalizedEmail) return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  save(user: User): Promise<void> {
    this.usersById.set(user.id, user);
    return Promise.resolve();
  }
}

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

class FakePasswordHasherGateway implements PasswordHasherGateway {
  hash(plainPassword: string): Promise<string> {
    return Promise.resolve(`hashed:${plainPassword}`);
  }

  verify(plainPassword: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `hashed:${plainPassword}`);
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
