import fs from "node:fs";
import path from "node:path";

const SYSTEM_DIR = "auricrux/system";
const QC_DIR = "docs/qc";

export function ensureDirs(root) {
  fs.mkdirSync(path.join(root, SYSTEM_DIR), { recursive: true });
  fs.mkdirSync(path.join(root, QC_DIR), { recursive: true });
  fs.mkdirSync(path.join(root, SYSTEM_DIR, "loop_runs"), { recursive: true });
}

export function readJson(root, relativePath, fallback) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function writeJson(root, relativePath, data) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

/**
 * Merge workflow repair items into the Auricrux work queue (Act -> Review backlog).
 */
export function enqueueRepairWorkItems(root, repairPlans, runId) {
  const queuePath = path.join(SYSTEM_DIR, "work_queue.json");
  const queue = readJson(root, queuePath, { version: 1, queueName: "auricrux-machine-native-queue", items: [] });
  queue.items = Array.isArray(queue.items) ? queue.items : [];

  const now = new Date().toISOString();
  for (const plan of repairPlans) {
    if (plan.repairClass === "retry-transient") continue;
    const itemId = `WFR-${plan.id}-${runId}`.slice(0, 48);
    const exists = queue.items.some((item) => item.id === itemId);
    if (exists) continue;
    queue.items.unshift({
      id: itemId,
      title: plan.title,
      lane: plan.targetLane || "product",
      priority: plan.priority || "medium",
      status: "queued",
      source: "workflow-repair-loop",
      runId,
      failedStep: plan.step?.name,
      detail: plan.detail,
      targetRepo: plan.targetRepo,
      createdAtUtc: now,
    });
  }

  queue.updatedAtUtc = now;
  writeJson(root, queuePath, queue);
  return queue;
}

export function persistRepairLoopReceipt(root, receipt) {
  const stamp = receipt.generatedAt.replace(/[:.]/g, "").slice(0, 15);
  writeJson(root, `${SYSTEM_DIR}/workflow_repair_state.json`, receipt.state);
  writeJson(root, `${SYSTEM_DIR}/workflow_repair_receipt.json`, receipt);
  writeJson(root, `${SYSTEM_DIR}/loop_runs/workflow-repair-${stamp}.json`, receipt);
  writeJson(root, `${QC_DIR}/workflow-repair-report.json`, receipt);

  const md = formatRepairMarkdown(receipt);
  fs.writeFileSync(path.join(root, QC_DIR, "workflow-repair-latest.md"), md, "utf8");
  return md;
}

function formatRepairMarkdown(receipt) {
  const { runId, complete, rounds, finalSummary, repairPlans } = receipt;
  return `# FCA Workflow Repair Loop

- **When:** ${receipt.generatedAt}
- **Run ID:** ${runId}
- **Protocol:** Observe -> Act -> Review (FCA/Auricrux coverage law)
- **Result:** ${complete ? "RECOVERED — workflow simulation green" : "OPEN — failures remain after bounded repair"}

## Rounds

${rounds
  .map(
    (r) =>
      `### Round ${r.round} — ${r.complete ? "PASS" : "FAIL"} (${r.passed}/${r.total} steps)\n${(r.failures || [])
        .map((f) => `- ${f.name}: ${f.detail || "failed"}`)
        .join("\n") || "- (no failures)"}`,
  )
  .join("\n\n")}

## Repair actions taken

${repairPlans.length ? repairPlans.map((p) => `- **${p.repairClass}** ${p.title}: ${p.outcome}`).join("\n") : "- No automated repairs applied"}

## Summary

${finalSummary}

## For the founder

- This loop runs automatically with workflow simulations every 6 hours.
- Green end state = product workflows worked without you testing manually.
- Red end state = repair items were queued; check \`auricrux/system/work_queue.json\`.
`;
}
