import { Id } from "@/domain/_shared/id.vo";

export class SessionId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static generate(): SessionId {
    return new SessionId(Id.generateValue());
  }

  /** Rehydrates a SessionId from a trusted, already-persisted value. */
  static from(value: string): SessionId {
    return new SessionId(value);
  }
}
