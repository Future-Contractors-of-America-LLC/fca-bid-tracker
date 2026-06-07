import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const target = path.join(root, "public", "runtime-fingerprint.txt");

const lines = [
  `service=fca-bid-tracker`,
  `generatedAt=${new Date().toISOString()}`,
  `source=${process.env.GITHUB_ACTIONS ? "github-actions" : "local-build"}`,
  `gitRef=${process.env.GITHUB_REF || "local"}`,
  `gitSha=${process.env.GITHUB_SHA || "local"}`,
  `runId=${process.env.GITHUB_RUN_ID || "local"}`,
  `expectedHosts=futurecontractorsofamerica.com,www.futurecontractorsofamerica.com`,
  `continuityIntent=governed-public-runtime-fingerprint`
];

await fs.writeFile(target, `${lines.join("\n")}\n`, "utf8");
console.log(`Runtime fingerprint generated at ${target}`);
