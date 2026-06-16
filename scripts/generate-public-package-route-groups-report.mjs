import fs from "fs/promises";
import path from "path";
import { publicPackageRouteGroups } from "../src/publicPackageRouteGroups.js";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const generatedAt = new Date().toISOString();
const report = {
  generatedAt,
  groupCount: publicPackageRouteGroups.length,
  groups: publicPackageRouteGroups.map((group) => ({
    key: group.key,
    title: group.title,
    detail: group.detail,
    routeCount: group.routes.length,
    routes: group.routes
  }))
};

const markdown = `# Public Package Route Groups Report\n\n- Generated at: ${generatedAt}\n- Route groups: ${report.groupCount}\n\n${report.groups.map((group) => `## ${group.title}\n\n${group.detail}\n\n${group.routes.map((route) => `- ${route.label} → ${route.href}`).join("\n")}`).join("\n\n")}`;

await fs.writeFile(path.join(outputDir, "public-package-route-groups-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "public-package-route-groups-report.md"), markdown);

console.log(`Generated public package route groups report with ${report.groupCount} groups.`);
