import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesModule = await import(pathToFileURL(path.join(root, "src", "routes.js")).href);
const siteMetadataModule = await import(pathToFileURL(path.join(root, "src", "siteMetadata.js")).href);

const routes = routesModule.routes || {};
const routeKeys = Object.keys(routes);
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
  if (!routes[key] && key !== "/") {
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
