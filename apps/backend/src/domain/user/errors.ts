import { AppError } from "@/domain/_shared/errors";

export class InvalidEmailError extends AppError {
  readonly code = "invalid_input";
  readonly status = 400;

  constructor(value: string) {
    super(`Invalid email "${value}": expected a valid email address (e.g. name@example.com)`);
  }
}

export class InvalidFullNameError extends AppError {
  readonly code = "invalid_input";
  readonly status = 400;

  constructor(value: string) {
    super(`Invalid name "${value}": expected 1-120 non-blank characters`);
  }
}

/**
 * The offending plaintext password is never interpolated into the message (security).
 * Its length stands in as the non-sensitive "offending value" required by project
 * error-message conventions.
 */
export class WeakPasswordError extends AppError {
  readonly code = "weak_password";
  readonly status = 422;

  constructor(offendingLength: number, failedRules: string[]) {
    super(
      `Password does not meet requirements (length=${offendingLength}): expected at least 8 characters, ` +
        `at least one letter, and at least one number. Failed rules: ${failedRules.join(", ")}`,
    );
  }
}

export class EmailAlreadyExistsError extends AppError {
  readonly code = "email_already_exists";
  readonly status = 409;

  constructor(readonly email: string) {
    super("An account with this email already exists — try logging in");
  }
}

export class InvalidCredentialsError extends AppError {
  readonly code = "invalid_credentials";
  readonly status = 401;

  constructor() {
    super("Invalid email or password");
  }
}

export class AccountSuspendedError extends AppError {
  readonly code = "account_suspended";
  readonly status = 403;

  constructor() {
    super("This account has been suspended");
  }
}
