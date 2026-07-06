import { exec, execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const execAsync = promisify(exec);

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || "2d35643e-8a14-49d0-adf8-a5e8d291fc42";
const swaName = process.env.FCA_SWA_NAME || "fca-frontend";
const swaResourceGroup = process.env.FCA_SWA_RESOURCE_GROUP || "fca-frontend_group";
const functionAppName = process.env.FCA_FUNCTION_APP_NAME || "Auricrux-Central";
const functionResourceGroup = process.env.FCA_FUNCTION_RESOURCE_GROUP || "Auricrux_group";

const requiredFlags = [
  "FCA_AURICRUX_LIVE_ENABLED",
  "FCA_FORCE_LIVE_MODE",
  "FCA_IMMUTABLE_AUDIT_ENABLED",
  "VITE_FCA_FORCE_LIVE_MODE",
  "VITE_AURICRUX_AUTORUN_CAMPAIGNS",
];

const requiredSecretLike = [
  "FCA_SESSION_SECRET",
  "FCA_IMMUTABLE_AUDIT_SINK",
];

const azCandidates = [
  process.env.AZ_CLI_PATH,
  "C:/Program Files (x86)/Microsoft SDKs/Azure/CLI2/wbin/az.cmd",
  "az",
  "az.cmd",
].filter(Boolean);

let cachedAzCliPath = null;

async function resolveAzCliPath() {
  if (cachedAzCliPath) {
    return cachedAzCliPath;
  }

  for (const candidate of azCandidates) {
    try {
      if (candidate === "az" || candidate === "az.cmd") {
        cachedAzCliPath = candidate;
        return cachedAzCliPath;
      }

      await fs.access(candidate);
      cachedAzCliPath = candidate;
      return cachedAzCliPath;
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error("Azure CLI executable not found. Set AZ_CLI_PATH or ensure az is on PATH.");
}

function parseJson(stdout, label) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`${label} did not return JSON: ${error.message}`);
  }
}

async function runAz(args) {
  const azCliPath = await resolveAzCliPath();

  const quote = (value) => {
    const raw = String(value);
    if (raw.length === 0) {
      return '""';
    }
    if (!/[\s"'&|<>^]/.test(raw)) {
      return raw;
    }
    return `"${raw.replaceAll('"', '\\"')}"`;
  };

  const command = [
    quote(azCliPath),
    ...args.map(quote),
    "--subscription",
    quote(subscriptionId),
  ].join(" ");

  const { stdout } = await execAsync(command, { shell: true, windowsHide: true, maxBuffer: 1024 * 1024 * 4 });
  return stdout;
}

async function listSwaAppSettings() {
  const stdout = await runAz([
    "staticwebapp",
    "appsettings",
    "list",
    "--name",
    swaName,
    "--resource-group",
    swaResourceGroup,
    "-o",
    "json",
  ]);
  return parseJson(stdout, "staticwebapp appsettings list");
}

async function listFunctionAppSettings() {
  const stdout = await runAz([
    "functionapp",
    "config",
    "appsettings",
    "list",
    "--name",
    functionAppName,
    "--resource-group",
    functionResourceGroup,
    "-o",
    "json",
  ]);
  return parseJson(stdout, "functionapp config appsettings list");
}

async function showSwa() {
  const stdout = await runAz([
    "staticwebapp",
    "show",
    "--name",
    swaName,
    "--resource-group",
    swaResourceGroup,
    "-o",
    "json",
  ]);
  return parseJson(stdout, "staticwebapp show");
}

async function showLinkedBackends() {
  const stdout = await runAz([
    "staticwebapp",
    "backends",
    "show",
    "--name",
    swaName,
    "--resource-group",
    swaResourceGroup,
    "-o",
    "json",
  ]);
  return parseJson(stdout, "staticwebapp backends show");
}

function getSettingValue(list, name) {
  if (Array.isArray(list)) {
    const entry = list.find((item) => item?.name === name);
    return entry?.value;
  }

  if (list?.properties && typeof list.properties === "object") {
    return list.properties[name];
  }

  return undefined;
}

async function probe(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "cache-control": "no-cache, no-store, max-age=0, must-revalidate",
        pragma: "no-cache",
      },
    });
    const body = await response.text();
    return {
      ok: response.ok,
      status: response.status,
      bodyPreview: body.slice(0, 120),
    };
  } catch (error) {
    return {
      ok: false,
      status: "ERR",
      bodyPreview: String(error.message),
    };
  }
}

const report = {
  ok: true,
  governance: {
    swa: {
      resource: `${swaResourceGroup}/${swaName}`,
      flags: {},
      secretLike: {},
    },
    functionApp: {
      resource: `${functionResourceGroup}/${functionAppName}`,
      flags: {},
      secretLike: {},
    },
    linkage: {
      linkedBackends: [],
      hasExpectedBackend: false,
    },
  },
  routeHealth: {
    hosts: [],
    checks: [],
  },
  failures: [],
};

const outputDir = path.join(process.cwd(), "workspace");
const outputPath = path.join(outputDir, "azure_live_governance_and_routes_report.json");

const [swaSettings, functionSettings, swa, linkedBackends] = await Promise.all([
  listSwaAppSettings(),
  listFunctionAppSettings(),
  showSwa(),
  showLinkedBackends(),
]);

for (const name of requiredFlags) {
  const swaValue = getSettingValue(swaSettings, name);
  const fnValue = getSettingValue(functionSettings, name);

  report.governance.swa.flags[name] = swaValue || "MISSING";
  report.governance.functionApp.flags[name] = fnValue || "MISSING";

  if (String(swaValue || "") !== "1") {
    report.failures.push(`SWA setting ${name} is not enabled (expected 1).`);
  }

  if (String(fnValue || "") !== "1") {
    report.failures.push(`Function App setting ${name} is not enabled (expected 1).`);
  }
}

for (const name of requiredSecretLike) {
  const swaSet = Boolean(getSettingValue(swaSettings, name));
  const fnSet = Boolean(getSettingValue(functionSettings, name));

  report.governance.swa.secretLike[name] = swaSet;
  report.governance.functionApp.secretLike[name] = fnSet;

  if (!swaSet) {
    report.failures.push(`SWA setting ${name} is missing.`);
  }

  if (!fnSet) {
    report.failures.push(`Function App setting ${name} is missing.`);
  }
}

const backendArray = Array.isArray(linkedBackends) ? linkedBackends : [];
report.governance.linkage.linkedBackends = backendArray.map((backend) => ({
  name: backend?.name,
  provisioningState: backend?.provisioningState,
  backendResourceId: backend?.backendResourceId,
}));

const expectedBackendId = `/subscriptions/${subscriptionId}/resourceGroups/${functionResourceGroup}/providers/Microsoft.Web/sites/${functionAppName}`.toLowerCase();
report.governance.linkage.hasExpectedBackend = backendArray.some(
  (backend) => String(backend?.backendResourceId || "").toLowerCase() === expectedBackendId,
);

if (!report.governance.linkage.hasExpectedBackend) {
  report.failures.push("SWA is not linked to the expected Function App backend.");
}

const hosts = [
  swa?.defaultHostname,
  ...(Array.isArray(swa?.customDomains) ? swa.customDomains : []),
].filter(Boolean);

report.routeHealth.hosts = hosts;

const routeChecks = [
  "/",
  "/deployment-status.json",
  "/api/customer-auth-state",
  "/api/academy-lms?view=summary",
];

for (const host of hosts) {
  for (const route of routeChecks) {
    const result = await probe(`https://${host}${route}`);
    report.routeHealth.checks.push({
      host,
      route,
      ...result,
    });

    if (route.startsWith("/api/")) {
      if (result.status === 404 || result.status === "ERR") {
        report.failures.push(`API route ${route} failed on ${host} with status ${result.status}.`);
      }
    } else if (route === "/" || route === "/deployment-status.json") {
      if (!result.ok) {
        report.failures.push(`Core route ${route} failed on ${host} with status ${result.status}.`);
      }
    }
  }
}

if (report.failures.length > 0) {
  report.ok = false;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

console.log(JSON.stringify(report, null, 2));
console.log(`Report written to ${outputPath}`);

if (!report.ok) {
  process.exit(1);
}
