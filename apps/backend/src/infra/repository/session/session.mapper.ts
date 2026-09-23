import type { Session as PrismaSession } from "@prisma/client";
import { Session } from "@/domain/session/session.entity";

type PersistedSession = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export class SessionMapper {
  static toDomain(row: PrismaSession): Session {
    return Session.restore({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      createdAt: row.createdAt,
      expiresAt: row.expiresAt,
      revokedAt: row.revokedAt,
    });
  }

  static toPersistence(session: Session): PersistedSession {
    return {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }
}
