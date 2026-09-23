import type { HttpRequest } from "./types";

export type CookieConfig = {
  name: string;
  maxAgeSeconds: number;
  secure: boolean;
};

export function buildSessionCookie(config: CookieConfig, token: string): string {
  return serializeCookie(config, `${config.name}=${token}`, `Max-Age=${config.maxAgeSeconds}`);
}

export function buildClearSessionCookie(config: CookieConfig): string {
  return serializeCookie(config, `${config.name}=`, "Max-Age=0");
}

function serializeCookie(config: CookieConfig, nameValue: string, maxAge: string): string {
  const attributes = [nameValue, "HttpOnly", "SameSite=Lax", "Path=/", maxAge];
  if (config.secure) attributes.push("Secure");
  return attributes.join("; ");
}

/** Reads a single cookie value from the request's `Cookie` header. */
export function readCookie(req: HttpRequest, name: string): string | undefined {
  const header = req.headers["cookie"];
  const raw = Array.isArray(header) ? header.join("; ") : header;
  if (!raw) return undefined;

  for (const pair of raw.split(";")) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = pair.slice(0, separatorIndex).trim();
    if (key !== name) continue;
    return decodeURIComponent(pair.slice(separatorIndex + 1).trim());
  }
  return undefined;
}
