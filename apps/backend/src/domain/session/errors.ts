import { ConflictError } from "@/domain/_shared/errors";

export class SessionAlreadyRevokedError extends ConflictError {
  readonly code = "session_already_revoked";
  readonly status = 409;

  constructor(id: string) {
    super(`Session already revoked: "${id}"`);
  }
}
