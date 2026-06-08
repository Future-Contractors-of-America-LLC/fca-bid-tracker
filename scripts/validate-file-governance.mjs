import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const filesPageSource = await fs.readFile(path.join(root, "src", "pages", "portal", "PortalFiles.jsx"), "utf8");
const { fileGovernance } = await import(pathToFileURL(path.join(root, "src", "fileGovernance.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }
  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const failures = [];

if (!fileGovernance || typeof fileGovernance !== "object") {
  failures.push("fileGovernance export is missing.");
}
if (!Array.isArray(fileGovernance.registers) || fileGovernance.registers.length < 3) {
  failures.push("fileGovernance.registers must contain at least 3 registers.");
}
if (!Array.isArray(fileGovernance.closeoutPackages) || fileGovernance.closeoutPackages.length < 4) {
  failures.push("fileGovernance.closeoutPackages must contain at least 4 items.");
}
if (!Array.isArray(fileGovernance.auditSignals) || fileGovernance.auditSignals.length < 3) {
  failures.push("fileGovernance.auditSignals must contain at least 3 signals.");
}

for (const [index, register] of (fileGovernance.registers || []).entries()) {
  if (!register.title || !register.purpose || !register.route || !register.label) {
    failures.push(`fileGovernance.registers[${index}] is missing required fields.`);
  }
  if (!routeSet.has(register.route)) {
    failures.push(`fileGovernance.registers[${index}] points to unsupported route: ${register.route}`);
  }
  if (!Array.isArray(register.artifacts) || register.artifacts.length < 4) {
    failures.push(`fileGovernance.registers[${index}] must define at least 4 artifacts.`);
  }
}

const requiredMarkers = [
  "fileGovernance.registers.map((register)",
  "fileGovernance.closeoutPackages.map((item)",
  "fileGovernance.auditSignals.map((signal)",
];

for (const marker of requiredMarkers) {
  if (!filesPageSource.includes(marker)) {
    failures.push(`PortalFiles.jsx no longer references required file-governance marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("File governance validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`File governance validation passed for ${fileGovernance.registers.length} registers, ${fileGovernance.closeoutPackages.length} closeout items, and ${fileGovernance.auditSignals.length} audit signals.`);
