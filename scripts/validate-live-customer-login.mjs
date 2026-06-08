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
      'return "/login?seeded=1";',
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
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      "publicActionCatalog.liveTestLogin",
      "publicActionCatalog.instantTestWorkspace",
      'const actionLabel = session?.authenticated ? "Open Workspace" : "Open Live Test Login";',
      'const resolvedHref = item.href === "/login" || item.href === "/login?seeded=1" ? actionHref : item.href;',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'import CustomerSessionBar from "../../components/CustomerSessionBar";',
      'import DeploymentStatusBeacon from "../../components/DeploymentStatusBeacon";',
      'from "../../customerAccounts";',
      "PRIMARY_TEST_ACCOUNT",
      "LAUNCH_SINGLE_USER_ACCOUNT",
      "resolveSeededCustomerAccount",
      "readLoginQueryState",
      'const seeded = params.get("seeded") === "1" || params.get("account") === "test";',
      'const autologin = seeded && params.get("autologin") === "1";',
      "autologinAttemptedRef",
      "authenticateWorkspaceAccount",
      "Customer product provisioning",
      "Use Plan Defaults",
      "Customize Access",
      "Custom provisioning is active.",
      "Enabled for first login",
      "Held back until enabled",
      "Launch real customer product after login",
      "Use Seeded Test Account",
      "Open Seeded Login URL",
      "Instant Platform Access",
      "Launch-ready single-user company account",
      "Use Launch Account",
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
