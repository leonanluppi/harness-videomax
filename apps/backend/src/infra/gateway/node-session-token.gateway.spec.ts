import { describe, expect, it } from "vitest";
import { NodeSessionTokenGateway } from "./node-session-token.gateway";

describe("NodeSessionTokenGateway", () => {
  it("generates a token whose hash matches hash(token)", () => {
    const gateway = new NodeSessionTokenGateway();

    const { token, tokenHash } = gateway.generate();

    expect(token).toHaveLength(64);
    expect(tokenHash).toBe(gateway.hash(token));
    expect(tokenHash).toHaveLength(64);
  });

  it("generates unique tokens across calls", () => {
    const gateway = new NodeSessionTokenGateway();

    const first = gateway.generate();
    const second = gateway.generate();

    expect(first.token).not.toBe(second.token);
  });
});
