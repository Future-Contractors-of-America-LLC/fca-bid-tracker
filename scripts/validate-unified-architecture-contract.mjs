#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = [
  path.join(root, "src"),
];

const ignoreDirs = new Set([
  "node_modules",
  "dist",
  ".git",
  "workspace",
  "generated",
  "api_generated",
  "docs",
]);

const allowedProviderPaths = [
  "src/config/domainHosts.js",
];

const providerTokens = [
  "azurestaticapps.net",
  "azurewebsites.net",
  "AZURE_STATIC_WEB_APPS",
  "AURICRUX_SWA_",
  "WEBSITE_RUN_FROM_PACKAGE",
  "SCM_DO_BUILD_DURING_DEPLOYMENT",
];

function normalize(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function isAllowedPath(relPath) {
  return allowedProviderPaths.some((prefix) => relPath.startsWith(prefix));
}

function walk(dirPath, out = []) {
  if (!fs.existsSync(dirPath)) return out;
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (ignoreDirs.has(entry.name)) continue;
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!/\.(js|jsx|ts|tsx|mjs|cjs|json)$/.test(entry.name)) continue;
    out.push(full);
  }
  return out;
}

const files = scanRoots.flatMap((dir) => walk(dir));
const violations = [];

for (const filePath of files) {
  const rel = normalize(filePath);
  const text = fs.readFileSync(filePath, "utf8");
  for (const token of providerTokens) {
    if (!text.includes(token)) continue;
    if (isAllowedPath(rel)) continue;
    violations.push(`${rel} contains provider-lock token '${token}' outside allowed adapter/deploy paths.`);
  }
}

if (violations.length > 0) {
  console.error("Unified architecture contract failed:");
  for (const issue of violations) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("Unified architecture contract passed (single code path + provider-neutral app runtime boundaries).");
