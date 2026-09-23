import { describe, expect, it } from "vitest";
import { RegisterUserUseCase } from "./register-user.usecase";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { User } from "@/domain/user/user.entity";
import type { UserId } from "@/domain/user/user-id.vo";
import type { Session } from "@/domain/session/session.entity";
import type { SessionId } from "@/domain/session/session-id.vo";
import { EmailAlreadyExistsError, WeakPasswordError } from "@/domain/user/errors";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function buildUseCase() {
  const userRepo = new FakeUserRepository();
  const sessionRepo = new FakeSessionRepository();
  const passwordHasher = new FakePasswordHasherGateway();
  const sessionToken = new FakeSessionTokenGateway();
  const useCase = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);
  return { useCase, userRepo, sessionRepo, sessionToken };
}

describe("RegisterUserUseCase", () => {
  it("registers_user_and_creates_session", async () => {
    const { useCase, userRepo, sessionRepo, sessionToken } = buildUseCase();

    const output = await useCase.execute({ name: "Camila Rocha", email: "Camila@Studio.co", password: "Pass1234" });

    expect(output.user.email).toBe("camila@studio.co");
    expect(output.user.isAdmin).toBe(false);

    const persistedUser = await userRepo.findByEmail("camila@studio.co");
    expect(persistedUser).not.toBeNull();
    expect(persistedUser?.passwordHash).not.toBe("Pass1234");

    const persistedSession = await sessionRepo.findByTokenHash(sessionToken.hashToken(output.sessionToken));
    expect(persistedSession).not.toBeNull();
  });

  it("rejects_duplicate_registration", async () => {
    const { useCase, userRepo } = buildUseCase();
    await useCase.execute({ name: "Existing User", email: "existing@example.com", password: "Pass1234" });
    const usersBefore = await userRepo.count();

    await expect(
      useCase.execute({ name: "Someone Else", email: "EXISTING@example.com", password: "Pass1234" }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);

    expect(await userRepo.count()).toBe(usersBefore);
  });

  it("rejects_each_password_rule", async () => {
    const { useCase: tooShort } = buildUseCase();
    await expect(
      tooShort.execute({ name: "New User", email: "short@example.com", password: "abc1" }),
    ).rejects.toBeInstanceOf(WeakPasswordError);

    const { useCase: noNumber } = buildUseCase();
    await expect(
      noNumber.execute({ name: "New User", email: "noNumber@example.com", password: "onlyletters" }),
    ).rejects.toBeInstanceOf(WeakPasswordError);

    const { useCase: noLetter } = buildUseCase();
    await expect(
      noLetter.execute({ name: "New User", email: "noLetter@example.com", password: "12345678" }),
    ).rejects.toBeInstanceOf(WeakPasswordError);
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

  count(): Promise<number> {
    return Promise.resolve(this.usersById.size);
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
