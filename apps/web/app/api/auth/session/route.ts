import { proxyToBackend } from "@/lib/auth-api";

export async function GET(request: Request): Promise<Response> {
  const cookie = request.headers.get("cookie");
  const result = await proxyToBackend("/api/auth/session", { method: "GET", cookie });

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "content-type": "application/json" },
  });
}
