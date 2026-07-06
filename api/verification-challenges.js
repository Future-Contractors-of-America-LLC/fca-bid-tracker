import crypto from "node:crypto";

const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const challenges = new Map();

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code || "")).digest("hex");
}

function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

function shouldExposeDevCode() {
  return ["1", "true", "yes"].includes(String(process.env.FCA_VERIFICATION_DEV_EXPOSE_CODE || "").toLowerCase());
}

export function createLoginChallenge(account) {
  const code = generateCode();
  const challengeId = crypto.randomBytes(18).toString("base64url");
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  challenges.set(challengeId, {
    email: account.email,
    codeHash: hashCode(code),
    expiresAt,
    account,
    attempts: 0,
  });
  return {
    challengeId,
    requiresVerification: true,
    deliveryChannel: "email-pending",
    expiresInSeconds: CHALLENGE_TTL_MS / 1000,
    maskedEmail: maskEmail(account.email),
    ...(shouldExposeDevCode() ? { devVerificationHint: code } : {}),
    deliveryWarning: "verification-email-not-sent",
  };
}

export function verifyLoginChallenge(challengeId, code) {
  const challenge = challenges.get(String(challengeId || ""));
  if (!challenge) return null;
  if (challenge.expiresAt < Date.now()) {
    challenges.delete(String(challengeId));
    return null;
  }
  challenge.attempts += 1;
  if (challenge.attempts > 5) {
    challenges.delete(String(challengeId));
    return null;
  }
  if (challenge.codeHash !== hashCode(code)) return null;
  challenges.delete(String(challengeId));
  return challenge.account;
}

export function verificationChallengeEnvelope(challengeState = null) {
  return {
    status: 200,
    ok: true,
    error: null,
    challengeState,
  };
}

function maskEmail(email) {
  const [local, domain] = String(email || "").split("@");
  if (!domain) return email;
  const maskedLocal = local.length <= 2 ? `${local.slice(0, 1)}*` : `${local.slice(0, 1)}${"*".repeat(Math.max(1, local.length - 2))}${local.slice(-1)}`;
  return `${maskedLocal}@${domain}`;
}
