#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const steps = [
  {
    label: "Flat handler proxy alignment",
    command: "node",
    args: ["scripts/validate-flat-api-proxy-alignment.mjs"],
  },
  {
    label: "Prepare api_generated",
    command: "node",
    args: ["scripts/prepare-api-functions.mjs"],
  },
  {
    label: "Build frontend + post-build packaging",
    command: "npm",
    args: ["run", "build"],
  },
  {
    label: "Central API connectivity check",
    command: "node",
    args: ["scripts/verify-central-api.mjs"],
    softFail: true,
  },
  {
    label: "Central spine bounded smoke",
    command: "node",
    args: ["scripts/smoke-central-spine.mjs"],
    softFail: true,
  },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const qcDir = path.resolve(__dirname, "../docs/qc");
const summaryFile = path.resolve(qcDir, "boundary-hardening-lane.json");

function parseArgs(argv) {
  const options = {
    cycles: 1,
    failOnSoft: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === "--cycles" || token === "-c") {
      const next = argv[i + 1];
      const parsed = Number.parseInt(next, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("Invalid value for --cycles. Use a positive integer.");
      }
      options.cycles = parsed;
      i += 1;
      continue;
    }
    if (token === "--fail-on-soft") {
      options.failOnSoft = true;
      continue;
    }
    if (token === "--help" || token === "-h") {
      console.log("Usage: node scripts/run-boundary-hardening-lane.mjs [--cycles <n>] [--fail-on-soft]");
      process.exit(0);
    }
    throw new Error(`Unknown argument: ${token}`);
  }

  return options;
}

function runStep(step, softFailures) {
  console.log(`\n== ${step.label} ==`);
  const isWindowsNpm = process.platform === "win32" && step.command === "npm";
  const command = isWindowsNpm ? "cmd.exe" : step.command;
  const args = isWindowsNpm ? ["/d", "/s", "/c", [step.command, ...step.args].join(" ")] : step.args;

  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    env: process.env,
  });

  const exitCode = Number.isInteger(result.status) ? result.status : 1;
  if (exitCode !== 0) {
    if (step.softFail) {
      const message = `${step.label} failed with exit code ${exitCode}`;
      softFailures.push(message);
      console.warn(`WARN: ${message}`);
      return;
    }
    throw new Error(`${step.label} failed with exit code ${exitCode}`);
  }
}

function writeSummary(summary) {
  mkdirSync(qcDir, { recursive: true });
  writeFileSync(summaryFile, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();
  const allSoftFailures = [];
  const cycleSummaries = [];

  for (let cycle = 1; cycle <= options.cycles; cycle += 1) {
    const cycleStartedAt = Date.now();
    const softFailures = [];
    console.log(`\n---- Boundary hardening cycle ${cycle}/${options.cycles} ----`);

    for (const step of steps) {
      runStep(step, softFailures);
    }

    const cycleElapsedSeconds = Math.round((Date.now() - cycleStartedAt) / 1000);
    cycleSummaries.push({
      cycle,
      elapsedSeconds: cycleElapsedSeconds,
      softFailures,
    });
    allSoftFailures.push(...softFailures.map((warning) => `cycle ${cycle}: ${warning}`));

    if (softFailures.length > 0) {
      console.warn(`Cycle ${cycle} completed with ${softFailures.length} warning(s).`);
      if (options.failOnSoft) {
        throw new Error(`Soft-fail checks failed during cycle ${cycle} and --fail-on-soft is enabled.`);
      }
    } else {
      console.log(`Cycle ${cycle} completed cleanly in ${cycleElapsedSeconds}s.`);
    }
  }

  const elapsedSeconds = Math.round((Date.now() - startedAt) / 1000);
  const summary = {
    generatedAt: new Date().toISOString(),
    cyclesRequested: options.cycles,
    elapsedSeconds,
    failOnSoft: options.failOnSoft,
    softFailureCount: allSoftFailures.length,
    warnings: allSoftFailures,
    cycles: cycleSummaries,
  };
  writeSummary(summary);

  if (allSoftFailures.length > 0) {
    console.warn("\nBoundary hardening lane completed with external-check warnings:");
    for (const warning of allSoftFailures) {
      console.warn(`- ${warning}`);
    }
  }
  console.log(`\nBoundary hardening lane complete in ${elapsedSeconds}s across ${options.cycles} cycle(s).`);
  console.log(`Summary written to ${summaryFile}`);
}

try {
  main();
} catch (error) {
  console.error(error.message || String(error));
  process.exit(1);
}
