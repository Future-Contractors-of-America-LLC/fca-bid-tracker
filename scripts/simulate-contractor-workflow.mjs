#!/usr/bin/env node
/**
 * Live contractor workflow simulation - mutates the production API like a real operator.
 * Safe: uses synthetic SIM-* records; does not delete customer data.
 *
 * Requires FCA_SIM_LOGIN_EMAIL + FCA_SIM_LOGIN_PASSWORD (see docs/FOUNDER_PRODUCT_TEST_ACCESS.md).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveSimCredentials } from "./lib/workflowSimCredentials.mjs";
import { requestJson, resolveApiBase } from "./lib/workflowSimHttp.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runId = `SIM-${Date.now()}`;
const simEmail = `workflow-sim-${runId.toLowerCase()}@futurecontractorsofamerica.com`;
const FIELD_OPS_PROJECT_ID = "PRJ-001";

const BID_CHECKLIST = {
  plansReceived: true,
  siteWalkComplete: true,
  budgetConfirmed: true,
  decisionMakerIdentified: true,
  tradeLevelingComplete: true,
  jurisdictionReviewed: true,
};

const steps = [];
let failed = 0;
let apiBase = "";

function pass(name, detail = "", data = {}) {
  steps.push({ name, status: "pass", detail, ...data });
  console.log(`PASS: ${name}${detail ? ` - ${detail}` : ""}`);
}

function fail(name, detail = "", data = {}) {
  failed += 1;
  steps.push({ name, status: "fail", detail, ...data });
  console.error(`FAIL: ${name}${detail ? ` - ${detail}` : ""}`);
}

apiBase = await resolveApiBase(process.env.AURICRUX_CENTRAL_API || process.env.FCA_API_BASE || "");
if (!apiBase) {
  fail("API reachable", "Central API health check failed");
  writeReport();
  process.exit(1);
}
pass("API reachable", apiBase);

let leadId = "";
let opportunityId = "";
let projectId = FIELD_OPS_PROJECT_ID;
let bidId = "BID-1";
let sessionCookie = "";

const credentials = resolveSimCredentials();
if (!credentials) {
  fail(
    "Customer login",
    "Set FCA_SIM_LOGIN_EMAIL and FCA_SIM_LOGIN_PASSWORD (QA account in docs/FOUNDER_PRODUCT_TEST_ACCESS.md)",
  );
  writeReport();
  process.exit(1);
}

try {
  const login = await requestJson(apiBase, "/api/customer-login", {
    method: "POST",
    body: { email: credentials.email, password: credentials.password },
  });
  if (login.response.ok && login.payload?.ok && login.payload?.session?.customer?.email) {
    sessionCookie = login.cookie || sessionCookie;
    pass("Customer login", login.payload.session.customer.email);
  } else if (login.payload?.requiresVerification) {
    const code = login.payload?.devVerificationHint;
    if (!login.payload?.challengeId || !code) {
      fail(
        "Customer login",
        "2FA required but no devVerificationHint; enable FCA_VERIFICATION_DEV_EXPOSE_CODE on Central",
      );
    } else {
      pass("Customer login", "2FA challenge issued");
      const verify = await requestJson(apiBase, "/api/customer-verify", {
        method: "POST",
        body: { challengeId: login.payload.challengeId, code },
      });
      if (verify.response.ok && verify.payload?.ok && verify.payload?.session?.customer?.email) {
        sessionCookie = verify.cookie || sessionCookie;
        pass("Customer verify", verify.payload.session.customer.email);
      } else {
        fail("Customer verify", verify.payload?.error || `HTTP ${verify.response.status}`);
      }
    }
  } else {
    fail("Customer login", login.payload?.error || `HTTP ${login.response.status}`);
  }

  if (sessionCookie) {
    const session = await requestJson(apiBase, "/api/customer-session", { cookie: sessionCookie });
    if (session.response.ok && session.payload?.ok) pass("Customer session");
    else fail("Customer session", session.payload?.error || `HTTP ${session.response.status}`);
  }
} catch (error) {
  fail("Customer login", error.message);
}

if (!sessionCookie) {
  writeReport();
  process.exit(1);
}

// --- 1. Governed lead intake (authenticated, not public channel) ---
try {
  const intake = await requestJson(apiBase, "/api/leads", {
    method: "POST",
    body: {
      sourceChannel: "portal-intake",
      sourceRoute: "/portal/pipeline",
      client: { name: `Workflow Sim GC ${runId}`, contactEmail: simEmail, contactPhone: "555-0199" },
      site: { jurisdiction: "Fairfax, VA", estimatedValue: 275000 },
      budgetSignal: "confirmed",
      projectIntent: "Commercial TI",
    },
    cookie: sessionCookie,
  });
  leadId = intake.payload?.item?.leadId || intake.payload?.data?.leadId || "";
  if (intake.response.ok && leadId) pass("Lead intake", leadId);
  else fail("Lead intake", intake.payload?.error || `HTTP ${intake.response.status}`);
} catch (error) {
  fail("Lead intake", error.message);
}

// --- 2. Qualify lead -> opportunity ---
if (leadId) {
  try {
    const qualify = await requestJson(apiBase, `/api/leads/${encodeURIComponent(leadId)}/qualify`, {
      method: "POST",
      body: {
        budgetStatus: "confirmed",
        jurisdictionStatus: "validated",
        ownershipStatus: "verified",
        sourceRoute: "/portal/pipeline",
        checklist: {
          plansReceived: true,
          siteWalkComplete: true,
          budgetConfirmed: true,
          decisionMakerIdentified: true,
        },
      },
      cookie: sessionCookie,
    });
    opportunityId = qualify.payload?.opportunity?.opportunityId || "";
    if (qualify.response.ok && opportunityId) pass("Qualify lead", opportunityId);
    else fail("Qualify lead", qualify.payload?.error || `HTTP ${qualify.response.status}`);
  } catch (error) {
    fail("Qualify lead", error.message);
  }
}

// --- 3. Advance seeded bid (POST /bids does not exist; use PATCH mutate) ---
try {
  const bidsList = await requestJson(apiBase, "/api/bids", { cookie: sessionCookie });
  const bids =
    bidsList.payload?.data?.items ||
    bidsList.payload?.items ||
    (Array.isArray(bidsList.payload) ? bidsList.payload : []);
  const firstBid = Array.isArray(bids) ? bids[0] : null;
  bidId = firstBid?.id || firstBid?.bidId || bidId;

  const bid = await requestJson(apiBase, "/api/bids", {
    method: "PATCH",
    body: {
      action: "update-qualification",
      bidId,
      updates: {
        status: "Qualified",
        score: "85/100",
        budgetFit: "Confirmed",
        checklist: BID_CHECKLIST,
      },
    },
    cookie: sessionCookie,
  });
  const bidPayload = bid.payload?.data?.bid || bid.payload?.bid || bid.payload;
  if (bid.response.ok && (bidPayload?.id || bidPayload?.bidId || bidId)) {
    bidId = bidPayload?.id || bidPayload?.bidId || bidId;
    pass("Advance bid qualification", bidId);
  } else {
    fail("Advance bid qualification", bidPayload?.error || bid.payload?.error || `HTTP ${bid.response.status}`);
  }
} catch (error) {
  fail("Advance bid qualification", error.message);
}

// --- 4. Pipeline link ---
if (bidId) {
  try {
    const pipeline = await requestJson(apiBase, "/api/commercial-pipeline", {
      method: "PATCH",
      body: { bidId, stage: "estimate", status: "active", nextAction: "Prepare governed estimate package" },
      cookie: sessionCookie,
    });
    if (pipeline.response.ok && pipeline.payload?.ok) pass("Pipeline stage update", "estimate");
    else fail("Pipeline stage update", pipeline.payload?.error || `HTTP ${pipeline.response.status}`);
  } catch (error) {
    fail("Pipeline stage update", error.message);
  }
}

// --- 5. Award -> project ---
if (opportunityId) {
  try {
    const convert = await requestJson(
      apiBase,
      `/api/opportunities/${encodeURIComponent(opportunityId)}/convert-to-project`,
      {
        method: "POST",
        body: { projectName: `Sim Project ${runId}`, sourceRoute: "/portal/pipeline" },
        cookie: sessionCookie,
      },
    );
    const convertedId = convert.payload?.item?.projectId || "";
    if (convert.response.ok && convertedId) {
      pass("Award -> project", convertedId);
    } else {
      fail("Award -> project", convert.payload?.error || `HTTP ${convert.response.status}`);
    }
  } catch (error) {
    fail("Award -> project", error.message);
  }
}

// Field-ops RFIs require a project in the table store (PRJ-001 is seeded per tenant).
projectId = FIELD_OPS_PROJECT_ID;

// --- 6. RFI on project ---
try {
  const rfi = await requestJson(apiBase, `/api/projects/${encodeURIComponent(projectId)}/rfis`, {
    method: "POST",
    body: { question: `Workflow sim RFI ${runId} - ceiling grid elevation at Level 2?` },
    cookie: sessionCookie,
  });
  const rfiId = rfi.payload?.data?.item?.id || rfi.payload?.item?.id || "";
  if (rfi.response.ok && rfiId) pass("Create RFI", rfiId);
  else fail("Create RFI", rfi.payload?.error || `HTTP ${rfi.response.status}`);
} catch (error) {
  fail("Create RFI", error.message);
}

// --- 7. Change order ---
try {
  const co = await requestJson(apiBase, "/api/change-orders", {
    method: "POST",
    body: {
      projectId,
      title: `Sim CO ${runId}`,
      amount: "$4,500.00",
      reason: "Workflow simulation change event",
      sourceRoute: "/portal/change-orders",
    },
    cookie: sessionCookie,
  });
  const coId = co.payload?.changeOrder?.changeOrderId || "";
  if (co.response.ok && coId) pass("Create change order", coId);
  else fail("Create change order", co.payload?.error || `HTTP ${co.response.status}`);
} catch (error) {
  fail("Create change order", error.message);
}

// --- 8. Field task ---
try {
  const task = await requestJson(apiBase, "/api/field-tasks", {
    method: "POST",
    body: {
      projectId,
      task: `Workflow sim field walk ${runId}`,
      assignee: "Superintendent",
      status: "open",
      costCode: "FIELD-LABOR",
    },
    cookie: sessionCookie,
  });
  const taskId = task.payload?.item?.id || "";
  if (task.response.ok && taskId) pass("Create field task", taskId);
  else fail("Create field task", task.payload?.error || `HTTP ${task.response.status}`);
} catch (error) {
  fail("Create field task", error.message);
}

// --- 9. Native payment ---
try {
  const intake = await requestJson(apiBase, "/api/fca-payments/intake", {
    method: "POST",
    body: { planKey: "startup", email: simEmail, company: "FCA Workflow Sim", contactName: "Simulator" },
    cookie: sessionCookie,
  });
  const intakeId = intake.payload?.data?.intake?.intakeId || intake.payload?.intake?.intakeId || "";
  if (!intake.response.ok || !intakeId) {
    fail("Payment intake", intake.payload?.error || `HTTP ${intake.response.status}`);
  } else {
    pass("Payment intake", intakeId);
    const checkout = await requestJson(apiBase, "/api/fca-payments/checkout", {
      method: "POST",
      body: { intakeId, method: "ACH", reference: runId },
      cookie: sessionCookie,
    });
    if (
      checkout.response.ok &&
      (checkout.payload?.data?.intake?.status === "completed" || checkout.payload?.intake?.status === "completed")
    ) {
      pass("Payment checkout", "completed");
    } else {
      fail("Payment checkout", checkout.payload?.error || `HTTP ${checkout.response.status}`);
    }
  }
} catch (error) {
  fail("Payment rail", error.message);
}

// --- 10. Warranty intake ---
try {
  const warranty = await requestJson(apiBase, "/api/fca-warranty/intake", {
    method: "POST",
    body: {
      title: `Workflow sim warranty ${runId}`,
      description: "Automated post-closeout touch-up request.",
      severity: "standard",
      email: simEmail,
      projectId,
    },
    cookie: sessionCookie,
  });
  const caseId = warranty.payload?.data?.warrantyCase?.warrantyCaseId || "";
  if (warranty.response.ok && caseId) pass("Warranty intake", caseId);
  else fail("Warranty intake", warranty.payload?.error || `HTTP ${warranty.response.status}`);
} catch (error) {
  fail("Warranty intake", error.message);
}

// --- 11. Auricrux recommend ---
try {
  const auricrux = await requestJson(apiBase, "/api/auricrux/actions", {
    method: "POST",
    body: {
      mode: "recommend",
      targetObjectType: "Project",
      targetObjectId: projectId,
      rationale: `Workflow simulation ${runId}`,
      sourceRoute: "/portal/platform",
    },
    cookie: sessionCookie,
  });
  const guidance = auricrux.payload?.data?.guidance || auricrux.payload?.guidance;
  if (auricrux.response.ok && (guidance?.reply || auricrux.payload?.ok)) pass("Auricrux recommend", "guidance returned");
  else fail("Auricrux recommend", `HTTP ${auricrux.response.status}`);
} catch (error) {
  fail("Auricrux recommend", error.message);
}

// --- 12. Academy read ---
try {
  const academy = await requestJson(apiBase, "/api/academy-lms", { cookie: sessionCookie });
  const programCount = academy.payload?.programs?.length || academy.payload?.catalog?.length || academy.payload?.count;
  if (academy.response.ok && (programCount || academy.payload?.ok !== false)) {
    pass("Academy catalog", programCount ? `${programCount} programs` : "reachable");
  } else {
    fail("Academy catalog", `HTTP ${academy.response.status}`);
  }
} catch (error) {
  fail("Academy catalog", error.message);
}

writeReport();
process.exit(failed > 0 ? 1 : 0);

function writeReport() {
  const outputDir = path.join(root, "docs", "qc");
  fs.mkdirSync(outputDir, { recursive: true });
  const passed = steps.filter((s) => s.status === "pass").length;
  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    apiBase,
    summary: { passed, failed, skipped: steps.filter((s) => s.status === "skip").length, total: steps.length },
    complete: failed === 0,
    steps,
  };
  fs.writeFileSync(path.join(outputDir, "workflow-simulation-report.json"), JSON.stringify(report, null, 2));

  const md = `# FCA Workflow Simulation

- **When:** ${report.generatedAt}
- **Run ID:** ${runId}
- **API:** ${apiBase}
- **Result:** ${report.complete ? "ALL STEPS PASSED" : `${failed} FAILURE(S)`} - ${passed}/${steps.length} passed

## What this proves

This robot runs the same API mutations a contractor operator would - lead intake, qualify, bid, pipeline, project, RFI, change order, field task, payment, warranty, Auricrux, and academy - without you logging in manually.

## Steps

${steps.map((s) => `- **${s.status.toUpperCase()}** ${s.name}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}

## For the founder

- Green = that part of the product worked on the live API when this ran.
- Red = something broke; engineering should fix before claiming that workflow works.
- Re-run anytime: \`npm run sim:workflow\`
- GitHub Actions runs this every hour on \`main\` (requires \`FCA_SIM_LOGIN_EMAIL\` / \`FCA_SIM_LOGIN_PASSWORD\` secrets).
`;
  fs.writeFileSync(path.join(outputDir, "workflow-simulation-latest.md"), md);
  if (failed === 0) console.log(`\nWorkflow simulation complete - ${passed}/${steps.length} steps passed.`);
  else console.error(`\nWorkflow simulation incomplete - ${failed} failure(s).`);
}
