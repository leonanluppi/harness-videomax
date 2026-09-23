import { z } from "zod";
import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import type { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import { buildSessionCookie, type CookieConfig } from "@/infra/http/cookies";

const schema = z.object({
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export class LoginHandler implements Handler {
  constructor(
    private readonly loginUser: LoginUserUseCase,
    private readonly cookieConfig: CookieConfig,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const input = schema.parse(req.body);
    const output = await this.loginUser.execute(input);

    return {
      status: 200,
      body: { user: output.user, session: { expiresAt: output.sessionExpiresAt } },
      headers: { "Set-Cookie": buildSessionCookie(this.cookieConfig, output.sessionToken) },
    };
  }
}
