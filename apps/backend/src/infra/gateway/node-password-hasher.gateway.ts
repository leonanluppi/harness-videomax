import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";

const SALT_BYTES = 16;
const KEY_LENGTH = 64;
const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };

/**
 * scrypt-based password hasher. Hash format: "scrypt$N$r$p$saltHex$hashHex"
 * so verification can reproduce the exact derivation parameters.
 */
export class NodePasswordHasherGateway implements PasswordHasherGateway {
  async hash(plaintext: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES);
    const derivedKey = await deriveKey(plaintext, salt);
    const { N, r, p } = SCRYPT_PARAMS;
    return `scrypt$${N}$${r}$${p}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
  }

  async verify(hash: string, plaintext: string): Promise<boolean> {
    const parsed = parseHash(hash);
    if (!parsed) return false;

    const derivedKey = await deriveKey(plaintext, parsed.salt, parsed.params);
    if (derivedKey.length !== parsed.hash.length) return false;
    return timingSafeEqual(derivedKey, parsed.hash);
  }
}

type ScryptParams = { N: number; r: number; p: number };

function deriveKey(plaintext: string, salt: Buffer, params: ScryptParams = SCRYPT_PARAMS): Promise<Buffer> {
  return new Promise((resolvePromise, rejectPromise) => {
    scrypt(plaintext, salt, KEY_LENGTH, { N: params.N, r: params.r, p: params.p }, (error, derivedKey) => {
      if (error) rejectPromise(error);
      else resolvePromise(derivedKey);
    });
  });
}

function parseHash(hash: string): { params: ScryptParams; salt: Buffer; hash: Buffer } | null {
  const segments = hash.split("$");
  if (segments.length !== 6 || segments[0] !== "scrypt") return null;

  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = segments;
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) return null;
  if (!saltHex || !hashHex) return null;

  return { params: { N, r, p }, salt: Buffer.from(saltHex, "hex"), hash: Buffer.from(hashHex, "hex") };
}
