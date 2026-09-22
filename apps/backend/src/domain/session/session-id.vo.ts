import { Id } from "@/domain/_shared/id.vo";

export class SessionId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static generate(): SessionId {
    return new SessionId(Id.generateValue());
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(value: string): SessionId {
    return new SessionId(value);
  }
}
