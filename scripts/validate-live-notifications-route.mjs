import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "pages", "portal", "PortalNotifications.jsx"),
    markers: [
      'title="Live Notifications and Continuity Alerts"',
      'activeHref="/portal/notifications"',
      'routeOverlay={routeStateOverlays.notifications}',
      'primaryHref="/portal/messages"',
      'title="Notifications now read from live workspace continuity"',
      'Launch account posture recorded',
      '<strong>Account source:</strong> {accountSource}',
      '<strong>Launch readiness:</strong> {launchReadiness}',
    ],
  },
  {
    file: path.join(root, "src", "routes.js"),
    markers: [
      'import PortalNotifications from "./pages/portal/PortalNotifications";',
      '"/portal/notifications": PortalNotifications,',
    ],
  },
  {
    file: path.join(root, "src", "systemState.js"),
    markers: [
      'notifications: {',
      'title: "Notification route state"',
      'href: "/portal/notifications",',
      'label: "Notifications",',
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicTopNav.jsx"),
    markers: [
      'label: "Open Notifications", href: "/portal/notifications", variant: "light"',
      'label: "Notifications", href: "/portal/notifications", variant: "secondary"',
      'if (item.href === "/portal/notifications") return portalMessages.length + 2;',
      'if (pathname.startsWith("/portal/notifications")) return "Notification continuity active";',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live notifications marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live notifications route validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live notifications route validation passed across portal route, system state, routes, shared top nav, and launch posture markers.");
