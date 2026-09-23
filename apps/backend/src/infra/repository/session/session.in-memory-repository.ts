import type { SessionRepository } from "@/domain/session/session.repository";
import type { SessionId } from "@/domain/session/session-id.vo";
import type { Session } from "@/domain/session/session.entity";

/** Named fake for use case tests. No inline stubs. */
export class SessionInMemoryRepository implements SessionRepository {
  private readonly sessionsById = new Map<string, Session>();

  findById(id: SessionId): Promise<Session | null> {
    return Promise.resolve(this.sessionsById.get(id.value) ?? null);
  }

  findByTokenHash(tokenHash: string): Promise<Session | null> {
    for (const session of this.sessionsById.values()) {
      if (session.tokenHash === tokenHash) return Promise.resolve(session);
    }
    return Promise.resolve(null);
  }

  save(session: Session): Promise<void> {
    this.sessionsById.set(session.id, session);
    return Promise.resolve();
  }
}
