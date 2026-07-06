#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const portalDir = path.join(root, "src", "pages", "portal");
const websiteDir = path.join(root, "src", "pages", "website");

const bannedPatterns = [
  /\bcoming soon\b/i,
  /\blorem ipsum\b/i,
  /\bTODO\b/i,
  /\bTBD\b/i,
  /\bplaceholder text\b/i,
  /\bdummy data\b/i,
  /\bfixme\b/i,
];

const excludedBannedFiles = new Set([
  "LegacyBidEntry.jsx",
  "LegacyBidStatus.jsx",
]);

const keyWebsitePages = [
  "Home.jsx",
  "Platform.jsx",
  "Pricing.jsx",
  "Features.jsx",
  "Solutions.jsx",
  "Contact.jsx",
  "Login.jsx",
  "Intake.jsx",
  "Warranty.jsx",
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function toRel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function pushFailure(failures, filePath, message) {
  failures.push(`${toRel(filePath)}: ${message}`);
}

const failures = [];
const findings = [];

const portalFiles = fs.readdirSync(portalDir)
  .filter((name) => name.endsWith(".jsx"))
  .map((name) => path.join(portalDir, name));

let portalTokenUsageCount = 0;
for (const filePath of portalFiles) {
  const source = read(filePath);
  const fileName = path.basename(filePath);

  if (source.includes("PortalShell")) {
    if (!/\btitle="[^"]+"/.test(source)) {
      pushFailure(failures, filePath, "PortalShell surface must define a non-empty title.");
    }
    if (!/\bsubtitle="[^"]+"/.test(source)) {
      pushFailure(failures, filePath, "PortalShell surface must define a non-empty subtitle.");
    }
  }

  const usesTokenSystem =
    source.includes("portalDesignTokens")
    || source.includes("portalCardStyle")
    || source.includes("PortalPageIntro")
    || source.includes("OperationalToolPage");
  if (usesTokenSystem) portalTokenUsageCount += 1;

  if (source.includes("�")) {
    pushFailure(failures, filePath, "Contains replacement character (encoding/language quality issue).");
  }

  for (const pattern of bannedPatterns) {
    if (pattern.test(source) && !excludedBannedFiles.has(fileName)) {
      pushFailure(failures, filePath, `Contains banned placeholder phrase matching ${pattern}.`);
      break;
    }
  }

  findings.push({ surface: toRel(filePath), type: "portal", checked: true });
}

if (portalTokenUsageCount < 12) {
  failures.push(`portal-token-usage: expected at least 12 portal pages using shared design/tokens patterns, found ${portalTokenUsageCount}.`);
}

for (const page of keyWebsitePages) {
  const filePath = path.join(websiteDir, page);
  if (!fs.existsSync(filePath)) {
    pushFailure(failures, filePath, "Missing required key website page.");
    continue;
  }

  const source = read(filePath);

  const hasPrimaryHeading =
    /<h1[\s>]/.test(source)
    || /\btitle="[^"]+"/.test(source)
    || /\btitle=\{[^}]+\}/.test(source)
    || source.includes("title:");
  if (!hasPrimaryHeading) {
    pushFailure(failures, filePath, "Key website page must provide a primary heading/title signal for clear UX language hierarchy.");
  }

  if (source.includes("�")) {
    pushFailure(failures, filePath, "Contains replacement character (encoding/language quality issue).");
  }

  for (const pattern of bannedPatterns) {
    if (pattern.test(source)) {
      pushFailure(failures, filePath, `Contains banned placeholder phrase matching ${pattern}.`);
      break;
    }
  }

  findings.push({ surface: toRel(filePath), type: "website", checked: true });
}

const report = {
  generatedAt: new Date().toISOString(),
  checked: findings.length,
  failed: failures.length,
  portalTokenUsageCount,
  failures,
};

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "ux-language-quality-report.json"), JSON.stringify(report, null, 2));

if (failures.length > 0) {
  console.error("UX/language quality validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`UX/language quality validation passed (${findings.length} surfaces checked, token usage ${portalTokenUsageCount}).`);
