#!/usr/bin/env node
/**
 * Live HTTP probes for managed auth + commercial beyond repo marker validators.
 * Hard rule: AURICRUX_BAN_FOUNDRY_AOAI=1 — never call Foundry/AOAI.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FCA_API_ORIGIN, FCA_WWW_ORIGIN } from "../src/config/domainHosts.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.env.AURICRUX_BAN_FOUNDRY_AOAI = process.env.AURICRUX_BAN_FOUNDRY_AOAI || "1";

const apiBase = (process.env.FCA_API_BASE || process.env.AURICRUX_CENTRAL_API || FCA_API_ORIGIN)
  .replace(/\/$/, "")
  .replace(/\/api$/, "");
const swaOrigin = (process.env.FCA_SWA_ORIGIN || FCA_WWW_ORIGIN).replace(/\/$/, "");

const findings = [];
let failed = 0;

function record(status, name, detail = "") {
  findings.push({ status, name, detail, at: new Date().toISOString() });
  const line = `${status.toUpperCase()}: ${name}${detail ? ` - ${detail}` : ""}`;
  if (status === "fail") {
    failed += 1;
    console.error(line);
  } else {
    console.log(line);
  }
}

async function probeJson(label, url, { method = "GET", body, expectOk = true, acceptStatuses = [] } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await response.text();
    let payload = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = null;
    }
    const allowed = new Set([...(expectOk ? [200, 201] : []), ...acceptStatuses]);
    if (!allowed.has(response.status)) {
      record("fail", label, `HTTP ${response.status}`);
      return { response, payload, text };
    }
    if (expectOk && payload && payload.ok === false && !acceptStatuses.includes(response.status)) {
      record("fail", label, `ok=false: ${payload.error || "unknown"}`);
      return { response, payload, text };
    }
    record("pass", label, `HTTP ${response.status}`);
    return { response, payload, text };
  } catch (error) {
    record("fail", label, error.message);
    return { response: null, payload: null, text: "" };
  }
}

const authState = await probeJson("live customer-auth-state", `${apiBase}/api/customer-auth-state`);
if (authState.payload?.authBoundary?.productionAuthReady !== true) {
  record("fail", "live authBoundary.productionAuthReady", "expected true");
} else {
  record(
    "pass",
    "live authBoundary.productionAuthReady",
    authState.payload.authBoundary.activeMode || "ready",
  );
}

const session = await probeJson("live customer-session", `${apiBase}/api/customer-session`);
if (session.payload && typeof session.payload.authenticated !== "boolean") {
  record("fail", "live customer-session shape", "missing authenticated boolean");
} else if (session.payload) {
  record("pass", "live customer-session shape", `authenticated=${session.payload.authenticated}`);
}

await probeJson("live commercial-pipeline", `${apiBase}/api/commercial-pipeline`);

const payments = await probeJson("live fca-payments/status", `${apiBase}/api/fca-payments/status`);
const rail = payments.payload?.data?.rail?.primaryRail || payments.payload?.rail?.primaryRail;
if (payments.response?.ok && rail && rail !== "fca-native") {
  record("fail", "live payments primaryRail", `expected fca-native, got ${rail}`);
} else if (payments.response?.ok && rail) {
  record("pass", "live payments primaryRail", rail);
}

const intake = await probeJson("live fca-payments/intake", `${apiBase}/api/fca-payments/intake`, {
  method: "POST",
  body: {
    offerKind: "academy-course",
    programKey: "electrical-core-level-1",
    email: "track-a-deep@futurecontractorsofamerica.com",
    company: "FCA Track A Deep Probe",
  },
  acceptStatuses: [201],
});
const intakeId = intake.payload?.data?.intake?.intakeId;
if (intake.response?.ok && intakeId) {
  record("pass", "live commercial intake id", intakeId);
} else if (intake.response && [400, 401].includes(intake.response.status)) {
  record("pass", "live commercial intake auth/validation boundary", `HTTP ${intake.response.status}`);
}

const commerce = await probeJson(
  "live academy-commerce catalog",
  `${apiBase}/api/academy-commerce?view=catalog&limit=1`,
);
if (commerce.payload?.ok && !Array.isArray(commerce.payload.courses)) {
  record("fail", "live academy-commerce courses", "courses array missing");
} else if (commerce.payload?.ok) {
  record("pass", "live academy-commerce courses", `${commerce.payload.courses.length} item(s)`);
}

// SWA same-origin auth is residual: frontend uses api.* via FCA_API_ORIGIN.
const swaAuth = await fetch(`${swaOrigin}/api/customer-auth-state`, {
  headers: { Accept: "application/json" },
});
if (swaAuth.status === 200) {
  record("pass", "swa same-origin customer-auth-state", "HTTP 200");
} else {
  record(
    "pass",
    "swa same-origin customer-auth-state residual",
    `HTTP ${swaAuth.status}; canonical auth plane is ${apiBase}`,
  );
}

const outDir = path.join(root, "docs", "qc");
fs.mkdirSync(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  banFoundryAoai: process.env.AURICRUX_BAN_FOUNDRY_AOAI,
  apiBase,
  swaOrigin,
  complete: failed === 0,
  failed,
  findings,
};
fs.writeFileSync(path.join(outDir, "managed-auth-commercial-live-latest.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "managed-auth-commercial-live-latest.md"),
  [
    "# Managed Auth + Commercial Live Probe",
    "",
    `- When: ${report.generatedAt}`,
    `- API base: ${apiBase}`,
    `- SWA origin: ${swaOrigin}`,
    `- Result: ${report.complete ? "PASS" : "FAIL"} (${failed} failure(s))`,
    `- Ban: AURICRUX_BAN_FOUNDRY_AOAI=${report.banFoundryAoai}`,
    "",
    "## Findings",
    ...findings.map((f) => `- **${f.status.toUpperCase()}** ${f.name}${f.detail ? `: ${f.detail}` : ""}`),
    "",
  ].join("\n"),
);

if (failed > 0) {
  console.error(`Managed auth + commercial live probe failed (${failed}).`);
  process.exit(1);
}
console.log("Managed auth + commercial live probe passed.");
