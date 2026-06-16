import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const requiredArtifacts = [
  "public-package-route-groups-report.json",
  "public-conversion-surface-route-truth-report.json",
  "packet-functional-minimums-report.json",
  "academy-catalog-report.json",
  "build-proof-lane-report.json",
];

const observed = [];
for (const artifact of requiredArtifacts) {
  const target = path.join(outputDir, artifact);
  let exists = false;
  try {
    await fs.access(target);
    exists = true;
  } catch {
    exists = false;
  }
  observed.push({ artifact, exists });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  observed,
};

const markdown = `# Alignment Observation Manifest\n\n- Generated at: ${manifest.generatedAt}\n\n${observed.map((item) => `- ${item.artifact}: ${item.exists ? "observed" : "missing"}`).join("\n")}`;

await fs.writeFile(path.join(outputDir, "alignment-observation-manifest.json"), JSON.stringify(manifest, null, 2));
await fs.writeFile(path.join(outputDir, "alignment-observation-manifest.md"), markdown);

console.log(`Generated alignment observation manifest for ${observed.length} artifacts.`);
