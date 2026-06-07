import fs from "fs";
import path from "path";

const root = process.cwd();
const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));

const scanRoots = [path.join(root, "src")];
const allowedExternalPrefixes = ["mailto:", "https://", "http://"];
const allowedStaticPrefixes = [
  "/fca-customer-entry",
  "/fca-customer-status",
  "/api/",
];
const allowedStaticRoutes = new Set([
  "/deployment-status.json",
  "/runtime-fingerprint.txt",
  "/live-shell-verification.html",
  "/api-continuity-audit.html",
]);

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

function normalizeTarget(target) {
  if (!target || typeof target !== "string") return target;
  const withoutQueryOrHash = target.split("#")[0].split("?")[0];
  return withoutQueryOrHash.endsWith("/") && withoutQueryOrHash !== "/"
    ? withoutQueryOrHash.slice(0, -1)
    : withoutQueryOrHash;
}

function isSupportedTarget(target) {
  const normalized = normalizeTarget(target);
  if (!normalized) return false;
  if (routeSet.has(normalized)) return true;
  if (allowedStaticRoutes.has(normalized)) return true;
  if (allowedStaticPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
  return allowedExternalPrefixes.some((prefix) => target.startsWith(prefix));
}

function collectLiteralTargets(content, file, failures) {
  const propPatterns = [
    { prop: "href", regex: /href="([^"]+)"/g },
    { prop: "primaryHref", regex: /primaryHref="([^"]+)"/g },
    { prop: "secondaryHref", regex: /secondaryHref="([^"]+)"/g },
    { prop: "ctaHref", regex: /ctaHref="([^"]+)"/g },
  ];

  for (const { prop, regex } of propPatterns) {
    for (const match of content.matchAll(regex)) {
      const target = match[1];
      if (!isSupportedTarget(target)) {
        failures.push(`${file} uses unsupported ${prop} target: ${target}`);
      }
    }
  }
}

function validateActionTags(content, file, failures) {
  const jsxTagPattern = /<([A-Z][A-Za-z0-9]*)\b[\s\S]*?\/?>/g;

  for (const match of content.matchAll(jsxTagPattern)) {
    const tagSource = match[0];
    const tagName = match[1];

    const actionPairs = [
      ["primaryHref", "primaryLabel"],
      ["secondaryHref", "secondaryLabel"],
      ["ctaHref", "ctaLabel"],
    ];

    for (const [hrefProp, labelProp] of actionPairs) {
      if (tagSource.includes(`${hrefProp}=`) && !tagSource.includes(`${labelProp}=`)) {
        failures.push(`${file} has <${tagName}> with ${hrefProp} but missing ${labelProp}.`);
      }
    }
  }
}

const filesToScan = scanRoots.flatMap((target) => walk(target));
const failures = [];

for (const file of filesToScan) {
  const content = fs.readFileSync(file, "utf8");
  collectLiteralTargets(content, path.relative(root, file), failures);
  validateActionTags(content, path.relative(root, file), failures);
}

if (failures.length > 0) {
  console.error("JSX action literal validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`JSX action literal validation passed for ${filesToScan.length} source files.`);
