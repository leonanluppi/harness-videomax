import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { RegisterForm } from "./register-form";

describe("RegisterForm", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("renders_register_form_with_inline_errors: blocks submission on password mismatch without calling the API", async () => {
    render(<RegisterForm />);

    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Camila Rocha" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "camila@studio.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass1234" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Different1" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("shows the failed password rule inline when the backend rejects a weak password", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "weak_password",
          message: "Password does not meet requirements: must be at least 8 characters long.",
          details: { reasons: ["must be at least 8 characters long"] },
        }),
        { status: 422 },
      ),
    );

    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Camila Rocha" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "camila@studio.co" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "abc1" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "abc1" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(await screen.findByText(/must be at least 8 characters long/)).toBeInTheDocument();
  });

  it("shows the duplicate-email message as a form-level error", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "email_already_exists",
          message: "An account with this email already exists — try logging in",
        }),
        { status: 409 },
      ),
    );

    render(<RegisterForm />);
    fireEvent.change(screen.getByLabelText("Full name"), { target: { value: "Camila Rocha" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "existing@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "Pass1234" } });
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Pass1234" } });
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("An account with this email already exists — try logging in"),
    ).toBeInTheDocument();
  });
});
