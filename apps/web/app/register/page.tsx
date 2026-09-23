import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";
import { getSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getSession();
  if (session.authenticated) redirect("/app");

  return (
    <AuthShell side="PASSWORD ≥ 8 CHARS · 1 LETTER + 1 NUMBER" topLink={{ label: "Have an account?", href: "/login", cta: "Sign in" }}>
      <RegisterForm />
    </AuthShell>
  );
}
