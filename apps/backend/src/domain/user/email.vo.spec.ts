import { describe, expect, it } from "vitest";
import { Email } from "./email.vo";
import { InvalidEmailError } from "./errors";

describe("Email", () => {
  it("normalizes_valid_email_to_lowercase", () => {
    const email = Email.create("Camila@Studio.co");

    expect(email.value).toBe("camila@studio.co");
    expect(email.equals(Email.create("camila@studio.co"))).toBe(true);
  });

  it("rejects_invalid_email_with_offending_value", () => {
    expect(() => Email.create("not-an-email")).toThrow(InvalidEmailError);
    try {
      Email.create("not-an-email");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidEmailError);
      expect((error as InvalidEmailError).message).toContain("not-an-email");
      expect((error as InvalidEmailError).message).toContain("valid email address");
    }
  });
});
