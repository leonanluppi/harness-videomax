import type { Session as PrismaSession } from "@prisma/client";
import { Session } from "@/domain/session/session.entity";

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

  static toPersistence(session: Session): Omit<PrismaSession, "createdAt"> {
    return {
      id: session.id,
      userId: session.userId,
      tokenHash: session.tokenHash,
      expiresAt: session.expiresAt,
      revokedAt: session.revokedAt,
    };
  }
}
