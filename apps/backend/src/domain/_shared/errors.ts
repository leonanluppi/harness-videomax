export abstract class AppError extends Error {
  abstract readonly code: string;
  abstract readonly status: number;
  readonly details?: unknown;

  constructor(message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.details = details;
  }
}

// Abstract categories — concrete errors per feature extend these.
export abstract class DomainError extends AppError {}
export abstract class NotFoundError extends AppError {}
export abstract class ConflictError extends AppError {}

// Concrete generic errors — instantiated directly by use cases / middleware.
export class UnauthenticatedError extends AppError {
  readonly code = "unauthenticated";
  readonly status = 401;

  constructor(message = "Authentication required") {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  readonly code = "forbidden";
  readonly status = 403;

  constructor(message = "Forbidden") {
    super(message);
  }
}

export class InvalidIdError extends DomainError {
  readonly code = "invalid_id";
  readonly status = 422;

  constructor(value: string) {
    super(`Invalid id: "${value}". Expected a UUID.`);
  }
}

export class UnexpectedAppError extends AppError {
  readonly code = "unexpected";
  readonly status = 500;

  constructor(message: string) {
    super(message);
  }
}
