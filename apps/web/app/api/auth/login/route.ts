import { proxyToBackend } from "@/lib/auth-api";

export async function POST(request: Request): Promise<Response> {
  const payload: unknown = await request.json().catch(() => null);
  const result = await proxyToBackend("/api/auth/login", { method: "POST", body: payload });

  const response = new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "content-type": "application/json" },
  });
  if (result.setCookie) response.headers.append("set-cookie", result.setCookie);
  return response;
}
