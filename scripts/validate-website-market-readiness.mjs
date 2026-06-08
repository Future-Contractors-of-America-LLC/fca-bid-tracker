import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const homeSource = await fs.readFile(path.join(root, "src", "pages", "website", "Home.jsx"), "utf8");
const { websiteMarketReadiness } = await import(pathToFileURL(path.join(root, "src", "websiteMarketReadiness.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  const withoutQueryOrHash = value.split("#")[0].split("?")[0];
  return withoutQueryOrHash.endsWith("/") && withoutQueryOrHash !== "/"
    ? withoutQueryOrHash.slice(0, -1)
    : withoutQueryOrHash;
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!websiteMarketReadiness || typeof websiteMarketReadiness !== "object") {
  failures.push("websiteMarketReadiness export is missing.");
}
if (!Array.isArray(websiteMarketReadiness.buyerJourneys) || websiteMarketReadiness.buyerJourneys.length < 4) {
  failures.push("websiteMarketReadiness.buyerJourneys must contain at least 4 buyer journeys.");
}
if (!Array.isArray(websiteMarketReadiness.trustSignals) || websiteMarketReadiness.trustSignals.length < 3) {
  failures.push("websiteMarketReadiness.trustSignals must contain at least 3 trust signals.");
}
if (!Array.isArray(websiteMarketReadiness.conversionActions) || websiteMarketReadiness.conversionActions.length < 3) {
  failures.push("websiteMarketReadiness.conversionActions must contain at least 3 conversion actions.");
}

for (const [index, journey] of (websiteMarketReadiness.buyerJourneys || []).entries()) {
  if (!journey.title || !journey.audience || !journey.outcome || !journey.route || !journey.label) {
    failures.push(`websiteMarketReadiness.buyerJourneys[${index}] is missing required fields.`);
  }
  if (!routeSet.has(normalizePath(journey.route))) {
    failures.push(`websiteMarketReadiness.buyerJourneys[${index}] points to unsupported route: ${journey.route}`);
  }
  if (!Array.isArray(journey.proof) || journey.proof.length < 3) {
    failures.push(`websiteMarketReadiness.buyerJourneys[${index}] must define at least 3 proof points.`);
  }
}

for (const [index, action] of (websiteMarketReadiness.conversionActions || []).entries()) {
  if (!action.title || !action.href || !action.label) {
    failures.push(`websiteMarketReadiness.conversionActions[${index}] is missing required fields.`);
  }
  if (!routeSet.has(normalizePath(action.href))) {
    failures.push(`websiteMarketReadiness.conversionActions[${index}] points to unsupported route: ${action.href}`);
  }
}

const requiredMarkers = [
  "websiteMarketReadiness.buyerJourneys.map((journey)",
  "websiteMarketReadiness.trustSignals.map((signal)",
  "websiteMarketReadiness.conversionActions",
];

for (const marker of requiredMarkers) {
  if (!homeSource.includes(marker)) {
    failures.push(`Home.jsx no longer references required website market-readiness marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Website market-readiness validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Website market-readiness validation passed for ${websiteMarketReadiness.buyerJourneys.length} buyer journeys, ${websiteMarketReadiness.trustSignals.length} trust signals, and ${websiteMarketReadiness.conversionActions.length} conversion actions.`);
