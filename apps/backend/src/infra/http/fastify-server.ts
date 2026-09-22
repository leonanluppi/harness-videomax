import Fastify, {
  type FastifyInstance,
  type FastifyReply,
  type FastifyRequest,
} from "fastify";
import { toHttpResponse } from "./error-handler";
import type { HttpMethod, HttpRequest, HttpRoute } from "./types";
import type { AuthenticatedUser } from "./middleware/auth";

type ResolveUser = (req: HttpRequest) => Promise<AuthenticatedUser | undefined>;

type BuildFastifyServerInput = {
  routes: HttpRoute[];
  logger: { level: "debug" | "info" | "warn" | "error" };
  resolveUser?: ResolveUser;
};

export function buildFastifyServer(input: BuildFastifyServerInput): FastifyInstance {
  const app = Fastify({ logger: input.logger });
  registerErrorHandler(app);
  registerRoutes(app, input.routes, input.resolveUser);
  return app;
}

function registerRoutes(app: FastifyInstance, routes: HttpRoute[], resolveUser?: ResolveUser): void {
  for (const route of routes) {
    app.route({
      method: route.method,
      url: route.path,
      handler: async (request, reply) => handleRoute(route, request, reply, resolveUser),
    });
  }
}

function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    request.log.error({ err: error }, "request failed");
    const response = toHttpResponse(error);
    void reply.status(response.status).send(response.body);
  });
}

async function handleRoute(
  route: HttpRoute,
  request: FastifyRequest,
  reply: FastifyReply,
  resolveUser?: ResolveUser,
): Promise<unknown> {
  const httpRequest = toHttpRequest(route.method, request);
  if (resolveUser) {
    const user = await resolveUser(httpRequest);
    if (user) httpRequest.user = user;
  }

  const response = await route.handler.handle(httpRequest);
  void reply.status(response.status);
  setHeaders(reply, response.headers);
  return response.body ?? null;
}

function toHttpRequest(method: HttpMethod, request: FastifyRequest): HttpRequest {
  return {
    method,
    path: request.url,
    params: toStringRecord(request.params),
    query: toQueryRecord(request.query),
    body: request.body,
    headers: request.headers,
  };
}

function toStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, string>;
}

function toQueryRecord(value: unknown): Record<string, string | string[] | undefined> {
  if (!value || typeof value !== "object") return {};
  return value as Record<string, string | string[] | undefined>;
}

function setHeaders(reply: FastifyReply, headers: Record<string, string> | undefined): void {
  if (!headers) return;
  for (const [key, value] of Object.entries(headers)) void reply.header(key, value);
}
