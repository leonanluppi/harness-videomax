import { describe, expect, it } from "vitest";
import {
  buildClearSessionCookie,
  buildSessionCookie,
  parseCookieHeader,
  SESSION_COOKIE_NAME,
} from "./cookies";

describe("cookies", () => {
  it("builds a session cookie with the expected attributes", () => {
    const cookie = buildSessionCookie("abc123", 2592000, { secure: false });

    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=abc123`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("Max-Age=2592000");
    expect(cookie).not.toContain("Secure");
  });

  it("includes Secure outside local development", () => {
    const cookie = buildSessionCookie("abc123", 2592000, { secure: true });

    expect(cookie).toContain("Secure");
  });

  it("builds a clearing cookie with Max-Age=0", () => {
    const cookie = buildClearSessionCookie({ secure: false });

    expect(cookie).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(cookie).toContain("Max-Age=0");
  });

  it("parses a cookie header into a key-value map", () => {
    const parsed = parseCookieHeader("session_token=abc123; other=value%20here");

    expect(parsed).toEqual({ session_token: "abc123", other: "value here" });
  });
});
