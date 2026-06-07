import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

function parseRouteKeys(source) {
  const routeObjectMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeObjectMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  const keys = new Set();
  const keyPattern = /["'](\/[^"']*)["']\s*:/g;

  for (const match of routeObjectMatch[1].matchAll(keyPattern)) {
    keys.add(match[1]);
  }

  return keys;
}

const routeSet = parseRouteKeys(routesSource);

const requiredAppRoutes = [
  "/",
  "/platform",
  "/login",
  "/pricing",
  "/contact",
  "/auricrux",
  "/portal",
  "/portal/platform",
  "/academy",
  "/not-found",
];

const allowedStaticPrefixes = [
  "/bid-entry",
  "/bid-status",
  "/fca-customer-entry",
  "/fca-customer-status",
  "mailto:",
  "https://",
  "http://",
];

function normalizeHref(href) {
  if (!href) return href;
  return href.endsWith("/") && href !== "/" ? href.slice(0, -1) : href;
}

function stripQueryAndHash(href) {
  if (!href) return href;
  return href.split("#")[0].split("?")[0];
}

function isSupportedHref(href) {
  const normalized = normalizeHref(href);
  const baseHref = stripQueryAndHash(normalized);
  if (routeSet.has(baseHref)) return true;
  return allowedStaticPrefixes.some((prefix) => normalized.startsWith(prefix));
}

function collectHrefs(value, hrefs = new Set()) {
  if (typeof value === "string") {
    if (
      value.startsWith("/") ||
      value.startsWith("mailto:") ||
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      hrefs.add(normalizeHref(value));
    }
    return hrefs;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectHrefs(item, hrefs);
    return hrefs;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value)) {
      collectHrefs(nestedValue, hrefs);
    }
  }

  return hrefs;
}

const failures = [];

for (const route of requiredAppRoutes) {
  if (!routeSet.has(route)) {
    failures.push(`Missing required app route: ${route}`);
  }
}

const shellHrefSources = [
  websiteShellModule.publicActionCatalog,
  websiteShellModule.publicFallbackCtaCards,
  websiteShellModule.auricruxWalkthroughPath,
  websiteShellModule.platformJourneyPath,
  websiteShellModule.platformLinkedProductAreas,
  websiteShellModule.portalNarrativeCtaSets,
  websiteShellModule.academyCtaSets,
  websiteShellModule.homeCtaSets,
  websiteShellModule.portalShellCtas,
  websiteShellModule.portalEntryCtaSets,
  websiteShellModule.platformDashboardCtaSets,
  websiteShellModule.shellHeaderCtaSets,
  websiteShellModule.executiveSignalCtaSets,
  websiteShellModule.founderJourneyCtaSets,
  websiteShellModule.shellJourney,
  websiteShellModule.shellPrimaryNav,
  websiteShellModule.shellWorkspaceRoutes,
  websiteShellModule.shellCompatibilityRoutes,
  websiteShellModule.shellProductionActions,
  websiteShellModule.publicRouteCtas,
  websiteShellModule.publicBodyCtaSets,
  websiteShellModule.contactPaths,
];

const shellHrefs = new Set();
for (const source of shellHrefSources) {
  collectHrefs(source, shellHrefs);
}

for (const href of [...shellHrefs].sort()) {
  if (!isSupportedHref(href)) {
    failures.push(`Unsupported critical CTA href: ${href}`);
  }
}

if (failures.length > 0) {
  console.error("Critical route smoke validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Critical route smoke validation passed for ${requiredAppRoutes.length} required routes and ${shellHrefs.size} critical CTA hrefs.`
);
