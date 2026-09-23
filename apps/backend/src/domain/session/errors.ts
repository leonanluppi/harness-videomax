import { AppError } from "@/domain/_shared/errors";

export class MissingSessionTokenError extends AppError {
  readonly code = "unauthenticated";
  readonly status = 401;

  constructor() {
    super("No session token was provided");
  }
}

export class InvalidSessionTokenError extends AppError {
  readonly code = "unauthenticated";
  readonly status = 401;

  constructor() {
    super("Session token is invalid or unknown");
  }
}

export class ExpiredSessionError extends AppError {
  readonly code = "unauthenticated";
  readonly status = 401;

  constructor(sessionId: string, expiresAt: Date) {
    super(`Session "${sessionId}" expired at ${expiresAt.toISOString()}`);
  }
}

export class RevokedSessionError extends AppError {
  readonly code = "unauthenticated";
  readonly status = 401;

  constructor(sessionId: string) {
    super(`Session "${sessionId}" was revoked`);
  }
}
