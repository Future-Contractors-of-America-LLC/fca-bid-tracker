import crypto from "node:crypto";
import {
  TEST_CUSTOMER_ACCOUNTS,
  sanitizeSeededCustomerAccount,
} from "../src/customerAccounts.js";

function sha256(value = "") {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function normalizeBoolean(value) {
  return value === true || value === "true" || value === "1";
}

function normalizeManagedAccount(raw = {}, index = 0) {
  const email = String(raw.email || "").trim().toLowerCase();
  if (!email) {
    throw new Error(`Managed customer account at index ${index} is missing email.`);
  }

  const passwordHash = raw.passwordHash
    ? String(raw.passwordHash).trim().toLowerCase()
    : raw.password
      ? sha256(raw.password)
      : "";

  if (!passwordHash) {
    throw new Error(`Managed customer account ${email} is missing passwordHash/password.`);
  }

  return {
    email,
    passwordHash,
    company: raw.company || raw.workspaceLabel || "FCA Customer Workspace",
    role: raw.role || "Owner / Admin",
    customerId: raw.customerId || `CUST-MANAGED-${index + 1}`,
    workspaceLabel: raw.workspaceLabel || raw.company || "FCA Managed Workspace",
    selectedPlan: raw.selectedPlan || "enterprise",
    enabledProducts: {
      saas: raw.enabledProducts?.saas !== false,
      lms: raw.enabledProducts?.lms !== false,
      auricrux: raw.enabledProducts?.auricrux !== false,
    },
    enabledComms: {
      chat: raw.enabledComms?.chat !== false,
      sms: raw.enabledComms?.sms !== false,
      phone: raw.enabledComms?.phone !== false,
      email: raw.enabledComms?.email !== false,
      teams: raw.enabledComms?.teams !== false,
      conference: raw.enabledComms?.conference !== false,
      lecture: raw.enabledComms?.lecture !== false,
    },
    accountMode: "managed",
  };
}

export function hasManagedCustomerAccounts() {
  return Boolean(process.env.FCA_CUSTOMER_ACCOUNTS_JSON);
}

export function allowSeededCustomerFallback() {
  if (!hasManagedCustomerAccounts()) return true;
  return normalizeBoolean(process.env.FCA_ALLOW_SEEDED_LOGIN_FALLBACK);
}

export function readManagedCustomerAccounts() {
  if (!hasManagedCustomerAccounts()) return [];

  try {
    const parsed = JSON.parse(process.env.FCA_CUSTOMER_ACCOUNTS_JSON || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.map((account, index) => normalizeManagedAccount(account, index));
  } catch {
    return [];
  }
}

export function validateCustomerCredentials(email = "", password = "") {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const passwordHash = sha256(password || "");

  const managedMatch = readManagedCustomerAccounts().find(
    (account) => account.email === normalizedEmail && account.passwordHash === passwordHash
  );

  if (managedMatch) {
    const { passwordHash: _passwordHash, ...sanitized } = managedMatch;
    return {
      ...sanitized,
      authenticationMode: "managed-server-session",
    };
  }

  if (allowSeededCustomerFallback()) {
    const seededMatch = TEST_CUSTOMER_ACCOUNTS.find(
      (account) =>
        account.email.toLowerCase() === normalizedEmail && account.password === String(password || "")
    );

    if (seededMatch) {
      return {
        ...sanitizeSeededCustomerAccount(seededMatch),
        accountMode: "seeded",
        authenticationMode: "seeded-server-session",
      };
    }
  }

  return null;
}
