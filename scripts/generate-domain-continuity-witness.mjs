import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const target = path.join(root, "public", "domain-continuity.json");

const payload = {
  service: "fca-bid-tracker",
  witnessType: "domain-continuity",
  generatedAt: new Date().toISOString(),
  source: process.env.GITHUB_ACTIONS ? "github-actions" : "local-build",
  gitRef: process.env.GITHUB_REF || "local",
  gitSha: process.env.GITHUB_SHA || "local",
  runId: process.env.GITHUB_RUN_ID || "local",
  expectedHosts: [
    "futurecontractorsofamerica.com",
    "www.futurecontractorsofamerica.com"
  ],
  canonicalRoutes: [
    "/",
    "/platform",
    "/login",
    "/pricing",
    "/contact",
    "/auricrux",
    "/academy",
    "/portal/platform",
    "/portal/projects",
    "/portal/files",
    "/portal/messages",
    "/portal/notifications",
    "/portal/bids",
    "/portal/billing",
    "/portal/support",
    "/portal/admin",
    "/portal/profile",
    "/portal/auricrux",
    "/live-shell-verification.html",
    "/deployment-status.json"
  ],
  knownUnexpectedRoutes: [
    "/team"
  ],
  continuityIntent: "apex-and-www-must-resolve-to-same-governed-swa-artifact"
};

await fs.writeFile(target, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Domain continuity witness generated at ${target}`);
