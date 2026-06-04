import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routerModule = await import(pathToFileURL(path.join(root, "router.jsx")).href);
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

const routes = routerModule.routes || {};
const routeSet = new Set(Object.keys(routes));

const allowedExternalPrefixes = ["mailto:", "https://", "http://"];
const allowedStaticPrefixes = [
  "/fca-customer-entry",
  "/fca-customer-status",
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

function isSupportedTarget(target) {
  if (!target || typeof target !== "string") return false;
  const normalized = normalizePath(target);
  if (routeSet.has(normalized)) return true;
  if (allowedStaticPrefixes.some((prefix) => normalized.startsWith(prefix))) return true;
  return allowedExternalPrefixes.some((prefix) => normalized.startsWith(prefix));
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

  validatePair(value.href, value.label, `${location}.href`, failures);
  validatePair(value.cta, value.label, `${location}.cta`, failures);
  validatePair(value.primaryHref, value.primaryLabel, `${location}.primaryHref`, failures);
  validatePair(value.secondaryHref, value.secondaryLabel, `${location}.secondaryHref`, failures);

  if (("variant" in value) && !["primary", "secondary", "light"].includes(value.variant)) {
    failures.push(`${location}.variant uses an unsupported CTA variant: ${value.variant}`);
  }

  Object.entries(value).forEach(([key, nestedValue]) => {
    if (["href", "label", "cta", "primaryHref", "primaryLabel", "secondaryHref", "secondaryLabel", "variant"].includes(key)) {
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
