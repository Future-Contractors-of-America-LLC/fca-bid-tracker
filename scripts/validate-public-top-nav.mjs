import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'import { useEffect, useMemo, useRef, useState } from "react";',
      'resolveLoginHref,',
      'resolveProfileHref,',
      'resolveWorkspaceEntryHref,',
      'const loginHref = resolveLoginHref();',
      'const workspaceHref = resolveWorkspaceEntryHref(session, mode === "portal" ? currentPath : "/portal/profile");',
      'const actionHref = session?.authenticated ? workspaceHref : loginHref;',
      'const actionLabel = session?.authenticated ? "Open Workspace" : "Open Login Portal";',
      'window.location.assign(loginHref);',
      '{isMobile ? (',
      'Continuity stamp:',
      'Active project spine: {currentProject.id} · {workspaceContext.currentNextAction}',
      '{continuityStamp} · Auricrux: {auricruxRail.nextRecommendedAction}',
      'aria-label={profileLabel}',
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      'import PublicTopNav from "./PublicTopNav";',
      'const renderHeaderActions = !(showTopNav && topNavMode === "public");',
      '{showTopNav ? <PublicTopNav mode={topNavMode} /> : null}',
      '{renderHeaderActions ? (',
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerSessionBar.jsx"),
    markers: [
      'function handleLogout() {',
      'logout();',
      'window.location.assign("/login");',
    ],
  },
  {
    file: path.join(root, "src", "customerSession.js"),
    markers: [
      'export function resolveLoginHref() {',
      'export function resolveProfileHref(session = readCustomerSession()) {',
      'export function resolveWorkspaceEntryHref(session = readCustomerSession(), requestedPath = "/portal/profile") {',
      'return "/portal/profile";',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'import { resolveWorkspaceEntryHref } from "../../customerSession";',
      'const requestedWorkspaceHref = accessMode === "protected" ? requestedPath : session?.nextHref || "/portal/profile";',
      'window.location.assign(resolveWorkspaceEntryHref(result.session, nextHref));',
      'primaryHref={isAuthenticated ? nextHref : "/login"}',
      'primaryLabel={isAuthenticated ? "Open Active Workspace" : "Open Login Portal"}',
      'onClick={handleResetSession}',
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

console.log("Public top nav validation passed across public navigation cleanliness and live login routing surfaces.");
