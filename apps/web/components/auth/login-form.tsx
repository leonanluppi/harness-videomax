"use client";

import { useState, type FormEvent } from "react";
import { FormField } from "@/components/ui/form-field";
import type { ApiErrorBody } from "@/lib/auth-api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(undefined);
    setSubmitting(true);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      window.location.assign("/app");
      return;
    }

    setSubmitting(false);
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    setFormError(body?.message || "Something went wrong. Please try again.");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
        autoComplete="current-password"
      />
      {formError && (
        <p role="alert" className="text-sm text-vm-err">
          {formError}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="mt-2 h-11 rounded-md bg-vm-accent text-sm font-medium text-white transition-colors hover:bg-vm-accent-hi disabled:opacity-60"
      >
        {submitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
