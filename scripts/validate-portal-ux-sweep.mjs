import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portalDir = path.join(root, "src", "pages", "portal");
const validJourneyKeys = new Set(["lead", "bid", "job", "coordination", "finance", "academy"]);

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

if (!topNav.includes("portalNavPrimary")) fail("PublicTopNav must use portalNavPrimary");
if (!topNav.includes("portalNavGroups")) fail("PublicTopNav must use grouped portal navigation");
if (!topNav.includes("NavDropdown")) fail("PublicTopNav desktop portal nav must use NavDropdown groups");
if (!topNav.includes("Ask Auricrux")) fail("PublicTopNav must expose Ask Auricrux assistant trigger");
if (!topNav.includes("toggleAuricruxAssistant")) fail("PublicTopNav must wire Auricrux assistant toggle");

if (dock.includes("bottom: 12") || dock.includes("bottom:12")) {
  fail("AuricruxDock must not use fixed bottom bubble positioning");
}
if (!dock.includes('if (!open) return null')) fail("AuricruxDock must stay hidden until opened from nav");

if (!systemState.includes("portalNavPrimary")) fail("systemState must export portalNavPrimary");
if (!systemState.includes("portalNavGroups")) fail("systemState must export portalNavGroups");
if (!systemState.includes("portalHubHrefs")) fail("systemState must export portalHubHrefs");

for (const page of fs.readdirSync(portalDir).filter((name) => name.endsWith(".jsx"))) {
  const source = fs.readFileSync(path.join(portalDir, page), "utf8");
  if (source.includes('currentJourney="project"')) {
    fail(`${page} uses invalid currentJourney="project" — use job or coordination`);
  }
  const journeyMatch = source.match(/currentJourney="([^"]+)"/);
  if (journeyMatch && !validJourneyKeys.has(journeyMatch[1])) {
    fail(`${page} uses unknown currentJourney="${journeyMatch[1]}"`);
  }
}

console.log("Portal UX sweep validation passed.");
