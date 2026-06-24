#!/usr/bin/env node
/** Field execution journey — design takeoff, field ops, punch, and job cost. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label) {
  const source = read(relativePath);
  if (!source.includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

const journey = [
  { step: "design", href: "/portal/design", files: ["src/pages/portal/PortalDesignWorkspace.jsx"] },
  { step: "field-tasks", href: "/portal/field-tasks", files: ["src/pages/portal/PortalFieldTasks.jsx"] },
  { step: "scheduling", href: "/portal/scheduling", files: ["src/pages/portal/PortalScheduling.jsx"] },
  { step: "punch", href: "/portal/punch", files: ["src/pages/portal/PortalPunch.jsx"] },
  { step: "job-cost", href: "/portal/job-cost", files: ["src/pages/portal/PortalJobCost.jsx"] },
];

const routes = read("src/routes.js");
for (const stop of journey) {
  if (!routes.includes(`"${stop.href}"`) && !routes.includes(`'${stop.href}'`)) {
    fail(`field route ${stop.href}`);
  } else {
    pass(`field route ${stop.href}`);
  }
  for (const file of stop.files) {
    if (!fs.existsSync(path.join(root, file))) fail(`field surface ${stop.step}`, file);
    else pass(`field surface ${stop.step}`);
  }
}

requireIncludes("src/pages/portal/PortalDesignWorkspace.jsx", "spawnTakeoff", "design workspace takeoff");
requireIncludes("src/pages/portal/PortalFieldTasks.jsx", "completeFieldTask", "field task completion");
requireIncludes("src/pages/portal/PortalScheduling.jsx", "completeFieldScheduleEvent", "schedule completion");
requireIncludes("src/pages/portal/PortalPunch.jsx", "resolvePunchMarkup", "punch resolve mutation");
requireIncludes("src/pages/portal/PortalJobCost.jsx", "postJobCostActual", "job cost actual posting");
requireIncludes("src/api/fieldOpsClient.js", "completeFieldTask", "field ops client");
requireIncludes("src/api/constructionClient.js", "postJobCostActual", "job cost client");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "field-execution-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 7, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log(`Field execution journey validation complete (${journey.length} stops).`);
