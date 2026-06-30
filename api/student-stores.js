import crypto from "node:crypto";

/**
 * Student account backing store for FCA/CHPS compliance.
 *
 * No PII is stored. Each account consists of:
 *   id, username (student-NNN), role: 'student',
 *   accessCode (8-char alphanumeric), accessCodeUsed,
 *   enrolledCourse, createdAt
 *
 * Seeded with 80 accounts (student-001 through student-080) on first use.
 */

const STORE_KEY = "__FCA_STUDENT_STORE__";
const SEED_COUNT = 80;
const ACCESS_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 chars = 2^5

function generateAccessCode() {
  const chars = ACCESS_CODE_CHARS;
  const len = chars.length; // 32
  const mask = len - 1; // 31 = 0b00011111 — no modulo bias since len is a power of 2
  const result = [];
  while (result.length < 8) {
    const bytes = crypto.randomBytes(16);
    for (const b of bytes) {
      const idx = b & mask;
      result.push(chars[idx]);
      if (result.length === 8) break;
    }
  }
  return result.join("");
}

function pad(n, width = 3) {
  return String(n).padStart(width, "0");
}

function nowIso() {
  return new Date().toISOString();
}

function buildSeedAccounts() {
  return Array.from({ length: SEED_COUNT }, (_, i) => {
    const n = i + 1;
    return {
      id: `STU-${pad(n)}`,
      username: `student-${pad(n)}`,
      role: "student",
      accessCode: generateAccessCode(),
      accessCodeUsed: false,
      enrolledCourse: null,
      active: true,
      createdAt: nowIso(),
    };
  });
}

function getStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      accounts: buildSeedAccounts(),
      nextSequence: SEED_COUNT + 1,
    };
  }
  return globalThis[STORE_KEY];
}

export function listStudentAccounts() {
  return getStore().accounts.filter((a) => a.active !== false);
}

export function getStudentAccount(id) {
  return getStore().accounts.find((a) => a.id === id) || null;
}

export function provisionStudentAccount({ enrolledCourse = null } = {}) {
  const store = getStore();
  const n = store.nextSequence;
  const account = {
    id: `STU-${pad(n)}`,
    username: `student-${pad(n)}`,
    role: "student",
    accessCode: generateAccessCode(),
    accessCodeUsed: false,
    enrolledCourse: enrolledCourse || null,
    active: true,
    createdAt: nowIso(),
  };
  store.accounts.push(account);
  store.nextSequence += 1;
  return account;
}

export function provisionStudentAccountsBulk(count, { enrolledCourse = null } = {}) {
  const capped = Math.min(count, 100);
  return Array.from({ length: capped }, () => provisionStudentAccount({ enrolledCourse }));
}

export function deactivateStudentAccount(id) {
  const store = getStore();
  const account = store.accounts.find((a) => a.id === id);
  if (!account) return null;
  account.active = false;
  return { ...account };
}

export function markAccessCodeUsed(id) {
  const account = getStudentAccount(id);
  if (!account) return null;
  account.accessCodeUsed = true;
  return { ...account };
}
