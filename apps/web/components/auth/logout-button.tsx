"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLinkButton } from "@/components/ui/button-link";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <ButtonLinkButton variant="outline" size="md" disabled={loading} onClick={() => void handleLogout()}>
      {loading ? "Signing out…" : "Log out"}
    </ButtonLinkButton>
  );
}
