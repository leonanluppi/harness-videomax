import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastifyServer } from "@/infra/http/fastify-server";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { RegisterHandler } from "./register.handler";
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
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, sessionToken, userQueries);

  return buildFastifyServer({
    logger: { level: "error" },
    routes: [
      { method: "POST", path: "/api/auth/register", handler: new RegisterHandler(registerUser, SESSION_MAX_AGE_SECONDS, false) },
      { method: "GET", path: "/api/auth/session", handler: new GetSessionHandler(getCurrentSession) },
    ],
  });
}

describe("GetSessionHandler", () => {
  it("returns authenticated true with the user and no token leak for an active session", async () => {
    const app = buildApp();
    const registerResponse = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Session User", email: "session@example.com", password: "Pass1234" },
    });
    const sessionCookie = String(registerResponse.headers["set-cookie"]).split(";")[0] ?? "";
    const token = sessionCookie.split("=")[1];

    const response = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: sessionCookie },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json<{ authenticated: boolean; user?: { email: string } }>();
    expect(body.authenticated).toBe(true);
    expect(body.user?.email).toBe("session@example.com");
    expect(JSON.stringify(body)).not.toContain(token);
  });

  it("returns authenticated: false for a missing session cookie", async () => {
    const app = buildApp();

    const response = await app.inject({ method: "GET", url: "/api/auth/session" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ authenticated: false });
  });

  it("returns authenticated: false for an unknown session token", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: "session_token=unknown-token" },
    });

    expect(response.json()).toEqual({ authenticated: false });
  });
});
