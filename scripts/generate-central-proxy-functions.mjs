import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, "api");

/** @type {Array<{ dir: string, route: string, centralPath: string, methods?: string[], dynamic?: boolean }>} */
const PROXIES = [
  { dir: "estimates", route: "estimates", centralPath: "/estimates" },
  { dir: "proposals", route: "proposals", centralPath: "/proposals" },
  { dir: "files", route: "files", centralPath: "/files" },
  { dir: "files-summary", route: "files/summary", centralPath: "/files/summary", methods: ["get", "options"] },
  { dir: "workflow-audit", route: "workflow-audit", centralPath: "/workflow-audit", methods: ["get", "options"] },
  { dir: "audit-events-summary", route: "audit-events/summary", centralPath: "/audit-events/summary", methods: ["get", "options"] },
  { dir: "billing-summary", route: "billing-summary", centralPath: "/billing-summary", methods: ["get", "options"] },
  { dir: "change-orders", route: "change-orders", centralPath: "/change-orders" },
  { dir: "pay-apps", route: "pay-apps", centralPath: "/pay-apps" },
  { dir: "closeout-packages", route: "closeout-packages", centralPath: "/closeout-packages" },
  { dir: "warranty-cases", route: "warranty-cases", centralPath: "/warranty-cases" },
  { dir: "remediation-links", route: "remediation-links", centralPath: "/remediation-links" },
  {
    dir: "academy-remediation-summary",
    route: "academy/remediation-summary",
    centralPath: "/academy/remediation-summary",
    methods: ["get", "options"],
  },
  { dir: "job-cost", route: "job-cost", centralPath: "/job-cost" },
  { dir: "field-photos", route: "field-photos", centralPath: "/field-photos" },
  { dir: "commercial-pipeline", route: "commercial-pipeline", centralPath: "/commercial-pipeline" },
  { dir: "leads", route: "leads", centralPath: "/leads" },
  {
    dir: "projects-workspace",
    route: "projects/{projectId}/workspace",
    centralPath: null,
    dynamic: true,
    methods: ["get", "options"],
  },
  {
    dir: "opportunities-workspace",
    route: "opportunities/{opportunityId}/workspace",
    centralPath: null,
    dynamic: true,
    methods: ["get", "options"],
  },
  {
    dir: "opportunity-convert",
    route: "opportunities/{opportunityId}/convert-to-project",
    centralPath: null,
    dynamic: true,
    methods: ["post", "options"],
  },
];

const DEFAULT_METHODS = ["get", "post", "patch", "options"];

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function ensureProxy(entry) {
  const methods = entry.methods || DEFAULT_METHODS;
  const targetDir = path.join(apiRoot, entry.dir);
  fs.mkdirSync(targetDir, { recursive: true });

  const indexSource = entry.dynamic
    ? `const { createCentralPathProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards dynamic route → Auricrux Central. */
module.exports = createCentralPathProxy();
`
    : `const { createCentralProxy } = require("../_lib/proxyToCentral");

/** SWA proxy: forwards /api/${entry.route} → Auricrux Central ${entry.centralPath}. */
module.exports = createCentralProxy("${entry.centralPath}");
`;

  writeJson(path.join(targetDir, "function.json"), {
    bindings: [
      {
        authLevel: "anonymous",
        type: "httpTrigger",
        direction: "in",
        name: "req",
        methods,
        route: entry.route,
      },
      { type: "http", direction: "out", name: "res" },
    ],
  });

  fs.writeFileSync(path.join(targetDir, "index.js"), indexSource, "utf8");
  console.log(`Prepared ${entry.dir} → ${entry.dynamic ? "dynamic path" : entry.centralPath}`);
}

for (const entry of PROXIES) {
  ensureProxy(entry);
}

console.log(`Generated ${PROXIES.length} central proxy function folders.`);
