import { describe, expect, it } from "vitest";
import { User } from "@/domain/user/user.entity";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";
import { SessionInMemoryRepository } from "@/infra/repository/session/session.in-memory-repository";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { currentUser, resolveCurrentUser } from "./auth";
import type { HttpRequest } from "@/infra/http/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

describe("resolveCurrentUser", () => {
  it("resolves an authenticated user context for an active session cookie", async () => {
    const userRepo = new UserInMemoryRepository();
    const hasher = new NodePasswordHasherGateway();
    const user = User.create({
      name: "Admin User",
      email: "admin@example.com",
      hashedPassword: await HashedPassword.create("Pass1234", hasher),
    });
    await userRepo.save(user);
    const userQueries = new UserInMemoryQueries(userRepo);
    const sessionRepo = new SessionInMemoryRepository();
    const sessionToken = new NodeSessionTokenGateway();
    const loginUser = new LoginUserUseCase(userRepo, sessionRepo, hasher, sessionToken, 30 * ONE_DAY_MS);
    const output = await loginUser.execute({ email: "admin@example.com", password: "Pass1234" });
    const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, sessionToken, userQueries);

    const resolved = await resolveCurrentUser(request(`session_token=${output.session.token}`), getCurrentSession);

    expect(resolved).toEqual({ id: user.id, isAdmin: false });
  });

  it("resolves undefined for a missing or invalid session cookie", async () => {
    const userQueries = new UserInMemoryQueries(new UserInMemoryRepository());
    const sessionRepo = new SessionInMemoryRepository();
    const sessionToken = new NodeSessionTokenGateway();
    const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, sessionToken, userQueries);

    await expect(resolveCurrentUser(request(undefined), getCurrentSession)).resolves.toBeUndefined();
    await expect(
      resolveCurrentUser(request("session_token=unknown-token"), getCurrentSession),
    ).resolves.toBeUndefined();
  });
});

describe("currentUser", () => {
  it("reads the user already resolved onto the request", () => {
    const req = request(undefined);
    req.user = { id: "user-1", isAdmin: true };

    expect(currentUser(req)).toEqual({ id: "user-1", isAdmin: true });
  });
});

function request(cookie: string | undefined): HttpRequest {
  return {
    method: "GET",
    path: "/x",
    params: {},
    query: {},
    body: null,
    headers: cookie === undefined ? {} : { cookie },
  };
}
