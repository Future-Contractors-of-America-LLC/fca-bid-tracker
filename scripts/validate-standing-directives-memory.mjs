import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const file = path.join(root, "docs", "standing-directives-operating-compact.md");
const source = await fs.readFile(file, "utf8");

const markers = [
  "# Standing Directives Operating Compact",
  "Continue under standing directives without requiring the founder to restate the vision, purpose, or direction.",
  "Advance every execution cycle across FCA SaaS Platform, FCA Academy (LMS), FCA Website, FCA Customer Portal, and Auricrux Comms.",
  "Shift toward a true hands-off posture through reusable control surfaces, validation, and documented operating law.",
  "true customer login",
];

const failures = markers.filter((marker) => !source.includes(marker));

if (failures.length > 0) {
  console.error("Standing directives operating compact validation failed:");
  for (const marker of failures) {
    console.error(` - Missing marker: ${marker}`);
  }
  process.exit(1);
}

console.log("Standing directives operating compact validation passed.");
