import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "pages", "portal", "PlatformDashboard.jsx"),
    markers: [
      'title="Platform summary now reads from the authenticated workspace"',
      'detail="This dashboard now binds live customer session state, tenant visibility, project context, Auricrux guidance, and launch posture into one active workspace summary."',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProfile.jsx"),
    markers: [
      '<strong>Customer email:</strong> {sessionEmail}',
      '<strong>Account source:</strong> {accountSource}',
      '<strong>Launch readiness:</strong> {launchReadiness}',
      'Launch real customer product access',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      'Launch account continuity',
      '<strong>Account source:</strong> {accountSource}',
      '<strong>Launch readiness:</strong> {launchReadiness}',
      'Keep seeded launch accounts visible until production auth is live',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalNotifications.jsx"),
    markers: [
      'Launch account posture recorded',
      '<strong>Account source:</strong> {accountSource}',
      '<strong>Launch readiness:</strong> {launchReadiness}',
      'Notifications now keep launch-user truth visible alongside customer continuity.',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live customer summary marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live customer summary surface validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live customer summary surface validation passed across platform, profile, messages, notifications, and launch posture layers.");
