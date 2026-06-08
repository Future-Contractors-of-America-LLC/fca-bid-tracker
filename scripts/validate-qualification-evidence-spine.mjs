import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "qualificationEvidence.js"),
    markers: [
      'export const qualificationEvidencePackets = [',
      'readiness: "Evidence packet ready for estimator handoff"',
      'files: [',
      'checks: [',
      'nextAction: "Route evidence-backed qualification packet to estimating"',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBids.jsx"),
    markers: [
      'import { qualificationEvidencePackets } from "../../qualificationEvidence";',
      'const evidencePacket = qualificationEvidencePackets.find((packet) => packet.bidId === bid.id);',
      'Qualification evidence packet',
      '<strong>Linked files</strong>',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalFiles.jsx"),
    markers: [
      'import { qualificationEvidencePackets } from "../../qualificationEvidence";',
      'Qualification evidence handoff',
      'The file spine now proves why a bid was allowed to advance',
      'Linked evidence files',
      'Gate checks',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:qualification-evidence-spine": "node scripts/validate-qualification-evidence-spine.mjs"',
      'npm run validate:bid-workspace && npm run validate:qualification-evidence-spine && npm run validate:project-workspace',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required qualification evidence spine marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Qualification evidence spine validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Qualification evidence spine validation passed across bids, files, and build wiring.");
