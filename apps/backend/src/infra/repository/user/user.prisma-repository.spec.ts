import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { config } from "@/config/env";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { User } from "@/domain/user/user.entity";
import { UserPrismaRepository } from "./user.prisma-repository";

const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
const repo = new UserPrismaRepository(prisma);

describe("UserPrismaRepository", () => {
  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("saves and finds a user by id and normalized email", async () => {
    const user = await createUser("camila@studio.co");

    await repo.save(user);

    const foundById = await repo.findById(user.id);
    expect(foundById?.email).toBe("camila@studio.co");
    expect(foundById?.name).toBe("Camila Rocha");
    expect(foundById?.status).toBe("active");

    const foundByEmail = await repo.findByEmail("camila@studio.co");
    expect(foundByEmail?.id).toBe(user.id);
  });

  it("returns null for an unknown id or email", async () => {
    await expect(repo.findById("00000000-0000-0000-0000-000000000000")).resolves.toBeNull();
    await expect(repo.findByEmail("missing@studio.co")).resolves.toBeNull();
  });

  it("enforces unique normalized email at the database level", async () => {
    const first = await createUser("dup@studio.co");
    await repo.save(first);

    const duplicate = await createUser("dup@studio.co");
    await expect(repo.save(duplicate)).rejects.toThrow();
  });

  it("upserts on save for an existing id", async () => {
    const user = await createUser("camila@studio.co");
    await repo.save(user);

    user.recordLogin(new Date("2026-03-01T00:00:00.000Z"));
    await repo.save(user);

    const found = await repo.findById(user.id);
    expect(found?.lastLoginAt).toEqual(new Date("2026-03-01T00:00:00.000Z"));
  });

  it("is idempotent on delete for a missing id", async () => {
    await expect(repo.delete("00000000-0000-0000-0000-000000000000")).resolves.toBeUndefined();
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
