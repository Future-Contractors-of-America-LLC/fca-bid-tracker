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
      "test -f dist/runtime-fingerprint.txt",
      "test -f dist/live-shell-verification.html",
      "test -f dist/host-binding-audit.html",
      "test -f dist/api-continuity-audit.html",
      "test -f api/customer-login.js",
      "test -f api/auricrux.js"
    ]
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"prebuild": "node scripts/generate-deployment-manifest.mjs && node scripts/generate-domain-continuity-witness.mjs && node scripts/generate-runtime-fingerprint.mjs"',
      '"validate:swa-deployment": "node scripts/validate-swa-deployment.mjs"',
      'npm run validate:swa-deployment'
    ]
  },
  {
    file: path.join(root, "public", "runtime-fingerprint.txt"),
    markers: [
      'service=fca-bid-tracker',
      'gitSha=pending-build',
      'expectedHosts=futurecontractorsofamerica.com,www.futurecontractorsofamerica.com',
      'continuityIntent=governed-public-runtime-fingerprint'
    ]
  },
  {
    file: path.join(root, "public", "host-binding-audit.html"),
    markers: [
      'FCA host binding audit',
      '/deployment-status.json',
      '/domain-continuity.json',
      '/runtime-fingerprint.txt',
      'Witness SHA aligned',
      'Current host'
    ]
  },
  {
    file: path.join(root, "public", "api-continuity-audit.html"),
    markers: [
      'FCA API continuity audit',
      '/api/customer-login',
      '/api/auricrux',
      '/runtime-fingerprint.txt',
      'partial API continuity only',
      'both public API continuity endpoints failed'
    ]
  },
  {
    file: path.join(root, "public", "staticwebapp.config.json"),
    markers: [
      '"route": "/runtime-fingerprint.txt"',
      '"/runtime-fingerprint.txt"',
      '"Content-Type": "text/plain; charset=utf-8"'
    ]
  }
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) failures.push(`${path.relative(root, check.file)} is missing required deployment hardening marker: ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("Static Web App deployment validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Static Web App deployment validation passed for governed runtime fingerprint generation, cross-artifact SHA alignment checks, witness pack continuity, host-binding audit surfaces, API continuity audit surfaces, and API deployment wiring.");
