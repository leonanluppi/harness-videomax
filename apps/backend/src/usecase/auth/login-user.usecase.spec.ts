import { describe, expect, it } from "vitest";
import { User } from "@/domain/user/user.entity";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import { InvalidCredentialsError, AccountSuspendedError } from "@/domain/user/errors";
import type { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type {
  GeneratedSessionToken,
  SessionTokenGateway,
} from "@/domain/session/session-token.gateway";
import { LoginUserUseCase } from "./login-user.usecase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("LoginUserUseCase", () => {
  it("logs_in_with_valid_credentials", async () => {
    const hasher = new FakePasswordHasherGateway();
    const userRepo = new FakeUserRepository();
    const user = User.create({
      name: "Existing User",
      email: "existing@example.com",
      hashedPassword: await HashedPassword.create("Pass1234", hasher),
    });
    await userRepo.save(user);
    const useCase = new LoginUserUseCase(
      userRepo,
      new FakeSessionRepository(),
      hasher,
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    const output = await useCase.execute({ email: "existing@example.com", password: "Pass1234" });

    expect(output.user.email).toBe("existing@example.com");
    const saved = await userRepo.findByEmail("existing@example.com");
    expect(saved?.lastLoginAt).not.toBeNull();
  });

  it("rejects_wrong_password_generically", async () => {
    const hasher = new FakePasswordHasherGateway();
    const userRepo = new FakeUserRepository();
    await userRepo.save(
      User.create({
        name: "Existing User",
        email: "existing@example.com",
        hashedPassword: await HashedPassword.create("Pass1234", hasher),
      }),
    );
    const useCase = new LoginUserUseCase(
      userRepo,
      new FakeSessionRepository(),
      hasher,
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    await expect(
      useCase.execute({ email: "existing@example.com", password: "wrong-password" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects_unknown_email_generically", async () => {
    const useCase = new LoginUserUseCase(
      new FakeUserRepository(),
      new FakeSessionRepository(),
      new FakePasswordHasherGateway(),
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    await expect(
      useCase.execute({ email: "missing@example.com", password: "Pass1234" }),
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("rejects a suspended account after verifying the password", async () => {
    const hasher = new FakePasswordHasherGateway();
    const userRepo = new FakeUserRepository();
    const suspended = User.restore({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Suspended User",
      email: "suspended@example.com",
      passwordHash: await hasher.hash("Pass1234"),
      isAdmin: false,
      status: "suspended",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    });
    await userRepo.save(suspended);
    const useCase = new LoginUserUseCase(
      userRepo,
      new FakeSessionRepository(),
      hasher,
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    await expect(
      useCase.execute({ email: "suspended@example.com", password: "Pass1234" }),
    ).rejects.toBeInstanceOf(AccountSuspendedError);
  });
});

class FakeUserRepository implements UserRepository {
  private readonly store = new Map<string, User>();

  findById(id: string): Promise<User | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByEmail(email: string): Promise<User | null> {
    for (const user of this.store.values()) if (user.email === email) return Promise.resolve(user);
    return Promise.resolve(null);
  }

  save(user: User): Promise<void> {
    this.store.set(user.id, user);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}

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

class FakePasswordHasherGateway implements PasswordHasherGateway {
  hash(plaintext: string): Promise<string> {
    return Promise.resolve(`fake-hash:${plaintext}`);
  }

  verify(hash: string, plaintext: string): Promise<boolean> {
    return Promise.resolve(hash === `fake-hash:${plaintext}`);
  }
}

class FakeSessionTokenGateway implements SessionTokenGateway {
  private counter = 0;

  generate(): GeneratedSessionToken {
    this.counter += 1;
    const token = `fake-token-${this.counter}`;
    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return `hash:${token}`;
  }
}
