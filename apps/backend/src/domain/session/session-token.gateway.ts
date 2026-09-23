export interface SessionTokenGateway {
  /** Generates a new opaque, cryptographically random plaintext token. */
  generateToken(): string;
  /** Deterministically hashes a plaintext token for storage/lookup. */
  hashToken(token: string): string;
}
