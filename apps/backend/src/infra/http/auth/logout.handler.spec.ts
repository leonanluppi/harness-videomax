import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastifyServer } from "@/infra/http/fastify-server";
import { resolveCurrentUser } from "@/infra/http/middleware/auth";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { LogoutUserUseCase } from "@/usecase/auth/logout-user.usecase";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { RegisterHandler } from "./register.handler";
import { LogoutHandler } from "./logout.handler";
import { GetSessionHandler } from "./get-session.handler";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function buildApp(): FastifyInstance {
  const userRepo = new UserInMemoryRepository();
  const userQueries = new UserInMemoryQueries(userRepo);
  const sessionRepo = new SessionInMemoryRepository();
  const passwordHasher = new NodePasswordHasherGateway();
  const sessionToken = new NodeSessionTokenGateway();
  const registerUser = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, 30 * ONE_DAY_MS);
  const logoutUser = new LogoutUserUseCase(sessionRepo, sessionToken);
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, sessionToken, userQueries);

  return buildFastifyServer({
    logger: { level: "error" },
    routes: [
      { method: "POST", path: "/api/auth/register", handler: new RegisterHandler(registerUser, SESSION_MAX_AGE_SECONDS, false) },
      { method: "POST", path: "/api/auth/logout", handler: new LogoutHandler(logoutUser, false) },
      { method: "GET", path: "/api/auth/session", handler: new GetSessionHandler(getCurrentSession) },
    ],
    resolveUser: (req) => resolveCurrentUser(req, getCurrentSession),
  });
}

describe("LogoutHandler", () => {
  it("clears_cookie_on_logout and revokes the session", async () => {
    const app = buildApp();
    const registerResponse = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Session User", email: "session@example.com", password: "Pass1234" },
    });
    const sessionCookie = String(registerResponse.headers["set-cookie"]).split(";")[0] ?? "";

    const logoutResponse = await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: { cookie: sessionCookie },
    });

    expect(logoutResponse.statusCode).toBe(204);
    expect(logoutResponse.headers["set-cookie"]).toContain("Max-Age=0");

    const sessionAfterLogout = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: sessionCookie },
    });
    expect(sessionAfterLogout.json()).toEqual({ authenticated: false });
  });

  it("is idempotent when no session cookie is present", async () => {
    const app = buildApp();

    const response = await app.inject({ method: "POST", url: "/api/auth/logout" });

    expect(response.statusCode).toBe(204);
  });
});
