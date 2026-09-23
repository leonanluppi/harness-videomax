import { forwardToBackend, mirrorBackendResponse } from "@/lib/auth-api";

export async function GET(request: Request): Promise<Response> {
  const backendResponse = await forwardToBackend("/api/auth/session", {
    method: "GET",
    cookie: request.headers.get("cookie"),
  });
  return mirrorBackendResponse(backendResponse);
}
