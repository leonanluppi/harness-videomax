import { forwardToBackend, mirrorBackendResponse } from "@/lib/auth-api";

export async function POST(request: Request): Promise<Response> {
  const payload: unknown = await request.json().catch(() => null);
  const backendResponse = await forwardToBackend("/api/auth/register", {
    method: "POST",
    body: payload,
    cookie: request.headers.get("cookie"),
  });
  return mirrorBackendResponse(backendResponse);
}
