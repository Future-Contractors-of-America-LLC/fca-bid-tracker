import fs from "fs";
import path from "path";

const root = process.cwd();

const requiredSurfaces = [
  "src/pages/website/Pricing.jsx",
  "src/pages/website/Home.jsx",
  "src/pages/website/Login.jsx",
  "src/pages/website/Contact.jsx",
  "src/pages/website/Platform.jsx",
  "src/pages/website/Auricrux.jsx"
];

const panelImportSnippet = 'PublicPackageRouteGroupsPanel';
const panelUsageSnippet = '<PublicPackageRouteGroupsPanel';

const results = [];
let failed = false;

for (const relativePath of requiredSurfaces) {
  const absolutePath = path.join(root, relativePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const hasImport = source.includes(panelImportSnippet);
  const hasUsage = source.includes(panelUsageSnippet);

  if (!hasImport || !hasUsage) {
    failed = true;
    results.push({
      path: relativePath,
      ok: false,
      hasImport,
      hasUsage,
      reason: "shared route-truth panel missing from public conversion surface"
    });
    continue;
  }

  results.push({
    path: relativePath,
    ok: true,
    hasImport,
    hasUsage
  });
}

const summary = {
  generatedAt: new Date().toISOString(),
  failed,
  requiredSurfaces,
  results
};

console.log(JSON.stringify(summary, null, 2));

if (failed) {
  process.exitCode = 1;
}
