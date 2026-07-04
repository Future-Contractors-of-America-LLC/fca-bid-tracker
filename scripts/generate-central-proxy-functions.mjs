import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, "api");

/** @type {Array<{ dir: string, route: string, centralPath?: string, methods?: string[], dynamic?: boolean }>} */
const PROXIES = [
  { dir: "projects", route: "projects", centralPath: "/projects" },
  {
    dir: "project-detail",
    route: "projects/{projectId}",
    dynamic: true,
    methods: ["get", "patch", "options"],
  },
  {
    dir: "project-rfis",
    route: "projects/{projectId}/rfis",
    dynamic: true,
  },
  {
    dir: "project-takeoffs",
    route: "projects/{projectId}/takeoffs",
    dynamic: true,
  },
  { dir: "bids", route: "bids", centralPath: "/bids" },
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
  { dir: "field-tasks", route: "field-tasks", centralPath: "/field-tasks" },
  { dir: "field-schedule", route: "field-schedule", centralPath: "/field-schedule" },
  { dir: "commercial-pipeline", route: "commercial-pipeline", centralPath: "/commercial-pipeline" },
  { dir: "leads", route: "leads", centralPath: "/leads" },
  { dir: "financial-workspace", route: "financial-workspace", centralPath: "/financial-workspace" },
  { dir: "portal-messages", route: "portal-messages", centralPath: "/portal-messages" },
  { dir: "portal-invoices", route: "portal-invoices", centralPath: "/portal-invoices" },
  { dir: "support-tickets", route: "support-tickets", centralPath: "/support-tickets" },
  { dir: "academy-lms", route: "academy-lms", centralPath: "/academy-lms", methods: ["get", "head", "post", "patch", "options"] },
  { dir: "auricrux", route: "auricrux", centralPath: "/auricrux", methods: ["get", "post", "options"] },
  {
    dir: "auricrux-speak",
    route: "auricrux/speak",
    centralPath: "/auricrux/speak",
    methods: ["post", "options"],
  },
  {
    dir: "auricrux-actions",
    route: "auricrux/actions",
    centralPath: "/auricrux/actions",
    methods: ["get", "post", "options"],
  },
  {
    dir: "auricrux-actions-alias",
    route: "auricrux-actions",
    centralPath: "/auricrux-actions",
    methods: ["get", "post", "options"],
  },
  {
    dir: "bid-doteach-workflow",
    route: "bid-doteach-workflow",
    centralPath: "/bid-doteach-workflow",
    methods: ["post", "options"],
  },
  {
    dir: "projects-workspace",
    route: "projects/{projectId}/workspace",
    dynamic: true,
    methods: ["get", "options"],
  },
  {
    dir: "opportunities-workspace",
    route: "opportunities/{opportunityId}/workspace",
    dynamic: true,
    methods: ["get", "options"],
  },
  {
    dir: "opportunity-convert",
    route: "opportunities/{opportunityId}/convert-to-project",
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
  console.log(`Prepared ${entry.dir} → ${entry.dynamic ? entry.route : entry.centralPath}`);
}

for (const entry of PROXIES) {
  ensureProxy(entry);
}

console.log(`Generated ${PROXIES.length} central proxy function folders.`);
