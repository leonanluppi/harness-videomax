import { InvalidFullNameError } from "./errors";

const MIN_LENGTH = 1;
const MAX_LENGTH = 120;

export class FullName {
  private constructor(readonly value: string) {}

  static create(raw: string): FullName {
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LENGTH || trimmed.length > MAX_LENGTH) {
      throw new InvalidFullNameError(raw);
    }
    return new FullName(trimmed);
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(value: string): FullName {
    return new FullName(value);
  }

  equals(other: FullName): boolean {
    return this.value === other.value;
  }
}
