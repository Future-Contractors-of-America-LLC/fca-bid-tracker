import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portalDir = path.join(root, "src", "pages", "portal");
const validJourneyKeys = new Set(["lead", "bid", "job", "coordination", "finance", "academy"]);
const SUBTITLE_MAX = 120;
const BANNED_PHRASES = ["branded workspace where", "continuity shell for", "instead of reading commentary"];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

const topNav = read("src/components/PublicTopNav.jsx");
const dock = read("src/components/AuricruxDock.jsx");
const systemState = read("src/systemState.js");
const portalShell = read("src/components/PortalShell.jsx");
const journeyStrip = read("src/components/JourneyStrip.jsx");

if (!topNav.includes("portalNavPrimary")) fail("PublicTopNav must use portalNavPrimary");
if (!topNav.includes("portalNavGroups")) fail("PublicTopNav must use grouped portal navigation");
if (!topNav.includes("fca-topnav-blur")) fail("PublicTopNav must use premium sticky header treatment");
if (!topNav.includes("iconOnly")) fail("PublicTopNav must use compact brand mark (iconOnly) to avoid unreadable duplicate brand text");

if (dock.includes("bottom: 12") || dock.includes("bottom:12")) {
  fail("AuricruxDock must not use fixed bottom bubble positioning");
}
if (!dock.includes("if (!open) return null")) fail("AuricruxDock must stay hidden until opened from nav");

if (!systemState.includes("portalNavPrimary")) fail("systemState must export portalNavPrimary");
if (!systemState.includes("portalNavGroups")) fail("systemState must export portalNavGroups");
if (!systemState.includes("portalHubHrefs")) fail("systemState must export portalHubHrefs");
if (!systemState.includes("portalHubModules")) fail("systemState must export portalHubModules");
if (!systemState.includes("PORTAL_SUBTITLE_MAX")) fail("systemState must export PORTAL_SUBTITLE_MAX");

if (!portalShell.includes("portalHubModules")) fail("PortalShell hub must use curated portalHubModules");
if (!portalShell.includes("ProjectSpineBar")) fail("PortalShell must show ProjectSpineBar as the single project context strip");
if (!portalShell.includes("PORTAL_SUBTITLE_MAX")) fail("PortalShell must truncate subtitles with PORTAL_SUBTITLE_MAX");
if (portalShell.includes("CustomerSessionBar")) {
  fail("PortalShell must not stack CustomerSessionBar — Account/Workspace live in PublicTopNav");
}
if (portalShell.includes("WorkspaceContextBar")) {
  fail("PortalShell must not stack WorkspaceContextBar — project context lives in ProjectSpineBar");
}
if (portalShell.includes("RouteStateOverlay") || portalShell.includes("RouteReadinessOverlay")) {
  fail("PortalShell must not mount route theater overlays");
}
if (portalShell.includes("showJourney={true}") || portalShell.includes("showJourney\n")) {
  fail("PortalShell must keep JourneyStrip off by default");
}

if (!journeyStrip.includes("showGuidance = false")) fail("JourneyStrip must hide verbose Auricrux guidance by default");

const designTokens = read("src/portalDesignTokens.js");
const operationalToolPage = read("src/components/OperationalToolPage.jsx");
const proofPath = read("src/components/portal/FounderProofPath.jsx");
const evidenceHook = read("src/hooks/useWorkflowEvidence.js");

if (!designTokens.includes("portalButtonPrimary")) fail("portalDesignTokens must export shared button styles");
if (!operationalToolPage.includes("portalDesignTokens")) fail("OperationalToolPage must use portalDesignTokens");
if (!operationalToolPage.includes("api-error")) fail("OperationalToolPage must fail closed with api-error (no localStorage-fallback theater)");
if (operationalToolPage.includes("localStorage-fallback")) {
  fail("OperationalToolPage must not silently fall back to localStorage when API handlers exist");
}
if (!proofPath.includes("Create demo records") && !proofPath.includes("seedDemoRecords")) {
  fail("FounderProofPath must expose Create demo records for a live PRJ-BID-1 walk");
}
if (evidenceHook.includes("seeded-system-state")) {
  fail("useWorkflowEvidence must not seed theater file/audit state");
}

const fallbackAwarePages = [
  { file: "src/pages/portal/PortalMessages.jsx", marker: 'apiBacking === "local-fallback"' },
  { file: "src/pages/portal/PortalSupport.jsx", marker: 'apiBacking === "local-fallback"' },
  { file: "src/pages/portal/PortalNotifications.jsx", marker: 'accountSource === "local-fallback"' },
];
for (const { file, marker } of fallbackAwarePages) {
  const source = read(file);
  if (!source.includes("PortalAlert")) fail(`${file} must surface PortalAlert for degraded API posture`);
  if (!source.includes(marker)) fail(`${file} must detect local-fallback workspace posture`);
}

for (const page of fs.readdirSync(portalDir).filter((name) => name.endsWith(".jsx"))) {
  const source = fs.readFileSync(path.join(portalDir, page), "utf8");
  if (source.includes('currentJourney="project"')) {
    fail(`${page} uses invalid currentJourney="project" — use job or coordination`);
  }
  const journeyMatch = source.match(/currentJourney="([^"]+)"/);
  if (journeyMatch && !validJourneyKeys.has(journeyMatch[1])) {
    fail(`${page} uses unknown currentJourney="${journeyMatch[1]}"`);
  }

  const subtitleMatch = source.match(/subtitle="([^"]+)"/);
  if (subtitleMatch) {
    const subtitle = subtitleMatch[1];
    if (subtitle.length > SUBTITLE_MAX) {
      fail(`${page} subtitle exceeds ${SUBTITLE_MAX} characters (${subtitle.length})`);
    }
    for (const phrase of BANNED_PHRASES) {
      if (subtitle.toLowerCase().includes(phrase)) {
        fail(`${page} subtitle contains banned marketing phrase: ${phrase}`);
      }
    }
  }
}

console.log("Portal UX sweep validation passed.");
