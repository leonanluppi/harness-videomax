import { Email } from "@/domain/user/email.vo";
import { UserId } from "@/domain/user/user-id.vo";
import { AccountSuspendedError, InvalidCredentialsError } from "@/domain/user/errors";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { LoginUserInput, LoginUserOutput } from "./login-user.dto";

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly passwordHasher: PasswordHasherGateway,
    private readonly sessionToken: SessionTokenGateway,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const normalizedEmail = Email.create(input.email).value;
    const user = await this.userRepo.findByEmail(normalizedEmail);
    if (!user) throw new InvalidCredentialsError();

    const passwordOk = await this.passwordHasher.verify(input.password, user.passwordHash);
    if (!passwordOk) throw new InvalidCredentialsError();

    if (!user.isActive()) throw new AccountSuspendedError();

    user.recordLogin();
    await this.userRepo.save(user);

    const plainToken = this.sessionToken.generateToken();
    const tokenHash = this.sessionToken.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + this.sessionTtlMs);
    const session = Session.create({ userId: UserId.from(user.id), tokenHash, expiresAt });
    await this.sessionRepo.save(session);

    return {
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
      sessionToken: plainToken,
      sessionExpiresAt: expiresAt.toISOString(),
    };
  }
}
