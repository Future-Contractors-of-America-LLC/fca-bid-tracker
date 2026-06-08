import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const billingPageSource = await fs.readFile(path.join(root, "src", "pages", "portal", "PortalBilling.jsx"), "utf8");
const { billingGovernance } = await import(pathToFileURL(path.join(root, "src", "billingGovernance.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!billingGovernance || typeof billingGovernance !== "object") {
  failures.push("billingGovernance export is missing.");
}
if (!Array.isArray(billingGovernance.lanes) || billingGovernance.lanes.length < 3) {
  failures.push("billingGovernance.lanes must contain at least 3 lanes.");
}
if (!Array.isArray(billingGovernance.revenueSignals) || billingGovernance.revenueSignals.length < 4) {
  failures.push("billingGovernance.revenueSignals must contain at least 4 signals.");
}
if (!Array.isArray(billingGovernance.conversionLinks) || billingGovernance.conversionLinks.length < 3) {
  failures.push("billingGovernance.conversionLinks must contain at least 3 links.");
}

for (const [index, lane] of (billingGovernance.lanes || []).entries()) {
  if (!lane.title || !lane.purpose || !lane.route || !lane.label) {
    failures.push(`billingGovernance.lanes[${index}] is missing required fields.`);
  }
  if (!routeSet.has(lane.route)) {
    failures.push(`billingGovernance.lanes[${index}] points to unsupported route: ${lane.route}`);
  }
  if (!Array.isArray(lane.artifacts) || lane.artifacts.length < 4) {
    failures.push(`billingGovernance.lanes[${index}] must define at least 4 artifacts.`);
  }
}

for (const [index, link] of (billingGovernance.conversionLinks || []).entries()) {
  if (!link.title || !link.href || !link.label) {
    failures.push(`billingGovernance.conversionLinks[${index}] is missing required fields.`);
  }
  if (!routeSet.has(link.href)) {
    failures.push(`billingGovernance.conversionLinks[${index}] points to unsupported route: ${link.href}`);
  }
}

const requiredMarkers = [
  "billingGovernance.lanes.map((lane)",
  "billingGovernance.revenueSignals.map((signal)",
  "billingGovernance.conversionLinks",
];

for (const marker of requiredMarkers) {
  if (!billingPageSource.includes(marker)) {
    failures.push(`PortalBilling.jsx no longer references required billing-governance marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Billing governance validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Billing governance validation passed for ${billingGovernance.lanes.length} lanes, ${billingGovernance.revenueSignals.length} revenue signals, and ${billingGovernance.conversionLinks.length} conversion links.`);
