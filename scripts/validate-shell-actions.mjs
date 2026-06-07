import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));

const allowedExternalPrefixes = ["mailto:", "https://", "http://"];
const allowedStaticPrefixes = [
  "/fca-customer-entry",
  "/fca-customer-status",
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  const withoutQueryOrHash = value.split("#")[0].split("?")[0];
  return withoutQueryOrHash.endsWith("/") && withoutQueryOrHash !== "/"
    ? withoutQueryOrHash.slice(0, -1)
    : withoutQueryOrHash;
}

function isSupportedTarget(target) {
  if (!target || typeof target !== "string") return false;
  const normalized = normalizePath(target);
  if (routeSet.has(normalized)) return true;
  if (allowedStaticPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
  return allowedExternalPrefixes.some((prefix) => target.startsWith(prefix));
}

function validatePair(target, label, location, failures) {
  if (target == null && label == null) return;

  if (typeof target !== "string" || !target.trim()) {
    failures.push(`${location} has a missing or invalid target value.`);
    return;
  }

  if (typeof label !== "string" || !label.trim()) {
    failures.push(`${location} is missing a visible label.`);
  }

  if (!isSupportedTarget(target)) {
    failures.push(`${location} points to an unsupported target: ${target}`);
  }
}

function walk(value, location, failures) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, `${location}[${index}]`, failures));
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  const visibleLabel = value.label ?? value.ctaLabel;

  if (Object.prototype.hasOwnProperty.call(value, "href") || Object.prototype.hasOwnProperty.call(value, "label") || Object.prototype.hasOwnProperty.call(value, "ctaLabel")) {
    validatePair(value.href, visibleLabel, `${location}.href`, failures);
  }

  if (Object.prototype.hasOwnProperty.call(value, "cta") || Object.prototype.hasOwnProperty.call(value, "ctaLabel")) {
    validatePair(value.cta, visibleLabel, `${location}.cta`, failures);
  }

  if (Object.prototype.hasOwnProperty.call(value, "primaryHref") || Object.prototype.hasOwnProperty.call(value, "primaryLabel")) {
    validatePair(value.primaryHref, value.primaryLabel, `${location}.primaryHref`, failures);
  }

  if (Object.prototype.hasOwnProperty.call(value, "secondaryHref") || Object.prototype.hasOwnProperty.call(value, "secondaryLabel")) {
    validatePair(value.secondaryHref, value.secondaryLabel, `${location}.secondaryHref`, failures);
  }

  if (("variant" in value) && !["primary", "secondary", "light"].includes(value.variant)) {
    failures.push(`${location}.variant uses an unsupported CTA variant: ${value.variant}`);
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (["href", "label", "cta", "ctaLabel", "primaryHref", "primaryLabel", "secondaryHref", "secondaryLabel", "variant"].includes(key)) {
      return;
    }
    walk(nestedValue, `${location}.${key}`, failures);
  });
}

const failures = [];

for (const [exportName, exportedValue] of Object.entries(websiteShellModule)) {
  walk(exportedValue, exportName, failures);
}

if (failures.length > 0) {
  console.error("Shell action integrity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Shell action integrity validation passed across ${Object.keys(websiteShellModule).length} website shell exports.`);
