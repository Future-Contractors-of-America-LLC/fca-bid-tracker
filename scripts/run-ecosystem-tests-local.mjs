#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const phaseIndex = args.indexOf("--phase");
const phase = phaseIndex >= 0 ? args[phaseIndex + 1] : "all";
const includeLive = args.includes("--include-live");
const includeRuntimeSmoke = process.env.FCA_INCLUDE_RUNTIME_SMOKE === "1";

const commandsByPhase = {
  static: ["npm run validate:phase4-ecosystem"],
  "api-smoke": ["npm run validate:flat-api-proxy-alignment"],
  all: ["npm run validate:phase4-ecosystem", "npm run validate:flat-api-proxy-alignment"],
};

const commands = commandsByPhase[phase] || commandsByPhase.all;
if (includeRuntimeSmoke) {
  commands.push("npm run validate:runtime-smoke");
}

for (const command of commands) {
  const result = spawnSync(command, {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      FCA_ISOLATED_MODE: process.env.FCA_ISOLATED_MODE || "true",
    },
  });
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (includeLive) {
  const hosts = (process.env.AURICRUX_LIVE_VERIFY_HOSTS || process.env.AURICRUX_EXPECTED_HOSTS || "").trim();
  if (!hosts) {
    console.log("SKIP live ecosystem check: no explicit live hosts configured (AURICRUX_LIVE_VERIFY_HOSTS/AURICRUX_EXPECTED_HOSTS).");
    process.exit(0);
  }

  const result = spawnSync("npm run verify:live-deployment", {
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      FCA_ISOLATED_MODE: process.env.FCA_ISOLATED_MODE || "true",
    },
  });
  process.exit(result.status ?? 1);
}
