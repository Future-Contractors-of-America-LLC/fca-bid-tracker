import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const catalogModule = await import(pathToFileURL(path.join(root, "src", "academyCatalog.js")).href);
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const academyHomeSource = await fs.readFile(path.join(root, "src", "pages", "academy", "AcademyHome.jsx"), "utf8");
const academyCatalogSource = await fs.readFile(path.join(root, "src", "pages", "academy", "AcademyCatalog.jsx"), "utf8");
const websiteShellSource = await fs.readFile(path.join(root, "src", "websiteShell.js"), "utf8");

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
const programs = academyCatalog?.programs || [];

if (!Array.isArray(programs) || programs.length < 4) {
  failures.push("academyCatalog.programs must define at least 4 programs.");
}

for (const [index, program] of programs.entries()) {
  if (!program.title || !program.credential || !program.goal) {
    failures.push(`academyCatalog.programs[${index}] is missing title, credential, or goal.`);
  }
  if (!Array.isArray(program.outcomes) || program.outcomes.length < 4) {
    failures.push(`academyCatalog.programs[${index}] must define at least 4 outcomes.`);
  }
  if (!Array.isArray(program.courses) || program.courses.length < 3) {
    failures.push(`academyCatalog.programs[${index}] must define at least 3 courses.`);
  }
  if (!routeSet.has(program.linkedSurface)) {
    failures.push(`academyCatalog.programs[${index}] points to unsupported linkedSurface: ${program.linkedSurface}`);
  }
}

const requiredMarkers = [
  "/academy/catalog",
  "/portal/academy/catalog",
  "academyCatalog.programs.map((program)",
  "publicActionCatalog.academyCatalog",
];

for (const marker of requiredMarkers) {
  const sources = [academyHomeSource, academyCatalogSource, websiteShellSource, routesSource];
  if (!sources.some((source) => source.includes(marker))) {
    failures.push(`Expected academy catalog marker not found: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Academy catalog validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Academy catalog validation passed for ${programs.length} programs with dedicated catalog routes and CTA coverage.`);
