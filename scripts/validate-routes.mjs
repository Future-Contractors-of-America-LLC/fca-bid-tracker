import fs from "fs";
import path from "path";

const root = process.cwd();
const scanRoots = [path.join(root, "src"), path.join(root, "router.jsx")];

const explicitRoutes = new Set([
  "/",
  "/platform",
  "/login",
  "/pricing",
  "/contact",
  "/auricrux",
  "/portal",
  "/portal/platform",
  "/portal/projects",
  "/portal/files",
  "/portal/messages",
  "/portal/bids",
  "/portal/billing",
  "/portal/support",
  "/portal/admin",
  "/portal/academy",
  "/academy",
]);

const allowedStaticPrefixes = [
  "/bid-entry",
  "/bid-status",
  "/fca-customer-entry",
  "/fca-customer-status",
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

function collectInternalHrefs(content) {
  const matches = [...content.matchAll(/href=\"([^\"]+)\"/g)];
  return matches.map((match) => match[1]).filter((href) => href.startsWith("/") || href.startsWith("mailto:") || href.startsWith("http://") || href.startsWith("https://"));
}

const filesToScan = scanRoots.flatMap((target) => walk(target));
const hrefs = new Set();

for (const file of filesToScan) {
  const content = fs.readFileSync(file, "utf8");
  for (const href of collectInternalHrefs(content)) {
    hrefs.add(href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href);
  }
}

const invalid = [...hrefs].filter((href) => {
  if (explicitRoutes.has(href)) return false;
  return !allowedStaticPrefixes.some((prefix) => href.startsWith(prefix));
});

if (invalid.length > 0) {
  console.error("Route validation failed. These href values are not backed by router routes or approved static prefixes:");
  for (const href of invalid) {
    console.error(` - ${href}`);
  }
  process.exit(1);
}

console.log(`Route validation passed for ${hrefs.size} href targets.`);
