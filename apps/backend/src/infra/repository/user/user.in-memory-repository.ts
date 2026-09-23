import type { UserRepository } from "@/domain/user/user.repository";
import type { UserId } from "@/domain/user/user-id.vo";
import type { User } from "@/domain/user/user.entity";

/** Named fake for use case tests. No inline stubs. */
export class UserInMemoryRepository implements UserRepository {
  private readonly usersById = new Map<string, User>();

  findById(id: UserId): Promise<User | null> {
    return Promise.resolve(this.usersById.get(id.value) ?? null);
  }

  findByEmail(normalizedEmail: string): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.email === normalizedEmail) return Promise.resolve(user);
    }
    return Promise.resolve(null);
  }

  save(user: User): Promise<void> {
    this.usersById.set(user.id, user);
    return Promise.resolve();
  }
}
