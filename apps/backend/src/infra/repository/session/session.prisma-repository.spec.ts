import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { config } from "@/config/env";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { User } from "@/domain/user/user.entity";
import { Session } from "@/domain/session/session.entity";
import { UserPrismaRepository } from "@/infra/repository/user/user.prisma-repository";
import { SessionPrismaRepository } from "./session.prisma-repository";

const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
const userRepo = new UserPrismaRepository(prisma);
const sessionRepo = new SessionPrismaRepository(prisma);

describe("SessionPrismaRepository", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves and finds a session by id and token hash", async () => {
    const user = await createUser("camila@studio.co");
    await userRepo.save(user);
    const session = Session.create({
      userId: user.id,
      tokenHash: "a".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });

    await sessionRepo.save(session);

    const foundById = await sessionRepo.findById(session.id);
    expect(foundById?.userId).toBe(user.id);

    const foundByHash = await sessionRepo.findByTokenHash("a".repeat(64));
    expect(foundByHash?.id).toBe(session.id);
  });

  it("returns null for an unknown token hash", async () => {
    await expect(sessionRepo.findByTokenHash("b".repeat(64))).resolves.toBeNull();
  });

  it("persists revocation", async () => {
    const user = await createUser("camila@studio.co");
    await userRepo.save(user);
    const session = Session.create({
      userId: user.id,
      tokenHash: "c".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);

    session.revoke(new Date());
    await sessionRepo.save(session);

    const found = await sessionRepo.findByTokenHash("c".repeat(64));
    expect(found?.revokedAt).not.toBeNull();
    expect(found?.isActive(new Date())).toBe(false);
  });

  it("cascades delete when the owning user is removed", async () => {
    const user = await createUser("camila@studio.co");
    await userRepo.save(user);
    const session = Session.create({
      userId: user.id,
      tokenHash: "d".repeat(64),
      expiresAt: new Date(Date.now() + 60_000),
    });
    await sessionRepo.save(session);

    await prisma.user.delete({ where: { id: user.id } });

    await expect(sessionRepo.findById(session.id)).resolves.toBeNull();
  });

  it("is idempotent on delete for a missing id", async () => {
    await expect(sessionRepo.delete("00000000-0000-0000-0000-000000000000")).resolves.toBeUndefined();
  });
});

async function createUser(email: string): Promise<User> {
  const hashedPassword = await HashedPassword.create("Pass1234", new FakePasswordHasherGateway());
  return User.create({ name: "Camila Rocha", email, hashedPassword });
}

class FakePasswordHasherGateway implements PasswordHasherGateway {
  hash(plaintext: string): Promise<string> {
    return Promise.resolve(`fake-hash:${plaintext}`);
  }

  verify(hash: string, plaintext: string): Promise<boolean> {
    return Promise.resolve(hash === `fake-hash:${plaintext}`);
  }
}
