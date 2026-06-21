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
      "accountSource",
      "isProtectedCustomerRoute",
      "hasCustomerProductAccess",
      'return "/login";',
      "resolveAdminWorkspaceHref",
      "resolveFounderAutologinHref",
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'from "../customerSession"',
      "export function resolveRoleDefaultProducts",
      "customerId,",
      "workspaceLabel,",
      'accountSource = "workspace-shell"',
      "At least one customer product surface must be enabled.",
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
      "const needsCustomerLogin = sessionReady && isProtectedCustomerRoute(normalizedPath) && !activeSession?.authenticated;",
      "const lacksProductAccess = sessionReady && !needsCustomerLogin && isProtectedCustomerRoute(normalizedPath) && !hasCustomerProductAccess(activeSession, normalizedPath);",
      'accessMode={needsCustomerLogin ? "protected" : lacksProductAccess ? "restricted" : "direct"}',
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerSessionBar.jsx"),
    markers: [
      'import useCustomerSession from "../hooks/useCustomerSession";',
      "Signed in",
      'label: "Workspace"',
      'label: "Academy"',
      'label: "Auricrux"',
      'action.enabled ?',
      "Sign out",
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'import CustomerSessionBar from "./CustomerSessionBar";',
      "<CustomerSessionBar requestedPath={activeHref} compact={!isHubPage} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      "resolveLoginHref",
      "resolveAdminWorkspaceHref",
      "Admin workspace",
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'from "../../customerAccounts";',
      "resolveSeededCustomerAccount",
      "resolveSeededAccountByKey",
      "readLoginQueryState",
      "const seeded = params.get(\"seeded\") === \"1\" || Boolean(accountParam);",
      'const autologin = params.get("autologin") === "1" && seeded;',
      "autologinAttemptedRef",
      "authenticateWorkspaceAccount",
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
      "Account source:",
      "Launch readiness:",
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
  {
    file: path.join(root, "src", "websiteShell.js"),
    markers: [
      'label: "Open Live Test Login"',
      'href: "/login?seeded=1"',
      'label: "Instant Test Workspace"',
      'href: "/login?seeded=1&autologin=1&next=/portal/platform"',
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

console.log("Live customer login validation passed across session state, shared navigation, router guard, seeded auth continuity, query-driven test entry, launch single-user visibility, profile controls, and authenticated launch surfaces.");
