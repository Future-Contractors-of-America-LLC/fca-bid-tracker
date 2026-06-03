import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routerModule = await import(pathToFileURL(path.join(root, "router.jsx")).href);
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

const routes = routerModule.routes || {};
const routeSet = new Set(Object.keys(routes));

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

function isSupportedHref(href) {
  const normalized = normalizeHref(href);
  if (routeSet.has(normalized)) return true;
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
