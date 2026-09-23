import { beforeEach, describe, expect, it, vi } from "vitest";
import { getSession } from "./session";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({ toString: () => "session_token=abc" }),
}));

describe("getSession", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  it("resolves authenticated state through the backend proxy", async () => {
    const user = { id: "1", name: "Camila Rocha", email: "camila@studio.co", isAdmin: false };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ authenticated: true, user }),
    } as Response);

    await expect(getSession()).resolves.toEqual({ authenticated: true, user });
  });

  it("resolves anonymous state when the backend reports no session", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ authenticated: false }),
    } as Response);

    await expect(getSession()).resolves.toEqual({ authenticated: false });
  });

  it("resolves anonymous state when the backend call itself fails", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response);

    await expect(getSession()).resolves.toEqual({ authenticated: false });
  });
});
