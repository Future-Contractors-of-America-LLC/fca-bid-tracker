import fs from "fs";

import { advise as veloryn } from "./agents/officers/veloryn.mjs";
import { advise as numarqon } from "./agents/officers/numarqon.mjs";
import { advise as jurivant } from "./agents/officers/jurivant.mjs";
import { advise as codarion } from "./agents/officers/codarion.mjs";
import { advise as fabroryn } from "./agents/officers/fabroryn.mjs";
import { advise as axioryn } from "./agents/officers/axioryn.mjs";

import { build as uiBuild } from "./agents/specialists/ui-builder.mjs";
import { build as academyBuild } from "./agents/specialists/academy-builder.mjs";
import { build as saasBuild } from "./agents/specialists/saas-builder.mjs";
import { build as commsBuild } from "./agents/specialists/comms-builder.mjs";

const MATRIX = "FCA_COVERAGE_MATRIX.md";

function parsePendingFeatures(text) {
  const blocks = text.split("FEATURE:").slice(1);
  return blocks
    .map(b => b.split("\n")[0].trim())
    .filter(Boolean);
}

function classifyTargets(pending) {
  const targets = new Set();
  for (const f of pending) {
    if (f.toLowerCase().includes("landing") || f.toLowerCase().includes("website")) targets.add("Public Landing Page");
    if (f.toLowerCase().includes("portal")) targets.add("Customer Portal");
    if (f.toLowerCase().includes("academy") || f.toLowerCase().includes("credential")) targets.add("Academy");
    if (f.toLowerCase().includes("communication") || f.toLowerCase().includes("telemetry")) targets.add("Comms");
  }
  return Array.from(targets);
}

function writeDigest(lines) {
  fs.mkdirSync("auricrux/outputs/digests", { recursive: true });
  const d = new Date();
  const stamp = d.toISOString().slice(0,10);
  const file = `auricrux/outputs/digests/daily-${stamp}.md`;
  fs.writeFileSync(file, lines.join("\n") + "\n");
  return file;
}

export async function runAuricrux() {
  const matrixLoaded = fs.existsSync(MATRIX);
  const matrixText = matrixLoaded ? fs.readFileSync(MATRIX, "utf-8") : "";
  const pending = matrixLoaded ? parsePendingFeatures(matrixText) : [];

  const buildTargets = classifyTargets(pending);

  const context = {
    matrixLoaded,
    publicIdentity: "Auricrux",
    buildTargets,
    costActionPlanned: false,
    externalCommitmentPlanned: false,
    experimentalChange: false
  };

  // Officer invocation model: invoked when decisions cross domains (parallel consult allowed)
  const officerAdvisories = await Promise.all([
    Promise.resolve(veloryn(context)),
    Promise.resolve(numarqon(context)),
    Promise.resolve(jurivant(context)),
    Promise.resolve(codarion(context)),
    Promise.resolve(fabroryn(context)),
    Promise.resolve(axioryn(context))
  ]);

  // Specialists build (executed under Auricrux)
  for (const t of buildTargets) {
    if (t === "Public Landing Page") uiBuild("Public Landing Page");
    if (t === "Customer Portal") saasBuild();
    if (t === "Academy") academyBuild();
    if (t === "Comms") commsBuild();
  }

  const digestLines = [
    `# Auricrux Daily Execution Digest`,
    ``,
    `## Pending features detected: ${pending.length}`,
    `## Build targets: ${buildTargets.join(", ") || "(none)"}`,
    ``,
    `## Officer advisories (internal-only)`,
    ...officerAdvisories.map(a => `- ${a.officer}: ${a.severity}${a.notes.length ? " — " + a.notes.join(" | ") : ""}`)
  ];

  const digestFile = writeDigest(digestLines);

  console.log("AURICRUX_EXEC_COMPLETE");
  console.log("DIGEST_FILE:", digestFile);
}