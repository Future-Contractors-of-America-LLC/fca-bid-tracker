#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const commandTimeoutMs = Number(process.env.FCA_CLAIM_CERTAINTY_TIMEOUT_MS || 600000);
const integrityReportMaxAgeMinutes = Number(process.env.FCA_CLAIM_CERTAINTY_INTEGRITY_REPORT_MAX_AGE_MINUTES || 180);

function getFreshIntegrityStatusFromReport() {
  const reportPath = path.join(outputDir, "fca-total-integrity-report.json");
  if (!fs.existsSync(reportPath)) {
    return { usable: false, reason: "No existing integrity report found." };
  }

  const reportRaw = fs.readFileSync(reportPath, "utf8");
  const report = parseJsonSafe(reportRaw);
  if (!report || typeof report !== "object") {
    return { usable: false, reason: "Integrity report is not valid JSON." };
  }

  const generatedAt = Date.parse(String(report.generatedAt || ""));
  if (!Number.isFinite(generatedAt)) {
    return { usable: false, reason: "Integrity report missing generatedAt timestamp." };
  }

  const maxAgeMs = integrityReportMaxAgeMinutes * 60 * 1000;
  const ageMs = Date.now() - generatedAt;
  if (maxAgeMs > 0 && ageMs > maxAgeMs) {
    return {
      usable: false,
      reason: `Integrity report is stale (${Math.round(ageMs / 60000)}m old; max ${integrityReportMaxAgeMinutes}m).`,
    };
  }

  const status = String(report.status || "").trim().toUpperCase();
  if (!status) {
    return { usable: false, reason: "Integrity report missing status." };
  }

  return {
    usable: true,
    pass: status === "PASS",
    detail: `Integrity report status ${status} from ${new Date(generatedAt).toISOString()} (${Math.round(ageMs / 60000)}m old).`,
  };
}

function run(command, cwd = root) {
  const startedAt = Date.now();
  console.log(`[claim-certainty] running: ${command}`);
  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
    timeout: commandTimeoutMs,
    maxBuffer: 1024 * 1024 * 20,
  });

  const durationMs = Date.now() - startedAt;
  const timedOut = result.error?.code === "ETIMEDOUT";
  const hasSpawnError = Boolean(result.error) && !timedOut;
  const exitCode = timedOut ? 124 : (hasSpawnError ? 1 : (result.status ?? 1));

  let stderr = (result.stderr || "").trim();
  if (timedOut) {
    stderr = `Timed out after ${commandTimeoutMs}ms. ${stderr}`.trim();
  } else if (hasSpawnError) {
    stderr = `${result.error.message || "Command execution failed."} ${stderr}`.trim();
  }

  console.log(`[claim-certainty] finished: ${command} => ${exitCode} (${durationMs}ms)`);

  return {
    command,
    exitCode,
    stdout: (result.stdout || "").trim(),
    stderr,
    durationMs,
    timedOut,
  };
}

function runStrictIntegrityWithTimeoutAlignment() {
  const inherited = Number(process.env.FCA_TOTAL_INTEGRITY_CHECK_TIMEOUT_MS || 0);
  const alignedTimeoutMs = Number(process.env.FCA_CLAIM_CERTAINTY_STRICT_INTEGRITY_TIMEOUT_MS || 1200000);
  const strictIntegrityTimeoutMs = Math.max(inherited, alignedTimeoutMs);
  const childProcessTimeoutMs = Number(
    process.env.FCA_CLAIM_CERTAINTY_STRICT_INTEGRITY_COMMAND_TIMEOUT_MS
      || Math.max(commandTimeoutMs, strictIntegrityTimeoutMs + 120000),
  );
  const mergedEnv = {
    ...process.env,
    FCA_TOTAL_INTEGRITY_CHECK_TIMEOUT_MS: String(strictIntegrityTimeoutMs),
  };

  const startedAt = Date.now();
  const command = "node scripts/validate-fca-total-integrity.mjs";
  console.log(
    `[claim-certainty] running: ${command} `
      + `(FCA_TOTAL_INTEGRITY_CHECK_TIMEOUT_MS=${strictIntegrityTimeoutMs}, timeout=${childProcessTimeoutMs})`,
  );
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    stdio: "pipe",
    encoding: "utf8",
    env: mergedEnv,
    timeout: childProcessTimeoutMs,
    maxBuffer: 1024 * 1024 * 20,
  });

  const durationMs = Date.now() - startedAt;
  const timedOut = result.error?.code === "ETIMEDOUT";
  const hasSpawnError = Boolean(result.error) && !timedOut;
  const exitCode = timedOut ? 124 : (hasSpawnError ? 1 : (result.status ?? 1));

  let stderr = (result.stderr || "").trim();
  if (timedOut) {
    stderr = `Timed out after ${childProcessTimeoutMs}ms. ${stderr}`.trim();
  } else if (hasSpawnError) {
    stderr = `${result.error.message || "Command execution failed."} ${stderr}`.trim();
  }

  console.log(`[claim-certainty] finished: ${command} => ${exitCode} (${durationMs}ms)`);

  return {
    command,
    exitCode,
    stdout: (result.stdout || "").trim(),
    stderr,
    durationMs,
    timedOut,
  };
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readFunctionAppSettingsFromLive() {
  const appName = (process.env.FCA_READINESS_FUNCTIONAPP_NAME || "Auricrux-Central").trim();
  const resourceGroup = (process.env.FCA_READINESS_FUNCTIONAPP_RG || "Auricrux_group").trim();
  if (!appName || !resourceGroup) {
    return { source: "none", values: {}, names: new Set(), error: "Function app not configured for evidence read." };
  }

  const cmd = `az functionapp config appsettings list --resource-group ${resourceGroup} --name ${appName} -o json`;
  const result = run(cmd);
  if (result.exitCode !== 0) {
    return {
      source: `${resourceGroup}/${appName}`,
      values: {},
      names: new Set(),
      error: result.stderr || result.stdout || "Unable to read function app settings.",
    };
  }

  const data = parseJsonSafe(result.stdout);
  const entries = Array.isArray(data) ? data : [];
  const values = Object.fromEntries(
    entries
      .filter((entry) => entry && typeof entry.name === "string")
      .map((entry) => [entry.name, String(entry.value || "").trim()]),
  );

  return {
    source: `${resourceGroup}/${appName}`,
    values,
    names: new Set(Object.keys(values)),
    error: "",
  };
}

function evaluateM365GraphConnection() {
  const appSettings = readFunctionAppSettingsFromLive();
  if (appSettings.error) {
    return {
      pass: false,
      detail: `Function app settings read failed for ${appSettings.source}: ${appSettings.error}`,
    };
  }

  const requiredSettingNames = [
    "FCA_TENANT_ID",
    "FCA_TENANT_PRIMARY_DOMAIN",
    "FCA_CLIENT_ID",
    "FCA_CLIENT_SECRET",
  ];
  const missingNames = requiredSettingNames.filter((name) => !appSettings.names.has(name));

  const verifyCentral = run("node scripts/verify-central-api.mjs");
  const customerVerifyRoutePresent = verifyCentral.exitCode === 0 && /OK\s+customer_verify_route/i.test(verifyCentral.stdout);

  if (missingNames.length || !customerVerifyRoutePresent) {
    const parts = [];
    if (missingNames.length) {
      parts.push(`Missing app settings: ${missingNames.join(", ")}`);
    }
    if (!customerVerifyRoutePresent) {
      parts.push("customer_verify_route check not confirmed in verify-central-api output");
    }
    return {
      pass: false,
      detail: `M365/Graph connection not proven via ${appSettings.source}. ${parts.join("; ")}`,
    };
  }

  return {
    pass: true,
    detail: `M365/Graph connection readiness proven via ${appSettings.source} settings and customer_verify_route health.`,
  };
}

const checks = [];

const cachedIntegrity = getFreshIntegrityStatusFromReport();
if (cachedIntegrity.usable) {
  checks.push({
    id: "strict-integrity",
    required: true,
    pass: cachedIntegrity.pass,
    detail: cachedIntegrity.detail,
  });
} else {
  const integrity = runStrictIntegrityWithTimeoutAlignment();
  checks.push({
    id: "strict-integrity",
    required: true,
    pass: integrity.exitCode === 0,
    detail: integrity.exitCode === 0
      ? "Strict integrity passed via live execution."
      : (integrity.stderr || integrity.stdout || `Strict integrity failed via live execution. ${cachedIntegrity.reason}`),
  });
}

const finance = run("node scripts/validate-finance-ops-readiness.mjs");
checks.push({
  id: "finance-ops-readiness",
  required: true,
  pass: finance.exitCode === 0,
  detail: finance.exitCode === 0 ? "Finance operations readiness passed." : (finance.stderr || finance.stdout || "Finance operations readiness failed."),
});

const m365Graph = evaluateM365GraphConnection();

checks.push({
  id: "m365-graph-connection-certainty",
  required: true,
  pass: m365Graph.pass,
  detail: m365Graph.detail,
});

const requiredFailed = checks.filter((item) => item.required && !item.pass);
const status = requiredFailed.length === 0 ? "PASS" : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status,
  checks,
  requiredFailed: requiredFailed.map((item) => ({ id: item.id, detail: item.detail })),
};

fs.writeFileSync(path.join(outputDir, "claim-certainty-report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# Claim Certainty Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  "",
  "## Checks",
  ...checks.map((item) => `- ${item.pass ? "PASS" : "FAIL"} ${item.id}: ${item.detail}`),
  "",
  "## Blocking Items",
  ...(requiredFailed.length ? requiredFailed.map((item) => `- ${item.id}: ${item.detail}`) : ["- none"]),
  "",
  "## Notes",
  "- This validator treats identity certainty as M365/Graph connection readiness in Auricrux-Central settings and customer verification route health.",
  "- A PASS means strict integrity, finance ops readiness, and M365/Graph connection certainty all passed together.",
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "claim-certainty-report.md"), markdown + "\n");

if (status !== "PASS") {
  console.error(`Claim certainty failed (${requiredFailed.length} required checks blocked).`);
  process.exit(1);
}

console.log("Claim certainty validation passed.");
