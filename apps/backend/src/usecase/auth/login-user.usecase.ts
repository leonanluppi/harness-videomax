import { Email } from "@/domain/user/email.vo";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { AccountSuspendedError, InvalidCredentialsError } from "@/domain/user/errors";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import { type LoginUserInput, type LoginUserOutput, toOutput } from "./login-user.dto";

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly passwordHasher: PasswordHasherGateway,
    private readonly sessionToken: SessionTokenGateway,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const email = Email.create(input.email);
    const user = await this.userRepo.findByEmail(email.value);
    if (!user) throw new InvalidCredentialsError();

    const validPassword = await user.verifyPassword(input.password, this.passwordHasher);
    if (!validPassword) throw new InvalidCredentialsError();
    if (!user.isActive()) throw new AccountSuspendedError();

    user.recordLogin(new Date());
    await this.userRepo.save(user);

    const { token, tokenHash } = this.sessionToken.generate();
    const session = Session.create({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + this.sessionTtlMs),
    });
    await this.sessionRepo.save(session);

    return toOutput(user, token, session);
  }
}
