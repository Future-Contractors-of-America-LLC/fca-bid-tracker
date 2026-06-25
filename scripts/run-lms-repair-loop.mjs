#!/usr/bin/env node
/**
 * FCA Academy LMS repair-improvement loop.
 *
 * Protocol (coverage law: Observe -> Act -> Review):
 *  1. Observe — run Academy LMS simulation, capture failures
 *  2. Act     — apply bounded auto-repairs (retry transients) + enqueue engineering/founder items
 *  3. Review  — re-run simulation, persist receipt, update work queue
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requestJson, resolveApiBase } from "./lib/workflowSimHttp.mjs";
import { resolveSimCredentials } from "./lib/workflowSimCredentials.mjs";
import {
  allPlansAreQueuedOnly,
  planRepairs,
  repairClassAllowsRetry,
  REPAIR_CLASSES,
  topRepairPlan,
} from "./lib/lmsRepairPlaybooks.mjs";
import {
  ensureDirs,
  enqueueRepairWorkItems,
  maybeDispatchSwaRedeploy,
  persistRepairLoopReceipt,
  readJson,
  resolveRepairWorkItems,
  writeNextAction,
} from "./lib/lmsRepairState.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runId = `LMS-WFR-${Date.now()}`;
const MAX_ROUNDS = Math.max(1, Number.parseInt(process.env.FCA_LMS_REPAIR_LOOP_MAX_ROUNDS || "3", 10));
const RETRY_DELAY_MS = Math.max(1000, Number.parseInt(process.env.FCA_LMS_REPAIR_LOOP_RETRY_MS || "5000", 10));
const SIM_SCRIPT = path.join(root, "scripts", "simulate-academy-lms.mjs");
const SIM_REPORT = "docs/qc/lms-simulation-report.json";

ensureDirs(root);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runSimulation() {
  const result = spawnSync(process.execPath, [SIM_SCRIPT], {
    cwd: root,
    env: process.env,
    encoding: "utf8",
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return {
    exitCode: result.status ?? 1,
    report: readJson(root, SIM_REPORT, null),
  };
}

async function auricruxReviewFailures(apiBase, sessionCookie, failures) {
  if (!apiBase || !sessionCookie || !failures.length) return [];

  const reviews = [];
  for (const failure of failures.slice(0, 3)) {
    try {
      const response = await requestJson(apiBase, "/api/auricrux/actions", {
        method: "POST",
        body: {
          mode: "recommend",
          targetObjectType: "AcademySimulation",
          targetObjectId: failure.name,
          rationale: `LMS repair loop failure on ${failure.name}: ${failure.detail || "unknown"}`,
          sourceRoute: "/academy",
        },
        cookie: sessionCookie,
      });
      const guidance = response.payload?.data?.guidance?.reply || response.payload?.guidance?.reply;
      if (guidance) {
        reviews.push({ step: failure.name, guidance: String(guidance).slice(0, 400) });
      }
    } catch {
      // review is best-effort
    }
  }
  return reviews;
}

async function obtainSessionCookie(apiBase) {
  const credentials = resolveSimCredentials();
  if (!credentials) return "";

  const login = await requestJson(apiBase, "/api/customer-login", {
    method: "POST",
    body: { email: credentials.email, password: credentials.password },
  });

  if (login.response.ok && login.payload?.ok && login.payload?.session?.customer?.email) {
    return login.cookie || "";
  }

  if (login.payload?.requiresVerification && login.payload?.challengeId && login.payload?.devVerificationHint) {
    const verify = await requestJson(apiBase, "/api/customer-verify", {
      method: "POST",
      body: { challengeId: login.payload.challengeId, code: login.payload.devVerificationHint },
    });
    if (verify.response.ok && verify.payload?.ok) return verify.cookie || "";
  }

  return "";
}

function applyRepairPlan(plan) {
  if (plan.autoRepair === "retry-transient" || plan.repairClass === REPAIR_CLASSES.RETRY_TRANSIENT) {
    return { ...plan, outcome: "scheduled-retry" };
  }
  if (plan.autoRepair === "swa-redeploy") {
    const redeploy = maybeDispatchSwaRedeploy(plan);
    return { ...plan, outcome: redeploy.dispatched ? "swa-redeploy-dispatched" : "swa-redeploy-queued", redeploy };
  }
  if (plan.repairClass === REPAIR_CLASSES.FOUNDER_ACTION) {
    return { ...plan, outcome: "founder-action-queued" };
  }
  if (plan.repairClass === REPAIR_CLASSES.ENGINEERING_QUEUE) {
    return { ...plan, outcome: "engineering-queued" };
  }
  return { ...plan, outcome: "logged" };
}

async function main() {
  const apiBase = await resolveApiBase(process.env.AURICRUX_CENTRAL_API || process.env.FCA_API_BASE || "");
  const state = readJson(root, "auricrux/system/lms_repair_state.json", {
    runCount: 0,
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    history: [],
  });

  state.runCount = (state.runCount || 0) + 1;
  const rounds = [];
  const appliedRepairs = [];
  let complete = false;
  let lastReport = null;
  let lastRedeploy = null;

  for (let round = 1; round <= MAX_ROUNDS; round += 1) {
    console.log(`\n=== LMS repair loop round ${round}/${MAX_ROUNDS} (Observe) ===\n`);
    const { report } = runSimulation();
    lastReport = report;

    if (!report) {
      rounds.push({
        round,
        complete: false,
        passed: 0,
        total: 0,
        failures: [{ name: "Simulation report", detail: "lms-simulation-report.json missing" }],
      });
      break;
    }

    const failures = (report.steps || []).filter((s) => s.status === "fail");
    const passed = (report.steps || []).filter((s) => s.status === "pass").length;
    const total = (report.steps || []).length;

    rounds.push({ round, complete: report.complete, passed, total, failures });

    if (report.complete) {
      complete = true;
      console.log(`\n=== Round ${round}: all Academy LMS steps passed (Review) ===\n`);
      break;
    }

    console.log(`\n=== Round ${round}: ${failures.length} failure(s) — planning repairs (Act) ===\n`);
    const plans = planRepairs(failures);
    for (const plan of plans) {
      const applied = applyRepairPlan(plan);
      appliedRepairs.push(applied);
      if (applied.redeploy) lastRedeploy = applied.redeploy;
      console.log(`REPAIR [${applied.repairClass}] ${applied.title} -> ${applied.outcome}`);
    }

    enqueueRepairWorkItems(root, plans, runId);

    const shouldRetry = repairClassAllowsRetry(plans) && round < MAX_ROUNDS;
    const blocked = allPlansAreQueuedOnly(plans);

    if (!shouldRetry || (blocked && round > 1)) {
      console.log("\n=== No further bounded auto-repair available (Review) ===\n");
      break;
    }

    console.log(`\n=== Waiting ${RETRY_DELAY_MS}ms before retry ===\n`);
    await sleep(RETRY_DELAY_MS);
  }

  let auricruxReviews = [];
  if (!complete && lastReport) {
    const failures = (lastReport.steps || []).filter((s) => s.status === "fail");
    const sessionCookie = await obtainSessionCookie(apiBase);
    auricruxReviews = await auricruxReviewFailures(apiBase, sessionCookie, failures);
    for (const review of auricruxReviews) {
      console.log(`AURICRUX REVIEW [${review.step}]: ${review.guidance}`);
    }
  }

  if (complete) {
    state.consecutiveSuccesses = (state.consecutiveSuccesses || 0) + 1;
    state.consecutiveFailures = 0;
    resolveRepairWorkItems(root, runId);
    writeNextAction(root, null, runId, true);
  } else {
    state.consecutiveFailures = (state.consecutiveFailures || 0) + 1;
    state.consecutiveSuccesses = 0;
    const failures = (lastReport?.steps || []).filter((s) => s.status === "fail");
    const topPlan = topRepairPlan(planRepairs(failures));
    writeNextAction(root, topPlan, runId, false);
  }

  state.lastRunUtc = new Date().toISOString();
  state.lastComplete = complete;
  state.lastRunId = runId;
  state.history = Array.isArray(state.history) ? state.history : [];
  state.history.unshift({
    at: state.lastRunUtc,
    runId,
    complete,
    rounds: rounds.length,
    failures: complete ? 0 : (lastReport?.summary?.failed ?? 0),
  });
  state.history = state.history.slice(0, 30);

  const finalSummary = complete
    ? `Academy LMS simulation recovered in ${rounds.length} round(s). Consecutive successes: ${state.consecutiveSuccesses}.`
    : `Academy LMS simulation still failing after ${rounds.length} bounded repair round(s). ${appliedRepairs.filter((r) => r.outcome.includes("queued") || r.outcome.includes("dispatched")).length} item(s) queued. Consecutive failures: ${state.consecutiveFailures}.`;

  const receipt = {
    generatedAt: new Date().toISOString(),
    runId,
    protocol: "observe-act-review",
    module: "fca-academy-lms",
    complete,
    maxRounds: MAX_ROUNDS,
    rounds,
    repairPlans: appliedRepairs,
    auricruxReviews,
    redeploy: lastRedeploy,
    finalSummary,
    state,
  };

  const md = persistRepairLoopReceipt(root, receipt);
  console.log("\n--- LMS repair loop report ---\n");
  console.log(md);

  process.exit(complete ? 0 : 1);
}

main().catch((error) => {
  console.error("LMS repair loop crashed:", error);
  process.exit(1);
});
