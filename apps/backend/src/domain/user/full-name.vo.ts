import { z } from "zod";
import { InvalidFullNameError } from "./errors";

const schema = z.string().trim().min(1).max(120);

export class FullName {
  private constructor(readonly value: string) {}

  static create(raw: string): FullName {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new InvalidFullNameError(raw);
    return new FullName(parsed.data);
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(value: string): FullName {
    return new FullName(value);
  }

  equals(other: FullName): boolean {
    return this.value === other.value;
  }
}
