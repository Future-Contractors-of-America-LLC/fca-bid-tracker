import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const supportPageSource = await fs.readFile(path.join(root, "src", "pages", "portal", "PortalSupport.jsx"), "utf8");
const { supportGovernance } = await import(pathToFileURL(path.join(root, "src", "supportGovernance.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!supportGovernance || typeof supportGovernance !== "object") {
  failures.push("supportGovernance export is missing.");
}
if (!Array.isArray(supportGovernance.lanes) || supportGovernance.lanes.length < 3) {
  failures.push("supportGovernance.lanes must contain at least 3 lanes.");
}
if (!Array.isArray(supportGovernance.responseSignals) || supportGovernance.responseSignals.length < 4) {
  failures.push("supportGovernance.responseSignals must contain at least 4 signals.");
}
if (!Array.isArray(supportGovernance.commsRecoveryActions) || supportGovernance.commsRecoveryActions.length < 3) {
  failures.push("supportGovernance.commsRecoveryActions must contain at least 3 actions.");
}

for (const [index, lane] of (supportGovernance.lanes || []).entries()) {
  if (!lane.title || !lane.purpose || !lane.route || !lane.label) {
    failures.push(`supportGovernance.lanes[${index}] is missing required fields.`);
  }
  if (!routeSet.has(lane.route)) {
    failures.push(`supportGovernance.lanes[${index}] points to unsupported route: ${lane.route}`);
  }
  if (!Array.isArray(lane.artifacts) || lane.artifacts.length < 4) {
    failures.push(`supportGovernance.lanes[${index}] must define at least 4 artifacts.`);
  }
}

for (const [index, action] of (supportGovernance.commsRecoveryActions || []).entries()) {
  if (!action.title || !action.href || !action.label) {
    failures.push(`supportGovernance.commsRecoveryActions[${index}] is missing required fields.`);
  }
  if (!routeSet.has(action.href)) {
    failures.push(`supportGovernance.commsRecoveryActions[${index}] points to unsupported route: ${action.href}`);
  }
}

const requiredMarkers = [
  "Auricrux Support Intelligence",
  "Support is currently running in local-fallback mode",
  "Create support ticket",
  "Open tickets",
];

for (const marker of requiredMarkers) {
  if (!supportPageSource.includes(marker)) {
    failures.push(`PortalSupport.jsx no longer references required support-governance marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Support governance validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Support governance validation passed for ${supportGovernance.lanes.length} lanes, ${supportGovernance.responseSignals.length} response signals, and ${supportGovernance.commsRecoveryActions.length} recovery actions.`);
