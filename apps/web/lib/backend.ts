const DEFAULT_BACKEND_URL = "http://localhost:4000";

/** Centralizes the backend origin lookup for proxy routes and server helpers. */
export function getBackendUrl(): string {
  return process.env["BACKEND_INTERNAL_URL"] ?? DEFAULT_BACKEND_URL;
}

export async function getHelloMessage(): Promise<string> {
  const response = await fetch(`${getBackendUrl()}/api/hello`, { cache: "no-store" });

  if (!response.ok) return "Backend is not ready";
  const body = (await response.json()) as { message?: unknown };
  return typeof body.message === "string" ? body.message : "Unexpected backend response";
}
