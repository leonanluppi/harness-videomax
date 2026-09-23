import { describe, expect, it } from "vitest";
import { buildFastifyServer } from "@/infra/http/fastify-server";
import { authRoutes } from "./auth.routes";
import { RegisterHandler } from "./register.handler";
import { LoginHandler } from "./login.handler";
import { LogoutHandler } from "./logout.handler";
import { GetSessionHandler } from "./get-session.handler";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import { LogoutUserUseCase } from "@/usecase/auth/logout-user.usecase";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";
import { NodeScryptPasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import type { CookieConfig } from "@/infra/http/cookies";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const cookieConfig: CookieConfig = { name: "session_token", maxAgeSeconds: 2_592_000, secure: false };

/**
 * Keeps the read-side fake in sync with the write-side fake on every save, the
 * way Prisma-backed repositories and queries naturally share one `users` table.
 */
class SyncedUserQueries extends UserInMemoryQueries {
  constructor(private readonly userRepo: UserInMemoryRepository) {
    super();
  }

  override async getById(id: Parameters<UserInMemoryQueries["getById"]>[0]) {
    const user = await this.userRepo.findById(id);
    if (!user) return null;
    this.seed({ id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin });
    return super.getById(id);
  }
}

function buildApp() {
  const userRepo = new UserInMemoryRepository();
  const sessionRepo = new SessionInMemoryRepository();
  const userQueries = new SyncedUserQueries(userRepo);
  const passwordHasher = new NodeScryptPasswordHasherGateway();
  const sessionToken = new NodeSessionTokenGateway();

  const registerUser = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);
  const loginUser = new LoginUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, SESSION_TTL_MS);
  const logoutUser = new LogoutUserUseCase(sessionRepo, sessionToken);
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, userQueries, sessionToken);

  const routes = authRoutes({
    registerHandler: new RegisterHandler(registerUser, cookieConfig),
    loginHandler: new LoginHandler(loginUser, cookieConfig),
    logoutHandler: new LogoutHandler(logoutUser, cookieConfig),
    getSessionHandler: new GetSessionHandler(getCurrentSession, cookieConfig),
  });

  const app = buildFastifyServer({ logger: { level: "error" }, routes });
  return { app, userRepo, userQueries };
}

describe("auth handlers", () => {
  it("sets_secure_session_cookie_on_register", async () => {
    const { app } = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "New User", email: "New@Example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{ user: { email: string; isAdmin: boolean }; session: { expiresAt: string } }>();
    expect(body.user.email).toBe("new@example.com");
    expect(body.user.isAdmin).toBe(false);
    expect(body.session.expiresAt).toEqual(expect.any(String));

    const setCookie = response.headers["set-cookie"];
    expect(setCookie).toContain("session_token=");
    expect(setCookie).toContain("HttpOnly");
    expect(setCookie).toContain("SameSite=Lax");
    expect(setCookie).toContain("Path=/");
  });

  it("rejects a too-short password with 422 weak_password", async () => {
    const { app } = buildApp();

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "New User", email: "new@example.com", password: "abc1" },
    });

    expect(response.statusCode).toBe(422);
    expect(response.json()).toMatchObject({ code: "weak_password" });
    expect(response.headers["set-cookie"]).toBeUndefined();
  });

  it("rejects duplicate email with 409", async () => {
    const { app } = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Existing User", email: "existing@example.com", password: "Pass1234" },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Someone", email: "EXISTING@example.com", password: "Pass1234" },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({
      code: "email_already_exists",
      message: "An account with this email already exists — try logging in",
    });
  });

  it("rejects wrong login credentials with a generic 401", async () => {
    const { app } = buildApp();
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

  it("clears_cookie_on_logout", async () => {
    const { app } = buildApp();
    const registerResponse = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Session User", email: "session@example.com", password: "Pass1234" },
    });
    const cookie = firstCookiePair(registerResponse.headers["set-cookie"]);

    const response = await app.inject({
      method: "POST",
      url: "/api/auth/logout",
      headers: { cookie },
    });

    expect(response.statusCode).toBe(204);
    const clearCookie = response.headers["set-cookie"];
    expect(clearCookie).toContain("Max-Age=0");

    const sessionResponse = await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie } });
    expect(sessionResponse.json()).toEqual({ authenticated: false });
  });

  it("returns authenticated session state for an active cookie, anonymous otherwise", async () => {
    const { app } = buildApp();
    const registerResponse = await app.inject({
      method: "POST",
      url: "/api/auth/register",
      payload: { name: "Session User", email: "session2@example.com", password: "Pass1234" },
    });
    const cookie = firstCookiePair(registerResponse.headers["set-cookie"]);

    const authed = await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie } });
    expect(authed.json()).toMatchObject({ authenticated: true, user: { email: "session2@example.com" } });

    const anon = await app.inject({ method: "GET", url: "/api/auth/session" });
    expect(anon.json()).toEqual({ authenticated: false });
  });
});

function firstCookiePair(setCookie: string | string[] | undefined): string {
  const raw = Array.isArray(setCookie) ? setCookie[0] : setCookie;
  if (!raw) throw new Error("expected a Set-Cookie header");
  return raw.split(";")[0] ?? "";
}
