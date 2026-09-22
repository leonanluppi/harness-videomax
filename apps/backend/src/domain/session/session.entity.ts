import { SessionId } from "./session-id.vo";
import { SessionAlreadyRevokedError } from "./errors";

type CreateProps = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

type RestoreProps = {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
};

export class Session {
  private constructor(
    private readonly _id: SessionId,
    private readonly _userId: string,
    private readonly _tokenHash: string,
    private readonly _createdAt: Date,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | null,
  ) {}

  static create(props: CreateProps): Session {
    return new Session(
      SessionId.generate(),
      props.userId,
      props.tokenHash,
      new Date(),
      props.expiresAt,
      null,
    );
  }

  static restore(props: RestoreProps): Session {
    return new Session(
      SessionId.fromTrusted(props.id),
      props.userId,
      props.tokenHash,
      props.createdAt,
      props.expiresAt,
      props.revokedAt,
    );
  }

  revoke(now: Date): void {
    if (this._revokedAt) throw new SessionAlreadyRevokedError(this._id.value);
    this._revokedAt = now;
  }

  isActive(now: Date): boolean {
    return this._revokedAt === null && this._expiresAt.getTime() > now.getTime();
  }

  get id(): string {
    return this._id.value;
  }

  get userId(): string {
    return this._userId;
  }

  get tokenHash(): string {
    return this._tokenHash;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get revokedAt(): Date | null {
    return this._revokedAt;
  }

  toJSON(): never {
    throw new Error("Do not serialize Session directly. Use toOutput() in the use case DTO.");
  }
}
