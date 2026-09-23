import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import type { LogoutUserUseCase } from "@/usecase/auth/logout-user.usecase";
import { buildClearSessionCookie, readCookie, type CookieConfig } from "@/infra/http/cookies";

export class LogoutHandler implements Handler {
  constructor(
    private readonly logoutUser: LogoutUserUseCase,
    private readonly cookieConfig: CookieConfig,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const sessionToken = readCookie(req, this.cookieConfig.name);
    await this.logoutUser.execute({ sessionToken });

    return {
      status: 204,
      headers: { "Set-Cookie": buildClearSessionCookie(this.cookieConfig) },
    };
  }
}
