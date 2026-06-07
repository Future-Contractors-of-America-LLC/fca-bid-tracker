import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const siteMetadataModule = await import(pathToFileURL(path.join(root, "src", "siteMetadata.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeKeys = extractRouteKeys(routesSource);
const routeSet = new Set(routeKeys);
const routeMetadata = siteMetadataModule.routeMetadata || {};

const failures = [];
const metadataKeys = new Set(Object.keys(routeMetadata));
const routesRequiringMetadata = routeKeys.filter((route) => route !== "/not-found");

for (const route of routesRequiringMetadata) {
  const entry = routeMetadata[route];
  if (!entry) {
    failures.push(`Missing metadata entry for route: ${route}`);
    continue;
  }

  if (typeof entry.title !== "string" || !entry.title.trim()) {
    failures.push(`Metadata title is missing for route: ${route}`);
  }

  if (typeof entry.description !== "string" || !entry.description.trim()) {
    failures.push(`Metadata description is missing for route: ${route}`);
  }
}

for (const key of metadataKeys) {
  if (!routeSet.has(key) && key !== "/") {
    failures.push(`Metadata entry does not map to a live route: ${key}`);
  }
}

if (failures.length > 0) {
  console.error("Site metadata validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Site metadata validation passed for ${routesRequiringMetadata.length} live routes.`);
