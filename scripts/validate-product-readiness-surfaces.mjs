import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const blueprintModule = await import(pathToFileURL(path.join(root, "src", "productBlueprint.js")).href);
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const academyHomeSource = await fs.readFile(path.join(root, "src", "pages", "academy", "AcademyHome.jsx"), "utf8");
const homeSource = await fs.readFile(path.join(root, "src", "pages", "website", "Home.jsx"), "utf8");
const platformSource = await fs.readFile(path.join(root, "src", "pages", "website", "Platform.jsx"), "utf8");

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const { academyClassrooms, saasOperationalPathways, websiteEnterpriseProof } = blueprintModule;
const failures = [];

if (!Array.isArray(saasOperationalPathways) || saasOperationalPathways.length < 4) {
  failures.push("saasOperationalPathways must define at least 4 real SaaS pathways.");
}

if (!Array.isArray(academyClassrooms) || academyClassrooms.length < 4) {
  failures.push("academyClassrooms must define at least 4 classroom tracks.");
}

if (!Array.isArray(websiteEnterpriseProof) || websiteEnterpriseProof.length < 3) {
  failures.push("websiteEnterpriseProof must define at least 3 enterprise-proof statements.");
}

for (const [index, pathway] of (saasOperationalPathways || []).entries()) {
  if (!pathway.title || !pathway.outcome || !Array.isArray(pathway.modules) || pathway.modules.length < 4) {
    failures.push(`saasOperationalPathways[${index}] is missing required product detail.`);
  }
  if (!routeSet.has(pathway.href)) {
    failures.push(`saasOperationalPathways[${index}] points to unsupported href: ${pathway.href}`);
  }
}

for (const [index, classroom] of (academyClassrooms || []).entries()) {
  if (!classroom.title || !classroom.credential || !Array.isArray(classroom.modules) || classroom.modules.length < 4) {
    failures.push(`academyClassrooms[${index}] is missing required curriculum detail.`);
  }
  if (!routeSet.has(classroom.linkedSurface)) {
    failures.push(`academyClassrooms[${index}] points to unsupported linkedSurface: ${classroom.linkedSurface}`);
  }
}

const requiredMarkers = [
  "academyClassrooms.map((classroom)",
  "saasOperationalPathways.map((pathway)",
  "websiteEnterpriseProof.map((item)",
];

for (const marker of requiredMarkers) {
  const sources = [academyHomeSource, homeSource, platformSource];
  if (!sources.some((source) => source.includes(marker))) {
    failures.push(`Expected product readiness marker not found in customer-facing surfaces: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Product readiness surface validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Product readiness validation passed for ${saasOperationalPathways.length} SaaS pathways, ${academyClassrooms.length} academy classrooms, and ${websiteEnterpriseProof.length} enterprise website proof statements.`
);
