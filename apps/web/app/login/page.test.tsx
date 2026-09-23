import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./page";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn().mockResolvedValue({ authenticated: false }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/lib/auth-api", () => ({
  loginRequest: vi.fn().mockResolvedValue({
    ok: false,
    error: { code: "invalid_credentials", message: "Invalid email or password" },
  }),
}));

describe("LoginPage", () => {
  it("renders_login_form_with_generic_error", async () => {
    const ui = await LoginPage();
    render(ui);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /create one/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    const errors = await screen.findAllByText("Invalid email or password");
    expect(errors.length).toBeGreaterThan(0);
    expect(screen.queryByText(/which field/i)).not.toBeInTheDocument();
  });
});
