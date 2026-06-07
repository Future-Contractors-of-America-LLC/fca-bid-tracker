import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const checks = [
  {
    file: path.join(root, ".github", "workflows", "azure-static-web-apps-delightful-mushroom-0de67860f.yml"),
    markers: [
      "Azure/static-web-apps-deploy@v1",
      "skip_app_build: true",
      "skip_api_build: false",
      "app_location: dist",
      "api_location: api",
      "test -f dist/deployment-status.json",
      "test -f api/customer-login.js",
      "test -f api/auricrux.js",
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"prebuild": "node scripts/generate-deployment-manifest.mjs"',
      '"validate:swa-deployment": "node scripts/validate-swa-deployment.mjs"',
      'npm run validate:swa-deployment',
    ],
  },
  {
    file: path.join(root, "scripts", "generate-deployment-manifest.mjs"),
    markers: [
      '"deployment-status.json"',
      '"/api/auricrux"',
      '"/api/customer-login"',
      '"static-web-app-plus-functions"',
    ],
  },
  {
    file: path.join(root, "public", "deployment-status.json"),
    markers: [
      '"service": "fca-bid-tracker"',
      '"deploymentIntent": "static-web-app-plus-functions"',
    ],
  },
  {
    file: path.join(root, "staticwebapp.config.json"),
    markers: [
      '"route": "/api/*"',
      '"route": "/deployment-status.json"',
      '"route": "/index.html"',
      '"Cache-Control": "no-store, no-cache, must-revalidate"',
      '"X-Auricrux-Deployment-Intent": "live-login-and-public-shell-verification"',
      '"rewrite": "/index.html"',
      '"exclude": [',
      '"/deployment-status.json"',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.relative(root, check.file)} is missing required deployment hardening marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Static Web App deployment validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Static Web App deployment validation passed for app artifact continuity, API deployment wiring, cache-busting posture, and public deployment verification manifest generation.");
