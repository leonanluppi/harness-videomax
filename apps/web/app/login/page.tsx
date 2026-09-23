import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getSession();
  if (session.authenticated) redirect("/app");

  return (
    <AuthShell side="SECURE COOKIE · 30 DAY SESSION" topLink={{ label: "No account?", href: "/register", cta: "Create one" }}>
      <LoginForm />
    </AuthShell>
  );
}
