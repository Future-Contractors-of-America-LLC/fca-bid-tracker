#!/usr/bin/env node
/**
 * Runtime smoke for managed customer login + optional 2FA verification.
 * Requires FCA_MANAGED_LOGIN_EMAIL and FCA_MANAGED_LOGIN_PASSWORD in env.
 * Skips gracefully when credentials are not provided (CI-safe default).
 */
import fs from "node:fs";
import path from "node:path";
import { FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN } from "./domainHosts.constants.mjs";

const outputDir = path.join(process.cwd(), "docs", "qc");
const findings = [];
let failed = 0;
let API_BASE = process.env.FCA_API_BASE || "";

function pass(label, detail = "") {
  findings.push({ status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
}

function skip(label, detail = "") {
  findings.push({ status: "skip", label, detail });
  console.log(`SKIP: ${label}${detail ? ` — ${detail}` : ""}`);
}

async function resolveApiBase() {
  if (API_BASE) return API_BASE;
  for (const candidate of [FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN]) {
    try {
      const response = await fetch(`${candidate}/api/health`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        API_BASE = candidate;
        return API_BASE;
      }
    } catch {
      // try next candidate
    }
  }
  API_BASE = FCA_AZURE_API_FALLBACK_ORIGIN;
  return API_BASE;
}

function resolveCredentials() {
  const email = process.env.FCA_MANAGED_LOGIN_EMAIL?.trim().toLowerCase();
  const password = process.env.FCA_MANAGED_LOGIN_PASSWORD;
  if (email && password) {
    return { email, password };
  }

  const accountsPath = process.env.FCA_MANAGED_ACCOUNTS_FILE;
  if (!accountsPath || !fs.existsSync(accountsPath)) {
    return null;
  }

  const accounts = JSON.parse(fs.readFileSync(accountsPath, "utf8"));
  const account = Array.isArray(accounts) ? accounts[0] : null;
  if (!account?.email || !account?.password) {
    return null;
  }
  return { email: String(account.email).trim().toLowerCase(), password: String(account.password) };
}

function parseCookie(setCookieHeader) {
  if (!setCookieHeader) return "";
  const first = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
  return String(first).split(";")[0];
}

async function postJson(route, payload, cookie = "") {
  const headers = { Accept: "application/json", "Content-Type": "application/json" };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${API_BASE}${route}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const setCookie = response.headers.getSetCookie?.() || response.headers.get("set-cookie");
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body, cookie: parseCookie(setCookie) };
}

async function getJson(route, cookie = "") {
  const headers = { Accept: "application/json" };
  if (cookie) headers.Cookie = cookie;
  const response = await fetch(`${API_BASE}${route}`, { method: "GET", headers });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

const credentials = resolveCredentials();
if (!credentials) {
  skip("managed-customer-auth", "Set FCA_MANAGED_LOGIN_EMAIL/PASSWORD or FCA_MANAGED_ACCOUNTS_FILE to run");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "managed-customer-auth-smoke.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), skipped: true, findings }, null, 2),
  );
  process.exit(0);
}

await resolveApiBase();
console.log(`Using API base: ${API_BASE}`);

try {
  const { response: authResponse, body: authBody } = await getJson("/api/customer-auth-state");
  const boundary = authBody?.authBoundary;
  if (!authResponse.ok || !boundary?.productionAuthReady) {
    fail("customer-auth-state", `productionAuthReady=${boundary?.productionAuthReady}`);
  } else {
    pass("customer-auth-state", "productionAuthReady=true");
  }
} catch (error) {
  fail("customer-auth-state", error.message);
}

let sessionCookie = "";
try {
  const { response, body } = await postJson("/api/customer-login", {
    email: credentials.email,
    password: credentials.password,
  });

  if (response.status >= 500) {
    fail("customer-login", body?.error || `HTTP ${response.status}`);
  } else if (!response.ok || !body?.ok) {
    fail("customer-login", body?.error || `HTTP ${response.status}`);
  } else if (body.requiresVerification) {
    pass("customer-login", "requiresVerification=true");
    const code = body.devVerificationHint;
    if (!body.challengeId || !code) {
      fail(
        "customer-verify",
        "2FA required but no devVerificationHint; configure Graph mail or FCA_VERIFICATION_DEV_EXPOSE_CODE for smoke",
      );
    } else {
      const verify = await postJson("/api/customer-verify", {
        challengeId: body.challengeId,
        code,
      });
      if (!verify.response.ok || !verify.body?.ok || !verify.body?.session?.customer?.email) {
        fail("customer-verify", verify.body?.error || `HTTP ${verify.response.status}`);
      } else {
        pass("customer-verify", `session for ${verify.body.session.customer.email}`);
        sessionCookie = verify.cookie;
      }
    }
  } else if (body.session?.customer?.email) {
    pass("customer-login", `direct session for ${body.session.customer.email}`);
    sessionCookie = (await postJson("/api/customer-login", {
      email: credentials.email,
      password: credentials.password,
    })).cookie;
  } else {
    fail("customer-login", "unexpected login response shape");
  }
} catch (error) {
  fail("customer-login", error.message);
}

if (sessionCookie) {
  try {
    const { response, body } = await getJson("/api/customer-session", sessionCookie);
    const email = body?.session?.customer?.email || body?.account?.email;
    if (response.ok && body?.ok && email === credentials.email) {
      pass("customer-session", `authenticated as ${email}`);
    } else {
      fail("customer-session", body?.error || `HTTP ${response.status}`);
    }
  } catch (error) {
    fail("customer-session", error.message);
  }

  try {
    const logout = await postJson("/api/customer-logout", {}, sessionCookie);
    if (logout.response.ok && logout.body?.ok) {
      pass("customer-logout", "session cleared");
    } else {
      fail("customer-logout", logout.body?.error || `HTTP ${logout.response.status}`);
    }
  } catch (error) {
    fail("customer-logout", error.message);
  }
}

fs.mkdirSync(outputDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  apiBase: API_BASE,
  summary: { passed: findings.filter((f) => f.status === "pass").length, failed },
  findings,
};
fs.writeFileSync(path.join(outputDir, "managed-customer-auth-smoke.json"), JSON.stringify(report, null, 2));

console.log(`\n=== Managed customer auth smoke: ${report.summary.passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
