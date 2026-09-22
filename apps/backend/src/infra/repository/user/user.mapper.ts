import type { User as PrismaUser } from "@prisma/client";
import { User, type UserStatus } from "@/domain/user/user.entity";

export class UserMapper {
  static toDomain(row: PrismaUser): User {
    return User.restore({
      id: row.id,
      name: row.name,
      email: row.email,
      passwordHash: row.passwordHash,
      isAdmin: row.isAdmin,
      status: row.status as UserStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastLoginAt: row.lastLoginAt,
    });
  }

  static toPersistence(user: User): Omit<PrismaUser, "createdAt" | "updatedAt"> {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      isAdmin: user.isAdmin,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
