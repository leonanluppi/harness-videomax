import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(4000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().url(),
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  webOrigin: z.string().url().default("http://localhost:3000"),
  sessionCookieName: z.string().min(1).default("session_token"),
  sessionTtlDays: z.coerce.number().int().min(1).default(30),
  passwordHashKeyLength: z.coerce.number().int().min(32).default(64),
});

const parsed = schema.safeParse({
  port: process.env["PORT"],
  logLevel: process.env["LOG_LEVEL"],
  databaseUrl: process.env["DATABASE_URL"],
  nodeEnv: process.env["NODE_ENV"],
  webOrigin: process.env["WEB_ORIGIN"],
  sessionCookieName: process.env["SESSION_COOKIE_NAME"],
  sessionTtlDays: process.env["SESSION_TTL_DAYS"],
  passwordHashKeyLength: process.env["PASSWORD_HASH_KEY_LENGTH"],
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten());
  process.exit(1);
}

const data = parsed.data;

export const config = Object.freeze({
  ...data,
  sessionTtlMs: data.sessionTtlDays * 24 * 60 * 60 * 1000,
  /** Cookies must be `Secure` outside local development. */
  sessionCookieSecure: data.nodeEnv !== "development",
});
