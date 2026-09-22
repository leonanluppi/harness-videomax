import { AppError, ConflictError, DomainError } from "@/domain/_shared/errors";

export class InvalidEmailError extends DomainError {
  readonly code = "invalid_email";
  readonly status = 422;

  constructor(value: string) {
    super(`Invalid email: "${value}". Expected a valid email address.`);
  }
}

export class InvalidFullNameError extends DomainError {
  readonly code = "invalid_full_name";
  readonly status = 422;

  constructor(value: string) {
    super(`Invalid name: "${value}". Expected 1-120 non-blank characters.`);
  }
}

export class WeakPasswordError extends DomainError {
  readonly code = "weak_password";
  readonly status = 422;

  constructor(reasons: string[]) {
    super(`Password does not meet requirements: ${reasons.join(", ")}.`, { reasons });
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  readonly code = "email_already_exists";
  readonly status = 409;

  constructor(email: string) {
    super("An account with this email already exists — try logging in", { email });
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
