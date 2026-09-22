import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import { buildClearSessionCookie, readSessionToken } from "@/infra/http/cookies";
import type { LogoutUserUseCase } from "@/usecase/auth/logout-user.usecase";

export class LogoutHandler implements Handler {
  constructor(
    private readonly logoutUser: LogoutUserUseCase,
    private readonly cookieSecure: boolean,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const token = readSessionToken(req.headers["cookie"]);
    await this.logoutUser.execute({ token });

    return {
      status: 204,
      headers: { "set-cookie": buildClearSessionCookie({ secure: this.cookieSecure }) },
    };
  }
}
