import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const adminPageSource = await fs.readFile(path.join(root, "src", "pages", "portal", "PortalAdmin.jsx"), "utf8");
const { adminGovernance } = await import(pathToFileURL(path.join(root, "src", "adminGovernance.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!adminGovernance || typeof adminGovernance !== "object") {
  failures.push("adminGovernance export is missing.");
}
if (!Array.isArray(adminGovernance.controls) || adminGovernance.controls.length < 3) {
  failures.push("adminGovernance.controls must contain at least 3 controls.");
}
if (!Array.isArray(adminGovernance.readinessSignals) || adminGovernance.readinessSignals.length < 4) {
  failures.push("adminGovernance.readinessSignals must contain at least 4 signals.");
}
if (!Array.isArray(adminGovernance.governanceActions) || adminGovernance.governanceActions.length < 3) {
  failures.push("adminGovernance.governanceActions must contain at least 3 actions.");
}

for (const [index, control] of (adminGovernance.controls || []).entries()) {
  if (!control.title || !control.purpose || !control.route || !control.label) {
    failures.push(`adminGovernance.controls[${index}] is missing required fields.`);
  }
  if (!routeSet.has(control.route)) {
    failures.push(`adminGovernance.controls[${index}] points to unsupported route: ${control.route}`);
  }
  if (!Array.isArray(control.artifacts) || control.artifacts.length < 4) {
    failures.push(`adminGovernance.controls[${index}] must define at least 4 artifacts.`);
  }
}

for (const [index, action] of (adminGovernance.governanceActions || []).entries()) {
  if (!action.title || !action.href || !action.label) {
    failures.push(`adminGovernance.governanceActions[${index}] is missing required fields.`);
  }
  if (!routeSet.has(action.href)) {
    failures.push(`adminGovernance.governanceActions[${index}] points to unsupported route: ${action.href}`);
  }
}

const requiredMarkers = [
  "adminGovernance.controls.map((control)",
  "adminGovernance.readinessSignals.map((signal)",
  "adminGovernance.governanceActions",
];

for (const marker of requiredMarkers) {
  if (!adminPageSource.includes(marker)) {
    failures.push(`PortalAdmin.jsx no longer references required admin-governance marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Admin governance validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Admin governance validation passed for ${adminGovernance.controls.length} controls, ${adminGovernance.readinessSignals.length} readiness signals, and ${adminGovernance.governanceActions.length} governance actions.`);
