import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const scanRoots = [path.join(root, "src"), path.join(root, "router.jsx")];

const explicitRoutes = new Set([
  "/",
  "/platform",
  "/login",
  "/intake",
  "/checkout",
  "/pricing",
  "/features",
  "/solutions",
  "/contact",
  "/auricrux",
  "/warranty",
  "/referrals",
  "/terms",
  "/privacy",
  "/refunds",
  "/ip",
  "/not-found",
  "/bid-entry",
  "/bid-status",
  "/portal",
  "/portal/platform",
  "/portal/operations",
  "/portal/projects",
  "/portal/files",
  "/portal/audit",
  "/portal/messages",
  "/portal/notifications",
  "/portal/bids",
  "/portal/estimates",
  "/portal/proposals",
  "/portal/billing",
  "/portal/support",
  "/portal/admin",
  "/portal/profile",
  "/portal/auricrux",
  "/portal/academy",
  "/portal/plans",
  "/portal/finance",
  "/portal/scheduling",
  "/portal/field-tasks",
  "/portal/field-supervision",
  "/academy",
  "/academy/catalog",
  "/deployment-status.json",
  "/runtime-fingerprint.txt",
  "/live-shell-verification.html",
  "/api-continuity-audit.html",
]);

const allowedStaticPrefixes = [
  "/fca-customer-entry",
  "/fca-customer-status",
  "/brand/",
  "/api/",
  "mailto:",
  "https://",
  "http://",
];

function walk(targetPath, files = []) {
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(targetPath)) {
      walk(path.join(targetPath, entry), files);
    }
    return files;
  }

  if (/\.(jsx|js|mjs)$/.test(targetPath)) {
    files.push(targetPath);
  }

  return files;
}

function normalizeHref(href) {
  if (!href) return href;
  return href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
}

function stripQueryAndHash(href) {
  if (!href) return href;
  return href.split("#")[0].split("?")[0];
}

function isTrackedHref(href) {
  return href.startsWith("/") || href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://");
}

function collectInternalHrefsFromContent(content) {
  const matches = [...content.matchAll(/href="([^"]+)"/g)];
  return matches.map((match) => match[1]).filter(isTrackedHref).map(normalizeHref);
}

function collectHrefsFromValue(value, hrefs = new Set()) {
  if (typeof value === "string") {
    if (isTrackedHref(value)) {
      hrefs.add(normalizeHref(value));
    }
    return hrefs;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectHrefsFromValue(item, hrefs);
    return hrefs;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      collectHrefsFromValue(nestedValue, hrefs);
    }
  }

  return hrefs;
}

const filesToScan = scanRoots.flatMap((target) => walk(target));
const hrefs = new Set();

for (const file of filesToScan) {
  const content = fs.readFileSync(file, "utf8");
  for (const href of collectInternalHrefsFromContent(content)) {
    hrefs.add(href);
  }
}

const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);
for (const exportedValue of Object.values(websiteShellModule)) {
  collectHrefsFromValue(exportedValue, hrefs);
}

const invalid = [...hrefs].filter((href) => {
  const baseHref = stripQueryAndHash(href);
  if (explicitRoutes.has(baseHref)) return false;
  return !allowedStaticPrefixes.some((prefix) => href.startsWith(prefix));
});

if (invalid.length > 0) {
  console.error("Route validation failed. These href values are not backed by router routes or approved static prefixes:");
  for (const href of invalid.sort()) {
    console.error(` - ${href}`);
  }
  process.exit(1);
}

console.log(`Route validation passed for ${hrefs.size} href targets across JSX surfaces and website shell exports.`);
