import type { PrismaClient } from "@prisma/client";
import type { CurrentUserDto, UserQueries } from "@/domain/user/user.queries";
import type { UserId } from "@/domain/user/user-id.vo";

export class UserPrismaQueries implements UserQueries {
  constructor(private readonly prisma: PrismaClient) {}

  async getById(id: UserId): Promise<CurrentUserDto | null> {
    const row = await this.prisma.user.findUnique({ where: { id: id.value } });
    if (!row) return null;
    return { id: row.id, name: row.name, email: row.email, isAdmin: row.isAdmin };
  }
}
