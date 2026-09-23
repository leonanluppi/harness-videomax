import { z } from "zod";
import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import type { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import { buildSessionCookie, type CookieConfig } from "@/infra/http/cookies";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().min(1),
  password: z.string().min(1),
});

export class RegisterHandler implements Handler {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly cookieConfig: CookieConfig,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const input = schema.parse(req.body);
    const output = await this.registerUser.execute(input);

    return {
      status: 201,
      body: { user: output.user, session: { expiresAt: output.sessionExpiresAt } },
      headers: { "Set-Cookie": buildSessionCookie(this.cookieConfig, output.sessionToken) },
    };
  }
}
