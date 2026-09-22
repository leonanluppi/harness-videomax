import { describe, expect, it } from "vitest";
import { Session } from "@/domain/session/session.entity";
import { SessionInMemoryRepository } from "./session.in-memory-repository";

describe("SessionInMemoryRepository", () => {
  it("saves and finds a session by id and token hash", async () => {
    const repo = new SessionInMemoryRepository();
    const session = Session.create({
      userId: "user-1",
      tokenHash: "a".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await repo.save(session);

    await expect(repo.findById(session.id)).resolves.toBe(session);
    await expect(repo.findByTokenHash("a".repeat(64))).resolves.toBe(session);
    await expect(repo.findByTokenHash("b".repeat(64))).resolves.toBeNull();
  });

  it("is idempotent on delete for a missing id", async () => {
    const repo = new SessionInMemoryRepository();

    await expect(repo.delete("missing-id")).resolves.toBeUndefined();
  });
});
