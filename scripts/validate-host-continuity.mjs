import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const checks = [
  {
    file: path.join(root, "src", "hostContinuity.js"),
    markers: [
      'import { FCA_APP_HOST, FCA_MARKETING_HOST } from "./config/domainHosts"',
      "ensureProductHostContinuity",
      'pathname === "/login"',
      "isProtectedCustomerRoute(pathname)",
      "window.location.replace",
    ],
  },
  {
    file: path.join(root, "src", "main.jsx"),
    markers: [
      'import { ensureProductHostContinuity } from "./hostContinuity"',
      "ensureProductHostContinuity()",
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} missing: ${marker}`);
    }
  }
}

if (failures.length) {
  console.error("Host continuity validation failed:");
  failures.forEach((f) => console.error(` - ${f}`));
  process.exit(1);
}

console.log("Host continuity validation passed.");
