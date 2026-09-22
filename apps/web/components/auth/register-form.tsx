"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import type { ApiErrorBody } from "@/lib/auth-api";

type FieldErrors = Partial<Record<"password" | "confirmPassword" | "form", string>>;

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setErrors({});
    setSubmitting(true);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      window.location.assign("/app");
      return;
    }

    setSubmitting(false);
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    setErrors(toFieldErrors(body));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <FormField id="name" name="name" label="Full name" value={name} onChange={setName} required autoComplete="name" />
      <FormField
        id="email"
        name="email"
        label="Email"
        type="email"
        value={email}
        onChange={setEmail}
        required
        autoComplete="email"
      />
      <FormField
        id="password"
        name="password"
        label="Password"
        type="password"
        value={password}
        onChange={setPassword}
        required
        autoComplete="new-password"
        hint="8+ characters, at least one letter and one number"
        error={errors.password}
      />
      <FormField
        id="confirmPassword"
        name="confirmPassword"
        label="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        required
        autoComplete="new-password"
        error={errors.confirmPassword}
      />
      {errors.form && (
        <p role="alert" className="text-sm text-vm-err">
          {errors.form}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-vm-accent text-sm font-medium text-white transition-colors hover:bg-vm-accent-hi disabled:opacity-60"
      >
        {submitting ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

function toFieldErrors(body: ApiErrorBody | null): FieldErrors {
  if (!body) return { form: "Something went wrong. Please try again." };

  if (body.code === "weak_password") {
    const reasons = extractReasons(body.details);
    return { password: reasons.length > 0 ? `Password ${reasons.join(", ")}.` : body.message };
  }

  return { form: body.message || "Something went wrong. Please try again." };
}

function extractReasons(details: unknown): string[] {
  if (!details || typeof details !== "object" || !("reasons" in details)) return [];
  const reasons = (details as { reasons: unknown }).reasons;
  return Array.isArray(reasons) ? reasons.filter((reason): reason is string => typeof reason === "string") : [];
}
