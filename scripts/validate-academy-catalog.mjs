import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const academyHomeSource = await fs.readFile(path.join(root, "src", "pages", "academy", "AcademyHome.jsx"), "utf8");
const catalogModule = await import(pathToFileURL(path.join(root, "src", "academyCatalog.js")).href);
const { academyCatalog } = catalogModule;

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!academyCatalog || typeof academyCatalog !== "object") {
  failures.push("academyCatalog export is missing.");
}

if (!Array.isArray(academyCatalog.programs) || academyCatalog.programs.length < 4) {
  failures.push("academyCatalog.programs must contain at least 4 programs.");
}
if (!Array.isArray(academyCatalog.credentials) || academyCatalog.credentials.length < 4) {
  failures.push("academyCatalog.credentials must contain at least 4 credentials.");
}
if (!Array.isArray(academyCatalog.pathways) || academyCatalog.pathways.length < 3) {
  failures.push("academyCatalog.pathways must contain at least 3 pathways.");
}

for (const [index, program] of (academyCatalog.programs || []).entries()) {
  if (!program.title || !program.credential || !program.audience || !program.duration || !program.format || !program.outcome) {
    failures.push(`academyCatalog.programs[${index}] is missing required fields.`);
  }
  if (!Array.isArray(program.classrooms) || program.classrooms.length === 0) {
    failures.push(`academyCatalog.programs[${index}] must reference at least one classroom.`);
  }
  if (!Array.isArray(program.stack) || program.stack.length < 3) {
    failures.push(`academyCatalog.programs[${index}] must list at least 3 stack surfaces.`);
  }
}

for (const [index, pathway] of (academyCatalog.pathways || []).entries()) {
  if (!pathway.title || !pathway.description || !pathway.label) {
    failures.push(`academyCatalog.pathways[${index}] is missing required pathway fields.`);
  }
  if (!routeSet.has(pathway.route)) {
    failures.push(`academyCatalog.pathways[${index}] points to unsupported route: ${pathway.route}`);
  }
}

const requiredMarkers = [
  "academyCatalog.programs.map((program)",
  "academyCatalog.credentials.map((credential)",
  "academyCatalog.pathways.map((pathway)",
];

for (const marker of requiredMarkers) {
  if (!academyHomeSource.includes(marker)) {
    failures.push(`AcademyHome.jsx no longer references required academy catalog marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Academy catalog validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Academy catalog validation passed for ${academyCatalog.programs.length} programs, ${academyCatalog.credentials.length} credentials, and ${academyCatalog.pathways.length} pathways.`);
