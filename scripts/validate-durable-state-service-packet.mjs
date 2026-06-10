import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();

const requiredFiles = [
  "durable-state-service/package.json",
  "durable-state-service/host.json",
  "durable-state-service/.env.example",
  "durable-state-service/deployment.env.example",
  "durable-state-service/lib/apiKeyAuth.js",
  "durable-state-service/lib/defaultState.js",
  "durable-state-service/lib/durableStateRepository.js",
  "durable-state-service/lib/repositories/filesystemDurableStateRepository.js",
  "durable-state-service/lib/repositories/externalDatabaseReadyRepository.js",
  "durable-state-service/customer-state.js",
  "durable-state-service/README.md",
  "docs/FCA_DURABLE_SERVICE_DEPLOYMENT_AND_CUTOVER_PACKET.md",
  "docs/FCA_DURABLE_SERVICE_CUTOVER_CHECKLIST.md",
];

const missing = requiredFiles.filter((relativePath) => !fs.existsSync(path.join(repoRoot, relativePath)));

if (missing.length) {
  console.error("Durable state service packet is incomplete. Missing files:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

const customerStateRoute = fs.readFileSync(path.join(repoRoot, "durable-state-service/customer-state.js"), "utf8");
if (!customerStateRoute.includes('route: "customer-state/{customerId}"')) {
  console.error("customer-state durable service route is missing expected route binding.");
  process.exit(1);
}

const packetDoc = fs.readFileSync(path.join(repoRoot, "docs/FCA_DURABLE_SERVICE_DEPLOYMENT_AND_CUTOVER_PACKET.md"), "utf8");
if (!packetDoc.includes("Rollback order") || !packetDoc.includes("Required deployment order")) {
  console.error("Deployment and cutover packet is missing required deployment or rollback sections.");
  process.exit(1);
}

console.log("Durable state service deployment and cutover packet validation passed.");
