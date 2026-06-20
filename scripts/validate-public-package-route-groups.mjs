import { publicPackageRouteGroups } from "../src/publicPackageRouteGroups.js";
import { routes, routePatterns } from "../src/routes.js";
import { academyCatalog } from "../src/academyCatalog.js";
import * as customerCommandTools from "../src/customerCommandTools.js";

function matchRoutePattern(pattern, pathname) {
  const normalizedPattern = pattern.endsWith("/") && pattern !== "/" ? pattern.slice(0, -1) : pattern;
  const normalizedPath = pathname.endsWith("/") && pathname !== "/" ? pathname.slice(0, -1) : pathname;
  const patternParts = normalizedPattern.split("/").filter(Boolean);
  const pathParts = normalizedPath.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return false;
  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];
    if (patternPart.startsWith(":")) continue;
    if (patternPart !== pathPart) return false;
  }
  return true;
}

function isBackedRoute(href) {
  if (routes[href]) return true;
  return (routePatterns || []).some((entry) => matchRoutePattern(entry.pattern, href));
}

const requiredAcademyProgramKeys = [
  "electrical-apprenticeship-year1",
  "osha30-certification-prep",
  "aas-construction-operations-sem1",
  "virginia-dpor-residential-license-prep",
  "contractor-business-formation-legal",
  "contractor-construction-law-essentials",
  "fca-contractor-command-user-guide"
];

const requiredToolExports = [
  "stageMobilizationInvoiceTool",
  "createPermitEscalationTool"
];

const requiredRoutesByGroup = Object.fromEntries(
  publicPackageRouteGroups.map((group) => [group.key, group.routes.map((route) => route.href)])
);

const results = [];
let failed = false;

for (const group of publicPackageRouteGroups) {
  if (!group.routes?.length) {
    failed = true;
    results.push({ group: group.key, ok: false, reason: "group has no declared routes" });
    continue;
  }

  const missingRoutes = group.routes
    .map((route) => route.href)
    .filter((href) => !isBackedRoute(href));

  if (missingRoutes.length) {
    failed = true;
    results.push({ group: group.key, ok: false, reason: `missing route declarations: ${missingRoutes.join(", ")}` });
    continue;
  }

  results.push({ group: group.key, ok: true, routeCount: group.routes.length });
}

const missingProgramKeys = requiredAcademyProgramKeys.filter(
  (key) => !academyCatalog.programs.some((program) => program.key === key)
);
if (missingProgramKeys.length) {
  failed = true;
  results.push({ group: "academy-programs", ok: false, reason: `missing required academy tracks: ${missingProgramKeys.join(", ")}` });
} else {
  results.push({ group: "academy-programs", ok: true, programCount: academyCatalog.programs.length });
}

const missingToolExports = requiredToolExports.filter((name) => typeof customerCommandTools[name] !== "function");
if (missingToolExports.length) {
  failed = true;
  results.push({ group: "portal-command-tools", ok: false, reason: `missing command tools: ${missingToolExports.join(", ")}` });
} else {
  results.push({ group: "portal-command-tools", ok: true, toolCount: requiredToolExports.length });
}

const summary = {
  generatedAt: new Date().toISOString(),
  failed,
  requiredRoutesByGroup,
  results
};

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  process.exitCode = 1;
}
