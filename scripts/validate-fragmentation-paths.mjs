#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiRoot = path.join(root, "api");

const skipNames = new Set([
  "_lib",
  "host.json",
  "package.json",
]);

const apiEntries = fs.readdirSync(apiRoot, { withFileTypes: true });
const canonicalFunctionDirs = new Set(
  apiEntries
    .filter((entry) => entry.isDirectory())
    .filter((entry) => fs.existsSync(path.join(apiRoot, entry.name, "function.json")))
    .map((entry) => entry.name),
);

const shimmedCanonicalRoutes = new Set([
  "academy-lms",
  "auricrux",
  "diag-canary",
  "projects",
  "stripe-checkout",
]);

const deployable = [];

for (const entry of apiEntries) {
  if (entry.isDirectory()) {
    if (entry.name === "_lib") continue;
    if (!fs.existsSync(path.join(apiRoot, entry.name, "function.json"))) continue;
    if (shimmedCanonicalRoutes.has(entry.name)) continue;
    deployable.push({ type: "dir", name: entry.name });
    continue;
  }

  if (!entry.isFile()) continue;
  if (!entry.name.endsWith(".js")) continue;
  if (skipNames.has(entry.name)) continue;

  const baseName = entry.name.replace(/\.js$/i, "");
  if (canonicalFunctionDirs.has(baseName)) continue;
  deployable.push({ type: "flat", name: baseName });
}

const byFamily = new Map();
for (const item of deployable) {
  const family = item.name.replace(/-v4$/i, "");
  const current = byFamily.get(family) || [];
  current.push(item);
  byFamily.set(family, current);
}

const collisions = [...byFamily.entries()]
  .filter(([, entries]) => entries.length > 1)
  .map(([family, entries]) => ({ family, entries }));

if (collisions.length > 0) {
  console.error("Fragmentation path validation failed (multiple route implementations detected):");
  for (const item of collisions) {
    console.error(` - ${item.family} has overlapping deployable entries: ${item.entries.map((entry) => `${entry.type}:${entry.name}`).join(", ")}`);
  }
  process.exit(1);
}

console.log("Fragmentation path validation passed (single deployable implementation per capability surface).");
