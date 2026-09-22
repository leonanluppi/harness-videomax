import { describe, expect, it } from "vitest";
import { NodePasswordHasherGateway } from "./node-password-hasher.gateway";

describe("NodePasswordHasherGateway", () => {
  it("hashes a password and verifies the same plaintext", async () => {
    const hasher = new NodePasswordHasherGateway();

    const hash = await hasher.hash("Pass1234");

    expect(hash).not.toContain("Pass1234");
    await expect(hasher.verify(hash, "Pass1234")).resolves.toBe(true);
    await expect(hasher.verify(hash, "wrong-password")).resolves.toBe(false);
  });

  it("produces a different salt (and hash) for the same plaintext on each call", async () => {
    const hasher = new NodePasswordHasherGateway();

    const first = await hasher.hash("Pass1234");
    const second = await hasher.hash("Pass1234");

    expect(first).not.toBe(second);
  });

  it("rejects malformed hash strings instead of throwing", async () => {
    const hasher = new NodePasswordHasherGateway();

    await expect(hasher.verify("not-a-valid-hash", "Pass1234")).resolves.toBe(false);
  });
});
