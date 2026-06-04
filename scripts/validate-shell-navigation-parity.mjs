import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesModule = await import(pathToFileURL(path.join(root, "src", "routes.js")).href);
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

const routes = routesModule.routes || {};
const routeSet = new Set(Object.keys(routes));

const shellJourney = websiteShellModule.shellJourney || [];
const shellPrimaryNav = websiteShellModule.shellPrimaryNav || [];
const shellWorkspaceRoutes = websiteShellModule.shellWorkspaceRoutes || [];
const publicRouteCtas = websiteShellModule.publicRouteCtas || {};

const allowedStaticPrefixes = [
  "/fca-customer-entry",
  "/fca-customer-status",
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

function isLiveOrAllowedPath(value) {
  const normalized = normalizePath(value);
  if (!normalized) return false;
  if (routeSet.has(normalized)) return true;
  return allowedStaticPrefixes.some((prefix) => normalized.startsWith(prefix));
}

const failures = [];
const journeyKeys = new Set();
const journeyHrefs = new Set();

for (const item of shellJourney) {
  if (!item || typeof item !== "object") {
    failures.push("shellJourney contains a non-object entry.");
    continue;
  }

  if (!item.key || typeof item.key !== "string") {
    failures.push("shellJourney contains an entry with a missing key.");
  } else {
    if (journeyKeys.has(item.key)) {
      failures.push(`shellJourney contains a duplicate key: ${item.key}`);
    }
    journeyKeys.add(item.key);
  }

  if (!item.label || typeof item.label !== "string") {
    failures.push(`shellJourney entry ${item.key || "unknown"} is missing a label.`);
  }

  if (!isLiveOrAllowedPath(item.href)) {
    failures.push(`shellJourney entry ${item.key || "unknown"} points to an unsupported href: ${item.href}`);
  } else {
    journeyHrefs.add(normalizePath(item.href));
  }
}

for (const item of shellPrimaryNav) {
  if (!item || typeof item !== "object") {
    failures.push("shellPrimaryNav contains a non-object entry.");
    continue;
  }

  if (!item.label || typeof item.label !== "string") {
    failures.push("shellPrimaryNav contains an entry with a missing label.");
  }

  if (!journeyKeys.has(item.journeyKey)) {
    failures.push(`shellPrimaryNav item ${item.label || item.href || "unknown"} uses unknown journeyKey: ${item.journeyKey}`);
  }

  if (!routeSet.has(normalizePath(item.href))) {
    failures.push(`shellPrimaryNav item ${item.label || item.journeyKey || "unknown"} points to a non-route href: ${item.href}`);
  }

  if (!journeyHrefs.has(normalizePath(item.href))) {
    failures.push(`shellPrimaryNav item ${item.label || item.journeyKey || "unknown"} is not represented in shellJourney: ${item.href}`);
  }
}

for (const item of shellWorkspaceRoutes) {
  if (!item || typeof item !== "object") {
    failures.push("shellWorkspaceRoutes contains a non-object entry.");
    continue;
  }

  if (!item.label || typeof item.label !== "string") {
    failures.push("shellWorkspaceRoutes contains an entry with a missing label.");
  }

  if (!isLiveOrAllowedPath(item.href)) {
    failures.push(`shellWorkspaceRoutes item ${item.label || "unknown"} points to an unsupported href: ${item.href}`);
  }
}

for (const [key, ctaGroup] of Object.entries(publicRouteCtas)) {
  if (!ctaGroup || typeof ctaGroup !== "object") {
    failures.push(`publicRouteCtas.${key} is not an object.`);
    continue;
  }

  if (!routeSet.has(normalizePath(ctaGroup.primaryHref))) {
    failures.push(`publicRouteCtas.${key}.primaryHref is not a live route: ${ctaGroup.primaryHref}`);
  }

  if (!ctaGroup.primaryLabel || typeof ctaGroup.primaryLabel !== "string") {
    failures.push(`publicRouteCtas.${key}.primaryLabel is missing.`);
  }

  if (!routeSet.has(normalizePath(ctaGroup.secondaryHref))) {
    failures.push(`publicRouteCtas.${key}.secondaryHref is not a live route: ${ctaGroup.secondaryHref}`);
  }

  if (!ctaGroup.secondaryLabel || typeof ctaGroup.secondaryLabel !== "string") {
    failures.push(`publicRouteCtas.${key}.secondaryLabel is missing.`);
  }
}

if (failures.length > 0) {
  console.error("Shell navigation parity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Shell navigation parity validation passed for ${shellJourney.length} journey items, ${shellPrimaryNav.length} primary nav items, ${shellWorkspaceRoutes.length} workspace routes, and ${Object.keys(publicRouteCtas).length} public CTA groups.`
);
