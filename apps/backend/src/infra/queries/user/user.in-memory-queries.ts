import type { CurrentUserDto, UserQueries } from "@/domain/user/user.queries";
import type { UserId } from "@/domain/user/user-id.vo";

/** Named fake for use case tests. No inline stubs. */
export class UserInMemoryQueries implements UserQueries {
  private readonly usersById = new Map<string, CurrentUserDto>();

  seed(user: CurrentUserDto): void {
    this.usersById.set(user.id, user);
  }

  getById(id: UserId): Promise<CurrentUserDto | null> {
    return Promise.resolve(this.usersById.get(id.value) ?? null);
  }
}
