import { WeakPasswordError } from "./errors";

const MIN_LENGTH = 8;

/**
 * Validates plaintext password strength rules (PRD: 8+ chars, at least one
 * letter, at least one number) before a caller hashes it. Lives beside
 * HashedPassword because both concepts describe the same domain rule set —
 * this project's component boundaries do not carve out a separate plaintext VO.
 */
export function assertValidPlainPassword(plainPassword: string): void {
  const failedRules: string[] = [];
  if (plainPassword.length < MIN_LENGTH) failedRules.push(`at least ${MIN_LENGTH} characters`);
  if (!/[A-Za-z]/.test(plainPassword)) failedRules.push("at least one letter");
  if (!/[0-9]/.test(plainPassword)) failedRules.push("at least one number");
  if (failedRules.length > 0) throw new WeakPasswordError(plainPassword.length, failedRules);
}

/** Wraps an already-hashed password string. Never accepts or exposes plaintext. */
export class HashedPassword {
  private constructor(readonly value: string) {}

  static create(hash: string): HashedPassword {
    if (!hash) throw new Error("HashedPassword requires a non-empty hash string");
    return new HashedPassword(hash);
  }

  /** Rehydrates a trusted hash already persisted in the database. */
  static restore(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  toJSON(): never {
    throw new Error("Do not serialize HashedPassword. It must never leave the domain/infra boundary.");
  }
}
