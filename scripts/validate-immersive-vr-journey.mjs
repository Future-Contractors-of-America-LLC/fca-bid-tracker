#!/usr/bin/env node
/** Immersive / VR advancement journey � portal hub, WebXR probe, session mutations. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` � ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

const journey = [
  { step: "immersive-hub", href: "/portal/immersive", files: ["src/pages/portal/PortalImmersive.jsx"] },
  { step: "vr-viewport", files: ["src/components/immersive/ImmersiveVrViewport.jsx"] },
  { step: "design-takeoff", href: "/portal/design", files: ["src/pages/portal/PortalDesignWorkspace.jsx"] },
];

const routes = read("src/routes.js");
for (const stop of journey) {
  if (stop.href) {
    if (!routes.includes(`"${stop.href}"`) && !routes.includes(`'${stop.href}'`)) {
      fail(`immersive route ${stop.href}`);
    } else {
      pass(`immersive route ${stop.href}`);
    }
  }
  for (const file of stop.files) {
    if (!fs.existsSync(path.join(root, file))) fail(`immersive surface ${stop.step}`, file);
    else pass(`immersive surface ${stop.step}`);
  }
}

requireIncludes("src/api/immersiveClient.js", "startImmersiveLab", "immersive lab start client");
requireIncludes("src/api/immersiveClient.js", "recordImmersiveEvidence", "immersive evidence client");
requireIncludes("src/api/immersiveClient.js", "probeImmersiveVrSupport", "WebXR VR probe");
requireIncludes("src/pages/portal/PortalImmersive.jsx", "recordImmersiveEvidence", "immersive portal evidence mutation");
requireIncludes("src/components/immersive/ImmersiveVrViewport.jsx", "immersive-vr", "VR viewport immersive mode");
requireIncludes("core/immersive_sessions.py", "start_immersive_session", "central immersive session start", centralRoot);
requireIncludes("core/immersive_sessions.py", "record_immersive_evidence", "central immersive evidence", centralRoot);
requireIncludes("core/immersive_http.py", "record-evidence", "immersive HTTP evidence action", centralRoot);
requireIncludes("core/immersive_sessions.py", "immersive-vr", "VR mode support", centralRoot);

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "immersive-vr-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 8, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log("Immersive VR journey validation complete.");
