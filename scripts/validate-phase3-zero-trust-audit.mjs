import { createRequire } from "node:module";
import { createSessionCookie } from "../api/auth-boundary.js";

const require = createRequire(import.meta.url);
const controls = require("../api/_lib/runtime/securityHardeningControls.js");
const failures = [];

const {
  FCA_SECURITY_POLICY,
  WORM_AUDIT_LOG_SCHEMA,
  enforceSecurityHardening,
  listSecurityAuditEvents,
  resetSecurityHardeningStateForTests,
  writeTamperEvidentSecurityEvent,
} = controls;

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function signedHeaders({ role = "Owner / Admin", email = "owner@example.com", customerId = "CUST-PHASE3-001", route = "/portal/platform", targetEnvironment = "saas", sourceEnvironment = "saas", service = {} } = {}, now = Date.now()) {
  const { cookie, session } = createSessionCookie(
    {
      email,
      customerId,
      company: "FCA Phase 3 Validation",
      role,
      accountMode: targetEnvironment === "cte" ? "cte-shadow" : "managed",
      cteProgramEnabled: targetEnvironment === "cte" || String(role).toLowerCase().includes("cte"),
    },
    now,
  );

  const headers = {
    cookie,
    "x-fca-user-role": role,
    "x-fca-user-id": email,
    "x-fca-route": route,
    "x-fca-customer-id": customerId,
    "x-fca-tenant-id": customerId,
    "x-fca-source-environment": sourceEnvironment,
    "x-fca-target-environment": targetEnvironment,
    "x-fca-continuous-auth": "signed-server-session",
    "x-fca-auth-issued-at": String(session.issuedAt),
    "x-fca-access-token-expires-at": String(session.accessTokenExpiresAt),
  };

  if (service.agent) headers["x-fca-agent"] = service.agent;
  if (service.account) headers["x-fca-service-account"] = service.account;
  if (service.role) headers["x-fca-service-role"] = service.role;
  if (service.scope) headers["x-fca-service-scope"] = service.scope;
  return headers;
}

function request(method, headers, body = {}) {
  return { method, headers, body };
}

function enforce(method, resourcePath, headers, body = {}, options = {}) {
  return enforceSecurityHardening(request(method, headers, body), {
    resourcePath,
    body,
    operation: options.operation || "phase3-validation",
    allowAnonymous: options.allowAnonymous || false,
  });
}

assert(FCA_SECURITY_POLICY.zeroTrust.validation === "continuous-short-lived-token-validation", "Zero-trust policy must require short-lived continuous token validation.");
assert(FCA_SECURITY_POLICY.zeroTrust.accessTokenTtlSeconds <= 600, "Zero-trust policy must cap access token TTL at 10 minutes or less.");
assert(WORM_AUDIT_LOG_SCHEMA.mode === "append-only-worm", "Audit schema must use append-only WORM mode.");
assert(WORM_AUDIT_LOG_SCHEMA.updateAllowed === false, "WORM audit schema must disallow updates.");
assert(WORM_AUDIT_LOG_SCHEMA.deleteAllowed === false, "WORM audit schema must disallow deletes.");
assert(WORM_AUDIT_LOG_SCHEMA.azureProductionSink.requiredControls.includes("shared-key-access-disabled-where-supported"), "WORM audit storage controls must disable shared key access where supported.");

resetSecurityHardeningStateForTests();
const staleHeaders = signedHeaders({}, Date.now() - 11 * 60 * 1000);
const stale = enforce("POST", "/projects", staleHeaders, { action: "update" });
assert(stale.allowed === false, "Expired short-lived access windows must be denied.");
assert(stale.response?.status === 401, "Expired short-lived access windows must return 401.");

const forgedRoleOnly = enforce("POST", "/projects", { "x-fca-user-role": "Owner / Admin", "x-fca-user-id": "owner@example.com" }, { action: "update" });
assert(forgedRoleOnly.allowed === false, "Role headers without a signed fresh session must not satisfy zero-trust.");

resetSecurityHardeningStateForTests();
const contractorAllowed = enforce("POST", "/projects", signedHeaders({ role: "SaaS_Contractor", email: "contractor@example.com" }), { action: "update", projectId: "PRJ-1" });
assert(contractorAllowed.allowed === true, "SaaS_Contractor must be allowed on SaaS project operations with a fresh session.");

const academyToFinance = enforce("POST", "/billing-summary", signedHeaders({ role: "Academy_Admin", email: "academy@example.com", route: "/portal/finance", targetEnvironment: "saas" }), { action: "update-invoice", invoiceId: "INV-1" });
assert(academyToFinance.allowed === false, "Academy_Admin must not mutate SaaS finance APIs.");
assert(academyToFinance.response?.body?.code === "FCA_RBAC_DENIED", "Academy_Admin finance denial must be RBAC-scoped.");

const contractorToAcademy = enforce("POST", "/academy-lms/admin", signedHeaders({ role: "SaaS_Contractor", email: "contractor@example.com", route: "/academy/dashboard", targetEnvironment: "academy" }), { action: "grade-student", studentId: "STU-1" });
assert(contractorToAcademy.allowed === false, "SaaS_Contractor must not access Academy admin APIs.");
assert(contractorToAcademy.response?.body?.code === "FCA_RBAC_DENIED", "SaaS_Contractor academy denial must be RBAC-scoped.");

resetSecurityHardeningStateForTests();
const cteToLiveFinance = enforce(
  "POST",
  "/billing-summary",
  signedHeaders({ role: "CTE_Student", email: "student@example.com", customerId: "CTE-STU-1", route: "/portal/finance", sourceEnvironment: "cte", targetEnvironment: "saas" }),
  { action: "export csv", targetEnvironment: "production", customerEmail: "student@example.com" },
);
assert(cteToLiveFinance.allowed === false, "CTE principals must be blocked from SaaS financial endpoints.");
assert([403, 423].includes(cteToLiveFinance.response?.status), "CTE-to-live finance attempts must return a blocking response.");

resetSecurityHardeningStateForTests();
const auricruxMissingService = enforce("POST", "/auricrux/actions", signedHeaders({ role: "Owner / Admin", route: "/portal/auricrux" }), { mode: "execute", prompt: "Prepare outreach", targetObject: "BID-1" });
assert(auricruxMissingService.allowed === false, "Auricrux execution must require a scoped service account.");
assert(auricruxMissingService.response?.body?.code === "FCA_AURICRUX_SCOPE_DENIED", "Missing Auricrux service account must return FCA_AURICRUX_SCOPE_DENIED.");

const cteScopedServiceToSaas = enforce(
  "POST",
  "/auricrux/actions",
  signedHeaders({
    role: "Auricrux_Service",
    email: "auricrux@example.com",
    route: "/portal/auricrux",
    targetEnvironment: "saas",
    service: { agent: "auricrux", account: "auricrux-cte-shadow-executor", scope: "auricrux:cte:execute" },
  }),
  { mode: "execute", prompt: "Run live SaaS action", targetObject: "BID-2" },
);
assert(cteScopedServiceToSaas.allowed === false, "CTE-scoped Auricrux service accounts must not execute SaaS actions.");

const scopedAuricrux = enforce(
  "POST",
  "/auricrux/actions",
  signedHeaders({
    role: "Auricrux_Service",
    email: "auricrux@example.com",
    route: "/portal/auricrux",
    targetEnvironment: "saas",
    service: { agent: "auricrux", account: "auricrux-saas-executor", scope: "auricrux:saas:execute" },
  }),
  { mode: "execute", prompt: "Prepare pricing narrative for owner@example.com", context: { projectId: "PRJ-2" }, targetObject: "BID-3" },
);
assert(scopedAuricrux.allowed === true, "Properly scoped Auricrux SaaS service account must be allowed.");
assert(scopedAuricrux.event?.auricruxTelemetry?.promptHash, "Auricrux audit telemetry must include prompt hash.");
assert(scopedAuricrux.event?.auricruxTelemetry?.contextHash, "Auricrux audit telemetry must include context hash.");
assert(scopedAuricrux.event?.auricruxTelemetry?.actionHash, "Auricrux audit telemetry must include action hash.");
assert(!JSON.stringify(listSecurityAuditEvents({ limit: 20 })).includes("owner@example.com"), "Auricrux audit events must not persist raw prompt PII.");

resetSecurityHardeningStateForTests();
for (let index = 0; index < 3; index += 1) {
  enforce("POST", "/projects", { "x-fca-user-role": "Owner / Admin" }, { action: "update", index });
}
assert(listSecurityAuditEvents({ limit: 20 }).some((event) => event.eventType === "security_threshold_alert" && event.action === "failed-auth-attempts"), "Failed auth bursts must emit threshold alerts.");

resetSecurityHardeningStateForTests();
const rapidHeaders = signedHeaders({ role: "SaaS_Contractor", email: "rapid@example.com" });
for (let index = 0; index < 12; index += 1) {
  enforce("POST", "/projects", rapidHeaders, { action: "touch", index });
}
assert(listSecurityAuditEvents({ limit: 40 }).some((event) => event.eventType === "security_threshold_alert" && event.action === "rapid-api-calls"), "Rapid API calls must emit threshold alerts.");

resetSecurityHardeningStateForTests();
const exportHeaders = signedHeaders({ role: "Owner / Admin", email: "finance@example.com", route: "/portal/finance" });
for (let index = 0; index < 2; index += 1) {
  enforce("POST", "/billing-summary", exportHeaders, { action: "export csv", customerEmail: `student${index}@example.com`, amount: 1000 + index });
}
assert(listSecurityAuditEvents({ limit: 20 }).some((event) => event.eventType === "security_threshold_alert" && event.action === "mass-export-attempts"), "Mass export attempts must emit threshold alerts.");

resetSecurityHardeningStateForTests();
const wormEvent = writeTamperEvidentSecurityEvent({ eventType: "worm_schema_probe", resourcePath: "/audit", payload: { email: "audit@example.com" } });
assert(wormEvent.wormAppendOnly === true, "Audit events must mark WORM append-only posture.");
assert(wormEvent.updateAllowed === false && wormEvent.deleteAllowed === false, "Audit events must carry no-update/no-delete semantics.");
assert(wormEvent.previousHash && wormEvent.eventHash, "Audit events must remain hash chained.");

if (failures.length) {
  console.error("Phase 3 zero-trust and audit validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Phase 3 zero-trust and audit validation passed: short-lived auth, API RBAC, scoped Auricrux identity, WORM audit schema, and anomaly thresholds are enforced.");