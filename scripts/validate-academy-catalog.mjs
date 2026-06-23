import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalogSource = await fs.readFile(path.join(root, "src", "pages", "academy", "AcademyCatalog.jsx"), "utf8");
const taxonomyModule = await import(pathToFileURL(path.join(root, "src", "academyCatalogTaxonomy.js")).href);
const offeringsModule = await import(pathToFileURL(path.join(root, "src", "academyOfferings.js")).href);
const { academyCatalog } = await import(pathToFileURL(path.join(root, "src", "academyCatalog.js")).href);

const {
  CATALOG_PATHWAYS,
  CATALOG_TOPICS,
  PROGRAM_CATALOG_META,
} = taxonomyModule;
const { organizeCatalogHierarchy } = offeringsModule;

const failures = [];

if (!Array.isArray(CATALOG_PATHWAYS) || CATALOG_PATHWAYS.length < 4) {
  failures.push("CATALOG_PATHWAYS must define at least 4 pathways.");
}
if (!Array.isArray(CATALOG_TOPICS) || CATALOG_TOPICS.length < 10) {
  failures.push("CATALOG_TOPICS must define at least 10 topics.");
}
if (!academyCatalog?.programs?.length) {
  failures.push("academyCatalog.programs is missing.");
}

for (const program of academyCatalog.programs) {
  if (!PROGRAM_CATALOG_META[program.key]) {
    failures.push(`PROGRAM_CATALOG_META missing placement for ${program.key}`);
    continue;
  }
  const meta = PROGRAM_CATALOG_META[program.key];
  if (!meta.pathwayKey || !meta.topicKey || !meta.enrollment) {
    failures.push(`PROGRAM_CATALOG_META[${program.key}] is incomplete.`);
  }
  if (meta.enrollment.syllabusPublic !== true) {
    failures.push(`PROGRAM_CATALOG_META[${program.key}] must keep syllabusPublic: true.`);
  }
}

const hierarchy = organizeCatalogHierarchy([], { includeOperatorGuides: true });
const placedCount = hierarchy.reduce((sum, pathway) => sum + pathway.courseCount, 0);
if (placedCount < academyCatalog.programs.length) {
  failures.push(`organizeCatalogHierarchy placed ${placedCount}/${academyCatalog.programs.length} static programs.`);
}

const requiredMarkers = [
  "organizeCatalogHierarchy",
  "Choose a pathway",
  "Choose a topic",
  "View syllabus",
  "Enrollment",
];

for (const marker of requiredMarkers) {
  if (!catalogSource.includes(marker)) {
    failures.push(`AcademyCatalog.jsx missing required marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Academy catalog validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Academy catalog validation passed for ${academyCatalog.programs.length} programs across ${CATALOG_PATHWAYS.length} pathways and ${CATALOG_TOPICS.length} topics.`);
