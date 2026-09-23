import type { PrismaClient } from "@prisma/client";
import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionId } from "@/domain/session/session-id.vo";
import type { Session } from "@/domain/session/session.entity";
import { SessionMapper } from "./session.mapper";

export class SessionPrismaRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: SessionId): Promise<Session | null> {
    const row = await this.prisma.session.findUnique({ where: { id: id.value } });
    return row ? SessionMapper.toDomain(row) : null;
  }

  async findByTokenHash(tokenHash: string): Promise<Session | null> {
    const row = await this.prisma.session.findUnique({ where: { tokenHash } });
    return row ? SessionMapper.toDomain(row) : null;
  }

  async save(session: Session): Promise<void> {
    const data = SessionMapper.toPersistence(session);
    await this.prisma.session.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
