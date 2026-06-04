import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "ctaBehavior.js"),
    markers: [
      'export function isCurrentRouteHref(href = "", currentPath = "/") {',
      'export function dedupeActions(actions = []) {',
      'export function filterVisibleActions(actions = [], currentPath = "/") {',
      'export function resolveActionPair(primaryAction, secondaryAction, currentPath = "/") {',
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicCtaRow.jsx"),
    markers: [
      'import { filterVisibleActions } from "../ctaBehavior";',
      'const visibleActions = filterVisibleActions(actions, currentPath);',
      'if (!visibleActions.length) return null;',
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicOperationsStrip.jsx"),
    markers: [
      'import { resolveActionPair } from "../ctaBehavior";',
      'const { primary, secondary } = resolveActionPair(',
      '{primary ? <AuricruxTrustInsight mode="operations" primaryHref={primary.href} primaryLabel={primary.label} /> : null}',
    ],
  },
  {
    file: path.join(root, "src", "components", "AuricruxPresenceLayer.jsx"),
    markers: [
      'import { resolveActionPair } from "../ctaBehavior";',
      'const { primary, secondary } = resolveActionPair(',
      '{primary || secondary ? (',
    ],
  },
  {
    file: path.join(root, "src", "components", "JourneyStrip.jsx"),
    markers: [
      'return isActive ? (',
      '<span key={item.key} style={sharedStyle} aria-current="page">',
      '<a key={item.key} href={item.href} style={sharedStyle}>',
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicActionRail.jsx"),
    markers: [
      'import { filterVisibleActions } from "../ctaBehavior";',
      'const productionActions = filterVisibleActions(shellProductionActions, currentPath);',
      'const workspaceRoutes = filterVisibleActions(shellWorkspaceRoutes.slice(0, 4), currentPath);',
      'secondaryHref="/login"',
      'secondaryLabel="Open Login Portal"',
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

console.log("Public top nav validation passed across CTA dedupe and no-op suppression surfaces.");
