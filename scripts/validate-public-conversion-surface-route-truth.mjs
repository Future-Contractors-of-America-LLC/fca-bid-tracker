import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const surfaceFiles = [
  "src/pages/website/Home.jsx",
  "src/pages/website/Contact.jsx",
  "src/pages/website/Pricing.jsx",
  "src/pages/website/Platform.jsx",
  "src/pages/website/Auricrux.jsx"
];

const requiredImport = 'import PublicPackageRouteGroupsPanel from "../../components/PublicPackageRouteGroupsPanel";';
const requiredUsageTag = "<PublicPackageRouteGroupsPanel";

const results = [];
let failed = false;

for (const relativePath of surfaceFiles) {
  const absolutePath = path.join(root, relativePath);
  const content = await fs.readFile(absolutePath, "utf8");
  const hasImport = content.includes(requiredImport);
  const hasUsage = content.includes(requiredUsageTag);
  const ok = hasImport && hasUsage;
  if (!ok) failed = true;
  results.push({
    path: relativePath,
    hasImport,
    hasUsage,
    ok,
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  failed,
  surfaceCount: surfaceFiles.length,
  results,
};

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  process.exitCode = 1;
}
