/**
 * FCA Academy LMS repair playbooks  observe-act-review protocol.
 */

/** @typedef {{ id: string, repairClass: string, title: string, detail: string, step: object, autoRepair?: string, actionId?: string }} RepairPlan */

export const REPAIR_CLASSES = {
  RETRY_TRANSIENT: "retry-transient",
  FOUNDER_ACTION: "founder-action",
  ENGINEERING_QUEUE: "engineering-queue",
  AURICRUX_REVIEW: "auricrux-review",
};

export const REPAIR_ACTION_IDS = {
  "lms-catalog-drift": "LMS-CATALOG-FIX",
  "lms-media-missing": "LMS-MEDIA-FIX",
  "lms-swa-offline": "LMS-SWA-REDEPLOY",
  "lms-commerce-rail": "LMS-COMMERCE-FIX",
  "lms-entitlement": "LMS-ENTITLEMENT-FIX",
  "lms-central-artifacts": "LMS-CENTRAL-ARTIFACTS-FIX",
  "lms-auth-missing": "LMS-AUTH-CONFIG",
  "lms-academy-ctas": "LMS-CTA-FIX",
};

export const PLAYBOOKS = [
  {
    id: "lms-auth-missing",
    match: (step) =>
      (step.name === "Academy customer login" || step.name?.includes("customer login")) &&
      String(step.detail || "").includes("FCA_SIM_LOGIN"),
    repairClass: REPAIR_CLASSES.FOUNDER_ACTION,
    title: "Configure Academy simulation login secrets",
    detail: "Add FCA_SIM_LOGIN_EMAIL and FCA_SIM_LOGIN_PASSWORD (see docs/FOUNDER_PRODUCT_TEST_ACCESS.md).",
    targetLane: "founder",
    priority: "critical",
    actionId: "LMS-AUTH-CONFIG",
  },
  {
    id: "lms-entitlement",
    match: (step) =>
      /LMS entitlement|lms: false|HTTP 403.*LMS/i.test(String(step.detail || "")) ||
      (step.name === "Academy LMS snapshot" && String(step.detail || "").includes("403")),
    repairClass: REPAIR_CLASSES.FOUNDER_ACTION,
    title: "Enable LMS entitlement on QA account",
    detail: "Set productAccess lms: true on the simulation account (see docs/FOUNDER_PRODUCT_TEST_ACCESS.md).",
    targetLane: "founder",
    priority: "critical",
    actionId: "LMS-ENTITLEMENT-FIX",
  },
  {
    id: "lms-api-transient",
    match: (step) => /HTTP 5\d\d|timeout|ECONNRESET|fetch failed|health check failed/i.test(String(step.detail || "")),
    repairClass: REPAIR_CLASSES.RETRY_TRANSIENT,
    title: "Transient Academy API failure",
    detail: "Retry after backoff when Central or network is warming.",
    autoRepair: "retry-transient",
    priority: "low",
  },
  {
    id: "lms-catalog-drift",
    match: (step) =>
      /catalog total|catalog integrity|lane \w+|catalogIntegrity|lane count/i.test(`${step.name} ${step.detail}`),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Academy catalog drift vs expected lane counts",
    detail: "Align core/academy.py catalog with shell academyDesignSystem expected totals.",
    targetLane: "product",
    targetRepo: "auricrux-central",
    priority: "high",
    actionId: "LMS-CATALOG-FIX",
  },
  {
    id: "lms-media-missing",
    match: (step) => /lesson-media:|validate-academy-media|missing lecture|missing labDemo/i.test(`${step.name} ${step.detail}`),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Academy lesson media slots incomplete",
    detail: "Run npm run seed:academy-static-media or fix lessonMedia URLs in academy catalog.",
    targetLane: "content",
    targetRepo: "fca-bid-tracker",
    priority: "high",
    actionId: "LMS-MEDIA-FIX",
  },
  {
    id: "lms-swa-offline",
    match: (step) => step.name?.startsWith("SWA route") && step.status === "fail",
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Academy SWA routes offline or missing markers",
    detail: "Redeploy SWA or restore /academy route files in the shell.",
    targetLane: "platform",
    targetRepo: "fca-bid-tracker",
    priority: "high",
    actionId: "LMS-SWA-REDEPLOY",
    autoRepair: "swa-redeploy",
  },
  {
    id: "lms-commerce-rail",
    match: (step) =>
      /commerce intake|fca-payments\/intake|validate-academy-native-commerce|native checkout/i.test(`${step.name} ${step.detail}`),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Academy native commerce rail regression",
    detail: "Verify /api/fca-payments/intake and academy commerce client wiring on live Central.",
    targetLane: "revenue",
    targetRepo: "auricrux-central",
    priority: "critical",
    actionId: "LMS-COMMERCE-FIX",
  },
  {
    id: "lms-central-artifacts",
    match: (step) => step.name === "Central academy artifacts" && step.status === "fail",
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Central academy content artifact standards failed",
    detail: "Fix verify_academy_media.py failures in auricrux-central.",
    targetLane: "content",
    targetRepo: "auricrux-central",
    priority: "high",
    actionId: "LMS-CENTRAL-ARTIFACTS-FIX",
  },
  {
    id: "lms-api-unreachable",
    match: (step) => step.name === "Academy API reachable" || step.name === "Academy API health",
    repairClass: REPAIR_CLASSES.RETRY_TRANSIENT,
    title: "Central API unreachable for Academy simulation",
    detail: "Retry when api.futurecontractorsofamerica.com health recovers.",
    autoRepair: "retry-transient",
    priority: "high",
  },
  {
    id: "lms-academy-ctas",
    match: (step) => /validate-academy-ctas|academy CTA|academy cta missing/i.test(`${step.name} ${step.detail}`),
    repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
    title: "Academy CTA parity drift",
    detail: "Academy CTAs are missing or pointing at stale routes. Re-run validate-academy-ctas.mjs locally and align src/websiteShell.js academyCtaSets + academy page CTAs with the canonical academy route map.",
    targetLane: "product",
    targetRepo: "fca-bid-tracker",
    priority: "medium",
    actionId: "LMS-CTA-FIX",
  },
];

/**
 * @param {Array<{ name: string, status: string, detail?: string }>} failedSteps
 * @returns {RepairPlan[]}
 */
export function planRepairs(failedSteps) {
  const plans = [];
  const seenPlaybooks = new Set();
  const seenSteps = new Set();

  for (const step of failedSteps) {
    if (seenSteps.has(step.name)) continue;
    seenSteps.add(step.name);

    let matched = false;
    for (const playbook of PLAYBOOKS) {
      if (!playbook.match(step)) continue;
      if (seenPlaybooks.has(playbook.id)) {
        matched = true;
        break;
      }
      seenPlaybooks.add(playbook.id);
      matched = true;
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
        actionId: playbook.actionId || `LMS-${playbook.id}`.toUpperCase(),
      });
      break;
    }

    if (!matched) {
      plans.push({
        id: "unmapped-failure",
        repairClass: REPAIR_CLASSES.ENGINEERING_QUEUE,
        title: `Investigate Academy failure: ${step.name}`,
        detail: step.detail || "No playbook mapped; engineering triage required.",
        step,
        autoRepair: null,
        targetLane: "product",
        targetRepo: "fca-bid-tracker",
        priority: "medium",
        actionId: "LMS-TRIAGE",
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
      (p) => p.repairClass === REPAIR_CLASSES.ENGINEERING_QUEUE || p.repairClass === REPAIR_CLASSES.FOUNDER_ACTION,
    )
  );
}

export function topRepairPlan(plans) {
  if (!plans.length) return null;
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return [...plans].sort((a, b) => (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9))[0];
}
