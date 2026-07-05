#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const [scriptFile, ...scriptArgs] = process.argv.slice(2);

if (!scriptFile) {
  console.error("Usage: node scripts/run-optional-script.mjs <script-path> [...args]");
  process.exit(1);
}

const root = process.cwd();
const absoluteScriptPath = path.resolve(root, scriptFile);

if (!fs.existsSync(absoluteScriptPath)) {
  console.log(`Skip: optional script not present: ${scriptFile}`);
  process.exit(0);
}

const result = spawnSync(process.execPath, [absoluteScriptPath, ...scriptArgs], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
