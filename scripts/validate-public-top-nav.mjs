import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "navigation.js"),
    markers: [
      'export const NAVIGATION_EVENT = "auricrux:navigate";',
      'export function isManagedAppPath(pathname = "/") {',
      'export function isManagedNavigationTarget(href = "") {',
      'if (href.endsWith(".html")) return false;',
      'window.dispatchEvent(new CustomEvent(NAVIGATION_EVENT, { detail: { href: nextPath } }));',
    ],
  },
  {
    file: path.join(root, "src", "router.jsx"),
    markers: [
      'const [normalizedPath, setNormalizedPath] = useState(readCurrentPath);',
      'function handleDocumentClick(event) {',
      'const anchor = event.target.closest("a[href]");',
      'if (!isManagedNavigationTarget(href)) return;',
      'event.preventDefault();',
      'navigateTo(href);',
      'window.addEventListener(NAVIGATION_EVENT, syncRouteFromLocation);',
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'import { navigateTo } from "../navigation";',
      'navigateTo(loginHref);',
      'const workspaceHref = resolveWorkspaceEntryHref(session, mode === "portal" ? currentPath : "/portal/profile");',
      'const actionHref = session?.authenticated ? workspaceHref : loginHref;',
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerSessionBar.jsx"),
    markers: [
      'import { navigateTo } from "../navigation";',
      'navigateTo("/login");',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Login.jsx"),
    markers: [
      'import { navigateTo } from "../../navigation";',
      'navigateTo(resolveWorkspaceEntryHref(result.session, nextHref));',
      'navigateTo("/login");',
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

console.log("Public top nav validation passed across internal SPA navigation and login continuity surfaces.");
