import type { Session } from "@/domain/session/session.entity";
import type { SessionRepository } from "@/domain/session/session.repository";

export class SessionInMemoryRepository implements SessionRepository {
  private readonly store = new Map<string, Session>();

  findById(id: string): Promise<Session | null> {
    return Promise.resolve(this.store.get(id) ?? null);
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    for (const session of this.store.values()) {
      if (session.tokenHash === tokenHash) return Promise.resolve(session);
    }
    return Promise.resolve(null);
  }

  save(session: Session): Promise<void> {
    this.store.set(session.id, session);
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }
}
