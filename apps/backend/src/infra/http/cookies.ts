export const SESSION_COOKIE_NAME = "session_token";

export type SessionCookieConfig = {
  secure: boolean;
};

export function buildSessionCookie(
  token: string,
  maxAgeSeconds: number,
  config: SessionCookieConfig,
): string {
  return serializeCookie(token, [`Max-Age=${maxAgeSeconds}`], config);
}

export function buildClearSessionCookie(config: SessionCookieConfig): string {
  return serializeCookie("", ["Max-Age=0"], config);
}

/** Reads the session cookie value out of a raw HTTP `Cookie` header (possibly duplicated across proxies). */
export function readSessionToken(cookieHeader: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(cookieHeader) ? cookieHeader[0] : cookieHeader;
  return raw ? parseCookieHeader(raw)[SESSION_COOKIE_NAME] : undefined;
}

export function parseCookieHeader(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const separatorIndex = part.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = part.slice(0, separatorIndex).trim();
    const value = part.slice(separatorIndex + 1).trim();
    if (key) result[key] = safeDecode(value);
  }
  return result;
}

function serializeCookie(value: string, ageAttribute: string[], config: SessionCookieConfig): string {
  const attributes = [
    `${SESSION_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "SameSite=Lax",
    "Path=/",
    ...ageAttribute,
  ];
  if (config.secure) attributes.push("Secure");
  return attributes.join("; ");
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
