import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { PasswordHasherGateway } from "@/domain/user/password-hasher.gateway";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_BYTES = 16;

/** Scrypt-based password hashing. Stored as `<salt-hex>:<derived-key-hex>`. */
export class NodeScryptPasswordHasherGateway implements PasswordHasherGateway {
  async hash(plainPassword: string): Promise<string> {
    const salt = randomBytes(SALT_BYTES).toString("hex");
    const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
  }

  async verify(plainPassword: string, hash: string): Promise<boolean> {
    const [salt, key] = hash.split(":");
    if (!salt || !key) return false;

    const derivedKey = (await scrypt(plainPassword, salt, KEY_LENGTH)) as Buffer;
    const storedKey = Buffer.from(key, "hex");
    if (storedKey.length !== derivedKey.length) return false;

    return timingSafeEqual(derivedKey, storedKey);
  }
}
