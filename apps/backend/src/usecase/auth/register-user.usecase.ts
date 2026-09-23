import { Email } from "@/domain/user/email.vo";
import { User } from "@/domain/user/user.entity";
import { UserId } from "@/domain/user/user-id.vo";
import { assertValidPlainPassword } from "@/domain/user/hashed-password.vo";
import { EmailAlreadyExistsError } from "@/domain/user/errors";
import type { UserRepository } from "@/domain/user/user.repository";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";
import type { RegisterUserInput, RegisterUserOutput } from "./register-user.dto";

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly passwordHasher: PasswordHasherGateway,
    private readonly sessionToken: SessionTokenGateway,
    private readonly sessionTtlMs: number,
  ) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const normalizedEmail = Email.create(input.email).value;
    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) throw new EmailAlreadyExistsError(normalizedEmail);

    assertValidPlainPassword(input.password);
    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({ name: input.name, email: input.email, passwordHash });
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
