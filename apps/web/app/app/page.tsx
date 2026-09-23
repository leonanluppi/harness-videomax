import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";

/**
 * Temporary authenticated shell. F04 replaces this with the real video library;
 * F02 only needs a valid, protected redirect destination.
 */
export default async function AppPage() {
  const session = await getSession();
  if (!session.authenticated) redirect("/login");

  return (
    <main className="min-h-screen bg-vm-paper px-6 py-16 text-vm-ink">
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.08em] text-vm-accent">videomax</p>
            <h1 className="text-3xl font-semibold tracking-tight">Welcome, {session.user.name}</h1>
          </div>
          <LogoutButton />
        </div>
        <p className="text-sm text-vm-muted">
          Your library is on its way. This placeholder confirms you are signed in as {session.user.email}.
        </p>
      </div>
    </main>
  );
}
