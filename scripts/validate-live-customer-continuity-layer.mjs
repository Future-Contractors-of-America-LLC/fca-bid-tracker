import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AuricruxNarrativeInsight.jsx"),
    markers: [
      'import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";',
      'import { readCustomerSession } from "../customerSession";',
      "workspaceContext.currentNextAction",
      "auricruxRail.nextRecommendedAction",
      "Auricrux embedded in narrative layer",
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useWorkspaceState.js"),
    markers: [
      'import { readCustomerSession } from "../customerSession";',
      "function bindCustomerSession(baseState)",
      "authenticatedCustomer",
      "customerSessionEmail",
    ],
  },
  {
    file: path.join(root, "src", "components", "WorkspaceSnapshotCard.jsx"),
    markers: [
      'import AuricruxNarrativeInsight from "./AuricruxNarrativeInsight";',
      "state.auricrux.systemState || state.auricrux.readinessState",
      "state.meta.authenticatedCustomer",
      "<AuricruxNarrativeInsight mode=\"snapshot\" ctaHref={ctaHref} ctaLabel={ctaLabel} />",
    ],
  },
  {
    file: path.join(root, "src", "components", "FounderJourneyStrip.jsx"),
    markers: [
      'import AuricruxNarrativeInsight from "./AuricruxNarrativeInsight";',
      "<AuricruxNarrativeInsight mode=\"founder\" ctaHref={ctaHref} ctaLabel={ctaLabel} />",
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required live customer continuity marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Live customer continuity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Live customer continuity validation passed across workspace state binding, snapshot, and founder narrative layers.");
