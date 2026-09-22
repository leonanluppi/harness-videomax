import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegisterForm } from "@/components/auth/register-form";

export default async function RegisterPage() {
  const session = await getSession();
  if (session.authenticated) redirect("/app");

  return (
    <AuthShell side="PASSWORD ≥ 8 CHARS · 1 LETTER + 1 NUMBER">
      <div className="mb-6 text-right text-xs text-vm-muted">
        Have an account?{" "}
        <Link href="/login" className="font-medium text-vm-accent">
          Sign in →
        </Link>
      </div>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Create your library</h1>
      <p className="mb-6 text-sm text-vm-muted">Free forever · unlimited videos.</p>
      <RegisterForm />
      <p className="mt-4 text-center text-xs text-vm-muted">
        By creating an account you agree to our Terms and Privacy notice.
      </p>
    </AuthShell>
  );
}
