import type { PrismaClient } from "@prisma/client";
import type { UserRepository } from "@/domain/user/user.repository";
import type { UserId } from "@/domain/user/user-id.vo";
import type { User } from "@/domain/user/user.entity";
import { UserMapper } from "./user.mapper";

export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.value } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(normalizedEmail: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async save(user: User): Promise<void> {
    const data = UserMapper.toPersistence(user);
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data,
    });
  }
}
