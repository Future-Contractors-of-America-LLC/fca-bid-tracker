import fs from "fs";
import path from "path";

const root = process.cwd();
const workflowsDir = path.join(root, ".github", "workflows");
const targetFiles = [
  "auricrux-control-plane.yml",
  "auricrux-autonomous.yml",
  "auricrux-engine.yml",
  "auricrux-autopr.yml",
  "auricrux-executive.yml",
];

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function loadWorkflow(name) {
  const fullPath = path.join(workflowsDir, name);
  if (!fs.existsSync(fullPath)) {
    fail(`Missing required workflow: ${name}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

const loaded = Object.fromEntries(targetFiles.map((file) => [file, loadWorkflow(file)]));

const scheduledOwners = Object.entries(loaded)
  .filter(([, content]) => /^on:\s*[\s\S]*?^\s*schedule:/m.test(content))
  .map(([file]) => file);

if (scheduledOwners.length !== 1 || scheduledOwners[0] !== "auricrux-control-plane.yml") {
  fail(
    `Expected auricrux-control-plane.yml to be the only scheduled Auricrux workflow, found: ${scheduledOwners.join(", ") || "none"}`
  );
}

const controlPlane = loaded["auricrux-control-plane.yml"];
for (const token of ['- status', '- executive', '- engine']) {
  if (!controlPlane.includes(token)) {
    fail(`Auricrux control plane is missing required mode token: ${token}`);
  }
}

for (const file of ["auricrux-autonomous.yml", "auricrux-engine.yml", "auricrux-autopr.yml"]) {
  const content = loaded[file];
  if (content.includes("schedule:")) {
    fail(`${file} still declares a schedule trigger and is not subordinate to the control plane.`);
  }
}

const executive = loaded["auricrux-executive.yml"];
if (!/^on:\s*[\s\S]*?^\s*issues:/m.test(executive)) {
  fail("auricrux-executive.yml must remain issue-triggered for bounded executive escalation.");
}

console.log("✅ Auricrux automation topology is valid.");
console.log("   - Scheduled ownership: auricrux-control-plane.yml");
console.log("   - Subordinate/manual rails: autonomous, engine, autopr");
console.log("   - Issue-triggered executive rail preserved");
