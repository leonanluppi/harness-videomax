import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  port: z.coerce.number().int().min(1).max(65535).default(4000),
  logLevel: z.enum(["debug", "info", "warn", "error"]).default("info"),
  databaseUrl: z.string().url(),
  nodeEnv: z.enum(["development", "test", "production"]).default("development"),
  sessionCookieName: z.string().min(1).default("session_token"),
  sessionTtlDays: z.coerce.number().int().positive().default(30),
});

const parsed = schema.safeParse({
  port: process.env["PORT"],
  logLevel: process.env["LOG_LEVEL"],
  databaseUrl: process.env["DATABASE_URL"],
  nodeEnv: process.env["NODE_ENV"],
  sessionCookieName: process.env["SESSION_COOKIE_NAME"],
  sessionTtlDays: process.env["SESSION_TTL_DAYS"],
});

if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten());
  process.exit(1);
}

export const config = Object.freeze(parsed.data);
