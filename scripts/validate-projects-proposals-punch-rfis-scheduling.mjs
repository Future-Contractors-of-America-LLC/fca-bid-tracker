import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "projects-proposals-punch-rfis-scheduling-report.json");

const modules = [
  { route: "/portal/projects", file: "src/pages/portal/PortalProjects.jsx", markers: ['activeHref="/portal/projects"', "routeStateOverlays", "usePortalApiLoad"] },
  { route: "/portal/proposals", file: "src/pages/portal/PortalProposals.jsx", markers: ['activeHref="/portal/proposals"', "routeStateOverlays", "usePortalApiLoad"] },
  { route: "/portal/punch", file: "src/pages/portal/PortalPunch.jsx", markers: ['activeHref="/portal/punch"', "routeStateOverlays", "usePortalApiLoad"] },
  { route: "/portal/rfis", file: "src/pages/portal/PortalRfis.jsx", markers: ['activeHref="/portal/rfis"', "routeStateOverlays", "usePortalApiLoad"] },
  { route: "/portal/scheduling", file: "src/pages/portal/PortalScheduling.jsx", markers: ['activeHref="/portal/scheduling"', "routeStateOverlays", "usePortalApiLoad"] },
];

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

const errors = [];
for (const mod of modules) {
  const absolute = path.join(root, mod.file);
  const source = read(absolute);
  for (const marker of mod.markers) {
    if (!source.includes(marker)) {
      errors.push(`${mod.file} missing marker: ${marker}`);
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: modules.map((mod) => mod.route),
  checks: Object.fromEntries(modules.map((mod) => [mod.route, !errors.some((err) => err.startsWith(mod.file))])),
  errors,
};

if (!fs.existsSync(qcDir)) fs.mkdirSync(qcDir, { recursive: true });
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Projects/proposals/punch/rfis/scheduling validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Projects/proposals/punch/rfis/scheduling validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
