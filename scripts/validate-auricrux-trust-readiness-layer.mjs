import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxTrustInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      "auricruxRail.currentBlocker",
      "auricruxRail.nextRecommendedAction",
      "workspaceContext.currentNextAction",
      "Auricrux embedded in trust and readiness layer",
    ],
  },
  {
    file: path.join(root, "src", "components", "CustomerTrustPanel.jsx"),
    markers: [
      'import AuricruxTrustInsight from "./AuricruxTrustInsight";',
      "<AuricruxTrustInsight mode=\"trust\" primaryHref=\"/portal/platform\" primaryLabel=\"Open Platform Dashboard\" />",
    ],
  },
  {
    file: path.join(root, "src", "components", "CommercialReadinessPanel.jsx"),
    markers: [
      'import AuricruxTrustInsight from "./AuricruxTrustInsight";',
      "<AuricruxTrustInsight mode=\"readiness\" primaryHref={primaryHref} primaryLabel={primaryLabel} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "PublicOperationsStrip.jsx"),
    markers: [
      'import AuricruxTrustInsight from "./AuricruxTrustInsight";',
      "<AuricruxTrustInsight mode=\"operations\" primaryHref={primaryHref} primaryLabel={primaryLabel} />",
    ],
  },
];

const failures = [];

for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required Auricrux trust-readiness marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Auricrux trust and readiness layer validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Auricrux trust and readiness layer validation passed across trust, readiness, and public operations surfaces.");
