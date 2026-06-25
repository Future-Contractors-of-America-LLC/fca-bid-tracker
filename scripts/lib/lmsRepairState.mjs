import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const SYSTEM_DIR = "auricrux/system";
const QC_DIR = "docs/qc";

export function ensureDirs(root) {
  fs.mkdirSync(path.join(root, SYSTEM_DIR), { recursive: true });
  fs.mkdirSync(path.join(root, QC_DIR), { recursive: true });
  fs.mkdirSync(path.join(root, SYSTEM_DIR, "loop_runs"), { recursive: true });
  fs.mkdirSync(path.join(root, SYSTEM_DIR, "loops"), { recursive: true });
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

export function enqueueRepairWorkItems(root, repairPlans, runId) {
  const queuePath = path.join(SYSTEM_DIR, "work_queue.json");
  const queue = readJson(root, queuePath, { version: 1, queueName: "auricrux-machine-native-queue", items: [] });
  queue.items = Array.isArray(queue.items) ? queue.items : [];

  const now = new Date().toISOString();
  for (const plan of repairPlans) {
    if (plan.repairClass === "retry-transient") continue;
    const itemId = (plan.actionId || `LMS-${plan.id}`).slice(0, 48);
    const exists = queue.items.some((item) => item.id === itemId && item.status === "queued");
    if (exists) continue;
    queue.items.unshift({
      id: itemId,
      title: plan.title,
      lane: plan.targetLane || "product",
      priority: plan.priority || "medium",
      status: "queued",
      source: "lms-repair-loop",
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

export function resolveRepairWorkItems(root, runId) {
  const queuePath = path.join(SYSTEM_DIR, "work_queue.json");
  const queue = readJson(root, queuePath, { version: 1, items: [] });
  queue.items = Array.isArray(queue.items) ? queue.items : [];

  const now = new Date().toISOString();
  let changed = false;
  for (const item of queue.items) {
    if (item.source !== "lms-repair-loop" || item.status !== "queued") continue;
    item.status = "resolved";
    item.resolvedAtUtc = now;
    item.resolvedByRunId = runId;
    item.resolution = "lms-simulation-green";
    changed = true;
  }

  if (changed) {
    queue.updatedAtUtc = now;
    writeJson(root, queuePath, queue);
  }
  return queue;
}

export function writeNextAction(root, plan, runId, complete) {
  const now = new Date().toISOString();
  if (complete || !plan) {
    const cleared = {
      contract_version: "1.0.0",
      action_id: null,
      source_workflow: "lms-repair-loop",
      action_summary: "Academy LMS simulation green — no corrective action required.",
      action_type: "none",
      status: "idle",
      priority_band: "normal",
      generated_at: now,
      updatedAtUtc: now,
      trigger_source: runId,
    };
    writeJson(root, `${SYSTEM_DIR}/next_action.json`, cleared);
    return cleared;
  }

  const nextAction = {
    contract_version: "1.0.0",
    action_id: plan.actionId || `LMS-${plan.id}`,
    source_workflow: "lms-repair-loop",
    action_summary: plan.title,
    action_detail: plan.detail,
    action_type: "bounded-corrective-step",
    status: "ready",
    priority_band: plan.priority || "medium",
    failed_step: plan.step?.name,
    target_repo: plan.targetRepo,
    generated_at: now,
    updatedAtUtc: now,
    trigger_source: runId,
  };
  writeJson(root, `${SYSTEM_DIR}/next_action.json`, nextAction);
  return nextAction;
}

const REDEPLOY_WORKFLOW = "azure-static-web-apps-delightful-mushroom-0de67860f.yml";

export function maybeDispatchSwaRedeploy(plan) {
  if (plan?.autoRepair !== "swa-redeploy" && plan?.id !== "lms-swa-offline") {
    return { dispatched: false, reason: "not an SWA redeploy plan" };
  }

  const token = process.env.FCA_GITHUB_TOKEN?.trim();
  if (!token) {
    return { dispatched: false, reason: "FCA_GITHUB_TOKEN unavailable" };
  }

  try {
    const result = spawnSync(
      "gh",
      ["workflow", "run", REDEPLOY_WORKFLOW, "--ref", "main"],
      { encoding: "utf8", env: { ...process.env, GH_TOKEN: token, GITHUB_TOKEN: token } },
    );
    if (result.status === 0) {
      return { dispatched: true, workflow: REDEPLOY_WORKFLOW };
    }
    return { dispatched: false, reason: (result.stderr || result.stdout || "gh workflow run failed").slice(0, 200) };
  } catch (error) {
    return { dispatched: false, reason: error.message };
  }
}

export function persistRepairLoopReceipt(root, receipt) {
  const stamp = receipt.generatedAt.replace(/[:.]/g, "").slice(0, 15);
  writeJson(root, `${SYSTEM_DIR}/lms_repair_state.json`, receipt.state);
  writeJson(root, `${SYSTEM_DIR}/lms_repair_receipt.json`, receipt);
  writeJson(root, `${SYSTEM_DIR}/loop_runs/lms-repair-${stamp}.json`, receipt);
  writeJson(root, `${QC_DIR}/lms-repair-report.json`, receipt);

  const md = formatRepairMarkdown(receipt);
  fs.writeFileSync(path.join(root, QC_DIR, "lms-repair-latest.md"), md, "utf8");
  return md;
}

function formatRepairMarkdown(receipt) {
  const { runId, complete, rounds, finalSummary, repairPlans, redeploy } = receipt;
  return `# FCA Academy LMS Repair Loop

- **When:** ${receipt.generatedAt}
- **Run ID:** ${runId}
- **Protocol:** Observe -> Act -> Review (FCA Academy coverage law)
- **Result:** ${complete ? "RECOVERED — Academy LMS simulation green" : "OPEN — failures remain after bounded repair"}

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

${redeploy?.dispatched ? `\n## Redeploy\n\n- SWA workflow dispatched: \`${redeploy.workflow}\`\n` : ""}

## Summary

${finalSummary}

## For the founder

- This loop runs automatically every hour at :30 on \`main\`.
- Green end state = Academy LMS worked without manual walkthrough.
- Red end state = repair items queued; check \`auricrux/system/work_queue.json\` and \`next_action.json\`.
`;
}
