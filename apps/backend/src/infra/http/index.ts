import { helloRoutes, type HelloHttpDeps } from "./hello/hello.routes";
import { healthRoutes, type HealthHttpDeps } from "./health/health.routes";
import { authRoutes, type AuthHttpDeps } from "./auth/auth.routes";
import type { HttpRoute } from "./types";

export type HttpDeps = HelloHttpDeps & HealthHttpDeps & AuthHttpDeps;

export const buildHttpRoutes = (deps: HttpDeps): HttpRoute[] => [
  ...healthRoutes(deps),
  ...helloRoutes(deps),
  ...authRoutes(deps),
];
