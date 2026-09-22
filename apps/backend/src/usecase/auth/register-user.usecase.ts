import { Email } from "@/domain/user/email.vo";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import { User } from "@/domain/user/user.entity";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { EmailAlreadyExistsError } from "@/domain/user/errors";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import { type RegisterUserInput, type RegisterUserOutput, toOutput } from "./register-user.dto";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly passwordHasher: PasswordHasherGateway,
    private readonly sessionToken: SessionTokenGateway,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const email = Email.create(input.email);
    const existing = await this.userRepo.findByEmail(email.value);
    if (existing) throw new EmailAlreadyExistsError(email.value);

    const hashedPassword = await HashedPassword.create(input.password, this.passwordHasher);
    const user = User.create({ name: input.name, email: email.value, hashedPassword });
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
