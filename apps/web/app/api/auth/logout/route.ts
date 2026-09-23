import { forwardToBackend, mirrorBackendResponse } from "@/lib/auth-api";

export async function POST(request: Request): Promise<Response> {
  const backendResponse = await forwardToBackend("/api/auth/logout", {
    method: "POST",
    cookie: request.headers.get("cookie"),
  });
  return mirrorBackendResponse(backendResponse);
}
