import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const matrix = {
  generatedAt: new Date().toISOString(),
  targetPacket: "061Z",
  currentPacket: "062Q",
  requiredObservedClasses: [
    {
      key: "main_build_validation_pass",
      description: "Observed successful build-validation run on main with route-truth and packet-minimum gates included.",
      observationType: "main_run_required",
    },
    {
      key: "main_alignment_governance_pass",
      description: "Observed successful alignment-proof-governance run on main with uploaded governance bundle.",
      observationType: "main_run_required",
    },
    {
      key: "ci_backed_live_proof_commit",
      description: "Observed repo-visible CI-backed live deployment proof commit on main.",
      observationType: "repo_visible_main_commit_required",
    },
    {
      key: "ci_backed_live_proof_metadata",
      description: "Observed repo-visible CI-backed live deployment proof metadata transition on main.",
      observationType: "repo_visible_main_artifact_required",
    },
    {
      key: "current_head_live_verifier_pass",
      description: "Observed repo-visible current-head live verifier pass on main.",
      observationType: "repo_visible_main_artifact_required",
    },
    {
      key: "proof_bundle_readiness_pass",
      description: "Observed repo-visible proof bundle readiness pass on main.",
      observationType: "repo_visible_main_artifact_required",
    },
    {
      key: "persisted_control_bundle_pass",
      description: "Observed repo-visible persisted control bundle pass on main.",
      observationType: "repo_visible_main_artifact_required",
    }
  ],
  mergeGateOrder: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123],
  truthRule: "No observed-run lock claim is valid until the relevant workflow/run/artifact is visible on main or otherwise directly inspectable without inference.",
};

const markdown = `# Observed Run Lock Matrix\n\n- Generated at: ${matrix.generatedAt}\n- Target packet: ${matrix.targetPacket}\n- Current packet: ${matrix.currentPacket}\n\n## Required Observed Classes\n${matrix.requiredObservedClasses.map((item) => `- **${item.key}** · ${item.description} · type: ${item.observationType}`).join("\n")}\n\n## Merge Gate Order\n${matrix.mergeGateOrder.map((pr) => `- PR #${pr}`).join("\n")}\n\n## Truth Rule\n${matrix.truthRule}\n`;

await fs.writeFile(path.join(outputDir, "observed-run-lock-matrix.json"), JSON.stringify(matrix, null, 2));
await fs.writeFile(path.join(outputDir, "observed-run-lock-matrix.md"), markdown);

console.log(`Generated observed run lock matrix for ${matrix.requiredObservedClasses.length} required observed classes.`);
