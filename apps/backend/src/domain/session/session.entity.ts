import { SessionId } from "./session-id.vo";
import { UserId } from "@/domain/user/user-id.vo";

export type CreateSessionProps = {
  userId: UserId;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
};

export type RestoreSessionProps = {
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
    private readonly _userId: UserId,
    private readonly _tokenHash: string,
    private readonly _createdAt: Date,
    private readonly _expiresAt: Date,
    private _revokedAt: Date | null,
  ) {}

  static create(props: CreateSessionProps): Session {
    return new Session(
      SessionId.generate(),
      props.userId,
      props.tokenHash,
      props.createdAt ?? new Date(),
      props.expiresAt,
      null,
    );
  }

  static restore(props: RestoreSessionProps): Session {
    return new Session(
      SessionId.from(props.id),
      UserId.from(props.userId),
      props.tokenHash,
      props.createdAt,
      props.expiresAt,
      props.revokedAt,
    );
  }

  /** Idempotent: revoking an already-revoked session is a no-op. */
  revoke(now: Date = new Date()): void {
    if (this._revokedAt) return;
    this._revokedAt = now;
  }

  isActive(now: Date = new Date()): boolean {
    return this._revokedAt === null && this._expiresAt.getTime() > now.getTime();
  }

  get id(): string {
    return this._id.value;
  }

  get userId(): string {
    return this._userId.value;
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
