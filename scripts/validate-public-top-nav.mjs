import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'import { useEffect, useMemo, useRef, useState } from "react";',
      'import { clearCustomerSession, readCustomerSession } from "../customerSession";',
      'import { publicActionCatalog } from "../websiteShell";',
      'key: "explore"',
      'key: "workspace"',
      'key: "company"',
      'setOpenMenu((prev) => (prev === group.key ? null : group.key))',
      'setOpenMenu((prev) => (prev === "profile" ? null : "profile"))',
      'const [mobileOpen, setMobileOpen] = useState(false);',
      'document.addEventListener("mousedown", handleClickAway);',
      'document.addEventListener("keydown", handleEscape);',
      'window.location.assign("/login");',
      'Live session: {session.company}',
      'Logout',
      'useEffect(() => {',
      '}, [currentPath]);',
      'aria-label={profileLabel}',
    ],
  },
  {
    file: path.join(root, "src", "components", "ShellHeader.jsx"),
    markers: [
      'import PublicTopNav from "./PublicTopNav";',
      'showTopNav = true',
      '{showTopNav ? <PublicTopNav /> : null}',
    ],
  },
  {
    file: path.join(root, "src", "components", "PortalShell.jsx"),
    markers: [
      'showTopNav={false}',
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

console.log("Public top nav validation passed across public header and portal shell guard surfaces.");
