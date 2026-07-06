const crypto = require("crypto");

const STORE_KEY = "__FCA_SECURITY_HARDENING_CONTROL_PLANE__";
const GENESIS_HASH = "fca-security-genesis-v1";
const SESSION_COOKIE_NAME = "fca_session";
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";
const DEFAULT_IMMUTABLE_AUDIT_SINK = "azure-confidential-ledger-or-worm-storage-required";

const SENSITIVE_KEY_PATTERN = /email|phone|name|contact|address|street|city|state|zip|dob|birth|ssn|ein|tax|routing|bank|account|card|payment|invoice|payroll|wage|salary|token|secret|cookie|authorization|password|student|minor|guardian|contract|estimate|bid|proposal|file|intellectual|ip/i;
const EMAIL_PATTERN = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_PATTERN = /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;
const EXPORT_INTENT_PATTERN = /export|download|bulk|scrape|scraping|harvest|exfiltrat|dump|extract|csv|xlsx|archive|copy-all|lateral-movement|unauthorized-export/i;
const SENSITIVE_RESOURCE_PATTERN = /billing|invoice|payment|pay-app|finance|academy|student|cte|audit|auricrux|projects|bids|estimates|files|proposal|contract|payroll/i;
const AURICRUX_RESOURCE_PATTERN = /auricrux|bid-doteach-workflow/i;

const TRUSTED_DLP_AUTHORIZATIONS = new Set(["approved", "security-approved", "instructor-reviewed", "dpa-approved"]);
const MAX_ACCESS_TOKEN_WINDOW_MS = 15 * 60 * 1000;
const RAPID_API_CALL_THRESHOLD = 12;
const FAILED_AUTH_THRESHOLD = 3;
const MASS_EXPORT_THRESHOLD = 2;
const THRESHOLD_WINDOW_MS = 60 * 1000;

const ROUTE_RBAC_POLICIES = Object.freeze([
  {
    id: "financial-saas",
    pattern: /\/(billing|billing-summary|pay-apps|stripe-checkout|portal-invoices|finance|invoice|payment)/i,
    allowedRoles: new Set(["owner-admin", "saas-contractor", "finance-admin"]),
    allowedEnvironments: new Set(["saas"]),
    cteShadowAllowed: true,
  },
  {
    id: "academy-records",
    pattern: /\/(academy|academy-lms|academy-program-modules|student-stores|learners|enrollments)/i,
    allowedRoles: new Set(["owner-admin", "academy-admin", "academy-instructor", "cte-student"]),
    allowedEnvironments: new Set(["academy", "cte"]),
    cteShadowAllowed: true,
  },
  {
    id: "auricrux-execution",
    pattern: AURICRUX_RESOURCE_PATTERN,
    allowedRoles: new Set(["owner-admin", "saas-contractor", "academy-admin", "academy-instructor", "auricrux-service", "cte-student"]),
    allowedEnvironments: new Set(["saas", "academy", "cte"]),
    cteShadowAllowed: true,
  },
  {
    id: "saas-operations",
    pattern: /\/(projects|bids|estimates|proposals|files|change-orders|closeout|job-cost|workflow|opportunit|warranty|remediation|audit-events)/i,
    allowedRoles: new Set(["owner-admin", "saas-contractor", "finance-admin", "operations-admin", "auricrux-service", "cte-student"]),
    allowedEnvironments: new Set(["saas", "cte"]),
    cteShadowAllowed: true,
  },
]);

const WORM_AUDIT_LOG_SCHEMA = Object.freeze({
  version: "2026-07-04.phase3-zero-trust-audit.v1",
  mode: "append-only-worm",
  updateAllowed: false,
  deleteAllowed: false,
  retention: "minimum-7-years-with-legal-hold-support",
  azureProductionSink: {
    primary: "Azure Confidential Ledger",
    alternate: "Azure Storage immutable blob container with time-based retention and legal hold",
    requiredControls: [
      "managed-identity-writes-only",
      "private-endpoint-or-network-restricted-ingress",
      "secure-transfer-required",
      "public-blob-access-disabled",
      "shared-key-access-disabled-where-supported",
      "blob-versioning-and-soft-delete-enabled",
      "customer-managed-key-or-platform-managed-encryption",
      "diagnostics-to-log-analytics",
    ],
  },
  fields: [
    "id",
    "timestamp",
    "eventType",
    "action",
    "actorType",
    "role",
    "actorHash",
    "tenantHash",
    "targetEnvironment",
    "resourcePath",
    "outcome",
    "severity",
    "reason",
    "payloadHash",
    "auricruxTelemetry",
    "previousHash",
    "eventHash",
    "immutableSink",
  ],
});

const FCA_SECURITY_POLICY = Object.freeze({
  version: "2026-07-03.system-hardening.v1",
  encryption: {
    atRest: "AES-256 or stronger on all production data stores, backups, and immutable evidence stores",
    inTransit: "TLS 1.3+ required at all public and service boundaries; legacy plaintext or TLS downgrade is rejected at the edge",
    keyManagement: "Managed identity + Key Vault backed rotation; no hardcoded secrets or shared default trust",
  },
  dlp: {
    posture: "deny-by-default for sensitive export, scraping, and cross-environment movement",
    protectedClasses: [
      "financial-data",
      "contractor-intellectual-property",
      "minor-related-pii",
      "academy-records",
      "auricrux-prompts-and-actions",
    ],
    blockSignals: ["unauthorized-export", "bulk-scrape", "lateral-movement", "cte-to-live-production"],
  },
  disasterRecovery: {
    backupMode: "immutable-worm-isolated-region",
    protectedWorkloads: ["saas-transactions", "academy-records", "auricrux-system-logs"],
    killSwitch: "automatic-security-lockdown-on-severe-anomaly",
  },
  zeroTrust: {
    posture: "no-default-trust",
    validation: "continuous-short-lived-token-validation",
    accessTokenTtlSeconds: 600,
    refreshMode: "secure-http-only-session-refresh",
    actors: ["human-users", "service-accounts", "auricrux-ai-agents"],
  },
  audit: {
    posture: "tamper-evident-hash-chain",
    immutableSink: "Azure Confidential Ledger or WORM-enabled isolated storage in production",
    piiPolicy: "hash-or-redact-before-write",
    schema: "append-only immutable audit events with no update/delete application path",
  },
});

const STRICT_SECURITY_HEADERS = Object.freeze({
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "X-FCA-Encryption-Policy": "at-rest=AES-256; in-transit=TLS1.3+",
  "X-FCA-Zero-Trust": "continuous-validation; no-default-trust",
  "X-FCA-DLP": "block-sensitive-export-scrape-lateral-movement",
  "X-FCA-DR-Posture": "immutable-isolated-backups-required",
});

function nowIso() {
  return new Date().toISOString();
}

function securityStore() {
  if (!globalThis[STORE_KEY]) {
    globalThis[STORE_KEY] = {
      events: [],
      lastHash: GENESIS_HASH,
      lockdown: null,
      windows: {
        rapidApiCalls: {},
        failedAuth: {},
        massExports: {},
      },
    };
  }
  return globalThis[STORE_KEY];
}

function stableHash(value) {
  return crypto.createHash("sha256").update(typeof value === "string" ? value : JSON.stringify(value)).digest("hex");
}

function shortHash(value) {
  return stableHash(String(value || "anonymous")).slice(0, 16);
}

function getSessionSecret() {
  if (process.env.FCA_SESSION_SECRET) return process.env.FCA_SESSION_SECRET;
  if (requiresManagedSessionSecret()) {
    throw new Error("FCA_SESSION_SECRET_REQUIRED: managed session signing secret is required in production runtime.");
  }
  return DEFAULT_SESSION_SECRET;
}

function envFlagEnabled(value = "") {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function envFlagDisabled(value = "") {
  return ["0", "false", "no", "off"].includes(String(value || "").trim().toLowerCase());
}

function isProductionRuntime() {
  return envFlagEnabled(process.env.FCA_PRODUCTION_RUNTIME) || String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function requiresManagedSessionSecret() {
  if (envFlagDisabled(process.env.FCA_ENFORCE_MANAGED_SESSION_SECRET)) return false;
  return isProductionRuntime() || envFlagEnabled(process.env.FCA_ENFORCE_MANAGED_SESSION_SECRET);
}

function requiresImmutableAuditSink() {
  if (envFlagDisabled(process.env.FCA_REQUIRE_IMMUTABLE_AUDIT)) return false;
  return isProductionRuntime() || envFlagEnabled(process.env.FCA_REQUIRE_IMMUTABLE_AUDIT);
}

function immutableAuditSinkName() {
  return String(process.env.FCA_IMMUTABLE_AUDIT_SINK || "").trim() || DEFAULT_IMMUTABLE_AUDIT_SINK;
}

function isImmutableAuditSinkReady() {
  return process.env.FCA_IMMUTABLE_AUDIT_ENABLED === "1" && immutableAuditSinkName() !== DEFAULT_IMMUTABLE_AUDIT_SINK;
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function getHeader(req, name) {
  const headers = req?.headers || {};
  if (typeof headers.get === "function") return headers.get(name) || headers.get(name.toLowerCase()) || "";
  return headers[name] || headers[name.toLowerCase()] || "";
}

function getMethod(req) {
  return String(req?.method || "GET").toUpperCase();
}

function normalizeRole(role = "") {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\/]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function normalizeEnvironment(value = "") {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (/cte|shadow|student-sandbox/.test(normalized)) return "cte";
  if (/academy|lms|school|training/.test(normalized)) return "academy";
  if (/prod|production|live|central-live|saas/.test(normalized)) return "saas";
  return normalized || "saas";
}

function parseTimeMs(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function readSessionTokenFromCookieHeader(cookieHeader = "") {
  const parts = String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const match = parts.find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? match.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

function validateSignedSessionFromRequest(req, now = Date.now()) {
  const token = readSessionTokenFromCookieHeader(getHeader(req, "cookie"));
  if (!token || !token.includes(".")) return { valid: false, reason: "missing-signed-session-cookie" };

  const [encodedPayload, providedSignature] = token.split(".");
  let expectedSignature;
  try {
    expectedSignature = signPayload(encodedPayload);
  } catch {
    return { valid: false, reason: "session-signing-secret-missing" };
  }
  if (expectedSignature !== providedSignature) return { valid: false, reason: "invalid-signed-session-cookie" };

  try {
    const session = JSON.parse(base64UrlDecode(encodedPayload));
    const sessionExpiresAt = parseTimeMs(session?.exp);
    const accessTokenExpiresAt = parseTimeMs(session?.accessTokenExpiresAt);
    const issuedAt = parseTimeMs(session?.issuedAt);
    if (!sessionExpiresAt || sessionExpiresAt < now) return { valid: false, reason: "session-expired" };
    if (!accessTokenExpiresAt) return { valid: false, reason: "missing-short-lived-access-token" };
    if (accessTokenExpiresAt < now) return { valid: false, reason: "short-lived-access-token-expired", session };
    if (accessTokenExpiresAt - now > MAX_ACCESS_TOKEN_WINDOW_MS) return { valid: false, reason: "access-token-window-too-long", session };
    if (issuedAt && issuedAt > now + 60 * 1000) return { valid: false, reason: "access-token-issued-in-future", session };
    return { valid: true, session, authSource: "signed-server-session" };
  } catch {
    return { valid: false, reason: "malformed-signed-session-cookie" };
  }
}

function hasFreshBearerOrServiceProof(req, now = Date.now()) {
  const authorization = getHeader(req, "authorization");
  const provider = String(getHeader(req, "x-fca-auth-provider") || getHeader(req, "x-fca-service-auth") || "").toLowerCase();
  const expiresAt = parseTimeMs(getHeader(req, "x-fca-access-token-expires-at"));
  const issuedAt = parseTimeMs(getHeader(req, "x-fca-auth-issued-at"));
  const trustedProvider = ["microsoft-entra", "managed-identity", "entra-id", "fca-token-broker"].includes(provider);
  if (!authorization || !trustedProvider || !expiresAt || expiresAt < now) return { valid: false, reason: "missing-trusted-bearer-proof" };
  if (expiresAt - now > MAX_ACCESS_TOKEN_WINDOW_MS) return { valid: false, reason: "bearer-access-window-too-long" };
  if (issuedAt && issuedAt > now + 60 * 1000) return { valid: false, reason: "bearer-token-issued-in-future" };
  return { valid: true, authSource: provider, tokenHash: shortHash(authorization) };
}

function parseJsonMaybe(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(String(value));
  } catch {
    return { raw: String(value) };
  }
}

function redactSensitiveValue(value, key = "") {
  if (value === null || value === undefined) return value;
  if (SENSITIVE_KEY_PATTERN.test(String(key || ""))) return "[redacted-sensitive]";
  if (typeof value === "string") {
    return value
      .replace(EMAIL_PATTERN, "[redacted-email]")
      .replace(PHONE_PATTERN, "[redacted-phone]")
      .replace(SSN_PATTERN, "[redacted-ssn]");
  }
  if (Array.isArray(value)) return value.map((item) => redactSensitiveValue(item));
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => [childKey, redactSensitiveValue(childValue, childKey)]));
  }
  return value;
}

function collectSensitiveMatches(value, matches = [], keyPath = "payload") {
  if (value === null || value === undefined) return matches;
  if (SENSITIVE_KEY_PATTERN.test(keyPath)) matches.push({ path: keyPath, reason: "sensitive-key" });
  if (typeof value === "string") {
    if (EMAIL_PATTERN.test(value)) matches.push({ path: keyPath, reason: "email" });
    EMAIL_PATTERN.lastIndex = 0;
    if (PHONE_PATTERN.test(value)) matches.push({ path: keyPath, reason: "phone" });
    PHONE_PATTERN.lastIndex = 0;
    if (SSN_PATTERN.test(value)) matches.push({ path: keyPath, reason: "ssn" });
    SSN_PATTERN.lastIndex = 0;
    return matches;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectSensitiveMatches(item, matches, `${keyPath}[${index}]`));
    return matches;
  }
  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => collectSensitiveMatches(childValue, matches, `${keyPath}.${childKey}`));
  }
  return matches;
}

function resolvePrincipal(req, session = null) {
  const signedSession = session ? { valid: true, session, authSource: "trusted-route-session" } : validateSignedSessionFromRequest(req);
  const bearerProof = signedSession.valid ? { valid: false } : hasFreshBearerOrServiceProof(req);
  const trustedSession = signedSession.valid ? signedSession.session : null;
  const role = trustedSession?.role || getHeader(req, "x-fca-user-role") || req?.body?.role || "";
  const route = getHeader(req, "x-fca-route") || req?.body?.route || req?.body?.sourceRoute || "";
  const serviceAccount = getHeader(req, "x-fca-service-account") || "";
  const tenantSeed = getHeader(req, "x-fca-tenant-id") || getHeader(req, "x-fca-customer-id") || trustedSession?.customerId || session?.customerId || "";
  const userSeed = trustedSession?.customerId || trustedSession?.email || getHeader(req, "x-fca-user-id") || serviceAccount || session?.customerId || session?.email || "";
  const authenticated = Boolean(trustedSession || bearerProof.valid);
  const normalizedRole = normalizeRole(role);
  const actorType = normalizedRole.includes("auricrux") || getHeader(req, "x-fca-agent") ? "ai-agent" : normalizedRole.includes("service") || serviceAccount ? "service-account" : "human-user";
  const authSource = trustedSession ? signedSession.authSource : bearerProof.valid ? bearerProof.authSource : "none";
  const authFailureReason = authenticated ? null : signedSession.reason || bearerProof.reason || "missing-continuous-auth-context";

  return {
    authenticated,
    actorType,
    role: role || "anonymous",
    normalizedRole: normalizedRole || "anonymous",
    route: route || "unknown-route",
    tenantHash: shortHash(tenantSeed || "unknown-tenant"),
    actorHash: shortHash(userSeed || role || "anonymous"),
    authSource,
    authFailureReason,
    serviceAccount: serviceAccount || null,
    trustState: authenticated ? "continuously-validated" : `untrusted:${authFailureReason}`,
  };
}

function isCteOrMinorPrincipal(req, principal) {
  const shadowMode = String(getHeader(req, "x-fca-shadow-mode") || "").toLowerCase();
  const minorMode = String(getHeader(req, "x-fca-minor-privacy-mode") || "").toLowerCase();
  const role = principal?.normalizedRole || normalizeRole(principal?.role);
  return shadowMode === "cte-sandbox" || minorMode === "true" || role === "student" || role === "cte-student" || role === "minor" || (role.includes("cte") && role.includes("student"));
}

function hasLiveEnvironmentIntent(req, payload = {}) {
  const headerSignal = [
    getHeader(req, "x-fca-live-api-intent"),
    getHeader(req, "x-fca-target-environment"),
    getHeader(req, "x-fca-auricrux-mode"),
  ].join(" ");
  const bodySignal = JSON.stringify({
    targetEnvironment: payload.targetEnvironment,
    environmentTarget: payload.environmentTarget,
    auricruxMode: payload.auricruxMode,
    liveApiIntent: payload.liveApiIntent,
  });
  return /true|live|production|prod|central-live|execute-live/i.test(`${headerSignal} ${bodySignal}`);
}

function resolveTargetEnvironment(req, payload = {}, principal = null, resourcePath = "") {
  const explicit = getHeader(req, "x-fca-target-environment") || payload.targetEnvironment || payload.environmentTarget || payload.environment || "";
  if (explicit) return normalizeEnvironment(explicit);

  if (isCteOrMinorPrincipal(req, principal) && !hasLiveEnvironmentIntent(req, payload)) return "cte";

  const routeSignal = `${resourcePath} ${principal?.route || ""} ${getHeader(req, "x-fca-route")}`;
  if (/academy|lms|student|course|credential/i.test(routeSignal)) return "academy";
  return "saas";
}

function evaluateRouteRbac(req, { principal, payload = {}, resourcePath = "" } = {}) {
  if (getMethod(req) === "OPTIONS") return { allowed: true };

  const policy = ROUTE_RBAC_POLICIES.find((candidate) => candidate.pattern.test(String(resourcePath || principal?.route || "")));
  if (!policy) return { allowed: true };

  const targetEnvironment = resolveTargetEnvironment(req, payload, principal, resourcePath);
  const role = principal?.normalizedRole || normalizeRole(principal?.role);
  const cteShadowAllowed = policy.cteShadowAllowed && isCteOrMinorPrincipal(req, principal) && targetEnvironment === "cte" && !hasLiveEnvironmentIntent(req, payload);
  if (cteShadowAllowed) return { allowed: true, policy, targetEnvironment, reason: "cte-shadow-rbac-allow" };

  if (!policy.allowedRoles.has(role)) {
    return {
      allowed: false,
      policy,
      targetEnvironment,
      reason: "role-not-authorized-for-api-route",
      details: { requiredPolicy: policy.id, role, allowedRoles: Array.from(policy.allowedRoles) },
    };
  }

  if (!policy.allowedEnvironments.has(targetEnvironment)) {
    return {
      allowed: false,
      policy,
      targetEnvironment,
      reason: "role-not-authorized-for-target-environment",
      details: { requiredPolicy: policy.id, role, targetEnvironment, allowedEnvironments: Array.from(policy.allowedEnvironments) },
    };
  }

  return { allowed: true, policy, targetEnvironment };
}

function splitScopeList(value = "") {
  return String(value || "")
    .toLowerCase()
    .split(/[\s,]+/)
    .map((scope) => scope.trim())
    .filter(Boolean);
}

function buildAuricruxAuditTelemetry(req, payload = {}, resourcePath = "", targetEnvironment = "saas") {
  const auricruxSignal = AURICRUX_RESOURCE_PATTERN.test(String(resourcePath || "")) || getHeader(req, "x-fca-agent") || payload.agent === "auricrux";
  if (!auricruxSignal) return null;

  const prompt = payload.prompt || payload.userPrompt || payload.message || payload.instruction || getHeader(req, "x-fca-auricrux-prompt") || "none";
  const context = payload.context || payload.executionContext || payload.metadata || getHeader(req, "x-fca-auricrux-context") || "none";
  const action = payload.action || payload.mode || payload.capabilityId || payload.command || getHeader(req, "x-fca-auricrux-action") || "none";
  const targetObject = payload.targetObject || payload.projectId || payload.bidId || payload.recordId || payload.customerId || resourcePath || "none";

  return {
    promptHash: stableHash(prompt),
    contextHash: stableHash(context),
    actionHash: stableHash(action),
    targetObjectHash: stableHash(targetObject),
    targetEnvironment,
    serviceAccountHash: shortHash(getHeader(req, "x-fca-service-account") || "none"),
    rawPromptPersisted: false,
    rawContextPersisted: false,
  };
}

function evaluateAuricruxServiceAccount(req, { principal, payload = {}, resourcePath = "" } = {}) {
  if (!AURICRUX_RESOURCE_PATTERN.test(String(resourcePath || ""))) return { allowed: true };

  const method = getMethod(req);
  const targetEnvironment = resolveTargetEnvironment(req, payload, principal, resourcePath);
  const telemetry = buildAuricruxAuditTelemetry(req, payload, resourcePath, targetEnvironment);
  if (["GET", "HEAD", "OPTIONS"].includes(method)) return { allowed: true, targetEnvironment, telemetry };
  if (isCteOrMinorPrincipal(req, principal) && targetEnvironment === "cte" && !hasLiveEnvironmentIntent(req, payload)) {
    return { allowed: true, targetEnvironment, telemetry, reason: "cte-shadow-auricrux-mock-allow" };
  }

  const agent = normalizeRole(getHeader(req, "x-fca-agent"));
  const serviceAccount = normalizeRole(getHeader(req, "x-fca-service-account") || principal?.serviceAccount || "");
  const serviceRole = normalizeRole(getHeader(req, "x-fca-service-role"));
  const serviceScopeRaw = getHeader(req, "x-fca-service-scope");
  const scopes = splitScopeList(serviceScopeRaw);
  const allowedAccounts = {
    saas: "auricrux-saas-executor",
    academy: "auricrux-academy-executor",
    cte: "auricrux-cte-shadow-executor",
  };
  const requiredScope = `auricrux:${targetEnvironment}:execute`;
  const prohibitedPrivilegeSignal = `${serviceAccount} ${serviceRole} ${serviceScopeRaw}`;

  if (agent !== "auricrux") {
    return { allowed: false, targetEnvironment, telemetry, reason: "missing-auricrux-agent-identity" };
  }
  if (!serviceAccount || serviceAccount !== allowedAccounts[targetEnvironment]) {
    return { allowed: false, targetEnvironment, telemetry, reason: "missing-auricrux-scoped-service-account", details: { expectedServiceAccount: allowedAccounts[targetEnvironment] } };
  }
  if (/super|root|global-admin|owner-admin|all-access|\*/i.test(prohibitedPrivilegeSignal)) {
    return { allowed: false, targetEnvironment, telemetry, reason: "auricrux-super-admin-prohibited" };
  }
  if (!scopes.includes(requiredScope)) {
    return { allowed: false, targetEnvironment, telemetry, reason: "auricrux-scope-not-authorized", details: { requiredScope } };
  }
  if (targetEnvironment === "saas" && isCteOrMinorPrincipal(req, principal)) {
    return { allowed: false, targetEnvironment, telemetry, reason: "cte-principal-cannot-execute-live-auricrux" };
  }

  return { allowed: true, targetEnvironment, telemetry, reason: "auricrux-scoped-service-account-authorized" };
}

function recordWindowSignal(collectionName, key, threshold, now = Date.now()) {
  const store = securityStore();
  if (!store.windows) {
    store.windows = { rapidApiCalls: {}, failedAuth: {}, massExports: {} };
  }
  const collection = store.windows[collectionName] || {};
  store.windows[collectionName] = collection;
  const current = (collection[key] || []).filter((timestamp) => now - timestamp <= THRESHOLD_WINDOW_MS);
  current.push(now);
  collection[key] = current;
  return { count: current.length, threshold, exceeded: current.length >= threshold };
}

function writeThresholdAlertIfNeeded(req, { type, collectionName, key, threshold, principal, resourcePath, reason, payload = {} }) {
  const signal = recordWindowSignal(collectionName, key, threshold);
  if (!signal.exceeded) return null;
  return writeTamperEvidentSecurityEvent({
    eventType: "security_threshold_alert",
    action: type,
    principal,
    resourcePath,
    outcome: "alerted",
    severity: signal.count > threshold ? "critical" : "high",
    reason,
    payload: { ...payload, threshold, observedCount: signal.count, windowMs: THRESHOLD_WINDOW_MS },
    request: req,
  });
}

function isGlobalLockdownActive() {
  const store = securityStore();
  return ["1", "true", "yes", "lockdown"].includes(String(process.env.FCA_SECURITY_LOCKDOWN || "").toLowerCase()) || store.lockdown?.active === true;
}

function writeTamperEvidentSecurityEvent({ eventType, action, actorType, principal, resourcePath, outcome = "allowed", severity = "info", reason = null, payload = null, request = null, targetEnvironment = null, auricruxTelemetry = null }) {
  const store = securityStore();
  const resolvedPrincipal = principal || resolvePrincipal(request);
  const sanitizedPayload = redactSensitiveValue(payload || {});
  const resolvedTargetEnvironment = targetEnvironment || resolveTargetEnvironment(request, sanitizedPayload, resolvedPrincipal, resourcePath);
  const entry = {
    id: `SEC-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    timestamp: nowIso(),
    schemaVersion: WORM_AUDIT_LOG_SCHEMA.version,
    eventType,
    action: action || eventType,
    actorType: actorType || resolvedPrincipal.actorType,
    role: resolvedPrincipal.role,
    actorHash: resolvedPrincipal.actorHash,
    tenantHash: resolvedPrincipal.tenantHash,
    targetEnvironment: resolvedTargetEnvironment,
    trustState: resolvedPrincipal.trustState,
    resourcePath: resourcePath || "unknown-resource",
    outcome,
    severity,
    reason,
    payloadHash: stableHash(sanitizedPayload),
    auricruxTelemetry: auricruxTelemetry || buildAuricruxAuditTelemetry(request, sanitizedPayload, resourcePath, resolvedTargetEnvironment),
    previousHash: store.lastHash || GENESIS_HASH,
    hashAlgorithm: "sha256",
    tamperEvident: true,
    wormAppendOnly: WORM_AUDIT_LOG_SCHEMA.updateAllowed === false && WORM_AUDIT_LOG_SCHEMA.deleteAllowed === false,
    updateAllowed: false,
    deleteAllowed: false,
    immutableSink: immutableAuditSinkName(),
    immutableSinkReady: isImmutableAuditSinkReady(),
  };
  entry.eventHash = stableHash({ ...entry, eventHash: undefined });
  store.lastHash = entry.eventHash;
  store.events.unshift(entry);
  if (store.events.length > 5000) store.events.splice(5000);
  return entry;
}

function activateSecurityLockdown(reason, sourceEvent = {}) {
  const store = securityStore();
  store.lockdown = {
    active: true,
    reason,
    triggeredAt: nowIso(),
    sourceEventId: sourceEvent.id || null,
    actions: [
      "sever-saas-cte-live-links",
      "suspend-live-auricrux-operations",
      "force-shadow-only-cte-processing",
      "require-security-review-before-live-resume",
    ],
  };
  return store.lockdown;
}

function resetSecurityHardeningStateForTests() {
  globalThis[STORE_KEY] = {
    events: [],
    lastHash: GENESIS_HASH,
    lockdown: null,
    windows: {
      rapidApiCalls: {},
      failedAuth: {},
      massExports: {},
    },
  };
}

function inspectDlp(payload = {}, { req = null, resourcePath = "", operation = "request" } = {}) {
  const authorization = String(getHeader(req, "x-fca-dlp-authorization") || "").toLowerCase();
  const exportSignal = [
    resourcePath,
    operation,
    getHeader(req, "x-fca-export-intent"),
    getHeader(req, "x-fca-bulk-operation"),
    JSON.stringify(payload),
  ].join(" ");
  const sensitiveMatches = collectSensitiveMatches(payload).slice(0, 25);
  const protectedResource = SENSITIVE_RESOURCE_PATTERN.test(String(resourcePath || ""));
  const exportIntent = EXPORT_INTENT_PATTERN.test(exportSignal);
  const authorized = TRUSTED_DLP_AUTHORIZATIONS.has(authorization);
  const blocked = !authorized && exportIntent && (protectedResource || sensitiveMatches.length > 0);

  return {
    blocked,
    authorized,
    exportIntent,
    protectedResource,
    sensitiveMatches,
    sanitizedPayload: redactSensitiveValue(payload),
    reason: blocked ? "unauthorized-sensitive-export-or-scrape" : null,
  };
}

function detectSevereAnomaly(req, { principal, payload = {}, resourcePath = "" } = {}) {
  if (isGlobalLockdownActive()) {
    return { active: true, reason: "security-lockdown-active", existingLockdown: true };
  }
  if (isCteOrMinorPrincipal(req, principal) && hasLiveEnvironmentIntent(req, payload)) {
    return { active: true, reason: "unauthorized-cte-to-live-production-call", existingLockdown: false };
  }
  const sourceEnv = String(getHeader(req, "x-fca-source-environment") || payload.sourceEnvironment || "").toLowerCase();
  const targetEnv = String(getHeader(req, "x-fca-target-environment") || payload.targetEnvironment || payload.environmentTarget || "").toLowerCase();
  if (sourceEnv && targetEnv && sourceEnv !== targetEnv && /cte|shadow|academy/.test(sourceEnv) && /prod|live|saas/.test(targetEnv)) {
    return { active: true, reason: "unauthorized-cross-environment-lateral-movement", existingLockdown: false };
  }
  if (AURICRUX_RESOURCE_PATTERN.test(String(resourcePath || "")) && getHeader(req, "x-fca-auricrux-mode") === "live" && isCteOrMinorPrincipal(req, principal)) {
    return { active: true, reason: "minor-live-auricrux-execution-attempt", existingLockdown: false };
  }
  return { active: false };
}

function buildSecurityResponse(status, code, message, event, extra = {}) {
  return {
    status,
    headers: STRICT_SECURITY_HEADERS,
    body: {
      ok: false,
      error: message,
      code,
      securityEventId: event?.id || null,
      auditHash: event?.eventHash || null,
      tamperEvidentAudit: true,
      ...extra,
    },
  };
}

function requiresZeroTrustPrincipal(method, allowAnonymous = false) {
  if (allowAnonymous || method === "OPTIONS") return false;
  if (["GET", "HEAD"].includes(method)) return false;
  return true;
}

function enforceSecurityHardening(req, { resourcePath = "", body = undefined, session = null, allowAnonymous = false, operation = "api" } = {}) {
  const method = getMethod(req);
  const payload = body === undefined ? parseJsonMaybe(req?.body || {}) : parseJsonMaybe(body);
  const principal = resolvePrincipal(req, session);
  const targetEnvironment = resolveTargetEnvironment(req, payload, principal, resourcePath);
  const anomaly = detectSevereAnomaly(req, { principal, payload, resourcePath });

  if (anomaly.active) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "security_lockdown",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "critical",
      reason: anomaly.reason,
      payload,
      request: req,
      targetEnvironment,
    });
    const lockdown = anomaly.existingLockdown ? securityStore().lockdown : activateSecurityLockdown(anomaly.reason, event);
    return {
      allowed: false,
      response: buildSecurityResponse(423, "FCA_SECURITY_LOCKDOWN", "Security lockdown is active. Live operations are suspended pending review.", event, { lockdown }),
      event,
    };
  }

  const isMutating = !["GET", "HEAD", "OPTIONS"].includes(method);
  if (isMutating && requiresImmutableAuditSink() && !isImmutableAuditSinkReady()) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "immutable_audit_sink_denied",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "critical",
      reason: "immutable-audit-sink-not-configured",
      payload,
      request: req,
      targetEnvironment,
    });
    return {
      allowed: false,
      response: buildSecurityResponse(503, "FCA_IMMUTABLE_AUDIT_REQUIRED", "Immutable audit sink is required for mutating operations in this runtime.", event, {
        immutableAudit: {
          required: true,
          sink: immutableAuditSinkName(),
          sinkReady: false,
        },
      }),
      event,
    };
  }

  writeThresholdAlertIfNeeded(req, {
    type: "rapid-api-calls",
    collectionName: "rapidApiCalls",
    key: `${principal.actorHash}:${resourcePath || principal.route}`,
    threshold: RAPID_API_CALL_THRESHOLD,
    principal,
    resourcePath,
    reason: "rapid-successive-api-calls-threshold-exceeded",
    payload: { method, operation, targetEnvironment },
  });

  if (requiresZeroTrustPrincipal(method, allowAnonymous) && !principal.authenticated) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "zero_trust_denied",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "high",
      reason: principal.authFailureReason || "missing-continuous-auth-context",
      payload,
      request: req,
      targetEnvironment,
    });
    writeThresholdAlertIfNeeded(req, {
      type: "failed-auth-attempts",
      collectionName: "failedAuth",
      key: principal.actorHash,
      threshold: FAILED_AUTH_THRESHOLD,
      principal,
      resourcePath,
      reason: "failed-auth-threshold-exceeded",
      payload: { failureReason: principal.authFailureReason || "missing-continuous-auth-context", operation, targetEnvironment },
    });
    return {
      allowed: false,
      response: buildSecurityResponse(401, "FCA_ZERO_TRUST_CONTEXT_REQUIRED", "Continuous trust context is required for this operation.", event),
      event,
    };
  }

  const rbac = evaluateRouteRbac(req, { principal, payload, resourcePath });
  if (!rbac.allowed) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "rbac_denied",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "high",
      reason: rbac.reason,
      payload: { ...payload, rbac: rbac.details },
      request: req,
      targetEnvironment: rbac.targetEnvironment || targetEnvironment,
    });
    return {
      allowed: false,
      response: buildSecurityResponse(403, "FCA_RBAC_DENIED", "This role is not authorized for the requested API route or target environment.", event, { rbac: rbac.details }),
      event,
      rbac,
    };
  }

  const auricrux = evaluateAuricruxServiceAccount(req, { principal, payload, resourcePath });
  if (!auricrux.allowed) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "auricrux_scope_denied",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "critical",
      reason: auricrux.reason,
      payload: { ...payload, auricrux: auricrux.details },
      request: req,
      targetEnvironment: auricrux.targetEnvironment || targetEnvironment,
      auricruxTelemetry: auricrux.telemetry,
    });
    return {
      allowed: false,
      response: buildSecurityResponse(403, "FCA_AURICRUX_SCOPE_DENIED", "Auricrux execution requires a dedicated scoped service account for the target environment.", event, { auricrux: auricrux.details || { reason: auricrux.reason } }),
      event,
      auricrux,
    };
  }

  const dlp = inspectDlp(payload, { req, resourcePath, operation });
  if (dlp.blocked) {
    const event = writeTamperEvidentSecurityEvent({
      eventType: "dlp_blocked",
      action: operation,
      principal,
      resourcePath,
      outcome: "blocked",
      severity: "critical",
      reason: dlp.reason,
      payload: dlp.sanitizedPayload,
      request: req,
      targetEnvironment,
    });
    writeThresholdAlertIfNeeded(req, {
      type: "mass-export-attempts",
      collectionName: "massExports",
      key: principal.actorHash,
      threshold: MASS_EXPORT_THRESHOLD,
      principal,
      resourcePath,
      reason: "mass-export-threshold-exceeded",
      payload: { operation, targetEnvironment, dlpReason: dlp.reason },
    });
    return {
      allowed: false,
      response: buildSecurityResponse(403, "FCA_DLP_BLOCKED", "DLP blocked an unauthorized sensitive export, scrape, or lateral movement attempt.", event, {
        dlp: {
          reason: dlp.reason,
          exportIntent: dlp.exportIntent,
          protectedResource: dlp.protectedResource,
          sensitiveMatches: dlp.sensitiveMatches,
        },
      }),
      event,
      dlp,
    };
  }

  const shouldAudit = method !== "GET" || AURICRUX_RESOURCE_PATTERN.test(resourcePath) || SENSITIVE_RESOURCE_PATTERN.test(resourcePath);
  const event = shouldAudit
    ? writeTamperEvidentSecurityEvent({
        eventType: "security_control_allowed",
        action: operation,
        principal,
        resourcePath,
        outcome: "allowed",
        severity: "info",
        reason: auricrux.reason || rbac.reason || "zero-trust-dlp-rbac-dr-controls-passed",
        payload,
        request: req,
        targetEnvironment: auricrux.targetEnvironment || rbac.targetEnvironment || targetEnvironment,
        auricruxTelemetry: auricrux.telemetry,
      })
    : null;

  return { allowed: true, principal, dlp, rbac, auricrux, event };
}

async function enforceSecurityHardeningForFetchRequest(request, options = {}) {
  let body = {};
  if (!["GET", "HEAD", "OPTIONS"].includes(getMethod(request))) {
    try {
      const text = await request.clone().text();
      body = parseJsonMaybe(text);
    } catch {
      body = {};
    }
  }
  return enforceSecurityHardening(request, { ...options, body });
}

function toFetchSecurityResponse(enforcement) {
  return {
    status: enforcement.response.status,
    headers: enforcement.response.headers,
    jsonBody: enforcement.response.body,
  };
}

function buildSecureProxyHeaders(headers = {}) {
  return {
    ...headers,
    ...STRICT_SECURITY_HEADERS,
  };
}

function listSecurityAuditEvents({ limit = 100 } = {}) {
  return securityStore().events.slice(0, limit);
}

function getSecurityLockdownState() {
  return securityStore().lockdown || { active: false };
}

module.exports = {
  FCA_SECURITY_POLICY,
  STRICT_SECURITY_HEADERS,
  WORM_AUDIT_LOG_SCHEMA,
  buildSecureProxyHeaders,
  enforceSecurityHardening,
  enforceSecurityHardeningForFetchRequest,
  toFetchSecurityResponse,
  evaluateRouteRbac,
  evaluateAuricruxServiceAccount,
  inspectDlp,
  redactSensitiveValue,
  writeTamperEvidentSecurityEvent,
  listSecurityAuditEvents,
  getSecurityLockdownState,
  activateSecurityLockdown,
  resetSecurityHardeningStateForTests,
};