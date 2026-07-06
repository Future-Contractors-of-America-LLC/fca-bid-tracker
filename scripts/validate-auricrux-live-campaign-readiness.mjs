import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const failures = [];
const warnings = [];

function envFlagEnabled(value = "") {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function envPresent(name) {
  return String(process.env[name] || "").trim().length > 0;
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
    return {
      source: "none",
      values: {},
      error: "Function app name/resource group is not configured.",
    };
  }

  const result = spawnSync(
    "az functionapp config appsettings list --resource-group "
      + `${resourceGroup} --name ${appName} -o json`,
    {
      cwd: root,
      shell: true,
      stdio: "pipe",
      encoding: "utf8",
      env: process.env,
      timeout: 120000,
      maxBuffer: 1024 * 1024 * 10,
    },
  );

  const timedOut = result.error?.code === "ETIMEDOUT";
  const hasError = Boolean(result.error) && !timedOut;
  const exitCode = timedOut ? 124 : (hasError ? 1 : (result.status ?? 1));
  if (exitCode !== 0) {
    const stderr = (result.stderr || "").trim();
    const stdout = (result.stdout || "").trim();
    return {
      source: `${resourceGroup}/${appName}`,
      values: {},
      error: timedOut
        ? "Timed out while reading function app settings."
        : (stderr || stdout || "Unable to read function app settings."),
    };
  }

  const data = parseJsonSafe(result.stdout || "");
  const entries = Array.isArray(data) ? data : [];
  const values = Object.fromEntries(
    entries
      .filter((entry) => entry && typeof entry.name === "string")
      .map((entry) => [entry.name, String(entry.value || "").trim()]),
  );

  return {
    source: `${resourceGroup}/${appName}`,
    values,
    error: "",
  };
}

function hydrateMissingEnvFromFunctionApp(requiredKeys) {
  const settings = readFunctionAppSettingsFromLive();
  const hydrated = [];
  for (const key of requiredKeys) {
    if (envPresent(key)) continue;
    const value = settings.values[key];
    if (!value) continue;
    process.env[key] = value;
    hydrated.push(key);
  }
  return {
    source: settings.source,
    error: settings.error,
    hydrated,
  };
}

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function expectIncludes(source, marker, filePath) {
  if (!source.includes(marker)) {
    failures.push(`${filePath} missing marker: ${marker}`);
  }
}

const requireEnv = process.argv.includes("--require-env");

const permissionSource = await read("src/lib/auricruxPermissions.js");
const safeModeSource = await read("src/lib/cteSafeModeConfig.js");
const portalAuricruxSource = await read("src/pages/portal/PortalAuricrux.jsx");
const authBoundarySource = await read("api/auth-boundary.js");
const cteSafeStoreSource = await read("api/_lib/runtime/cteSafeModeStore.js");
const securitySource = await read("api/_lib/runtime/securityHardeningControls.js");

expectIncludes(permissionSource, "VITE_FCA_FORCE_LIVE_MODE", "src/lib/auricruxPermissions.js");
expectIncludes(permissionSource, "enabledProducts?.auricrux", "src/lib/auricruxPermissions.js");
expectIncludes(safeModeSource, "VITE_FCA_FORCE_LIVE_MODE", "src/lib/cteSafeModeConfig.js");
expectIncludes(portalAuricruxSource, "VITE_AURICRUX_AUTORUN_CAMPAIGNS", "src/pages/portal/PortalAuricrux.jsx");
expectIncludes(portalAuricruxSource, "auricruxCampaignLiveReady", "src/pages/portal/PortalAuricrux.jsx");
expectIncludes(authBoundarySource, "FCA_AURICRUX_LIVE_ENABLED", "api/auth-boundary.js");
expectIncludes(cteSafeStoreSource, "FCA_FORCE_LIVE_MODE", "api/_lib/runtime/cteSafeModeStore.js");
expectIncludes(securitySource, "FCA_IMMUTABLE_AUDIT_REQUIRED", "api/_lib/runtime/securityHardeningControls.js");
expectIncludes(securitySource, "FCA_SESSION_SECRET_REQUIRED", "api/_lib/runtime/securityHardeningControls.js");

const requiredEnv = [
  "FCA_AURICRUX_LIVE_ENABLED",
  "FCA_FORCE_LIVE_MODE",
  "FCA_SESSION_SECRET",
  "FCA_IMMUTABLE_AUDIT_ENABLED",
  "FCA_IMMUTABLE_AUDIT_SINK",
  "VITE_FCA_FORCE_LIVE_MODE",
  "VITE_AURICRUX_AUTORUN_CAMPAIGNS",
];

const functionAppEnvHydration = requireEnv
  ? hydrateMissingEnvFromFunctionApp(requiredEnv)
  : { source: "none", error: "", hydrated: [] };

if (requireEnv && functionAppEnvHydration.error) {
  warnings.push(
    `Function app settings hydration unavailable from ${functionAppEnvHydration.source}: ${functionAppEnvHydration.error}`,
  );
}

const envSnapshot = Object.fromEntries(
  requiredEnv.map((name) => {
    const raw = process.env[name];
    if (!raw) return [name, "MISSING"];
    if (name.includes("SECRET") || name.includes("SINK")) return [name, "SET"];
    return [name, raw];
  }),
);

if (requireEnv) {
  for (const key of requiredEnv) {
    if (!envPresent(key)) {
      failures.push(`Missing required environment variable: ${key}`);
    }
  }

  if (envPresent("FCA_AURICRUX_LIVE_ENABLED") && !envFlagEnabled(process.env.FCA_AURICRUX_LIVE_ENABLED)) {
    failures.push("FCA_AURICRUX_LIVE_ENABLED must be enabled for live campaign runtime.");
  }

  if (envPresent("FCA_FORCE_LIVE_MODE") && !envFlagEnabled(process.env.FCA_FORCE_LIVE_MODE)) {
    failures.push("FCA_FORCE_LIVE_MODE must be enabled to override safe-mode runtime for commercial live execution.");
  }

  if (envPresent("FCA_IMMUTABLE_AUDIT_ENABLED") && !envFlagEnabled(process.env.FCA_IMMUTABLE_AUDIT_ENABLED)) {
    failures.push("FCA_IMMUTABLE_AUDIT_ENABLED must be enabled for mutating live campaign operations.");
  }

  if (envPresent("VITE_FCA_FORCE_LIVE_MODE") && !envFlagEnabled(process.env.VITE_FCA_FORCE_LIVE_MODE)) {
    failures.push("VITE_FCA_FORCE_LIVE_MODE must be enabled for frontend live campaign mode.");
  }

  if (envPresent("VITE_AURICRUX_AUTORUN_CAMPAIGNS") && !envFlagEnabled(process.env.VITE_AURICRUX_AUTORUN_CAMPAIGNS)) {
    failures.push("VITE_AURICRUX_AUTORUN_CAMPAIGNS must be enabled for campaign auto-run behavior.");
  }
}

if (!requireEnv) {
  warnings.push("Environment enforcement skipped. Re-run with --require-env before live deployment.");
}

if (warnings.length > 0) {
  console.warn("Auricrux live campaign readiness warnings:");
  for (const warning of warnings) {
    console.warn(` - ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("Auricrux live campaign readiness validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  console.error("Environment snapshot:");
  console.error(JSON.stringify(envSnapshot, null, 2));
  process.exit(1);
}

console.log("Auricrux live campaign readiness validation passed.");
console.log(JSON.stringify({
  ok: true,
  requireEnv,
  functionAppEnvHydration,
  env: envSnapshot,
}, null, 2));
