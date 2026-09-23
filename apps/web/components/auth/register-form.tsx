"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/form-field";
import { ButtonLinkButton } from "@/components/ui/button-link";
import { registerRequest } from "@/lib/auth-api";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function validatePassword(password: string): string | undefined {
  const failedRules: string[] = [];
  if (password.length < 8) failedRules.push("at least 8 characters");
  if (!/[A-Za-z]/.test(password)) failedRules.push("at least one letter");
  if (!/[0-9]/.test(password)) failedRules.push("at least one number");
  if (failedRules.length === 0) return undefined;
  return `Password must have ${failedRules.join(", ")}.`;
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);

    const nextErrors: FieldErrors = {};
    if (name.trim().length === 0) nextErrors.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = "Enter a valid email address.";
    const passwordError = validatePassword(password);
    if (passwordError) nextErrors.password = passwordError;
    if (confirmPassword !== password) nextErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});

    setSubmitting(true);
    const result = await registerRequest({ name: name.trim(), email: email.trim(), password });
    setSubmitting(false);

    if (!result.ok) {
      if (result.error.code === "email_already_exists") {
        setErrors({ email: result.error.message });
      } else if (result.error.code === "weak_password") {
        setErrors({ password: result.error.message });
      } else {
        setFormError(result.error.message);
      }
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="mb-1 text-[26px] font-semibold tracking-tight">Create your library</h1>
        <p className="text-sm text-vm-muted">Free forever · unlimited videos.</p>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-vm-err bg-vm-err-bg px-3 py-2 text-xs text-vm-ink">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        <FormField
          id="name"
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          autoComplete="name"
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          hint={errors.password ? undefined : "8+ chars · at least one letter and one number"}
          autoComplete="new-password"
        />
        <FormField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <ButtonLinkButton type="submit" size="lg" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </ButtonLinkButton>
      </div>

      <p className="text-center text-xs text-vm-muted">By creating an account you agree to our Terms and Privacy notice.</p>
    </form>
  );
}
