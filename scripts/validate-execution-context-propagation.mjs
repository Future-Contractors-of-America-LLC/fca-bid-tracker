#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "src", "api", "backendBase.js");
const source = fs.readFileSync(target, "utf8");

const requiredMarkers = [
  "x-fca-tenant-id",
  "x-fca-customer-id",
  "x-fca-user-id",
  "x-fca-user-role",
  "x-fca-route",
  "buildExecutionContextHeaders",
  "...buildExecutionContextHeaders()",
];

const findings = requiredMarkers.map((marker) => ({
  marker,
  ok: source.includes(marker),
}));

const failed = findings.filter((item) => !item.ok).length;

const report = {
  generatedAt: new Date().toISOString(),
  target: "src/api/backendBase.js",
  failed,
  findings,
};

const outDir = path.join(root, "docs", "qc");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "execution-context-propagation-report.json"), JSON.stringify(report, null, 2));

const lines = [];
lines.push("# Execution Context Propagation Report");
lines.push("");
lines.push(`- Generated: ${report.generatedAt}`);
lines.push(`- Target: ${report.target}`);
lines.push(`- Failed: ${report.failed}`);
lines.push("");
for (const item of findings) {
  lines.push(`- ${item.ok ? "PASS" : "FAIL"} ${item.marker}`);
}
fs.writeFileSync(path.join(outDir, "execution-context-propagation-report.md"), `${lines.join("\n")}\n`);

if (failed > 0) {
  console.error("Execution context propagation validation failed.");
  process.exit(1);
}

console.log("Execution context propagation validation passed.");
