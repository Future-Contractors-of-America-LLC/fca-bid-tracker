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
      'FCA helps contractor teams move from opportunity to delivery with better visibility into bids, approvals, project files, customer updates, billing steps, workforce readiness, and communications routing.',
      'marginBottom: 0',
      'Linked product areas',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Pricing.jsx"),
    markers: [
      'Review the rollout path, activate a real workspace if you are ready to move, then continue into contact, pricing fit, recurring-service posture, referral-readiness, and platform review through the shared action surfaces above instead of repeating the same CTA cluster again here.',
      'Immediate next actions',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Contact.jsx"),
    markers: [
      'The route-local CTA cluster was removed here so contact can stay focused on the walkthrough options, current pricing paths, shared next actions, and live workspace activation already presented above.',
      'What happens in a walkthrough',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProfile.jsx"),
    markers: [
      'Customer profile now reads from the live authenticated workspace',
      'Persisted profile state',
      'Why this route matters',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalNotifications.jsx"),
    markers: [
      'Notifications now read from live workspace continuity',
      'Persisted notification state',
      'Active notifications',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      'Project route is anchored to the live workspace state',
      'Persisted project state',
      'Project Lifecycle',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    markers: [
      'Persisted message state',
      'BuildExpansionCommandDeck',
      'Coordination stream',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    markers: [
      'Billing now reads from the live workspace state',
      'Persisted billing state',
      'Billing queue',
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
