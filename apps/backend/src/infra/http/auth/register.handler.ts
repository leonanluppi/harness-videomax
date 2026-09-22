import { z } from "zod";
import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import { buildSessionCookie } from "@/infra/http/cookies";
import type { RegisterUserUseCase } from "@/usecase/auth/register-user.usecase";
import type { RegisterUserInput } from "@/usecase/auth/register-user.dto";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  password: z.string().min(1),
}) satisfies z.ZodType<RegisterUserInput>;

export class RegisterHandler implements Handler {
  constructor(
    private readonly registerUser: RegisterUserUseCase,
    private readonly sessionMaxAgeSeconds: number,
    private readonly cookieSecure: boolean,
  ) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const input = schema.parse(req.body);
    const output = await this.registerUser.execute(input);

    return {
      status: 201,
      body: { user: output.user, session: { expiresAt: output.session.expiresAt } },
      headers: {
        "set-cookie": buildSessionCookie(output.session.token, this.sessionMaxAgeSeconds, {
          secure: this.cookieSecure,
        }),
      },
    };
  }
}
