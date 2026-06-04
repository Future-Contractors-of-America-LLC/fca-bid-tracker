import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'import { useEffect, useMemo, useRef, useState } from "react";',
      'import { clearCustomerSession, readCustomerSession } from "../customerSession";',
      'import { auricruxRail, currentProject, portalMessages, projectAuditEvents, workspaceContext } from "../workspaceState";',
      'import { publicActionCatalog } from "../websiteShell";',
      'const publicNavGroups = [',
      'const portalNavGroups = [',
      'const publicQuickLinks = [',
      'const portalQuickLinks = [',
      'label: "Open Customer Profile", href: "/portal/profile"',
      'const loginHref = "/login";',
      'const workspaceHref = session?.authenticated ? "/portal/profile" : "/login";',
      'Open Login Portal',
      'Open Workspace',
      'Enter Workspace',
      'const workspaceLabel = resolveWorkspaceLabel(session, mode);',
      'const continuityStamp = resolveContinuityStamp(session);',
      'const notificationCount = portalMessages.length;',
      'if (item.href === "/portal/profile") return "Live";',
      'if (item.href === "/portal/messages") return portalMessages.length;',
      'if (item.href === "/portal/projects") return currentProject.id;',
      'Customer profile active',
      'Login portal active',
      'window.addEventListener("resize", handleResize);',
      'window.location.assign("/login");',
      'Notifications',
      'Active project spine: {currentProject.id} · {workspaceContext.currentNextAction}',
      '{continuityStamp} · Auricrux: {auricruxRail.nextRecommendedAction}',
      'aria-label={profileLabel}',
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      'import PublicTopNav from "./PublicTopNav";',
      'topNavMode = "public"',
      '{showTopNav ? <PublicTopNav mode={topNavMode} /> : null}',
      'primaryHref && primaryLabel',
      'secondaryHref && secondaryLabel',
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'showTopNav',
      'topNavMode="portal"',
    ],
  },
  {
    file: path.join(root, "src", "routes.js"),
    markers: [
      'import PortalProfile from "./pages/portal/PortalProfile";',
      '"/portal/profile": PortalProfile,',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'title="Access FCA Workspace"',
      'Open Live Customer Workspace',
      'window.location.assign(nextHref);',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required public top-nav marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Public top nav validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Public top nav validation passed across public and portal top navigation surfaces.");
