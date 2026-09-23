import { createHash, randomBytes } from "node:crypto";
import type { SessionTokenGateway } from "@/domain/session/session-token.gateway";

const TOKEN_BYTES = 32;

export class NodeSessionTokenGateway implements SessionTokenGateway {
  generateToken(): string {
    return randomBytes(TOKEN_BYTES).toString("hex");
  }

  hashToken(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
