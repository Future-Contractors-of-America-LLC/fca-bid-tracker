import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesModule = await import(pathToFileURL(path.join(root, "src", "routes.js")).href);
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

const routes = routesModule.routes || {};
const routeSet = new Set(Object.keys(routes));
const academyCtaSets = websiteShellModule.academyCtaSets || {};
const publicBodyCtaSets = websiteShellModule.publicBodyCtaSets || {};
const shellHeaderCtaSets = websiteShellModule.shellHeaderCtaSets || {};
const executiveSignalCtaSets = websiteShellModule.executiveSignalCtaSets || {};

const academyHomePath = path.join(root, "src", "pages", "academy", "AcademyHome.jsx");
const academyHomeSource = await fs.readFile(academyHomePath, "utf8");

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  return value.endsWith("/") && value !== "/" ? value.slice(0, -1) : value;
}

function isSupportedHref(value) {
  if (!value || typeof value !== "string") return false;
  if (value.startsWith("mailto:")) return true;
  return routeSet.has(normalizePath(value));
}

function validateActionArray(groupName, actions, failures) {
  if (!Array.isArray(actions) || actions.length === 0) {
    failures.push(`${groupName} must be a non-empty array.`);
    return;
  }

  for (const [index, action] of actions.entries()) {
    if (!action || typeof action !== "object") {
      failures.push(`${groupName}[${index}] is not an object.`);
      continue;
    }

    if (!action.label || typeof action.label !== "string") {
      failures.push(`${groupName}[${index}] is missing a label.`);
    }

    if (!isSupportedHref(action.href)) {
      failures.push(`${groupName}[${index}] points to an unsupported href: ${action.href}`);
    }
  }
}

const failures = [];

validateActionArray("academyCtaSets.continuityActions", academyCtaSets.continuityActions, failures);
validateActionArray("academyCtaSets.connectedPortalRoutes", academyCtaSets.connectedPortalRoutes, failures);
validateActionArray("academyCtaSets.productionClose", academyCtaSets.productionClose, failures);
validateActionArray("publicBodyCtaSets.academyEntry", publicBodyCtaSets.academyEntry, failures);

if (!shellHeaderCtaSets.academy || typeof shellHeaderCtaSets.academy !== "object") {
  failures.push("shellHeaderCtaSets.academy is missing.");
} else {
  if (!isSupportedHref(shellHeaderCtaSets.academy.primaryHref)) {
    failures.push(`shellHeaderCtaSets.academy.primaryHref is not a live route: ${shellHeaderCtaSets.academy.primaryHref}`);
  }

  if (!shellHeaderCtaSets.academy.primaryLabel || typeof shellHeaderCtaSets.academy.primaryLabel !== "string") {
    failures.push("shellHeaderCtaSets.academy.primaryLabel is missing.");
  }

  if (!isSupportedHref(shellHeaderCtaSets.academy.secondaryHref)) {
    failures.push(`shellHeaderCtaSets.academy.secondaryHref is not a supported route: ${shellHeaderCtaSets.academy.secondaryHref}`);
  }

  if (!shellHeaderCtaSets.academy.secondaryLabel || typeof shellHeaderCtaSets.academy.secondaryLabel !== "string") {
    failures.push("shellHeaderCtaSets.academy.secondaryLabel is missing.");
  }
}

if (!executiveSignalCtaSets.academy || typeof executiveSignalCtaSets.academy !== "object") {
  failures.push("executiveSignalCtaSets.academy is missing.");
} else {
  if (!isSupportedHref(executiveSignalCtaSets.academy.href)) {
    failures.push(`executiveSignalCtaSets.academy.href is not a supported route: ${executiveSignalCtaSets.academy.href}`);
  }

  if (!executiveSignalCtaSets.academy.label || typeof executiveSignalCtaSets.academy.label !== "string") {
    failures.push("executiveSignalCtaSets.academy.label is missing.");
  }
}

const requiredSourceMarkers = [
  "shellHeaderCtaSets.academy.primaryHref",
  "shellHeaderCtaSets.academy.primaryLabel",
  "shellHeaderCtaSets.academy.secondaryHref",
  "shellHeaderCtaSets.academy.secondaryLabel",
  "executiveSignalCtaSets.academy.href",
  "executiveSignalCtaSets.academy.label",
  "publicBodyCtaSets.academyEntry",
  "academyCtaSets.continuityActions",
  "academyCtaSets.connectedPortalRoutes",
  "academyCtaSets.productionClose",
];

for (const marker of requiredSourceMarkers) {
  if (!academyHomeSource.includes(marker)) {
    failures.push(`AcademyHome.jsx no longer references required academy CTA marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Academy CTA continuity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Academy CTA continuity validation passed for ${academyCtaSets.continuityActions.length} continuity actions, ${academyCtaSets.connectedPortalRoutes.length} connected routes, ${academyCtaSets.productionClose.length} production-close actions, and ${publicBodyCtaSets.academyEntry.length} academy entry actions.`
);
