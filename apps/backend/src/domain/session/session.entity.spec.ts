import { describe, expect, it } from "vitest";
import { Session } from "./session.entity";
import { UserId } from "@/domain/user/user-id.vo";

const userId = UserId.generate();

describe("Session", () => {
  it("is active when not expired and not revoked", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = Session.create({
      userId,
      tokenHash: "a".repeat(64),
      expiresAt: new Date("2026-01-31T00:00:00.000Z"),
      createdAt: now,
    });

    expect(session.isActive(now)).toBe(true);
    expect(() => JSON.stringify(session)).toThrow();
  });

  it("is inactive once expired", () => {
    const now = new Date("2026-01-01T00:00:00.000Z");
    const session = Session.create({
      userId,
      tokenHash: "a".repeat(64),
      expiresAt: new Date("2026-01-01T00:00:01.000Z"),
      createdAt: now,
    });

    expect(session.isActive(new Date("2026-01-02T00:00:00.000Z"))).toBe(false);
  });

  it("is inactive once revoked, and revoking twice is idempotent", () => {
    const session = Session.create({
      userId,
      tokenHash: "a".repeat(64),
      expiresAt: new Date("2026-01-31T00:00:00.000Z"),
    });

    session.revoke(new Date("2026-01-02T00:00:00.000Z"));
    const revokedAt = session.revokedAt;
    session.revoke(new Date("2026-01-03T00:00:00.000Z"));

    expect(session.isActive()).toBe(false);
    expect(session.revokedAt).toEqual(revokedAt);
  });

  it("restores a session from persistence", () => {
    const session = Session.restore({
      id: "550e8400-e29b-41d4-a716-446655440000",
      userId: userId.value,
      tokenHash: "b".repeat(64),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-31T00:00:00.000Z"),
      revokedAt: null,
    });

    expect(session.userId).toBe(userId.value);
    expect(session.isActive(new Date("2026-01-02T00:00:00.000Z"))).toBe(true);
  });
});
