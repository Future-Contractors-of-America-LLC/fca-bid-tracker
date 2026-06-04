import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "customerSession.js"),
    markers: [
      "CUSTOMER_SESSION_KEY",
      "readCustomerSession",
      "writeCustomerSession",
      "isProtectedCustomerRoute",
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'from "../customerSession"',
      "login({ email, company, nextHref = \"/portal\" })",
      "logout()",
    ],
  },
  {
    file: path.join(root, "src", "router.jsx"),
    markers: [
      'import Login from "./pages/website/Login";',
      'import { readCustomerSession, isProtectedCustomerRoute } from "./customerSession";',
      "const needsCustomerLogin = isProtectedCustomerRoute(normalizedPath) && !session?.authenticated;",
      "accessMode={needsCustomerLogin ? \"protected\" : \"direct\"}",
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerSessionBar.jsx"),
    markers: [
      'import useCustomerSession from "../hooks/useCustomerSession";',
      "Live customer session",
      "Sign Out",
      "Open Active Workspace",
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'import CustomerSessionBar from "./CustomerSessionBar";',
      "<CustomerSessionBar requestedPath={activeHref} />",
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'import useCustomerSession from "../../hooks/useCustomerSession";',
      'import CustomerSessionBar from "../../components/CustomerSessionBar";',
      "Open Live Customer Workspace",
      "window.location.assign(nextHref);",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live customer login marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live customer login validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live customer login validation passed across session state, router guard, portal shell, and login route.");
