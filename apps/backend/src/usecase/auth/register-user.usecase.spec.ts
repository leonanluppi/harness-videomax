import { describe, expect, it } from "vitest";
import type { User } from "@/domain/user/user.entity";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { EmailAlreadyExistsError } from "@/domain/user/errors";
import type { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type {
  GeneratedSessionToken,
  SessionTokenGateway,
} from "@/domain/session/session-token.gateway";
import { WeakPasswordError } from "@/domain/user/errors";
import { RegisterUserUseCase } from "./register-user.usecase";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("RegisterUserUseCase", () => {
  it("registers_user_and_creates_session", async () => {
    const userRepo = new FakeUserRepository();
    const sessionRepo = new FakeSessionRepository();
    const useCase = new RegisterUserUseCase(
      userRepo,
      sessionRepo,
      new FakePasswordHasherGateway(),
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    const output = await useCase.execute({
      name: "New User",
      email: "New@Example.com",
      password: "Pass1234",
    });

    expect(output.user).toEqual({
      id: expect.any(String),
      name: "New User",
      email: "new@example.com",
      isAdmin: false,
    });
    expect(output.session.token).toEqual(expect.any(String));

    const saved = await userRepo.findByEmail("new@example.com");
    expect(saved?.passwordHash).not.toBe("Pass1234");
    expect(sessionRepo.savedCount).toBe(1);
  });

  it("rejects_duplicate_registration", async () => {
    const userRepo = new FakeUserRepository();
    const useCase = new RegisterUserUseCase(
      userRepo,
      new FakeSessionRepository(),
      new FakePasswordHasherGateway(),
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );
    await useCase.execute({ name: "Existing User", email: "existing@example.com", password: "Pass1234" });

    await expect(
      useCase.execute({ name: "Impostor", email: "EXISTING@example.com", password: "Pass1234" }),
    ).rejects.toBeInstanceOf(EmailAlreadyExistsError);
    expect(userRepo.count).toBe(1);
  });

  it("rejects_each_password_rule", async () => {
    const useCase = new RegisterUserUseCase(
      new FakeUserRepository(),
      new FakeSessionRepository(),
      new FakePasswordHasherGateway(),
      new FakeSessionTokenGateway(),
      30 * ONE_DAY_MS,
    );

    await expect(
      useCase.execute({ name: "New User", email: "new@example.com", password: "abc1" }),
    ).rejects.toMatchObject({ code: "weak_password", details: { reasons: expect.arrayContaining([
      expect.stringContaining("8 characters"),
    ]) } });

    await expect(
      useCase.execute({ name: "New User", email: "new2@example.com", password: "12345678" }),
    ).rejects.toBeInstanceOf(WeakPasswordError);

    await expect(
      useCase.execute({ name: "New User", email: "new3@example.com", password: "abcdefgh" }),
    ).rejects.toBeInstanceOf(WeakPasswordError);
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

  get count(): number {
    return this.store.size;
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

  get savedCount(): number {
    return this.store.size;
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
