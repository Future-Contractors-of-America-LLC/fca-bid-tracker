/**
 * Optional cross-repo central academy artifact verification (Observe phase 4).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { resolveCentralRoot } from "./fcaCentralRoot.mjs";

/**
 * @param {string} root
 * @param {{ log?: boolean }} [options]
 */
export function runCentralArtifactCheck(root, options = {}) {
  const log = options.log !== false;
  const steps = [];
  const centralRoot = resolveCentralRoot(root);
  const scriptPath = path.join(centralRoot, "scripts", "verify_academy_media.py");
  const markerPath = path.join(centralRoot, "FCA_COVERAGE_MATRIX.md");

  if (!fs.existsSync(markerPath)) {
    steps.push({
      name: "Central academy artifacts",
      status: "pass",
      detail: "skipped ù auricrux-central sibling not present",
      phase: "central-artifacts",
    });
    if (log) console.log("SKIP: Central academy artifacts ù auricrux-central not available");
    return { steps, skipped: true };
  }

  if (!fs.existsSync(scriptPath)) {
    steps.push({
      name: "Central academy artifacts",
      status: "fail",
      detail: "verify_academy_media.py missing in auricrux-central",
      phase: "central-artifacts",
    });
    if (log) console.error("FAIL: Central academy artifacts ù script missing");
    return { steps, skipped: false };
  }

  const result = spawnSync("python", [scriptPath, "--artifacts-only"], {
    cwd: centralRoot,
    stdio: log ? "inherit" : "pipe",
    encoding: "utf8",
  });

  const detail =
    result.status === 0
      ? "verify_academy_media.py --artifacts-only"
      : (result.stderr || result.stdout || "verify_academy_media failed").trim().slice(0, 300);

  if (result.status === 0) {
    steps.push({
      name: "Central academy artifacts",
      status: "pass",
      detail: "verify_academy_media.py --artifacts-only",
      phase: "central-artifacts",
    });
    if (log) console.log("PASS: Central academy artifacts");
  } else {
    steps.push({
      name: "Central academy artifacts",
      status: "fail",
      detail,
      phase: "central-artifacts",
    });
    if (log) console.error("FAIL: Central academy artifacts");
  }

  return { steps, skipped: false };
}
