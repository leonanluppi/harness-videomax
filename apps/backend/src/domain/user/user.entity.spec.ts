import { describe, expect, it } from "vitest";
import type { PasswordHasherGateway } from "./password-hasher.gateway";
import { HashedPassword } from "./hashed-password.vo";
import { User } from "./user.entity";

describe("User", () => {
  it("creates_user_with_active_non_admin_defaults", async () => {
    const hasher = new FakePasswordHasherGateway();
    const hashedPassword = await HashedPassword.create("Pass1234", hasher);

    const user = User.create({ name: "Camila Rocha", email: "camila@studio.co", hashedPassword });

    expect(user.status).toBe("active");
    expect(user.isAdmin).toBe(false);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.lastLoginAt).toBeNull();
    expect(() => user.toJSON()).toThrow(/Do not serialize/);
  });

  it("restores a user and updates last login without regenerating identity", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const user = User.restore({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Existing User",
      email: "existing@example.com",
      passwordHash: "fake-hash:Pass1234",
      isAdmin: false,
      status: "active",
      createdAt,
      updatedAt: createdAt,
      lastLoginAt: null,
    });

    const now = new Date("2026-02-01T00:00:00.000Z");
    user.recordLogin(now);

    expect(user.id).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(user.lastLoginAt).toEqual(now);
    expect(user.updatedAt).toEqual(now);
  });

  it("verifies a password through the injected hasher", async () => {
    const hasher = new FakePasswordHasherGateway();
    const hashedPassword = await HashedPassword.create("Pass1234", hasher);
    const user = User.create({ name: "Camila Rocha", email: "camila@studio.co", hashedPassword });

    await expect(user.verifyPassword("Pass1234", hasher)).resolves.toBe(true);
    await expect(user.verifyPassword("wrong-password", hasher)).resolves.toBe(false);
  });
});

class FakePasswordHasherGateway implements PasswordHasherGateway {
  hash(plaintext: string): Promise<string> {
    return Promise.resolve(`fake-hash:${plaintext}`);
  }

  verify(hash: string, plaintext: string): Promise<boolean> {
    return Promise.resolve(hash === `fake-hash:${plaintext}`);
  }
}
