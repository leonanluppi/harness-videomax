import { UserId } from "./user-id.vo";
import { Email } from "./email.vo";
import { FullName } from "./full-name.vo";
import { HashedPassword } from "./hashed-password.vo";
import type { PasswordHasherGateway } from "./password-hasher.gateway";

export type UserStatus = "active" | "suspended";

type CreateProps = {
  name: string;
  email: string;
  hashedPassword: HashedPassword;
};

type RestoreProps = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  isAdmin: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

export class User {
  private constructor(
    private readonly _id: UserId,
    private _name: FullName,
    private _email: Email,
    private _passwordHash: HashedPassword,
    private readonly _isAdmin: boolean,
    private _status: UserStatus,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _lastLoginAt: Date | null,
  ) {}

  static create(props: CreateProps): User {
    const now = new Date();
    return new User(
      UserId.generate(),
      FullName.create(props.name),
      Email.create(props.email),
      props.hashedPassword,
      false,
      "active",
      now,
      now,
      null,
    );
  }

  static restore(props: RestoreProps): User {
    return new User(
      UserId.fromTrusted(props.id),
      FullName.fromTrusted(props.name),
      Email.fromTrusted(props.email),
      HashedPassword.fromTrusted(props.passwordHash),
      props.isAdmin,
      props.status,
      props.createdAt,
      props.updatedAt,
      props.lastLoginAt,
    );
  }

  verifyPassword(plaintext: string, hasher: PasswordHasherGateway): Promise<boolean> {
    return this._passwordHash.verify(plaintext, hasher);
  }

  recordLogin(now: Date): void {
    this._lastLoginAt = now;
    this._updatedAt = now;
  }

  isActive(): boolean {
    return this._status === "active";
  }

  get id(): string {
    return this._id.value;
  }

  get name(): string {
    return this._name.value;
  }

  get email(): string {
    return this._email.value;
  }

  get passwordHash(): string {
    return this._passwordHash.value;
  }

  get isAdmin(): boolean {
    return this._isAdmin;
  }

  get status(): UserStatus {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get lastLoginAt(): Date | null {
    return this._lastLoginAt;
  }

  toJSON(): never {
    throw new Error("Do not serialize User directly. Use toOutput() in the use case DTO.");
  }
}
