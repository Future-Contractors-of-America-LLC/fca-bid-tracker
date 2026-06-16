import { publicPackageRouteGroups } from "../src/publicPackageRouteGroups.js";
import { routes } from "../src/routes.js";
import { academyCatalog } from "../src/academyCatalog.js";
import * as customerCommandTools from "../src/customerCommandTools.js";

const requiredAcademyProgramKeys = [
  "electrical-apprenticeship-year1",
  "osha30-certification-prep",
  "aas-construction-operations-sem1",
  "virginia-dpor-residential-license-prep",
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
    .filter((href) => !routes[href]);

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
