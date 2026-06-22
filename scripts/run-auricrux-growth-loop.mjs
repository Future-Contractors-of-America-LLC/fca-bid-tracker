#!/usr/bin/env node
/**
 * Run Auricrux complete growth loop in sibling auricrux-central-work repo.
 * Usage: npm run train:auricrux-growth [-- --local-runs 3 --no-llm]
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const centralRoot = path.resolve(__dirname, "..", "..", "auricrux-central-work");
const script = path.join(centralRoot, "scripts", "training", "run_auricrux_growth_loop.py");
const extraArgs = process.argv.slice(2);

const result = spawnSync("python", [script, ...extraArgs], {
  cwd: centralRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
