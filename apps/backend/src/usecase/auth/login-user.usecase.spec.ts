import { describe, expect, it } from "vitest";
import { LoginUserUseCase } from "./login-user.usecase";
import { RegisterUserUseCase } from "./register-user.usecase";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { User } from "@/domain/user/user.entity";
import type { UserId } from "@/domain/user/user-id.vo";
import type { Session } from "@/domain/session/session.entity";
import type { SessionId } from "@/domain/session/session-id.vo";
import { InvalidCredentialsError } from "@/domain/user/errors";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

async function buildFixture() {
  const userRepo = new FakeUserRepository();
  const sessionRepo = new FakeSessionRepository();
  const passwordHasher = new FakePasswordHasherGateway();
  const sessionToken = new FakeSessionTokenGateway();
  const registerUseCase = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);
  const loginUseCase = new LoginUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);

  await registerUseCase.execute({ name: "Existing User", email: "existing@example.com", password: "Pass1234" });

  return { loginUseCase, userRepo };
}

describe("LoginUserUseCase", () => {
  it("logs_in_with_valid_credentials", async () => {
    const { loginUseCase, userRepo } = await buildFixture();

    const output = await loginUseCase.execute({ email: "existing@example.com", password: "Pass1234" });

    expect(output.user.email).toBe("existing@example.com");

    const user = await userRepo.findByEmail("existing@example.com");
    expect(user?.lastLoginAt).not.toBeNull();
  });

  it("rejects_wrong_password_generically", async () => {
    const { loginUseCase } = await buildFixture();

    await expect(
      loginUseCase.execute({ email: "existing@example.com", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects_unknown_email_generically", async () => {
    const { loginUseCase } = await buildFixture();

    await expect(
      loginUseCase.execute({ email: "unknown@example.com", password: "Pass1234" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
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
