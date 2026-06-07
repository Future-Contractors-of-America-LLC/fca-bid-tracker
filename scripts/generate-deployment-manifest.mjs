import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const publicDir = path.join(root, "public");
const target = path.join(publicDir, "deployment-status.json");
const defaultHost = "delightful-mushroom-0de67860f.7.azurestaticapps.net";
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
  expectedHosts: [
    "futurecontractorsofamerica.com",
    "www.futurecontractorsofamerica.com",
    defaultHost,
  ],
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
