import type { PrismaClient } from "@prisma/client";
import type { CurrentUserView, UserQueries } from "@/domain/user/user.queries";

export class UserPrismaQueries implements UserQueries {
  constructor(private readonly prisma: PrismaClient) {}

  async currentUserById(id: string): Promise<CurrentUserView | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, isAdmin: true },
    });
    return row ?? null;
  }
}
