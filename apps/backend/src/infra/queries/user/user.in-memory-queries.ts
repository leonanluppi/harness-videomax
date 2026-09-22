import type { CurrentUserView, UserQueries } from "@/domain/user/user.queries";
import type { UserInMemoryRepository } from "@/infra/repository/user/user.in-memory-repository";

export class UserInMemoryQueries implements UserQueries {
  constructor(private readonly repo: UserInMemoryRepository) {}

  async currentUserById(id: string): Promise<CurrentUserView | null> {
    const user = await this.repo.findById(id);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin };
  }
}
