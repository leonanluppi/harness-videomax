import { describe, expect, it } from "vitest";
import { assertValidPlainPassword } from "./hashed-password.vo";
import { WeakPasswordError } from "./errors";

describe("assertValidPlainPassword", () => {
  it("accepts a password with 8+ chars, a letter, and a number", () => {
    expect(() => assertValidPlainPassword("Pass1234")).not.toThrow();
  });

  it("rejects_each_password_rule", () => {
    expect(() => assertValidPlainPassword("abc1")).toThrow(WeakPasswordError);
    expect(() => assertValidPlainPassword("onlyletters")).toThrow(WeakPasswordError);
    expect(() => assertValidPlainPassword("12345678")).toThrow(WeakPasswordError);
  });

  it("names the failed rule in the error message without leaking the password", () => {
    try {
      assertValidPlainPassword("abc1");
      throw new Error("expected assertValidPlainPassword to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WeakPasswordError);
      const message = (error as Error).message;
      expect(message).toContain("at least 8 characters");
      expect(message).not.toContain("abc1");
    }
  });
});
