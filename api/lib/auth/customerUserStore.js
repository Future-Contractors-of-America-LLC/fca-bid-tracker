function normalizeEnabledProducts(enabledProducts = {}) {
  return {
    saas: enabledProducts?.saas !== false,
    lms: enabledProducts?.lms !== false,
    auricrux: enabledProducts?.auricrux !== false,
  };
}

function normalizeEnabledComms(enabledComms = {}) {
  return {
    chat: enabledComms?.chat !== false,
    sms: enabledComms?.sms !== false,
    phone: enabledComms?.phone !== false,
    email: enabledComms?.email !== false,
    teams: enabledComms?.teams !== false,
    conference: enabledComms?.conference !== false,
    lecture: enabledComms?.lecture !== false,
  };
}

function normalizeUserRecord(record = {}) {
  const normalizedEmail = String(record.email || "").trim().toLowerCase();
  if (!normalizedEmail || !record.passwordHash) return null;

  return {
    email: normalizedEmail,
    passwordHash: String(record.passwordHash),
    company: record.company || "FCA Customer Workspace",
    role: record.role || "Owner / Admin",
    customerId: record.customerId || `CUST-${normalizedEmail.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`,
    workspaceLabel: record.workspaceLabel || record.company || "FCA Customer Workspace",
    selectedPlan: record.selectedPlan || "startup",
    enabledProducts: normalizeEnabledProducts(record.enabledProducts),
    enabledComms: normalizeEnabledComms(record.enabledComms),
    status: record.status || "active",
  };
}

export function readCustomerUsersFromEnv() {
  const raw = process.env.FCA_CUSTOMER_USERS_JSON;
  if (!raw) return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("FCA_CUSTOMER_USERS_JSON is not valid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("FCA_CUSTOMER_USERS_JSON must be an array.");
  }

  return parsed.map(normalizeUserRecord).filter(Boolean);
}

export function findCustomerUserByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) return null;

  return readCustomerUsersFromEnv().find((user) => user.email === normalizedEmail) || null;
}

export function sanitizeCustomerUser(user) {
  if (!user) return null;

  return {
    email: user.email,
    company: user.company,
    role: user.role,
    customerId: user.customerId,
    workspaceLabel: user.workspaceLabel,
    selectedPlan: user.selectedPlan,
    enabledProducts: user.enabledProducts,
    enabledComms: user.enabledComms,
    authVersion: "customer-auth-v1",
  };
}
