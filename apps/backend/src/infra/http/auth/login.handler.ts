import { z } from "zod";
import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import { buildSessionCookie } from "@/infra/http/cookies";
import type { LoginUserUseCase } from "@/usecase/auth/login-user.usecase";
import type { LoginUserInput } from "@/usecase/auth/login-user.dto";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
}) satisfies z.ZodType<LoginUserInput>;

export class LoginHandler implements Handler {
  constructor(
    private readonly loginUser: LoginUserUseCase,
    private readonly sessionMaxAgeSeconds: number,
    private readonly cookieSecure: boolean,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const input = schema.parse(req.body);
    const output = await this.loginUser.execute(input);

    return {
      status: 200,
      body: { user: output.user, session: { expiresAt: output.session.expiresAt } },
      headers: {
        "set-cookie": buildSessionCookie(output.session.token, this.sessionMaxAgeSeconds, {
          secure: this.cookieSecure,
        }),
      },
    };
  }
}
