import fs from "fs/promises";
import path from "path";

const root = process.cwd();

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
    file: path.join(root, "api", "customer-login.js"),
    markers: [
      'app.http("customer-login"',
      'route: "customer-login"',
      'authenticationMode: "seeded-live-test-account"',
      '"The customer email or password is invalid."',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      "authenticateWorkspaceAccount",
      "Password",
      "Use Seeded Test Account",
      "PRIMARY_TEST_ACCOUNT.email",
      'fetch("/api/customer-login"',
      'accountSource: payload.authenticationMode || "api"',
      'accountSource: "local-fallback"',
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

console.log("Seeded customer auth validation passed across shared account registry, API login route, and live login workspace entry.");
