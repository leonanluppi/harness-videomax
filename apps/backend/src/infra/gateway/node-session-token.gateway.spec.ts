import { describe, expect, it } from "vitest";
import { NodeSessionTokenGateway } from "./node-session-token.gateway";

describe("NodeSessionTokenGateway", () => {
  it("generates distinct, sufficiently long opaque tokens", () => {
    const gateway = new NodeSessionTokenGateway();

    const first = gateway.generateToken();
    const second = gateway.generateToken();

    expect(first).not.toBe(second);
    expect(first.length).toBeGreaterThanOrEqual(32);
  });

  it("hashes a token deterministically", () => {
    const gateway = new NodeSessionTokenGateway();
    const token = gateway.generateToken();

    expect(gateway.hashToken(token)).toBe(gateway.hashToken(token));
    expect(gateway.hashToken(token)).not.toBe(token);
  });

  it("produces a 64-character hex digest matching the sessions.token_hash column", () => {
    const gateway = new NodeSessionTokenGateway();

    const hash = gateway.hashToken(gateway.generateToken());

    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
