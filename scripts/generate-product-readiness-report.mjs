import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const blueprintModule = await import(pathToFileURL(path.join(root, "src", "productBlueprint.js")).href);
const routesModule = await import(pathToFileURL(path.join(root, "src", "routes.js")).href);

const { saasOperationalPathways = [], academyClassrooms = [], websiteEnterpriseProof = [] } = blueprintModule;
const routeKeys = Object.keys(routesModule.routes || {});
const timestamp = new Date().toISOString();

const report = {
  generatedAt: timestamp,
  routeCount: routeKeys.length,
  saasPathwayCount: saasOperationalPathways.length,
  academyClassroomCount: academyClassrooms.length,
  websiteEnterpriseProofCount: websiteEnterpriseProof.length,
  saasPathways: saasOperationalPathways.map((item) => ({
    title: item.title,
    audience: item.audience,
    href: item.href,
    moduleCount: Array.isArray(item.modules) ? item.modules.length : 0,
  })),
  academyClassrooms: academyClassrooms.map((item) => ({
    title: item.title,
    credential: item.credential,
    cadence: item.cadence,
    linkedSurface: item.linkedSurface,
    moduleCount: Array.isArray(item.modules) ? item.modules.length : 0,
  })),
  websiteEnterpriseProof,
};

const markdown = `# FCA Product Readiness Report\n\n- Generated at: ${timestamp}\n- Route count: ${report.routeCount}\n- SaaS pathways: ${report.saasPathwayCount}\n- Academy classrooms: ${report.academyClassroomCount}\n- Website enterprise proof statements: ${report.websiteEnterpriseProofCount}\n\n## SaaS Operational Pathways\n${saasOperationalPathways.map((item) => `- **${item.title}** (${item.audience}) → ${item.href} · ${item.modules.length} modules`).join("\n")}\n\n## Academy Classrooms\n${academyClassrooms.map((item) => `- **${item.title}** (${item.credential}) → ${item.linkedSurface} · ${item.modules.length} modules`).join("\n")}\n\n## Website Enterprise Proof\n${websiteEnterpriseProof.map((item) => `- **${item.title}** — ${item.detail}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "product-readiness-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "product-readiness-report.md"), markdown);

console.log(`Generated product readiness report with ${report.saasPathwayCount} SaaS pathways, ${report.academyClassroomCount} classrooms, and ${report.websiteEnterpriseProofCount} website proof statements.`);
