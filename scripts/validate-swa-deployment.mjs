import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const checks = [
  {
    file: path.join(root, ".github", "workflows", "azure-static-web-apps-delightful-mushroom-0de67860f.yml"),
    markers: [
      "Azure/static-web-apps-deploy@v1",
      "AURICRUX_SWA_NAME: fca-frontend",
      "AURICRUX_SWA_DEFAULT_HOST: delightful-mushroom-0de67860f.7.azurestaticapps.net",
      "AURICRUX_EXPECTED_HOSTS: futurecontractorsofamerica.com,www.futurecontractorsofamerica.com,delightful-mushroom-0de67860f.7.azurestaticapps.net",
      "Assert SWA deployment target configuration",
      "test -n \"$AZURE_STATIC_WEB_APPS_API_TOKEN\"",
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
      "find dist -maxdepth 1 -name 'commit-witness-*.txt' | grep -q .",
      "Archive governed deployment payload",
      "workspace/governed_swa_payload.tgz",
      "npm run verify:live-deployment",
      "AURICRUX_LIVE_VERIFY_HOSTS: ${{ env.AURICRUX_EXPECTED_HOSTS }}",
      "workspace/live_deployment_smoke_summary.json",
      "workspace/live_deployment_smoke_failures.txt",
      "test -f api/customer-login.js",
      "test -f api/auricrux.js"
    ],
    oneOfMarkers: [
      ["actions/upload-artifact@v4", "actions/upload-artifact@v6"]
    ]
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"verify:live-deployment": "node scripts/verify-live-deployment.mjs"',
      '"prebuild": "node scripts/generate-deployment-manifest.mjs && node scripts/generate-domain-continuity-witness.mjs && node scripts/generate-runtime-fingerprint.mjs"',
      '"validate:swa-deployment": "node scripts/validate-swa-deployment.mjs"'
    ]
  },
  {
    file: path.join(root, "scripts", "verify-live-deployment.mjs"),
    markers: [
      'process.env.AURICRUX_LIVE_VERIFY_HOSTS',
      'process.env.AURICRUX_SWA_DEFAULT_HOST',
      'process.env.AURICRUX_SWA_NAME',
      'process.env.GITHUB_SHA',
      'targetCommitWitnessRoute',
      'commit-witness-',
      'deployment.commitWitnessRoute',
      '"futurecontractorsofamerica.com"',
      '"www.futurecontractorsofamerica.com"',
      '"/deployment-status.json"',
      '"/runtime-fingerprint.txt"',
      '"/warranty"',
      '"/referrals"',
      'workspace',
      'live_deployment_smoke_summary.json',
      'live_deployment_smoke_failures.txt'
    ]
  }
];

const staticWebAppConfigs = [
  path.join(root, "staticwebapp.config.json"),
  path.join(root, "public", "staticwebapp.config.json"),
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers ?? []) {
    if (!source.includes(marker)) failures.push(`${path.relative(root, check.file)} is missing required deployment hardening marker: ${marker}`);
  }
  for (const markerSet of check.oneOfMarkers ?? []) {
    if (!markerSet.some((marker) => source.includes(marker))) {
      failures.push(`${path.relative(root, check.file)} is missing one of the required deployment hardening markers: ${markerSet.join(" OR ")}`);
    }
  }
}

const configSources = await Promise.all(staticWebAppConfigs.map((file) => fs.readFile(file, "utf8")));
const [rootConfigSource, publicConfigSource] = configSources;

for (const [index, source] of configSources.entries()) {
  const relativeFile = path.relative(root, staticWebAppConfigs[index]);
  for (const marker of ['"route": "/commit-witness-*.txt"', '"/*.txt"']) {
    if (!source.includes(marker)) failures.push(`${relativeFile} is missing required deployment hardening marker: ${marker}`);
  }
}

if (rootConfigSource !== publicConfigSource) {
  failures.push("staticwebapp.config.json and public/staticwebapp.config.json must remain byte-for-byte identical for deployed SWA routing parity.");
}

if (failures.length > 0) {
  console.error("Static Web App deployment validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Static Web App deployment validation passed for exact commit witness verification, root/public config parity, target preflight, governed payload archiving, default-host continuity checks, post-deploy live smoke retries, artifact preservation, governed witness pack continuity, and API deployment wiring.");
