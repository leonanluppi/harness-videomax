import { describe, expect, it } from "vitest";
import { SessionAuthMiddleware } from "./auth";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { Session } from "@/domain/session/session.entity";
import { UserId } from "@/domain/user/user-id.vo";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";

function buildFixture() {
  const sessionRepo = new SessionInMemoryRepository();
  const userQueries = new UserInMemoryQueries();
  const sessionToken = new NodeSessionTokenGateway();
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, userQueries, sessionToken);
  const middleware = new SessionAuthMiddleware(getCurrentSession, sessionRepo, sessionToken);
  return { middleware, sessionRepo, userQueries, sessionToken };
}

describe("SessionAuthMiddleware", () => {
  it("SVC-SESSION-01 active cookie resolves current user", async () => {
    const { middleware, sessionRepo, userQueries, sessionToken } = buildFixture();
    const userId = UserId.generate();
    userQueries.seed({ id: userId.value, name: "Session User", email: "session@example.com", isAdmin: false });

    const plainToken = sessionToken.generateToken();
    const session = Session.create({
      userId,
      tokenHash: sessionToken.hashToken(plainToken),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);

    const optional = await middleware.resolveOptional(plainToken);
    expect(optional).toEqual({ id: userId.value, isAdmin: false });

    const required = await middleware.resolveRequired(plainToken);
    expect(required).toEqual({ id: userId.value, isAdmin: false });
  });

  it("SVC-SESSION-02 invalid cookie is rejected", async () => {
    const { middleware, sessionRepo, userQueries, sessionToken } = buildFixture();
    const userId = UserId.generate();
    userQueries.seed({ id: userId.value, name: "Revoked User", email: "revoked@example.com", isAdmin: false });

    const plainToken = sessionToken.generateToken();
    const session = Session.create({
      userId,
      tokenHash: sessionToken.hashToken(plainToken),
      expiresAt: new Date(Date.now() + 60_000),
    });
    session.revoke();
    await sessionRepo.save(session);

    await expect(middleware.resolveOptional(plainToken)).resolves.toBeUndefined();
    await expect(middleware.resolveRequired(plainToken)).rejects.toThrow();
  });

  it("resolveRequired rejects a missing cookie", async () => {
    const { middleware } = buildFixture();
    await expect(middleware.resolveRequired(undefined)).rejects.toThrow();
  });
});
