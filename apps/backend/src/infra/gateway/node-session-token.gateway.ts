import { createHash, randomBytes } from "node:crypto";
import type {
  GeneratedSessionToken,
  SessionTokenGateway,
} from "@/domain/session/session-token.gateway";

const TOKEN_BYTES = 32;

export class NodeSessionTokenGateway implements SessionTokenGateway {
  generate(): GeneratedSessionToken {
    const token = randomBytes(TOKEN_BYTES).toString("hex");
    return { token, tokenHash: this.hash(token) };
  }

  hash(token: string): string {
    return createHash("sha256").update(token).digest("hex");
  }
}
