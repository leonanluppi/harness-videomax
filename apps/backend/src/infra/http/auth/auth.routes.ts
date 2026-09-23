import type { HttpRoute } from "@/infra/http/types";
import type { RegisterHandler } from "./register.handler";
import type { LoginHandler } from "./login.handler";
import type { LogoutHandler } from "./logout.handler";
import type { GetSessionHandler } from "./get-session.handler";

export type AuthHttpDeps = {
  registerHandler: RegisterHandler;
  loginHandler: LoginHandler;
  logoutHandler: LogoutHandler;
  getSessionHandler: GetSessionHandler;
};

export const authRoutes = (deps: AuthHttpDeps): HttpRoute[] => [
  { method: "POST", path: "/api/auth/register", handler: deps.registerHandler },
  { method: "POST", path: "/api/auth/login", handler: deps.loginHandler },
  { method: "POST", path: "/api/auth/logout", handler: deps.logoutHandler },
  { method: "GET", path: "/api/auth/session", handler: deps.getSessionHandler },
];
