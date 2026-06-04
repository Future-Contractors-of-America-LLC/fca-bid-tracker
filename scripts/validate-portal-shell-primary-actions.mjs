import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesModule = await import(pathToFileURL(path.join(root, "src", "routes.js")).href);

const routes = routesModule.routes || {};
const routeSet = new Set(Object.keys(routes));

const portalShellChecks = [
  {
    file: path.join(root, "src", "pages", "portal", "PortalHome.jsx"),
    activeHref: "/portal",
    primaryHref: "/portal/projects",
    primaryLabel: "Open Project Flow",
    currentJourney: "lead",
  },
  {
    file: path.join(root, "src", "pages", "portal", "PlatformDashboard.jsx"),
    activeHref: "/portal/platform",
    primaryHref: "/portal/projects",
    primaryLabel: "Open Project Flow",
    currentJourney: "lead",
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    activeHref: "/portal/projects",
    primaryHref: "/portal/files",
    primaryLabel: "Open Files",
    currentJourney: "job",
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalFiles.jsx"),
    activeHref: "/portal/files",
    primaryHref: "/portal/messages",
    primaryLabel: "Open Messages",
    currentJourney: "coordination",
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalAdmin.jsx"),
    activeHref: "/portal/admin",
    primaryHref: "/pricing",
    primaryLabel: "Plans & Rollout",
    currentJourney: "finance",
  },
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

function isLiveRoute(value) {
  const normalized = normalizePath(value);
  return typeof normalized === "string" && routeSet.has(normalized);
}

const failures = [];

for (const check of portalShellChecks) {
  const basename = path.basename(check.file);
  const source = await fs.readFile(check.file, "utf8");

  if (!source.includes(`activeHref="${check.activeHref}"`)) {
    failures.push(`${basename} is missing expected PortalShell activeHref ${check.activeHref}`);
  }

  if (!source.includes(`primaryHref="${check.primaryHref}"`)) {
    failures.push(`${basename} is missing expected PortalShell primaryHref ${check.primaryHref}`);
  }

  if (!source.includes(`primaryLabel="${check.primaryLabel}"`)) {
    failures.push(`${basename} is missing expected PortalShell primaryLabel ${check.primaryLabel}`);
  }

  if (!source.includes(`currentJourney="${check.currentJourney}"`)) {
    failures.push(`${basename} is missing expected PortalShell currentJourney ${check.currentJourney}`);
  }

  if (!source.includes("<PortalShell")) {
    failures.push(`${basename} no longer renders PortalShell.`);
  }

  if (!isLiveRoute(check.activeHref)) {
    failures.push(`${basename} activeHref does not map to a live route: ${check.activeHref}`);
  }

  if (!isLiveRoute(check.primaryHref)) {
    failures.push(`${basename} primaryHref does not map to a live route: ${check.primaryHref}`);
  }
}

if (failures.length > 0) {
  console.error("Portal shell primary action validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Portal shell primary action validation passed for ${portalShellChecks.length} portal shell routes.`
);
