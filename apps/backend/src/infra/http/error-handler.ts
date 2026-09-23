import { ZodError } from "zod";
import { AppError } from "@/domain/_shared/errors";
import type { HttpResponse } from "./types";

export function toHttpResponse(error: unknown): HttpResponse {
  if (error instanceof AppError) {
    return { status: error.status, body: { code: error.code, message: error.message } };
  }

  if (error instanceof ZodError) {
    return { status: 400, body: { code: "invalid_input", message: formatZodError(error) } };
  }

  return {
    status: 500,
    body: { code: "internal_error", message: "Internal server error" },
  };
}

function formatZodError(error: ZodError): string {
  const issue = error.issues[0];
  if (!issue) return "Invalid input: request body did not match the expected shape";

  const path = issue.path.length > 0 ? issue.path.join(".") : "(body)";
  return `Invalid input at "${path}": ${issue.message}`;
}
