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
    file: path.join(root, "src", "components", "WorkspaceQuickActions.jsx"),
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
    file: path.join(root, "src", "components", "FounderJourneyStrip.jsx"),
    markers: [
      'import { isCurrentRouteHref } from "../ctaBehavior";',
      'const showCta = !isCurrentRouteHref(ctaHref, currentPath);',
      '<span key={step.key} style={sharedStyle} aria-current="page">',
    ],
  },
  {
    file: path.join(root, "src", "components", "ExecutiveSignalBar.jsx"),
    markers: [
      'import { isCurrentRouteHref } from "../ctaBehavior";',
      'const showAction = !isCurrentRouteHref(resolvedHref, currentPath);',
      '{showAction ? (',
    ],
  },
  {
    file: path.join(root, "src", "components", "BuildExpansionCommandDeck.jsx"),
    markers: [
      'import { resolveActionPair } from "../ctaBehavior";',
      'const { primary, secondary } = resolveActionPair(',
      '{primary ? <AuricruxExecutiveCommandInsight mode="deck" nextHref={primary.href} nextLabel={primary.label} /> : null}',
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
  {
    file: path.join(root, "src", "pages", "website", "Home.jsx"),
    markers: [
      'import { filterVisibleActions } from "../../ctaBehavior";',
      'const visibleSurfaceLinks = filterVisibleActions(publicSurfaceLinks, currentPath);',
      '{visibleSurfaceLinks.map((item) => (',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Platform.jsx"),
    markers: [
      'FCA helps contractor teams move from opportunity to delivery with real workflows for bids, estimates, proposals, projects, files, billing, support, Academy, and Auricrux guidance.',
      'marginBottom: 0',
      'Route groups around real work',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Pricing.jsx"),
    markers: [
      'Rollout checklist',
      'Products included in every rollout',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Contact.jsx"),
    markers: [
      'What happens in a walkthrough',
      'Walkthrough activation is not yet governed lead intake',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProfile.jsx"),
    markers: [
      "Live customer product controls",
      "Persisted customer profile state active",
      "Why this route matters",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalNotifications.jsx"),
    markers: [
      "Notifications now keep launch-user truth visible",
      "Persisted notifications state active",
      "Active notifications",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      "ProjectActionCenter",
      "Persisted project flow state active",
      'title="Projects"',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      "CustomerCommsLaunchpad",
      "Portal messages synced from Auricrux-Central",
      "Launch customer-enabled communications lanes",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    markers: [
      "Billing workspace",
      "Portal billing synced from Auricrux-Central",
      "CommercialContinuityFeed",
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

console.log("Public top nav validation passed across CTA dedupe, no-op suppression, and route-local cleanup surfaces.");
