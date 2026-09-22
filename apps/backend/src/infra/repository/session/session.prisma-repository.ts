import type { PrismaClient } from "@prisma/client";
import type { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";
import { SessionMapper } from "./session.mapper";

export class SessionPrismaRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Session | null> {
    const row = await this.prisma.session.findUnique({ where: { id } });
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

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } }).catch(() => undefined);
  }
}
