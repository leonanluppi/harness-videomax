import { ZodError } from "zod";
import { AppError } from "@/domain/_shared/errors";
import type { HttpResponse } from "./types";

export function toHttpResponse(error: unknown): HttpResponse {
  if (error instanceof AppError) {
    return {
      status: error.status,
      body: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        code: "invalid_input",
        message: `Invalid request body: ${describeZodIssues(error)}`,
        details: error.issues,
      },
    };
  }

  console.error("Unexpected error:", error);
  return {
    status: 500,
    body: { code: "internal_error", message: "Internal server error" },
  };
}

function describeZodIssues(error: ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path} — received invalid value, expected ${issue.message}`;
    })
    .join("; ");
}
