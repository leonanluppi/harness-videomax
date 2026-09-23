"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/ui/form-field";
import { ButtonLinkButton } from "@/components/ui/button-link";
import { loginRequest } from "@/lib/auth-api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(undefined);
    setSubmitting(true);

    const result = await loginRequest({ email: email.trim(), password });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h1 className="mb-1 text-[26px] font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-vm-muted">Sign in to open your library.</p>
      </div>

      {formError && (
        <p role="alert" className="rounded-md border border-vm-err bg-vm-err-bg px-3 py-2 text-xs text-vm-ink">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-3.5">
        <FormField
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />
        <ButtonLinkButton type="submit" size="lg" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </ButtonLinkButton>
      </div>
    </form>
  );
}
