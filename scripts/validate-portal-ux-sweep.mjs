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
const sessionBar = read("src/components/CustomerSessionBar.jsx");
const journeyStrip = read("src/components/JourneyStrip.jsx");

if (!topNav.includes("portalNavPrimary")) fail("PublicTopNav must use portalNavPrimary");
if (!topNav.includes("portalNavGroups")) fail("PublicTopNav must use grouped portal navigation");
if (!topNav.includes("NavDropdown")) fail("PublicTopNav desktop portal nav must use NavDropdown groups");
if (!topNav.includes("Ask Auricrux")) fail("PublicTopNav must expose Ask Auricrux assistant trigger");
if (!topNav.includes("fca-topnav-blur")) fail("PublicTopNav must use premium sticky header treatment");

if (dock.includes("bottom: 12") || dock.includes("bottom:12")) {
  fail("AuricruxDock must not use fixed bottom bubble positioning");
}
if (!dock.includes("if (!open) return null")) fail("AuricruxDock must stay hidden until opened from nav");

if (!systemState.includes("portalNavPrimary")) fail("systemState must export portalNavPrimary");
if (!systemState.includes("portalNavGroups")) fail("systemState must export portalNavGroups");
if (!systemState.includes("portalHubHrefs")) fail("systemState must export portalHubHrefs");
if (!systemState.includes("portalHubModules")) fail("systemState must export portalHubModules");

if (!portalShell.includes("portalHubModules")) fail("PortalShell hub must use curated portalHubModules");
if (!portalShell.includes('compact={!isHubPage}')) fail("CustomerSessionBar must compact on detail pages");

if (!sessionBar.includes("compact = false")) fail("CustomerSessionBar must support compact mode");

if (!journeyStrip.includes("showGuidance = false")) fail("JourneyStrip must hide verbose Auricrux guidance by default");

if (!portalShell.includes("showRouteOverlay")) fail("PortalShell must support showRouteOverlay for detail pages");

const designTokens = read("src/portalDesignTokens.js");
const operationalToolPage = read("src/components/OperationalToolPage.jsx");
if (!designTokens.includes("portalButtonPrimary")) fail("portalDesignTokens must export shared button styles");
if (!operationalToolPage.includes("portalDesignTokens")) fail("OperationalToolPage must use portalDesignTokens");

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
