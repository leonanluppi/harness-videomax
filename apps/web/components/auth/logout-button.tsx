"use client";

import { useState } from "react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout(): Promise<void> {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="h-9 rounded-md border border-vm-line-strong bg-vm-surface px-3 text-sm font-medium text-vm-ink-2 transition-colors hover:text-vm-ink disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
