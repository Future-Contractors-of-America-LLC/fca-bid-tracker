import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(
  qcDir,
  "admin-internal-billing-design-notifications-operations-pipeline-plans-revenue-engine-support-bids-profile-report.json",
);

const modules = [
  { route: "/portal/admin", file: "src/pages/portal/PortalAdmin.jsx", markers: ['activeHref="/portal/admin"', "routeStateOverlays"] },
  { route: "/portal/admin/internal", file: "src/pages/portal/PortalInternalCompany.jsx", markers: ['activeHref="/portal/admin/internal"', "routeStateOverlays"] },
  { route: "/portal/employee/internal", file: "src/pages/portal/PortalEmployeeInternalProfile.jsx", markers: ['activeHref="/portal/employee/internal"', "routeStateOverlays"] },
  { route: "/portal/billing", file: "src/pages/portal/PortalBilling.jsx", markers: ['activeHref="/portal/billing"', "routeStateOverlays"] },
  { route: "/portal/design", file: "src/pages/portal/PortalDesignWorkspace.jsx", markers: ['activeHref="/portal/design"', "routeStateOverlays"] },
  { route: "/portal/notifications", file: "src/pages/portal/PortalNotifications.jsx", markers: ['activeHref="/portal/notifications"', "routeStateOverlays"] },
  { route: "/portal/operations", file: "src/pages/portal/PortalOperations.jsx", markers: ['activeHref="/portal/operations"', "routeStateOverlays"] },
  { route: "/portal/pipeline", file: "src/pages/portal/PortalPipeline.jsx", markers: ['activeHref="/portal/pipeline"', "routeStateOverlays"] },
  { route: "/portal/plans", file: "src/pages/portal/PortalPlans.jsx", markers: ['activeHref="/portal/plans"', "routeStateOverlays"] },
  { route: "/portal/revenue-engine", file: "src/pages/portal/PortalRevenueEngine.jsx", markers: ['activeHref="/portal/revenue-engine"', "routeStateOverlays"] },
  { route: "/portal/support", file: "src/pages/portal/PortalSupport.jsx", markers: ['activeHref="/portal/support"', "routeStateOverlays"] },
  { route: "/portal/bids", file: "src/pages/portal/PortalBids.jsx", markers: ['activeHref="/portal/bids"', "routeStateOverlays"] },
  { route: "/portal/profile", file: "src/pages/portal/PortalProfile.jsx", markers: ['activeHref="/portal/profile"', "routeStateOverlays"] },
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
  console.error("Admin/internal/billing/design/notifications/operations/pipeline/plans/revenue/support/bids/profile validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Admin/internal/billing/design/notifications/operations/pipeline/plans/revenue/support/bids/profile validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
