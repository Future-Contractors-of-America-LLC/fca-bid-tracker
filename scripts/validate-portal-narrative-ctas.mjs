import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const routesSource = await fs.readFile(path.join(root, "src", "routes.js"), "utf8");
const websiteShellModule = await import(pathToFileURL(path.join(root, "src", "websiteShell.js")).href);

function extractRouteKeys(source) {
  const routeBlockMatch = source.match(/export const routes = \{([\s\S]*?)\n\};/);
  if (!routeBlockMatch) {
    throw new Error("Unable to locate exported routes object in src/routes.js");
  }

  return [...routeBlockMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((match) => match[2]);
}

const routeSet = new Set(extractRouteKeys(routesSource));
const portalNarrativeCtaSets = websiteShellModule.portalNarrativeCtaSets || {};
const publicBodyCtaSets = websiteShellModule.publicBodyCtaSets || {};

const portalPageChecks = [
  {
    file: path.join(root, "src", "pages", "portal", "PortalBids.jsx"),
    requiredMarkers: [
      'activeHref="/portal/bids"',
      'primaryHref="/bid-entry"',
      "publicBodyCtaSets.portalCoordination",
      "portalNarrativeCtaSets.bidSalesNarrative",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalSupport.jsx"),
    requiredMarkers: [
      'activeHref="/portal/support"',
      'primaryHref="/contact"',
      "publicBodyCtaSets.portalCoordination",
      "portalNarrativeCtaSets.supportContext",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalMessages.jsx"),
    requiredMarkers: [
      'activeHref="/portal/messages"',
      'primaryHref="/portal/billing"',
      "publicBodyCtaSets.portalCoordination",
      "portalNarrativeCtaSets.messageStream",
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    requiredMarkers: [
      'activeHref="/portal/billing"',
      'primaryHref="/portal/admin"',
      "publicBodyCtaSets.portalCoordination",
      "portalNarrativeCtaSets.billingNarrative",
    ],
  },
];

function normalizePath(value) {
  if (!value || typeof value !== "string") return value;
  const withoutQueryOrHash = value.split("#")[0].split("?")[0];
  return withoutQueryOrHash.endsWith("/") && withoutQueryOrHash !== "/"
    ? withoutQueryOrHash.slice(0, -1)
    : withoutQueryOrHash;
}

function isSupportedHref(value) {
  if (!value || typeof value !== "string") return false;
  if (value.startsWith("mailto:")) return true;
  if (value.startsWith("https://") || value.startsWith("http://")) return true;
  return routeSet.has(normalizePath(value));
}

function validateActionArray(groupName, actions, failures) {
  if (!Array.isArray(actions) || actions.length === 0) {
    failures.push(`${groupName} must be a non-empty array.`);
    return;
  }

  for (const [index, action] of actions.entries()) {
    if (!action || typeof action !== "object") {
      failures.push(`${groupName}[${index}] is not an object.`);
      continue;
    }

    if (!action.label || typeof action.label !== "string") {
      failures.push(`${groupName}[${index}] is missing a label.`);
    }

    if (!isSupportedHref(action.href)) {
      failures.push(`${groupName}[${index}] points to an unsupported href: ${action.href}`);
    }
  }
}

const failures = [];

validateActionArray("publicBodyCtaSets.portalCoordination", publicBodyCtaSets.portalCoordination, failures);
validateActionArray("portalNarrativeCtaSets.bidSalesNarrative", portalNarrativeCtaSets.bidSalesNarrative, failures);
validateActionArray("portalNarrativeCtaSets.supportContext", portalNarrativeCtaSets.supportContext, failures);
validateActionArray("portalNarrativeCtaSets.messageStream", portalNarrativeCtaSets.messageStream, failures);
validateActionArray("portalNarrativeCtaSets.billingNarrative", portalNarrativeCtaSets.billingNarrative, failures);

for (const pageCheck of portalPageChecks) {
  const source = await fs.readFile(pageCheck.file, "utf8");
  for (const marker of pageCheck.requiredMarkers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(pageCheck.file)} no longer references required portal CTA marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Portal narrative CTA validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Portal narrative CTA validation passed for ${publicBodyCtaSets.portalCoordination.length} shared coordination actions and 4 portal narrative CTA groups.`
);
