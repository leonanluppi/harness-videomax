import { Id } from "@/domain/_shared/id.vo";

export class UserId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static generate(): UserId {
    return new UserId(Id.generateValue());
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(value: string): UserId {
    return new UserId(value);
  }
}
