import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterPage from "./page";

vi.mock("@/lib/session", () => ({
  getSession: vi.fn().mockResolvedValue({ authenticated: false }),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("RegisterPage", () => {
  it("renders_register_form_with_inline_errors", async () => {
    const ui = await RegisterPage();
    render(ui);

    expect(screen.getByLabelText("Full name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirm password")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign in/i })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abc1" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "abc1" } });
    fireEvent.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/enter your full name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
  });
});
