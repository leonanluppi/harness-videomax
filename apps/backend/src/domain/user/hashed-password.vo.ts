import type { PasswordHasherGateway } from "./password-hasher.gateway";
import { WeakPasswordError } from "./errors";

const MIN_LENGTH = 8;

/**
 * Wraps an already-hashed password string. The plaintext never survives
 * past `create` — callers cannot construct this VO from raw input
 * without going through the password-strength rule and the hasher gateway.
 */
export class HashedPassword {
  private constructor(readonly value: string) {}

  static create(plaintext: string, hasher: PasswordHasherGateway): Promise<HashedPassword> {
    const violations = collectRuleViolations(plaintext);
    if (violations.length > 0) throw new WeakPasswordError(violations);

    return hasher.hash(plaintext).then((hash) => new HashedPassword(hash));
  }

  /** Skips validation. Only for rehydration from a trusted source (DB). */
  static fromTrusted(hash: string): HashedPassword {
    return new HashedPassword(hash);
  }

  verify(plaintext: string, hasher: PasswordHasherGateway): Promise<boolean> {
    return hasher.verify(this.value, plaintext);
  }
}

function collectRuleViolations(plaintext: string): string[] {
  const violations: string[] = [];
  if (plaintext.length < MIN_LENGTH) {
    violations.push(`must be at least ${MIN_LENGTH} characters long`);
  }
  if (!/[a-zA-Z]/.test(plaintext)) {
    violations.push("must contain at least one letter");
  }
  if (!/[0-9]/.test(plaintext)) {
    violations.push("must contain at least one number");
  }
  return violations;
}
