import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session.authenticated) redirect("/app");

  return (
    <AuthShell side="SECURE COOKIE · 30 DAY SESSION">
      <div className="mb-6 text-right text-xs text-vm-muted">
        No account?{" "}
        <Link href="/register" className="font-medium text-vm-accent">
          Create one →
        </Link>
      </div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="mb-6 text-sm text-vm-muted">Sign in to open your library.</p>
      <LoginForm />
    </AuthShell>
  );
}
