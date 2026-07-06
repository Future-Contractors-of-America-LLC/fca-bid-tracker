import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createSessionCookie } from "../api/auth-boundary.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));
}

function buildSignedSessionHeaders({ role = "Owner / Admin", email = "owner@example.com", customerId = "CUST-PHASE3-OWNER", route = "/portal/finance", targetEnvironment = "saas" } = {}) {
  const { cookie, session } = createSessionCookie({
    email,
    customerId,
    company: "FCA Phase 3 Validation",
    role,
    accountMode: targetEnvironment === "cte" ? "cte-shadow" : "managed",
    cteProgramEnabled: targetEnvironment === "cte",
  });

  return {
    cookie,
    "x-fca-user-role": role,
    "x-fca-user-id": email,
    "x-fca-route": route,
    "x-fca-customer-id": customerId,
    "x-fca-tenant-id": customerId,
    "x-fca-target-environment": targetEnvironment,
    "x-fca-continuous-auth": "signed-server-session",
    "x-fca-auth-issued-at": String(session.issuedAt),
    "x-fca-access-token-expires-at": String(session.accessTokenExpiresAt),
  };
}

const controls = require("../api/_lib/runtime/securityHardeningControls.js");
const { createCentralProxy } = require("../api/_lib/proxyToCentral.js");
const auricruxActions = require("../api/auricrux-actions/index.js");

const {
  FCA_SECURITY_POLICY,
  inspectDlp,
  enforceSecurityHardening,
  writeTamperEvidentSecurityEvent,
  listSecurityAuditEvents,
  resetSecurityHardeningStateForTests,
} = controls;

assert(FCA_SECURITY_POLICY.encryption.atRest.includes("AES-256"), "Security policy must require AES-256 encryption at rest.");
assert(FCA_SECURITY_POLICY.encryption.inTransit.includes("TLS 1.3"), "Security policy must require TLS 1.3+ in transit.");
assert(FCA_SECURITY_POLICY.disasterRecovery.backupMode.includes("immutable"), "Security policy must require immutable DR backups.");
assert(FCA_SECURITY_POLICY.audit.posture === "tamper-evident-hash-chain", "Security policy must require tamper-evident audit chains.");

const trustedHeaders = buildSignedSessionHeaders();

const dlp = inspectDlp(
  {
    action: "export csv",
    financialData: { customerEmail: "student@example.com", bankRoutingNumber: "123456789" },
  },
  { req: { method: "POST", headers: trustedHeaders }, resourcePath: "/billing-summary", operation: "bulk-export" },
);
assert(dlp.blocked === true, "DLP must block unauthorized sensitive financial export attempts.");
assert(!JSON.stringify(dlp.sanitizedPayload).includes("student@example.com"), "DLP sanitized payload must redact emails.");

resetSecurityHardeningStateForTests();
const missingTrust = enforceSecurityHardening(
  { method: "POST", headers: {}, body: { action: "mutate" } },
  { resourcePath: "/projects", body: { action: "mutate" }, operation: "central-proxy" },
);
assert(missingTrust.allowed === false, "Zero-trust control must deny mutating operations without request trust context.");
assert(missingTrust.response.status === 401, "Zero-trust denial must return 401.");

resetSecurityHardeningStateForTests();
const originalFetch = global.fetch;
global.fetch = async (target, init) => ({
  status: 200,
  text: async () => JSON.stringify({ ok: true, target, method: init.method }),
});

const proxyContext = { log: { error: () => {} } };
await createCentralProxy("/projects")(proxyContext, {
  method: "POST",
  headers: trustedHeaders,
  body: { action: "update", projectId: "PRJ-1" },
});
assert(proxyContext.res?.status === 200, "Trusted SaaS proxy mutation must still reach the normal Central proxy path.");
assert(proxyContext.res?.body?.ok === true, "Trusted SaaS proxy mutation must preserve live proxy behavior.");

const dlpContext = { log: { error: () => {} } };
await createCentralProxy("/billing-summary")(dlpContext, {
  method: "POST",
  headers: trustedHeaders,
  body: { action: "export csv", customerEmail: "minor@example.com", amount: 1000 },
});
assert(dlpContext.res?.status === 403, "Central proxy must block DLP export attempts before live fetch.");
assert(dlpContext.res?.body?.code === "FCA_DLP_BLOCKED", "DLP block must emit FCA_DLP_BLOCKED code.");

resetSecurityHardeningStateForTests();
const anomalyContext = { log: { error: () => {} } };
await createCentralProxy("/projects")(anomalyContext, {
  method: "POST",
  headers: {
    "x-fca-user-role": "CTE_Student",
    "x-fca-user-id": "student@example.com",
    "x-fca-route": "/portal/projects",
    "x-fca-shadow-mode": "cte-sandbox",
    "x-fca-live-api-intent": "true",
  },
  body: { targetEnvironment: "production", action: "write-live" },
});
assert(anomalyContext.res?.status === 423, "CTE-to-live anomaly must trigger security lockdown before live proxy calls.");
assert(anomalyContext.res?.body?.lockdown?.active === true, "Security lockdown response must include active lockdown state.");

const auricruxContext = {};
await auricruxActions(auricruxContext, {
  method: "POST",
  headers: trustedHeaders,
  body: { mode: "execute", capabilityId: "live-outreach" },
});
assert(auricruxContext.res?.status === 423, "Live Auricrux operations must be suspended while lockdown is active.");

resetSecurityHardeningStateForTests();
const eventOne = writeTamperEvidentSecurityEvent({ eventType: "test_one", resourcePath: "/audit", payload: { email: "one@example.com" } });
const eventTwo = writeTamperEvidentSecurityEvent({ eventType: "test_two", resourcePath: "/audit", payload: { email: "two@example.com" } });
const auditEvents = listSecurityAuditEvents({ limit: 2 });
assert(eventOne.eventHash && eventTwo.eventHash, "Security audit events must include hashes.");
assert(eventTwo.previousHash === eventOne.eventHash, "Security audit events must be hash chained.");
assert(auditEvents[0].tamperEvident === true, "Security audit list must expose tamper-evident entries.");
assert(!JSON.stringify(auditEvents).includes("one@example.com"), "Security audit entries must not persist raw sensitive payloads.");

global.fetch = originalFetch;

const swaConfig = readJson("staticwebapp.config.json");
const headers = swaConfig.globalHeaders || {};
assert(headers["Strict-Transport-Security"]?.includes("max-age=63072000"), "SWA config must set long-lived HSTS.");
assert(headers["Content-Security-Policy"]?.includes("upgrade-insecure-requests"), "SWA config must upgrade insecure requests.");
assert(headers["X-FCA-Encryption-Policy"]?.includes("TLS1.3"), "SWA config must publish encryption policy header.");
assert(headers["X-FCA-DLP"]?.includes("block-sensitive-export"), "SWA config must publish DLP posture header.");

const packageJson = readJson("package.json");
assert(packageJson.scripts["validate:system-security-hardening"] === "node scripts/validate-system-security-hardening.mjs", "package.json must expose validate:system-security-hardening.");

const lmsQcSteps = fs.readFileSync(path.join(root, "scripts", "lib", "lmsQcSteps.mjs"), "utf8");
assert(lmsQcSteps.includes("validate-system-security-hardening.mjs"), "LMS QC must include the system security hardening validator.");

if (failures.length) {
  console.error("System security hardening validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("System security hardening validation passed: encryption policy, DLP, zero-trust, kill switch, Auricrux lockdown, tamper-evident audit, and SWA security headers are enforced.");