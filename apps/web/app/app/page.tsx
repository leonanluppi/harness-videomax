import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AppPage() {
  const session = await getSession();
  if (!session.authenticated) redirect("/login");

  return (
    <main className="flex min-h-screen flex-col bg-vm-paper text-vm-ink">
      <header className="flex items-center justify-between border-b border-vm-line px-6 py-4">
        <span className="text-lg font-semibold tracking-tight">
          videomax<span className="text-vm-accent">.</span>
        </span>
        <LogoutButton />
      </header>
      <section className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
        <p className="font-mono text-xs tracking-[0.08em] text-vm-accent uppercase">
          Signed in as {session.user.email}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Your library is on its way.</h1>
        <p className="text-sm text-vm-muted">
          This placeholder will become the video library in a future release.
        </p>
      </section>
    </main>
  );
}
