import { pathToFileURL } from "node:url";
import { PrismaClient } from "@prisma/client";
import type { FastifyInstance } from "fastify";

import { config } from "@/config/env";
import { GetHelloUseCase } from "@/usecase/hello/get-hello.usecase";
import { GetHealthUseCase } from "@/usecase/health/get-health.usecase";
import { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import { LogoutUserUseCase } from "@/usecase/auth/logout-user.usecase";
import { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { PrismaDatabaseHealthGateway } from "@/infra/gateway/prisma-database-health.gateway";
import { NodeScryptPasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { UserPrismaRepository } from "@/infra/repository/user/user.prisma-repository";
import { SessionPrismaRepository } from "@/infra/repository/session/session.prisma-repository";
import { UserPrismaQueries } from "@/infra/queries/user/user.prisma-queries";
import { GetHelloHandler } from "@/infra/http/hello/get-hello.handler";
import { GetHealthHandler } from "@/infra/http/health/get-health.handler";
import { RegisterHandler } from "@/infra/http/auth/register.handler";
import { LoginHandler } from "@/infra/http/auth/login.handler";
import { LogoutHandler } from "@/infra/http/auth/logout.handler";
import { GetSessionHandler } from "@/infra/http/auth/get-session.handler";
import type { CookieConfig } from "@/infra/http/cookies";
import { buildHttpRoutes } from "@/infra/http/index";
import { buildFastifyServer } from "@/infra/http/fastify-server";

export function bootstrap(): Promise<FastifyInstance> {
  const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });

  const databaseHealth = new PrismaDatabaseHealthGateway(prisma);
  const passwordHasher = new NodeScryptPasswordHasherGateway(config.passwordHashKeyLength);
  const sessionToken = new NodeSessionTokenGateway();

  const userRepo = new UserPrismaRepository(prisma);
  const sessionRepo = new SessionPrismaRepository(prisma);
  const userQueries = new UserPrismaQueries(prisma);

  const cookieConfig: CookieConfig = {
    name: config.sessionCookieName,
    maxAgeSeconds: config.sessionTtlDays * 24 * 60 * 60,
    secure: config.sessionCookieSecure,
  };

  const getHello = new GetHelloUseCase();
  const getHealth = new GetHealthUseCase(databaseHealth);
  const registerUser = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, config.sessionTtlMs);
  const loginUser = new LoginUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, config.sessionTtlMs);
  const logoutUser = new LogoutUserUseCase(sessionRepo, sessionToken);
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, userQueries, sessionToken);

  const getHelloHandler = new GetHelloHandler(getHello);
  const getHealthHandler = new GetHealthHandler(getHealth);
  const registerHandler = new RegisterHandler(registerUser, cookieConfig);
  const loginHandler = new LoginHandler(loginUser, cookieConfig);
  const logoutHandler = new LogoutHandler(logoutUser, cookieConfig);
  const getSessionHandler = new GetSessionHandler(getCurrentSession, cookieConfig);

  const routes = buildHttpRoutes({
    getHelloHandler,
    getHealthHandler,
    registerHandler,
    loginHandler,
    logoutHandler,
    getSessionHandler,
  });
  const app = buildFastifyServer({ routes, logger: { level: config.logLevel } });

  app.addHook("onClose", () => prisma.$disconnect());
  return Promise.resolve(app);
}

async function start(): Promise<void> {
  const app = await bootstrap();
  await app.listen({ port: config.port, host: "0.0.0.0" });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await start();
}
