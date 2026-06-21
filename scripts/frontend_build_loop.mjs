import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const NODE = process.execPath;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SYSTEM_DIR = path.join(ROOT, "auricrux", "system");
const LOOP_RUNS_DIR = path.join(SYSTEM_DIR, "loop_runs");
const STATE_FILE = path.join(SYSTEM_DIR, "frontend_loop_state.json");
const RECEIPT_FILE = path.join(SYSTEM_DIR, "last_frontend_loop_receipt.json");

function utcNow() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function runValidator(script) {
  const scriptPath = path.join(ROOT, "scripts", script);
  if (!fs.existsSync(scriptPath)) {
    return { script, ok: false, skipped: true, reason: "missing-script" };
  }
  try {
    execSync(`"${NODE}" "${scriptPath}"`, { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
    return { script, ok: true };
  } catch (error) {
    return {
      script,
      ok: false,
      reason: "validation-failed",
      detail: String(error.stdout || error.stderr || error.message).slice(0, 500),
    };
  }
}

function runSpaBuild() {
  try {
    execSync(`"${NODE}" node_modules/vite/bin/vite.js build`, { cwd: ROOT, stdio: "pipe", encoding: "utf8" });
    return { step: "build:spa", ok: true };
  } catch (error) {
    return {
      step: "build:spa",
      ok: false,
      reason: "spa-build-failed",
      detail: String(error.stdout || error.stderr || error.message).slice(0, 500),
    };
  }
}

function main() {
  ensureDir(LOOP_RUNS_DIR);

  const validators = ["validate-routes.mjs", "validate-finance-workspace.mjs", "validate-portal-ux-sweep.mjs"];
  const results = validators.map(runValidator);
  const buildResult = runSpaBuild();
  results.push(buildResult);
  const ok = results.every((r) => r.ok || r.skipped);

  const state = readJson(STATE_FILE, { runCount: 0 });
  state.runCount = (state.runCount || 0) + 1;
  state.lastRunUtc = utcNow();
  state.lastOk = ok;
  state.validators = results;
  writeJson(STATE_FILE, state);

  const receipt = {
    loopId: "frontend-build",
    generatedUtc: utcNow(),
    ok,
    summary: `Frontend build loop run ${state.runCount}: ${results.filter((r) => r.ok).length}/${results.length} validators passed.`,
    metrics: {
      runCount: state.runCount,
      passed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok && !r.skipped).length,
    },
    details: { results },
  };

  const stamp = receipt.generatedUtc.replace(/[:.-]/g, "");
  writeJson(path.join(LOOP_RUNS_DIR, `frontend-build-${stamp}.json`), receipt);
  writeJson(RECEIPT_FILE, receipt);

  console.log(receipt.summary);
  if (!ok) process.exit(1);
}

main();
