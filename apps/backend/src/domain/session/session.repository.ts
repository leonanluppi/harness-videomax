import type { Session } from "./session.entity";
import type { SessionId } from "./session-id.vo";

export interface SessionRepository {
  findById(id: SessionId): Promise<Session | null>;
  findByTokenHash(tokenHash: string): Promise<Session | null>;
  save(session: Session): Promise<void>;
}
