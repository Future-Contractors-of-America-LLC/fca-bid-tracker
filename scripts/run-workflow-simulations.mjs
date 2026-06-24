#!/usr/bin/env node
/** Founder-facing workflow simulation runner with readable report output. */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const result = spawnSync(process.execPath, [path.join(root, "scripts", "simulate-contractor-workflow.mjs")], {
  encoding: "utf8",
  env: process.env,
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);

const reportPath = path.join(root, "docs", "qc", "workflow-simulation-latest.md");
if (fs.existsSync(reportPath)) {
  console.log("\n--- Founder report ---\n");
  console.log(fs.readFileSync(reportPath, "utf8"));
}

process.exit(result.status ?? 1);
