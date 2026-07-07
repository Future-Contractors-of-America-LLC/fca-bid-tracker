#!/usr/bin/env node
import { readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";

const repoRoot = process.cwd();

const skipDirs = new Set([
  ".git",
  "node_modules",
  "dist",
  "workspace",
  "generated",
  "bin",
  "obj",
]);

const dotnetExtensions = new Set([".cs", ".csproj", ".sln"]);
const backendJsExtensions = new Set([".js", ".mjs", ".cjs", ".ts"]);

function walk(dir, collector) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name)) continue;
      walk(join(dir, entry.name), collector);
      continue;
    }
    collector(join(dir, entry.name));
  }
}

const allFiles = [];
walk(repoRoot, (filePath) => {
  allFiles.push(filePath);
});

const dotnetFiles = [];
const backendJsFiles = [];

for (const absPath of allFiles) {
  const relPath = relative(repoRoot, absPath).replace(/\\/g, "/");
  const ext = extname(relPath).toLowerCase();

  if (dotnetExtensions.has(ext)) {
    dotnetFiles.push(relPath);
  }

  if ((relPath.startsWith("api/") || relPath.startsWith("api_generated/") || relPath.startsWith("app/api/")) && backendJsExtensions.has(ext)) {
    backendJsFiles.push(relPath);
  }
}

const summary = {
  checkedAt: new Date().toISOString(),
  dotnetFileCount: dotnetFiles.length,
  backendJsFileCount: backendJsFiles.length,
  dotnetExamples: dotnetFiles.slice(0, 10),
  backendJsExamples: backendJsFiles.slice(0, 10),
};

console.log("[backend-stack]", JSON.stringify(summary, null, 2));

const requireDotnet = process.env.FCA_REQUIRE_DOTNET_BACKEND === "1";
if (!requireDotnet) {
  process.exit(0);
}

if (dotnetFiles.length === 0) {
  console.error("[backend-stack] FAIL: FCA_REQUIRE_DOTNET_BACKEND=1 but no .NET backend files found.");
  process.exit(1);
}

if (backendJsFiles.length > 0) {
  console.error("[backend-stack] FAIL: FCA_REQUIRE_DOTNET_BACKEND=1 but JS/TS backend files still present in api surfaces.");
  process.exit(1);
}

console.log("[backend-stack] PASS: .NET backend enforced and no JS/TS backend surface files detected.");
