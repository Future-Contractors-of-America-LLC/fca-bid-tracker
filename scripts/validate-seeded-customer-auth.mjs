import fs from "fs/promises";
import path from "path";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = process.cwd();
const centralRoot = resolveCentralRoot(root);

const checks = [
  {
    file: path.join(root, "src", "customerAccounts.js"),
    markers: [
      "PRIMARY_TEST_ACCOUNT",
      "FCA-HandsOff-2026!",
      "resolveSeededCustomerAccount",
      "sanitizeSeededCustomerAccount",
    ],
  },
  {
    file: path.join(centralRoot, "customer-login", "__init__.py"),
    markers: [
      "PRIMARY_TEST_ACCOUNT",
      "launch.customer@futurecontractorsofamerica.com",
      "Set-Cookie",
      "authBoundary",
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      "authenticateWorkspaceAccount",
      "Password",
      "centralFetch(\"/api/customer-login\"",
      'accountSource: payload.authenticationMode || "api"',
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required seeded customer auth marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Seeded customer auth validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Seeded customer auth validation passed across shared account registry, central login route, and live login workspace entry.");
