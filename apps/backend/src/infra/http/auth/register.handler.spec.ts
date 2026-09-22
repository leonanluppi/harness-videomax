import { describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildFastifyServer } from "@/infra/http/fastify-server";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { RegisterHandler } from "./register.handler";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function buildApp(): FastifyInstance {
  const userRepo = new UserInMemoryRepository();
  const sessionRepo = new SessionInMemoryRepository();
  const registerUser = new RegisterUserUseCase(
    userRepo,
    sessionRepo,
    new NodePasswordHasherGateway(),
    new NodeSessionTokenGateway(),
    30 * ONE_DAY_MS,
  );
  return buildFastifyServer({
    logger: { level: "error" },
    routes: [
      { method: "POST", path: "/api/auth/register", handler: new RegisterHandler(registerUser, SESSION_MAX_AGE_SECONDS, false) },
    ],
  });
}

describe("RegisterHandler", () => {
  it("sets_secure_session_cookie_on_register", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "New User", email: "New@Example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{
      user: { email: string; isAdmin: boolean };
      session: { expiresAt: string };
    }>();
    expect(body.user).toEqual({ id: expect.any(String), name: "New User", email: "new@example.com", isAdmin: false });
    expect(body.session.expiresAt).toEqual(expect.any(String));
    const cookie = response.headers["set-cookie"];
    expect(cookie).toContain("session_token=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
  });

  it("rejects a too-short password with 422 weak_password", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "New User", email: "new@example.com", password: "abc1" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: "weak_password" });
  });

  it("rejects a duplicate email with 409", async () => {
    const app = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Existing User", email: "existing@example.com", password: "Pass1234" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Impostor", email: "EXISTING@example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      code: "email_already_exists",
      message: "An account with this email already exists — try logging in",
    });
  });

  it("rejects a malformed register body with 400 invalid_input", async () => {
    const app = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "", email: "not-an-email" },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ code: "invalid_input" });
  });
});
