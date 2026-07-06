#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const statusPath = path.join(root, "docs", "operations", "live-execution-status.md");
const progressPath = path.join(root, "docs", "operations", "wave0-progress-2026-07-01.md");
const qcDir = path.join(root, "docs", "qc");

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function countQcArtifacts() {
  try {
    return fs.readdirSync(qcDir).length;
  } catch {
    return 0;
  }
}

function latestReportState() {
  const parity = readSafe(path.join(qcDir, "matrix-shell-connector-parity-report.md"));
  const execCtx = readSafe(path.join(qcDir, "execution-context-propagation-report.md"));
  const envelope = readSafe(path.join(qcDir, "nonlms-contract-envelope-report.md"));

  return {
    parity: parity.includes("Failed: 0") ? "PASS" : "CHECK",
    execCtx: execCtx.includes("Failed: 0") ? "PASS" : "CHECK",
    envelope: envelope.includes("Failed: 0") ? "PASS" : "BASELINE",
  };
}

function writeStatus() {
  const now = new Date().toISOString();
  const qcCount = countQcArtifacts();
  const progress = readSafe(progressPath);
  const lastProgressLine = progress
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-1)[0] || "wave0 progress log active";
  const states = latestReportState();

  const body = [
    "# Live Execution Status",
    "",
    "- Status: ACTIVE",
    "- Mode: Continuous autonomous execution",
    `- Last updated: ${now}`,
    "- Current wave: Wave 0 foundation hardening",
    "",
    "## Current lane",
    "",
    "1. Contract envelope normalization",
    "2. Tenant and user context propagation enforcement",
    "3. Proxy replacement prioritization map",
    "",
    "## Live signals",
    "",
    `- QC artifact count: ${qcCount}`,
    `- Last progress signal: ${lastProgressLine}`,
    "",
    "## Most recent check state",
    "",
    `1. Matrix-shell-connector parity: ${states.parity}`,
    `2. Execution-context propagation: ${states.execCtx}`,
    `3. Non-LMS contract envelope: ${states.envelope}`,
    "",
    "## Observer note",
    "",
    "This file is heartbeat-updated automatically while autonomous execution is active.",
    "",
  ].join("\n");

  fs.writeFileSync(statusPath, body, "utf8");
}

writeStatus();
setInterval(writeStatus, 15000);
