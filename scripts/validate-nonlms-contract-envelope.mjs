#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const apiRoot = path.join(root, "api");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const files = walk(apiRoot)
  .filter((file) => !/academy|lms/i.test(file))
  .filter((file) => {
    const rel = path.relative(root, file).replace(/\\/g, "/");
    // Evaluate executable handlers only, not shared libraries/schemas.
    if (rel.startsWith("api/_lib/")) return false;
    if (rel.startsWith("api/projects/[") && !rel.endsWith("/index.js") && !rel.endsWith(".js")) return false;
    return rel.startsWith("api/") && (rel.endsWith(".js") || rel.endsWith("/index.js"));
  })
  .sort();

const findings = [];
let failed = 0;

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const source = fs.readFileSync(file, "utf8");

  const hasOk = /\bok\b\s*[:=]/.test(source);
  const hasError = /\berror\b\s*[:=]/.test(source);
  const hasStatus = /\bstatus\b\s*[:=]/.test(source) || /response\.status/.test(source);
  const isProxyOnly = /createCentralProxy|createCentralPathProxy/.test(source);

  const contractState = isProxyOnly
    ? "proxy-pass-through"
    : hasOk && hasError && hasStatus
      ? "normalized"
      : hasStatus || hasOk || hasError
        ? "partial"
        : "missing";

  if (contractState === "missing") failed += 1;

  findings.push({
    file: rel,
    contractState,
    hasOk,
    hasError,
    hasStatus,
    proxy: isProxyOnly,
  });
}

const summary = findings.reduce((acc, item) => {
  acc[item.contractState] = (acc[item.contractState] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  checked: findings.length,
  failed,
  summary,
  findings,
};

const outDir = path.join(root, "docs", "qc");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "nonlms-contract-envelope-report.json"), JSON.stringify(report, null, 2));

const lines = [];
lines.push("# Non-LMS Contract Envelope Report");
lines.push("");
lines.push(`- Generated: ${report.generatedAt}`);
lines.push(`- Checked: ${report.checked}`);
lines.push(`- Failed: ${report.failed}`);
lines.push("");
lines.push("## Summary");
for (const [key, value] of Object.entries(summary)) {
  lines.push(`- ${key}: ${value}`);
}
lines.push("");
lines.push("## Files");
for (const row of findings) {
  lines.push(`- ${row.contractState} | ${row.file}`);
}
fs.writeFileSync(path.join(outDir, "nonlms-contract-envelope-report.md"), `${lines.join("\n")}\n`);

const strict = process.env.FCA_STRICT_CONTRACT_ENVELOPE === "1";
if (failed > 0 && strict) {
  console.error("Non-LMS contract envelope validation found missing contracts (strict mode).");
  process.exit(1);
}

if (failed > 0) {
  console.warn("Non-LMS contract envelope baseline report emitted with missing contracts; strict mode not enabled.");
} else {
  console.log("Non-LMS contract envelope validation passed.");
}
