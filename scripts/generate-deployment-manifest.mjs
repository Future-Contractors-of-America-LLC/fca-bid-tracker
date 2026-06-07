import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const target = path.join(root, "public", "deployment-status.json");

const payload = {
  service: "fca-bid-tracker",
  generatedAt: new Date().toISOString(),
  source: process.env.GITHUB_ACTIONS ? "github-actions" : "local-build",
  gitRef: process.env.GITHUB_REF || "local",
  gitSha: process.env.GITHUB_SHA || "local",
  runId: process.env.GITHUB_RUN_ID || "local",
  verificationRoutes: [
    "/deployment-status.json",
    "/api/auricrux",
    "/api/customer-login",
    "/login",
  ],
  deploymentIntent: "static-web-app-plus-functions",
};

await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Deployment manifest generated at ${target}`);
