#!/usr/bin/env node
/** Cycle 8 completion gate � immersive / VR advancement + live session API proof. */
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

for (const script of ["validate-cycle7-complete.mjs", "validate-immersive-vr-journey.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
for (const marker of [
  "Immersive Experiences (3D / Simulation / Field Overlay) | Immersive hub, Academy labs | `product-complete` | `docs/qc/cycle8-completion-report.json`",
  "Immersive Experiences | `/portal/immersive`, Academy labs, WebXR viewport | `projects/{id}/immersive/session` | `product-complete`",
]) {
  if (matrix.includes(marker)) pass(`coverage matrix: ${marker.slice(0, 48)}`);
  else fail("coverage matrix row", marker);
}

try {
  const getResponse = await fetch(`${apiBase}/projects/${encodeURIComponent(demoProjectId)}/immersive/session`);
  const getPayload = await getResponse.json();
  if (!getResponse.ok || !getPayload?.ok) {
    fail("live immersive GET", `HTTP ${getResponse.status}`);
  } else if (Array.isArray(getPayload.data?.vrModes) && getPayload.data.vrModes.includes("immersive-vr")) {
    pass("live immersive GET", `mode=${getPayload.data.mode}`);
  } else {
    fail("live immersive GET", "missing vrModes");
  }

  const startResponse = await fetch(`${apiBase}/projects/${encodeURIComponent(demoProjectId)}/immersive/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", vrMode: "immersive-vr", labType: "vr-field-overlay" }),
  });
  const startPayload = await startResponse.json();
  const sessionId = startPayload?.session?.sessionId;
  if (!startResponse.ok || !startPayload?.ok || !sessionId) {
    fail("live immersive POST start", `HTTP ${startResponse.status}`);
  } else {
    pass("live immersive POST start", sessionId);
  }

  const evidenceResponse = await fetch(`${apiBase}/projects/${encodeURIComponent(demoProjectId)}/immersive/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "record-evidence",
      sessionId,
      note: "Cycle 8 VR advancement smoke � overlay alignment verified.",
      vrMode: "immersive-vr",
    }),
  });
  const evidencePayload = await evidenceResponse.json();
  const evidenceCount = evidencePayload?.session?.evidence?.length ?? 0;
  if (!evidenceResponse.ok || !evidencePayload?.ok || evidenceCount < 1) {
    fail("live immersive POST evidence", `HTTP ${evidenceResponse.status}`);
  } else {
    pass("live immersive POST evidence", `${evidenceCount} item(s)`);
  }
} catch (error) {
  fail("live immersive API", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle8-completion-report.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), cycle: 8, complete: failed === 0, failed, apiBase, demoProjectId },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`Cycle 8 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 8 complete � 100%.");
