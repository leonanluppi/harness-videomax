import type { Handler } from "@/infra/http/handler";
import type { HttpRequest, HttpResponse } from "@/infra/http/types";
import { readSessionToken } from "@/infra/http/cookies";
import type { GetCurrentSessionUseCase } from "@/usecase/auth/get-current-session.usecase";

export class GetSessionHandler implements Handler {
  constructor(private readonly getCurrentSession: GetCurrentSessionUseCase) {}

  async handle(req: HttpRequest): Promise<HttpResponse> {
    const token = readSessionToken(req.headers["cookie"]);
    const output = await this.getCurrentSession.execute({ token });

    return { status: 200, body: output };
  }
}
