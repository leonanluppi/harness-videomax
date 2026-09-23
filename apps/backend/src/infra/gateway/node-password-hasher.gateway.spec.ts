import { describe, expect, it } from "vitest";
import { NodeScryptPasswordHasherGateway } from "./node-password-hasher.gateway";

describe("NodeScryptPasswordHasherGateway", () => {
  it("verifies a matching password and rejects a wrong one", async () => {
    const gateway = new NodeScryptPasswordHasherGateway();
    const hash = await gateway.hash("Pass1234");

    await expect(gateway.verify("Pass1234", hash)).resolves.toBe(true);
    await expect(gateway.verify("wrong-password", hash)).resolves.toBe(false);
  });

  it("never stores the plaintext password in the hash", async () => {
    const gateway = new NodeScryptPasswordHasherGateway();
    const hash = await gateway.hash("Pass1234");

    expect(hash).not.toContain("Pass1234");
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it("uses a random salt so two hashes of the same password differ", async () => {
    const gateway = new NodeScryptPasswordHasherGateway();

    const [first, second] = await Promise.all([gateway.hash("Pass1234"), gateway.hash("Pass1234")]);

    expect(first).not.toBe(second);
  });

  it("rejects a malformed stored hash instead of throwing", async () => {
    const gateway = new NodeScryptPasswordHasherGateway();

    await expect(gateway.verify("Pass1234", "not-a-valid-hash")).resolves.toBe(false);
  });
});
