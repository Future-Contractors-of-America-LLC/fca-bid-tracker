import { pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_ITERATIONS = 120000;
const DEFAULT_KEY_LENGTH = 64;
const DEFAULT_DIGEST = "sha512";
const HASH_PREFIX = "pbkdf2_sha512";

export function hashPassword(password, options = {}) {
  const normalizedPassword = String(password || "");
  if (!normalizedPassword) {
    throw new Error("Password is required.");
  }

  const iterations = Number(options.iterations || DEFAULT_ITERATIONS);
  const salt = options.salt ? Buffer.from(options.salt, "base64") : randomBytes(16);
  const derivedKey = pbkdf2Sync(normalizedPassword, salt, iterations, DEFAULT_KEY_LENGTH, DEFAULT_DIGEST);

  return `${HASH_PREFIX}$${iterations}$${salt.toString("base64")}$${derivedKey.toString("base64")}`;
}

export function verifyPassword(password, passwordHash) {
  const normalizedPassword = String(password || "");
  const normalizedHash = String(passwordHash || "");
  if (!normalizedPassword || !normalizedHash) return false;

  const [prefix, iterationsRaw, saltBase64, hashBase64] = normalizedHash.split("$");
  if (prefix !== HASH_PREFIX || !iterationsRaw || !saltBase64 || !hashBase64) return false;

  const iterations = Number(iterationsRaw);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;

  const salt = Buffer.from(saltBase64, "base64");
  const expectedHash = Buffer.from(hashBase64, "base64");
  const derivedHash = pbkdf2Sync(normalizedPassword, salt, iterations, expectedHash.length, DEFAULT_DIGEST);

  if (derivedHash.length !== expectedHash.length) return false;
  return timingSafeEqual(derivedHash, expectedHash);
}
