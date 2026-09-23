import { z } from "zod";
import { InvalidEmailError } from "./errors";

const schema = z.string().trim().toLowerCase().email();

export class Email {
  private constructor(readonly value: string) {}

  static create(raw: string): Email {
    const parsed = schema.safeParse(raw);
    if (!parsed.success) throw new InvalidEmailError(raw);
    return new Email(parsed.data);
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(value: string): Email {
    return new Email(value);
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
