import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import type { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";
import { readCookie, type CookieConfig } from "@/infra/http/cookies";

export class GetSessionHandler implements Handler {
  constructor(
    private readonly getCurrentSession: GetCurrentSessionUseCase,
    private readonly cookieConfig: CookieConfig,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const sessionToken = readCookie(req, this.cookieConfig.name);
    const output = await this.getCurrentSession.execute({ sessionToken });

    return { status: 200, body: output };
  }
}
