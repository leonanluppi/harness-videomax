import { describe, expect, it } from "vitest";
import { User } from "./user.entity";

const createProps = { name: "Camila Rocha", email: "camila@studio.co", passwordHash: "hash:value" };

describe("User", () => {
  it("creates_user_with_active_non_admin_defaults", () => {
    const user = User.create(createProps);

    expect(user.status).toBe("active");
    expect(user.isAdmin).toBe(false);
    expect(user.isActive()).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.lastLoginAt).toBeNull();
    expect(() => JSON.stringify(user)).toThrow();
  });

  it("records login timestamp", () => {
    const user = User.create(createProps);
    const now = new Date("2026-01-01T00:00:00.000Z");

    user.recordLogin(now);

    expect(user.lastLoginAt).toEqual(now);
  });

  it("restores a suspended user from persistence", () => {
    const user = User.restore({
      id: "550e8400-e29b-41d4-a716-446655440000",
      name: "Existing User",
      email: "existing@example.com",
      passwordHash: "hash:value",
      isAdmin: false,
      status: "suspended",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      lastLoginAt: null,
    });

    expect(user.isActive()).toBe(false);
    expect(user.status).toBe("suspended");
  });
});
