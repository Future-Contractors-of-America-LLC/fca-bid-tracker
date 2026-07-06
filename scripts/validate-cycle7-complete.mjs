#!/usr/bin/env node
/** Cycle 7 completion gate � field execution shells (takeoff, field ops, punch, job cost) + live API proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");
const demoProjectId = process.env.FCA_DEMO_PROJECT_ID || "A-117";

let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  console.log(`PASS: ${label}${detail ? ` � ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` � ${detail}` : ""}`);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return false;
  }
  pass(label, relativePath);
  return true;
}

for (const script of ["validate-cycle6-complete.mjs", "validate-field-execution-journey.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

requireIncludes("field-tasks/__init__.py", "complete_field_task", "central field task completion", centralRoot);
requireIncludes("field-schedule/__init__.py", "_post_job_cost_actual", "central schedule job cost bridge", centralRoot);
requireIncludes("job-cost/__init__.py", "_post_job_cost_actual", "central job cost POST", centralRoot);
requireIncludes("function_app.py", "api_project_takeoffs", "central project takeoffs route", centralRoot);

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
for (const marker of [
  "Takeoff / Quantity | Estimating / takeoff | `product-complete` | `docs/qc/cycle7-completion-report.json`",
  "Scheduling / Field Execution | Execution control | `product-complete` | `docs/qc/cycle7-completion-report.json`",
  "QC / Punch | Quality module | `product-complete` | `docs/qc/cycle7-completion-report.json`",
  "Job Cost / Accounting | Finance | `product-complete` | `docs/qc/cycle7-completion-report.json`",
]) {
  if (matrix.includes(marker)) pass(`coverage matrix: ${marker.slice(0, 40)}`);
  else fail("coverage matrix row", marker);
}

async function checkLiveList(route, label) {
  const urls = [
    `${apiBase}/${route}?projectId=${encodeURIComponent(demoProjectId)}`,
    `${apiBase}/${route}`,
  ];

  let lastError = null;

  for (const [urlIndex, url] of urls.entries()) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          lastError = `HTTP ${response.status}`;
          if (response.status >= 500 && attempt < 3) {
            await wait(500 * attempt);
            continue;
          }
          break;
        }

        const payload = await response.json();
        if (payload.ok !== true || !Array.isArray(payload.items)) {
          lastError = "unexpected payload";
          break;
        }

        const detailPrefix = urlIndex === 0 ? `project=${demoProjectId}, ` : "fallback, ";
        pass(`live ${label}`, `${detailPrefix}${payload.count ?? payload.items.length} item(s)`);
        return;
      } catch (error) {
        lastError = error.message;
        if (attempt < 3) {
          await wait(500 * attempt);
          continue;
        }
      }
    }
  }

  fail(`live ${label}`, lastError || "unavailable");
}

await checkLiveList("field-tasks", "field-tasks");
await checkLiveList("field-schedule", "field-schedule");
await checkLiveList("job-cost", "job-cost");

try {
  const response = await fetch(`${apiBase}/projects/${encodeURIComponent(demoProjectId)}/takeoffs`);
  if (!response.ok) {
    fail("live takeoffs", `HTTP ${response.status}`);
  } else {
    const payload = await response.json();
    const items = payload?.data?.items ?? payload?.items;
    if (payload.ok === true || payload.success === true || Array.isArray(items)) {
      pass("live takeoffs", `${items?.length ?? 0} item(s)`);
    } else {
      fail("live takeoffs", "unexpected payload");
    }
  }
} catch (error) {
  fail("live takeoffs", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle7-completion-report.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), cycle: 7, complete: failed === 0, failed, apiBase, demoProjectId },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`Cycle 7 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 7 complete � 100%.");
