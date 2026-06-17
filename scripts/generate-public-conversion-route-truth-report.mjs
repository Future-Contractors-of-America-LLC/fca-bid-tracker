import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const requiredSurfaces = [
  "src/pages/website/Pricing.jsx",
  "src/pages/website/Home.jsx",
  "src/pages/website/Login.jsx",
  "src/pages/website/Contact.jsx",
  "src/pages/website/Platform.jsx",
  "src/pages/website/Auricrux.jsx"
];

const report = {
  generatedAt: new Date().toISOString(),
  surfaceCount: requiredSurfaces.length,
  surfaces: requiredSurfaces
};

const markdown = `# Public Conversion Route Truth Report\n\n- Generated at: ${report.generatedAt}\n- Shared route-truth conversion surfaces: ${report.surfaceCount}\n\n${report.surfaces.map((surface) => `- ${surface}`).join("\n")}`;

await fs.writeFile(path.join(outputDir, "public-conversion-route-truth-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "public-conversion-route-truth-report.md"), markdown);

console.log(`Generated public conversion route truth report for ${report.surfaceCount} surfaces.`);
