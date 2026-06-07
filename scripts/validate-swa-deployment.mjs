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
      "test -f dist/domain-continuity.json",
      "test -f dist/live-shell-verification.html",
      "test -f api/customer-login.js",
      "test -f api/auricrux.js",
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"prebuild": "node scripts/generate-deployment-manifest.mjs && node scripts/generate-domain-continuity-witness.mjs"',
      '"validate:swa-deployment": "node scripts/validate-swa-deployment.mjs"',
      'npm run validate:swa-deployment',
    ],
  },
  {
    file: path.join(root, "scripts", "generate-deployment-manifest.mjs"),
    markers: [
      '"deployment-status.json"',
      '"/live-shell-verification.html"',
      '"/api/auricrux"',
      '"/api/customer-login"',
      '"static-web-app-plus-functions"',
    ],
  },
  {
    file: path.join(root, "scripts", "generate-domain-continuity-witness.mjs"),
    markers: [
      '"domain-continuity.json"',
      '"futurecontractorsofamerica.com"',
      '"www.futurecontractorsofamerica.com"',
      '"/portal/platform"',
      '"/team"',
      '"apex-and-www-must-resolve-to-same-governed-swa-artifact"'
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
    file: path.join(root, "public", "domain-continuity.json"),
    markers: [
      '"witnessType": "domain-continuity"',
      '"futurecontractorsofamerica.com"',
      '"www.futurecontractorsofamerica.com"',
      '"knownUnexpectedRoutes"',
      '"/team"'
    ],
  },
  {
    file: path.join(root, "public", "live-shell-verification.html"),
    markers: [
      "FCA live shell verification",
      "/deployment-status.json",
      "/api/customer-login",
      "/api/auricrux",
      'cache: "no-store"',
      'Current host',
      'expectedHosts',
    ],
  },
  {
    file: path.join(root, "public", "staticwebapp.config.json"),
    markers: [
      '"route": "/api/*"',
      '"route": "/deployment-status.json"',
      '"route": "/live-shell-verification.html"',
      '"route": "/index.html"',
      '"Cache-Control": "no-store, no-cache, must-revalidate"',
      '"X-Auricrux-Deployment-Intent": "live-login-and-public-shell-verification"',
      '"rewrite": "/index.html"',
      '"exclude": [',
      '"/deployment-status.json"',
      '"/live-shell-verification.html"',
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

console.log("Static Web App deployment validation passed for app artifact continuity, API deployment wiring, cache-busting posture, raw hosting verification surfaces, deployed staticwebapp.config artifact continuity, domain continuity witness generation, and public deployment verification manifest generation.");
