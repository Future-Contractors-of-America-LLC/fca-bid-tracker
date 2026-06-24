/**
 * FCA/Auricrux repair playbooks for workflow simulation failures.
 * observe-act-review protocol — maps observed failures to bounded actions and review metadata.
 */

/** @typedef {{ id: string, repairClass: string, title: string, detail: string, step: object, autoRepair?: string }} RepairPlan */

export const REPAIR_CLASSES = {
  RETRY_TRANSIENT: "retry-transient",
  FOUNDER_ACTION: "founder-action",
  ENGINEERING_QUEUE: "engineering-queue",
  AURICRUX_REVIEW: "auricrux-review",
};

export const PLAYBOOKS = [
  {
    id: "auth-missing",
    match: (step) =>
      step.name === "Customer login" &&
      String(step.detail || "").includes("FCA_SIM_LOGIN_EMAIL"),
    repairClass: REPAIR_CLASSES.FOUNDER_ACTION,
    title: "Configure workflow simulation login secrets",
    detail: "Add FCA_SIM_LOGIN_EMAIL and FCA_SIM_LOGIN_PASSWORD (see docs/FOUNDER_PRODUCT_TEST_ACCESS.md).",
    targetLane: "founder",
    priority: "critical",
  },
  {
    id: "auth-2fa-blocked",
    match: (step) =>
      (step.name === "Customer login" || step.name === "Customer verify") &&
      String(step.detail || "").includes("devVerificationHint"),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Unblock 2FA for workflow simulation accounts",
    detail: "Enable FCA_VERIFICATION_DEV_EXPOSE_CODE on Central or assign a direct-login QA account.",
    targetLane: "platform",
    targetRepo: "auricrux-central",
    priority: "high",
  },
  {
    id: "lead-not-found",
    match: (step) => step.name === "Qualify lead" && /Lead not found/i.test(String(step.detail || "")),
    repairClass: REPAIR_CLASSES.RETRY_TRANSIENT,
    title: "Retry qualify after tenant persistence hydrate",
    detail: "Lead may not have flushed across instances; authenticated re-run usually resolves.",
    autoRepair: "retry-transient",
    priority: "medium",
  },
  {
    id: "bid-endpoint",
    match: (step) =>
      (step.name === "Advance bid qualification" || step.name === "Create bid") &&
      /HTTP 404|not found/i.test(String(step.detail || "")),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Bid mutation route drift",
    detail: "Use PATCH /api/bids with mutate actions; POST /api/bids is not registered.",
    targetLane: "product",
    targetRepo: "auricrux-central",
    priority: "high",
  },
  {
    id: "rfi-project-missing",
    match: (step) => step.name === "Create RFI" && /Project not found/i.test(String(step.detail || "")),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Field-ops project spine misaligned with tenant projects",
    detail: "Ensure convert-to-project or ensure_project registers PRJ in field_ops table store.",
    targetLane: "product",
    targetRepo: "auricrux-central",
    priority: "high",
  },
  {
    id: "payment-rail",
    match: (step) => /Payment/.test(step.name) && step.status === "fail",
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "FCA native payment rail regression",
    detail: "Verify /api/fca-payments/intake and /checkout on live Central.",
    targetLane: "revenue",
    targetRepo: "auricrux-central",
    priority: "critical",
  },
  {
    id: "api-transient",
    match: (step) => /HTTP 5\d\d|timeout|ECONNRESET|fetch failed/i.test(String(step.detail || "")),
    repairClass: REPAIR_CLASSES.RETRY_TRANSIENT,
    title: "Transient API failure",
    detail: "Retry after backoff when Central or network is warming.",
    autoRepair: "retry-transient",
    priority: "low",
  },
  {
    id: "api-unreachable",
    match: (step) => step.name === "API reachable",
    repairClass: REPAIR_CLASSES.RETRY_TRANSIENT,
    title: "Central API unreachable",
    detail: "Retry when api.futurecontractorsofamerica.com health recovers.",
    autoRepair: "retry-transient",
    priority: "high",
  },
];

/**
 * @param {Array<{ name: string, status: string, detail?: string }>} failedSteps
 * @returns {RepairPlan[]}
 */
export function planRepairs(failedSteps) {
  const plans = [];
  const seen = new Set();

  for (const step of failedSteps) {
    for (const playbook of PLAYBOOKS) {
      if (!playbook.match(step)) continue;
      const key = `${playbook.id}:${step.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      plans.push({
        id: playbook.id,
        repairClass: playbook.repairClass,
        title: playbook.title,
        detail: playbook.detail,
        step,
        autoRepair: playbook.autoRepair || null,
        targetLane: playbook.targetLane || "product",
        targetRepo: playbook.targetRepo || "fca-bid-tracker",
        priority: playbook.priority || "medium",
      });
      break;
    }

    if (!plans.some((p) => p.step.name === step.name)) {
      plans.push({
        id: "unmapped-failure",
        repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
        title: `Investigate workflow failure: ${step.name}`,
        detail: step.detail || "No playbook mapped; engineering triage required.",
        step,
        autoRepair: null,
        targetLane: "product",
        targetRepo: "fca-bid-tracker",
        priority: "medium",
      });
    }
  }

  return plans;
}

export function repairClassAllowsRetry(plans) {
  return plans.some((p) => p.repairClass === REPAIR_CLASSES.RETRY_TRANSIENT);
}

export function allPlansAreQueuedOnly(plans) {
  return (
    plans.length > 0 &&
    plans.every(
      (p) =>
        p.repairClass === REPAIR_CLASSES.ENGINEERING_QUEUE ||
        p.repairClass === REPAIR_CLASSES.FOUNDER_ACTION,
    )
  );
}
