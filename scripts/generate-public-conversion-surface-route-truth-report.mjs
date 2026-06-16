import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const surfaceFiles = [
  "src/pages/website/Home.jsx",
  "src/pages/website/Login.jsx",
  "src/pages/website/Contact.jsx",
  "src/pages/website/Pricing.jsx",
  "src/pages/website/Platform.jsx",
  "src/pages/website/Auricrux.jsx"
];

const requiredImport = 'import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";';
const requiredUsageTag = "<PublicPackageRouteGroupsPanel";
const generatedAt = new Date().toISOString();

const results = [];
for (const relativePath of surfaceFiles) {
  const content = await fs.readFile(path.join(root, relativePath), "utf8");
  results.push({
    path: relativePath,
    hasImport: content.includes(requiredImport),
    hasUsage: content.includes(requiredUsageTag),
  });
}

const report = {
  generatedAt,
  surfaceCount: results.length,
  results,
};

const markdown = `# Public Conversion Surface Route Truth Report\n\n- Generated at: ${generatedAt}\n- Surfaces checked: ${results.length}\n\n${results.map((result) => `- **${result.path}** · import: ${result.hasImport ? "yes" : "no"} · usage: ${result.hasUsage ? "yes" : "no"}`).join("\n")}`;

await fs.writeFile(path.join(outputDir, "public-conversion-surface-route-truth-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "public-conversion-surface-route-truth-report.md"), markdown);

console.log(`Generated public conversion surface route truth report for ${results.length} surfaces.`);
