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
      'export default function PublicTopNav({ mode = "public" }) {',
      'const navGroups = mode === "portal" ? portalNavGroups : publicNavGroups;',
      'const quickLinks = mode === "portal" ? portalQuickLinks : publicQuickLinks;',
      'const routeCue = resolveRouteCue(currentPath, mode);',
      'const workspaceLabel = resolveWorkspaceLabel(session, mode);',
      'const continuityStamp = resolveContinuityStamp(session);',
      'const notificationCount = portalMessages.length;',
      'if (item.href === "/portal/messages") return portalMessages.length;',
      'if (item.href === "/portal/projects") return currentProject.id;',
      'Route cue: message continuity active',
      'Route cue: public shell entry active',
      'window.addEventListener("resize", handleResize);',
      'window.location.assign("/login");',
      'Live session: ${session.company}',
      'Portal continuity shell',
      'Public continuity shell',
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
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'showTopNav',
      'topNavMode="portal"',
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
