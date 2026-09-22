import { proxyToBackend } from "@/lib/auth-api";

export async function POST(request: Request): Promise<Response> {
  const cookie = request.headers.get("cookie");
  const result = await proxyToBackend("/api/auth/logout", { method: "POST", cookie });

  const response = new Response(null, { status: result.status });
  if (result.setCookie) response.headers.set("set-cookie", result.setCookie);
  return response;
}
