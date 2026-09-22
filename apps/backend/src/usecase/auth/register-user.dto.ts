import type { User } from "@/domain/user/user.entity";
import type { Session } from "@/domain/session/session.entity";

export type RegisterUserInput = {
  name: string;
  email: string;
  password: string;
};

export type RegisterUserOutput = {
  user: { id: string; name: string; email: string; isAdmin: boolean };
  session: { token: string; expiresAt: string };
};

export function toOutput(user: User, token: string, session: Session): RegisterUserOutput {
  return {
    user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin },
    session: { token, expiresAt: session.expiresAt.toISOString() },
  };
}
