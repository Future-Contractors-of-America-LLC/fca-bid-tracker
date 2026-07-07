import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { createSessionCookie } from "../api/auth-boundary.js";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function fail(message) {
  failures.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readSource(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const shadow = require("../api/_lib/runtime/cteShadowEnvironment.cjs");
const { createCentralProxy } = require("../api/_lib/proxyToCentral.js");
const auricruxActions = require("../api/auricrux-actions/index.js");
const auricrux = require("../api/auricrux.js");
const stripeCheckout = require("../api/stripe-checkout/index.js");

const { cookie: cteCookie, session: cteSession } = createSessionCookie({
  email: "student@example.com",
  customerId: "CTE-STUDENT-TEST-001",
  company: "FCA Academy CTE Shadow",
  role: "CTE_Student",
  accountMode: "cte-shadow",
  cteProgramEnabled: true,
});

const cteHeaders = {
  cookie: cteCookie,
  "x-fca-user-role": "CTE_Student",
  "x-fca-route": "/portal/bids",
  "x-fca-shadow-mode": "cte-sandbox",
  "x-fca-minor-privacy-mode": "true",
  "x-fca-user-id": "cte-shadow-CTE-STUDENT-TEST-001",
  "x-fca-target-environment": "cte",
  "x-fca-source-environment": "cte",
  "x-fca-continuous-auth": "signed-server-session",
  "x-fca-auth-issued-at": String(cteSession.issuedAt),
  "x-fca-access-token-expires-at": String(cteSession.accessTokenExpiresAt),
};

assert(shadow.isCteStudentRole("CTE_Student"), "CTE_Student role must be recognized as a CTE student role.");
assert(shadow.isCteStudentRole("student"), "student role must be recognized as minor-level shadow role.");
assert(shadow.isCteShadowRequest({ method: "GET", headers: cteHeaders }), "CTE headers must activate shadow mode.");

const sanitized = shadow.sanitizeForMinorTelemetry({
  email: "student@example.com",
  contactName: "Minor Learner",
  nested: {
    note: "Call 555-123-4567 or email guardian@example.com",
  },
});
assert(sanitized.email === "[redacted-minor-pii]", "Email keyed values must be redacted.");
assert(sanitized.contactName === "[redacted-minor-pii]", "Name/contact keyed values must be redacted.");
assert(!JSON.stringify(sanitized).includes("guardian@example.com"), "Embedded email strings must be redacted.");
assert(!JSON.stringify(sanitized).includes("555-123-4567"), "Embedded phone strings must be redacted.");

const originalFetch = global.fetch;
global.fetch = async () => {
  throw new Error("LIVE_FETCH_BLOCKED_TEST");
};

async function runProxyCheck() {
  const context = {};
  await createCentralProxy("/projects")(context, {
    method: "POST",
    headers: cteHeaders,
    body: { customerEmail: "student@example.com", contactName: "Minor Learner", amount: 2500 },
  });
  assert(context.res?.status === 200, "CTE proxy request must return HTTP 200 from shadow mode.");
  assert(context.res?.body?.noLiveApis === true, "CTE proxy request must not call live APIs.");
  assert(context.res?.body?.databaseTarget === "cte-shadow-staging", "CTE proxy request must target cte-shadow-staging.");
  assert(context.res?.body?.productionDatabaseBypassed === true, "CTE proxy request must bypass production database.");
}

async function runAuricruxChecks() {
  const actionContext = {};
  await auricruxActions(actionContext, {
    method: "POST",
    headers: cteHeaders,
    body: {
      mode: "execute",
      capabilityId: "campaign-pilot-launch",
      rationale: "Launch campaign to student@example.com",
    },
  });
  assert(actionContext.res?.body?.mockExecution === true, "Auricrux actions must enter mock execution for CTE students.");
  assert(actionContext.res?.body?.noLiveApis === true, "Auricrux actions must bypass all live APIs for CTE students.");
  assert(actionContext.res?.body?.blockedExternalApis?.includes("payment-gateway"), "Auricrux mock response must list blocked external APIs.");
  assert(!JSON.stringify(actionContext.res?.body || {}).includes("student@example.com"), "Auricrux mock telemetry must redact student email addresses.");

  const messageContext = {};
  await auricrux(messageContext, {
    method: "POST",
    headers: cteHeaders,
    body: { message: "Send outreach to guardian@example.com", route: "/portal/messages" },
  });
  assert(messageContext.res?.body?.mode === "auricrux-mock-execution", "Auricrux chat route must use mock execution for CTE students.");
  assert(messageContext.res?.body?.noLiveApis === true, "Auricrux chat route must bypass live APIs for CTE students.");
  assert(!JSON.stringify(messageContext.res?.body || {}).includes("guardian@example.com"), "Auricrux chat telemetry must redact embedded email addresses.");
}

async function runStripeCheck() {
  const context = {};
  await stripeCheckout(context, {
    method: "POST",
    headers: cteHeaders,
    body: { action: "plan", planKey: "startup", customerEmail: "student@example.com", uiMode: "embedded" },
  });
  assert(context.res?.body?.mockCheckout === true, "Stripe checkout must return mock checkout for CTE students.");
  assert(context.res?.body?.noLiveApis === true, "Stripe checkout must not call Stripe or Central for CTE students.");
  assert(context.res?.body?.publishableKey === "pk_cte_shadow_simulated", "Stripe checkout must expose only simulated publishable key in CTE mode.");
}

await runProxyCheck();
await runAuricruxChecks();
await runStripeCheck();
global.fetch = originalFetch;

const backendBaseSource = readSource("src/api/backendBase.js");
assert(backendBaseSource.includes('headers["x-fca-shadow-mode"] = "cte-sandbox"'), "Frontend backend headers must declare CTE sandbox mode.");
assert(backendBaseSource.includes('headers["x-fca-minor-privacy-mode"] = "true"'), "Frontend backend headers must declare minor privacy mode.");
assert(backendBaseSource.includes('headers["x-fca-auricrux-mode"] = "mock"'), "Frontend backend headers must declare Auricrux mock mode.");
assert(backendBaseSource.includes('} else if (userEmail) headers["x-fca-user-id"] = userEmail'), "Frontend must avoid sending raw email as user id for CTE shadow sessions.");

const stripeClientSource = readSource("src/api/stripeClient.js");
assert(stripeClientSource.includes("buildExecutionContextHeaders"), "Stripe client must send execution context headers so CTE checkout is shadowed.");

const proxySource = readSource("api/_lib/proxyToCentral.js");
assert(proxySource.includes("isCteShadowRequest(req)"), "Central proxy must check CTE shadow mode before live fetch.");
assert(proxySource.indexOf("isCteShadowRequest(req)") < proxySource.indexOf("const target = `${CENTRAL_API}${resourcePath}${query}`"), "Central proxy CTE check must occur before live target construction/fetch.");

const centralProxySource = readSource("api/central-proxy.js");
assert(centralProxySource.includes("isCteShadowRequest(request)"), "Azure Functions central proxy must check CTE shadow mode.");
assert(centralProxySource.indexOf("isCteShadowRequest(request)") < centralProxySource.indexOf("const requestUrl = new URL(request.url)"), "Azure Functions central proxy CTE check must occur before live target construction.");

if (failures.length > 0) {
  console.error("CTE shadow environment validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("CTE shadow environment validation passed: SaaS traffic is sandboxed, Auricrux is mocked, live APIs are blocked, and minor PII is redacted.");