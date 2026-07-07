import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const target = path.join(publicDir, "deployment-status.json");
const defaultHost =
  process.env.AURICRUX_DEPLOY_DEFAULT_HOST
  || process.env.AURICRUX_SWA_DEFAULT_HOST
  || "delightful-mushroom-0de67860f.7.azurestaticapps.net";
const gitSha = process.env.GITHUB_SHA || "local";
const commitWitnessRoute = `/commit-witness-${gitSha}.txt`;

const payload = {
  service: "fca-bid-tracker",
  generatedAt: new Date().toISOString(),
  source: process.env.GITHUB_ACTIONS ? "github-actions" : "local-build",
  gitRef: process.env.GITHUB_REF || "local",
  gitSha,
  runId: process.env.GITHUB_RUN_ID || "local",
  defaultHost,
  expectedHosts: (process.env.AURICRUX_EXPECTED_HOSTS || `futurecontractorsofamerica.com,www.futurecontractorsofamerica.com,${defaultHost}`)
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
  verificationRoutes: [
    "/deployment-status.json",
    "/live-shell-verification.html",
    "/api/auricrux",
    "/api/customer-login",
    "/login",
    commitWitnessRoute,
  ],
  commitWitnessRoute,
  deploymentIntent: "static-web-app-plus-functions",
};

await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
await fs.writeFile(path.join(publicDir, `commit-witness-${gitSha}.txt`), `gitSha=${gitSha}\nrunId=${payload.runId}\ndefaultHost=${defaultHost}\n`, "utf8");
console.log(`Deployment manifest generated at ${target}`);
