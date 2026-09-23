import { Id } from "@/domain/_shared/id.vo";

export class UserId extends Id {
  private constructor(value: string) {
    super(value);
  }

  static generate(): UserId {
    return new UserId(Id.generateValue());
  }

  /** Rehydrates a UserId from a trusted, already-persisted value. */
  static from(value: string): UserId {
    return new UserId(value);
  }
}
