import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const file = path.join(root, "docs", "standing-directives-execution-standard.md");
const source = await fs.readFile(file, "utf8");

const markers = [
  "# Standing Directives Execution Standard",
  "Progress all lanes together: FCA SaaS Platform, FCA Academy (LMS), FCA Website, FCA Customer Portal, and Auricrux Comms.",
  "Keep revenue generation tied to truthful product proof, live commercial surfaces, and execution continuity.",
  "Reduce human dependency through reusable controls, automation, validation, recovery logic, and anti-drift standards.",
  "Preserve persistent memory in both repo artifacts and system memory so continuation does not require repeated restatement.",
  "Self-correct issues, errors, drift, and stale claims as a default behavior rather than an exception path.",
  "Zero human dependency is the directional goal, not a marketing claim.",
];

const failures = markers.filter((marker) => !source.includes(marker));

if (failures.length > 0) {
  console.error("Standing directives execution standard validation failed:");
  for (const marker of failures) {
    console.error(` - Missing marker: ${marker}`);
  }
  process.exit(1);
}

console.log("Standing directives execution standard validation passed.");
