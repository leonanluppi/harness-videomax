import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastifyServer } from "@/infra/http/fastify-server";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import { RegisterHandler } from "./register.handler";
import { LoginHandler } from "./login.handler";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function buildApp(): FastifyInstance {
  const userRepo = new UserInMemoryRepository();
  const sessionRepo = new SessionInMemoryRepository();
  const passwordHasher = new NodePasswordHasherGateway();
  const sessionToken = new NodeSessionTokenGateway();
  const registerUser = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, 30 * ONE_DAY_MS);
  const loginUser = new LoginUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, 30 * ONE_DAY_MS);
  return buildFastifyServer({
    logger: { level: "error" },
    routes: [
      { method: "POST", path: "/api/auth/register", handler: new RegisterHandler(registerUser, SESSION_MAX_AGE_SECONDS, false) },
      { method: "POST", path: "/api/auth/login", handler: new LoginHandler(loginUser, SESSION_MAX_AGE_SECONDS, false) },
    ],
  });
}

describe("LoginHandler", () => {
  it("logs in with valid credentials and sets a session cookie", async () => {
    const app = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Existing User", email: "existing@example.com", password: "Pass1234" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "existing@example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["set-cookie"]).toContain("session_token=");
  });

  it("rejects wrong credentials with a generic 401", async () => {
    const app = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Existing User", email: "existing@example.com", password: "Pass1234" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "existing@example.com", password: "wrong-password" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "invalid_credentials", message: "Invalid email or password" });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects an unknown email with the same generic 401", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/login",
      payload: { email: "missing@example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ code: "invalid_credentials", message: "Invalid email or password" });
  });
});
