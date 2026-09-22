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
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";
import { UserPrismaRepository } from "@/infra/repository/user/user.prisma-repository";
import { UserPrismaQueries } from "@/infra/queries/user/user.prisma-queries";
import { SessionPrismaRepository } from "@/infra/repository/session/session.prisma-repository";
import { GetHelloHandler } from "@/infra/http/hello/get-hello.handler";
import { GetHealthHandler } from "@/infra/http/health/get-health.handler";
import { RegisterHandler } from "@/infra/http/auth/register.handler";
import { LoginHandler } from "@/infra/http/auth/login.handler";
import { LogoutHandler } from "@/infra/http/auth/logout.handler";
import { GetSessionHandler } from "@/infra/http/auth/get-session.handler";
import { resolveCurrentUser } from "@/infra/http/middleware/auth";
import { buildHttpRoutes } from "@/infra/http/index";
import { buildFastifyServer } from "@/infra/http/fastify-server";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function bootstrap(): Promise<FastifyInstance> {
  const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });

  const databaseHealth = new PrismaDatabaseHealthGateway(prisma);
  const passwordHasher = new NodePasswordHasherGateway();
  const sessionToken = new NodeSessionTokenGateway();

  const userRepo = new UserPrismaRepository(prisma);
  const userQueries = new UserPrismaQueries(prisma);
  const sessionRepo = new SessionPrismaRepository(prisma);

  const sessionTtlMs = config.sessionTtlDays * ONE_DAY_MS;
  const sessionMaxAgeSeconds = config.sessionTtlDays * 24 * 60 * 60;
  const cookieSecure = config.nodeEnv === "production";

  const getHello = new GetHelloUseCase();
  const getHealth = new GetHealthUseCase(databaseHealth);
  const registerUser = new RegisterUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, sessionTtlMs);
  const loginUser = new LoginUserUseCase(userRepo, sessionRepo, passwordHasher, sessionToken, sessionTtlMs);
  const logoutUser = new LogoutUserUseCase(sessionRepo, sessionToken);
  const getCurrentSession = new GetCurrentSessionUseCase(sessionRepo, sessionToken, userQueries);

  const getHelloHandler = new GetHelloHandler(getHello);
  const getHealthHandler = new GetHealthHandler(getHealth);
  const registerHandler = new RegisterHandler(registerUser, sessionMaxAgeSeconds, cookieSecure);
  const loginHandler = new LoginHandler(loginUser, sessionMaxAgeSeconds, cookieSecure);
  const logoutHandler = new LogoutHandler(logoutUser, cookieSecure);
  const getSessionHandler = new GetSessionHandler(getCurrentSession);

  const routes = buildHttpRoutes({
    getHelloHandler,
    getHealthHandler,
    registerHandler,
    loginHandler,
    logoutHandler,
    getSessionHandler,
  });
  const app = buildFastifyServer({
    routes,
    logger: { level: config.logLevel },
    resolveUser: (req) => resolveCurrentUser(req, getCurrentSession),
  });

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
