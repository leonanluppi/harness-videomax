import type { User } from "./user.entity";
import type { UserId } from "./user-id.vo";

export interface UserRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(normalizedEmail: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
