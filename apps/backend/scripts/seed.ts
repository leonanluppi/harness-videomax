#!/usr/bin/env tsx
/**
 * Seeds the F02 contract's declarative "Persistent state" prerequisites:
 * `existing-user`, `active-session-user`, `revoked-session-user`.
 *
 * spec.md's Assumptions note there is no seed/factory convention yet, so
 * this script establishes one: fixed ids/emails/tokens, idempotent
 * (upsert), safe to re-run against a fresh or already-seeded database.
 *
 * Run with: npm run seed --workspace @videomax/backend
 */
import { PrismaClient } from "@prisma/client";
import { config } from "@/config/env";
import { NodePasswordHasherGateway } from "@/infra/gateway/node-password-hasher.gateway";
import { NodeSessionTokenGateway } from "@/infra/gateway/node-session-token.gateway";

const FIXTURE_PASSWORD = "Pass1234";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const SEED_FIXTURES = {
  existingUser: {
    id: "00000000-0000-0000-0000-000000000001",
    name: "Existing User",
    email: "existing@example.com",
    password: FIXTURE_PASSWORD,
  },
  activeSessionUser: {
    id: "00000000-0000-0000-0000-000000000002",
    name: "Session User",
    email: "session@example.com",
    password: FIXTURE_PASSWORD,
    sessionId: "00000000-0000-0000-0000-0000000000a1",
    sessionToken: "fixture-active-session-token",
  },
  revokedSessionUser: {
    id: "00000000-0000-0000-0000-000000000003",
    name: "Revoked User",
    email: "revoked@example.com",
    password: FIXTURE_PASSWORD,
    sessionId: "00000000-0000-0000-0000-0000000000a2",
    sessionToken: "fixture-revoked-session-token",
  },
} as const;

async function seed(): Promise<void> {
  const prisma = new PrismaClient({ datasources: { db: { url: config.databaseUrl } } });
  const hasher = new NodePasswordHasherGateway();
  const tokenGateway = new NodeSessionTokenGateway();
  const passwordHash = await hasher.hash(FIXTURE_PASSWORD);

  await upsertUser(prisma, SEED_FIXTURES.existingUser, passwordHash);
  await upsertUser(prisma, SEED_FIXTURES.activeSessionUser, passwordHash);
  await upsertUser(prisma, SEED_FIXTURES.revokedSessionUser, passwordHash);

  await prisma.session.upsert({
    where: { id: SEED_FIXTURES.activeSessionUser.sessionId },
    create: {
      id: SEED_FIXTURES.activeSessionUser.sessionId,
      userId: SEED_FIXTURES.activeSessionUser.id,
      tokenHash: tokenGateway.hash(SEED_FIXTURES.activeSessionUser.sessionToken),
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      revokedAt: null,
    },
    update: {
      tokenHash: tokenGateway.hash(SEED_FIXTURES.activeSessionUser.sessionToken),
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      revokedAt: null,
    },
  });

  await prisma.session.upsert({
    where: { id: SEED_FIXTURES.revokedSessionUser.sessionId },
    create: {
      id: SEED_FIXTURES.revokedSessionUser.sessionId,
      userId: SEED_FIXTURES.revokedSessionUser.id,
      tokenHash: tokenGateway.hash(SEED_FIXTURES.revokedSessionUser.sessionToken),
      expiresAt: new Date(Date.now() + THIRTY_DAYS_MS),
      revokedAt: new Date(),
    },
    update: {
      tokenHash: tokenGateway.hash(SEED_FIXTURES.revokedSessionUser.sessionToken),
      revokedAt: new Date(),
    },
  });

  logFixtures();
  await prisma.$disconnect();
}

type SeedUser = { id: string; name: string; email: string };

async function upsertUser(prisma: PrismaClient, user: SeedUser, passwordHash: string): Promise<void> {
  await prisma.user.upsert({
    where: { id: user.id },
    create: { id: user.id, name: user.name, email: user.email, passwordHash, isAdmin: false, status: "active" },
    update: { name: user.name, email: user.email, passwordHash, status: "active" },
  });
}

function logFixtures(): void {
  const { existingUser, activeSessionUser, revokedSessionUser } = SEED_FIXTURES;
  console.log("[seed] F02 contract fixtures ready:");
  console.log(`  existing-user:        ${existingUser.email} / ${existingUser.password}`);
  console.log(
    `  active-session-user:  ${activeSessionUser.email} / ${activeSessionUser.password} — cookie session_token=${activeSessionUser.sessionToken}`,
  );
  console.log(
    `  revoked-session-user: ${revokedSessionUser.email} / ${revokedSessionUser.password} — cookie session_token=${revokedSessionUser.sessionToken} (revoked)`,
  );
}

await seed();
