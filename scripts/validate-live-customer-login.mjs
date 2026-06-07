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
      "updateCustomerSession",
      "isProtectedCustomerRoute",
      "hasCustomerProductAccess",
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'from "../customerSession"',
      'login({ email, company, role = "Owner / Admin", nextHref = "/portal/platform" })',
      "updateSession(updates = {})",
      "setProductAccess(product, enabled)",
      "logout()",
    ],
  },
  {
    file: path.join(root, "src", "router.jsx"),
    markers: [
      'import Login from "./pages/website/Login";',
      "hasCustomerProductAccess",
      "const needsCustomerLogin = isProtectedCustomerRoute(normalizedPath) && !session?.authenticated;",
      "const lacksProductAccess = !needsCustomerLogin && isProtectedCustomerRoute(normalizedPath) && !hasCustomerProductAccess(session, normalizedPath);",
      'accessMode={needsCustomerLogin ? "protected" : lacksProductAccess ? "restricted" : "direct"}',
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerSessionBar.jsx"),
    markers: [
      'import useCustomerSession from "../hooks/useCustomerSession";',
      "Live customer session",
      "Open Active Workspace",
      "Open Academy / LMS",
      "Open Auricrux",
      "Unavailable",
      "Sign Out",
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
      "Launch real customer product after login",
      "navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProfile.jsx"),
    markers: [
      "Live customer product controls",
      "toggleProduct(product.key, product.enabled)",
      "Disable Access",
      "Enable Access",
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "AccessRestricted.jsx"),
    markers: [
      "This customer route is not enabled for the current session",
      "Enabled product layers",
      "Return to profile",
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

console.log("Live customer login validation passed across session state, router guard, profile controls, and authenticated launch surfaces.");
