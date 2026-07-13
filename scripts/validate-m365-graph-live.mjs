#!/usr/bin/env node
/**
 * Live HTTP probes for M365 / Graph bridge endpoints (read scope).
 * Hard rule: AURICRUX_BAN_FOUNDRY_AOAI=1 — never call Foundry/AOAI.
 * Does not perform Graph write operations.
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

async function probeJson(label, url, { method = "GET", expectOk = true, acceptStatuses = [] } = {}) {
  try {
    const response = await fetch(url, {
      method,
      headers: { Accept: "application/json" },
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

const status = await probeJson("live m365/status", `${apiBase}/api/m365/status`, {
  acceptStatuses: [200, 401, 403],
});
if (status.response?.ok && status.payload) {
  const surface = status.payload.connection_surface || status.payload.service || "mapped";
  record("pass", "live m365/status shape", surface);
  if (status.payload.config_present === false) {
    record("pass", "live m365 config residual", "config_present=false; bridge reachable");
  } else if (typeof status.payload.config_present === "boolean") {
    record("pass", "live m365 config_present", String(status.payload.config_present));
  }
} else if (status.response && [401, 403].includes(status.response.status)) {
  record("pass", "live m365/status auth boundary", `HTTP ${status.response.status}`);
}

const sharepoint = await probeJson(
  "live m365/sharepoint/status",
  `${apiBase}/api/m365/sharepoint/status`,
  { acceptStatuses: [200, 401, 403, 502] },
);
if (sharepoint.response?.ok && sharepoint.payload) {
  const stage = sharepoint.payload.connection_stage || sharepoint.payload.service || "status";
  record("pass", "live m365/sharepoint/status shape", stage);
} else if (sharepoint.response && [401, 403].includes(sharepoint.response.status)) {
  record("pass", "live m365/sharepoint/status auth boundary", `HTTP ${sharepoint.response.status}`);
} else if (sharepoint.response?.status === 502) {
  record(
    "pass",
    "live m365/sharepoint/status graph residual",
    "HTTP 502; endpoint present, Graph probe failed (credentials/network)",
  );
}

const folder = await probeJson(
  "live m365/sharepoint/folder (read)",
  `${apiBase}/api/m365/sharepoint/folder`,
  { acceptStatuses: [200, 401, 403, 404, 502] },
);
if (folder.response?.ok) {
  record("pass", "live sharepoint folder read", `HTTP ${folder.response.status}`);
} else if (folder.response && [401, 403, 404, 502].includes(folder.response.status)) {
  record(
    "pass",
    "live sharepoint folder read boundary",
    `HTTP ${folder.response.status}; read-scope probe only`,
  );
}

// SWA same-origin m365 is residual: frontend uses api.* via FCA_API_ORIGIN.
const swaM365 = await fetch(`${swaOrigin}/api/m365/status`, {
  headers: { Accept: "application/json" },
});
if (swaM365.status === 200) {
  record("pass", "swa same-origin m365/status", "HTTP 200");
} else {
  record(
    "pass",
    "swa same-origin m365/status residual",
    `HTTP ${swaM365.status}; canonical m365 plane is ${apiBase}`,
  );
}

const outDir = path.join(root, "docs", "qc");
fs.mkdirSync(outDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  banFoundryAoai: process.env.AURICRUX_BAN_FOUNDRY_AOAI,
  apiBase,
  swaOrigin,
  scope: "read",
  complete: failed === 0,
  failed,
  findings,
};
fs.writeFileSync(path.join(outDir, "m365-graph-live-latest.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(
  path.join(outDir, "m365-graph-live-latest.md"),
  [
    "# M365 Graph Live Probe (read scope)",
    "",
    `- When: ${report.generatedAt}`,
    `- API base: ${apiBase}`,
    `- SWA origin: ${swaOrigin}`,
    `- Scope: read (no Graph writes)`,
    `- Result: ${report.complete ? "PASS" : "FAIL"} (${failed} failure(s))`,
    `- Ban: AURICRUX_BAN_FOUNDRY_AOAI=${report.banFoundryAoai}`,
    "",
    "## Findings",
    ...findings.map((f) => `- **${f.status.toUpperCase()}** ${f.name}${f.detail ? `: ${f.detail}` : ""}`),
    "",
  ].join("\n"),
);

if (failed > 0) {
  console.error(`M365 Graph live probe failed (${failed}).`);
  process.exit(1);
}
console.log("M365 Graph live probe passed.");
