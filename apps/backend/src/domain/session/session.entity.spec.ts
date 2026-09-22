import { describe, expect, it } from "vitest";
import { Session } from "./session.entity";
import { SessionAlreadyRevokedError } from "./errors";

describe("Session", () => {
  it("is active while unexpired and unrevoked", () => {
    const session = Session.create({
      userId: "user-1",
      tokenHash: "a".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    expect(session.isActive(new Date())).toBe(true);
    expect(session.revokedAt).toBeNull();
  });

  it("is inactive once expired", () => {
    const session = Session.restore({
      id: "session-1",
      userId: "user-1",
      tokenHash: "a".repeat(64),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date("2026-01-02T00:00:00.000Z"),
      revokedAt: null,
    });

    expect(session.isActive(new Date("2026-01-03T00:00:00.000Z"))).toBe(false);
  });

  it("revokes_active_session_on_logout", () => {
    const session = Session.create({
      userId: "user-1",
      tokenHash: "a".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });
    const now = new Date();

    session.revoke(now);

    expect(session.revokedAt).toEqual(now);
    expect(session.isActive(now)).toBe(false);
  });

  it("returns_anonymous_for_expired_or_revoked_session", () => {
    const session = Session.restore({
      id: "session-1",
      userId: "user-1",
      tokenHash: "a".repeat(64),
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date("2026-01-01T01:00:00.000Z"),
    });

    expect(session.isActive(new Date())).toBe(false);
  });

  it("rejects revoking an already-revoked session", () => {
    const session = Session.create({
      userId: "user-1",
      tokenHash: "a".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });
    session.revoke(new Date());

    expect(() => session.revoke(new Date())).toThrow(SessionAlreadyRevokedError);
  });
});
