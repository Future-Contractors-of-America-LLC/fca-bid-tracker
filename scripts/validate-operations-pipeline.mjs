import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const opsPageSource = await fs.readFile(path.join(root, "src", "pages", "portal", "PortalOperations.jsx"), "utf8");
const shellSource = await fs.readFile(path.join(root, "src", "websiteShell.js"), "utf8");
const { operationsPipeline } = await import(pathToFileURL(path.join(root, "src", "operationsPipeline.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!operationsPipeline || typeof operationsPipeline !== "object") {
  failures.push("operationsPipeline export is missing.");
}
if (!Array.isArray(operationsPipeline.stages) || operationsPipeline.stages.length < 7) {
  failures.push("operationsPipeline.stages must contain at least 7 stages.");
}
if (!Array.isArray(operationsPipeline.commandDeck) || operationsPipeline.commandDeck.length < 3) {
  failures.push("operationsPipeline.commandDeck must contain at least 3 actions.");
}

for (const [index, stage] of (operationsPipeline.stages || []).entries()) {
  if (!stage.title || !stage.owner || !stage.outcome || !stage.primaryRoute || !stage.primaryLabel) {
    failures.push(`operationsPipeline.stages[${index}] is missing required fields.`);
  }
  if (!routeSet.has(stage.primaryRoute)) {
    failures.push(`operationsPipeline.stages[${index}] points to unsupported route: ${stage.primaryRoute}`);
  }
  if (!Array.isArray(stage.artifacts) || stage.artifacts.length < 4) {
    failures.push(`operationsPipeline.stages[${index}] must define at least 4 artifacts.`);
  }
}

for (const [index, action] of (operationsPipeline.commandDeck || []).entries()) {
  if (!action.title || !action.detail || !action.href || !action.label) {
    failures.push(`operationsPipeline.commandDeck[${index}] is missing required fields.`);
  }
  if (!routeSet.has(action.href) && action.href !== "/platform") {
    failures.push(`operationsPipeline.commandDeck[${index}] points to unsupported route: ${action.href}`);
  }
}

const requiredMarkers = [
  "PortalWorkspaceRedirect",
  "/portal/operations",
  'href: "/portal/pipeline"',
  "publicActionCatalog.operations",
];

for (const marker of requiredMarkers) {
  if (![opsPageSource, shellSource, routesSource].some((source) => source.includes(marker))) {
    failures.push(`Expected operations pipeline marker not found: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Operations pipeline validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Operations pipeline validation passed for ${operationsPipeline.stages.length} stages and ${operationsPipeline.commandDeck.length} command actions.`);
