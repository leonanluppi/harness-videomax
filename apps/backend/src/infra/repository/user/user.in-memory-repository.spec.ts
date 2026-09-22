import { describe, expect, it } from "vitest";
import { HashedPassword } from "@/domain/user/hashed-password.vo";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";
import { User } from "@/domain/user/user.entity";
import { UserInMemoryRepository } from "./user.in-memory-repository";
import { UserInMemoryQueries } from "@/infra/queries/user/user.in-memory-queries";

describe("UserInMemoryRepository", () => {
  it("saves and finds a user by id and normalized email", async () => {
    const repo = new UserInMemoryRepository();
    const user = await createUser("camila@studio.co");

    await repo.save(user);

    await expect(repo.findById(user.id)).resolves.toBe(user);
    await expect(repo.findByEmail("camila@studio.co")).resolves.toBe(user);
    await expect(repo.findByEmail("missing@studio.co")).resolves.toBeNull();
  });

  it("is idempotent on delete for a missing id", async () => {
    const repo = new UserInMemoryRepository();

    await expect(repo.delete("missing-id")).resolves.toBeUndefined();
  });
});

describe("UserInMemoryQueries", () => {
  it("returns a current-user projection backed by the same store", async () => {
    const repo = new UserInMemoryRepository();
    const queries = new UserInMemoryQueries(repo);
    const user = await createUser("camila@studio.co");
    await repo.save(user);

    await expect(queries.currentUserById(user.id)).resolves.toEqual({
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: false,
    });
    await expect(queries.currentUserById("missing-id")).resolves.toBeNull();
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
