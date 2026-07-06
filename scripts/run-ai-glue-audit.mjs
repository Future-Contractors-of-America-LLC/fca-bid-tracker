#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

function run(command, cwd = root) {
  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
  });

  return {
    command,
    exitCode: result.status ?? 1,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function readFunctionAppSettingNames() {
  const appName = (process.env.FCA_READINESS_FUNCTIONAPP_NAME || "Auricrux-Central").trim();
  const resourceGroup = (process.env.FCA_READINESS_FUNCTIONAPP_RG || "Auricrux_group").trim();
  const result = run(
    `az functionapp config appsettings list --resource-group ${resourceGroup} --name ${appName} --query "[].name" -o tsv`,
  );

  if (result.exitCode !== 0) {
    return {
      source: `${resourceGroup}/${appName}`,
      names: new Set(),
      error: result.stderr || result.stdout || "Unable to read Function App settings.",
    };
  }

  return {
    source: `${resourceGroup}/${appName}`,
    names: new Set(
      String(result.stdout || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
    error: "",
  };
}

function hasOutputMatch(result, regex) {
  const text = `${result.stdout}\n${result.stderr}`;
  return regex.test(text);
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

const checks = [];

function addCheck(id, passes, evidence, blocker) {
  checks.push({
    id,
    status: passes ? "PASS" : "BLOCKED",
    evidence,
    blocker: passes ? "" : blocker,
  });
}

function readBooleanEnv(name, defaultValue = false) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) {
    return defaultValue;
  }
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

const designRun = run("npm run validate:design-workspace");
const opsRun = run("npm run validate:operations-pipeline");
const financeRun = run("npm run validate:finance-workspace");
const bidWorkspaceRun = run("node scripts/validate-bid-workspace.mjs");
const routeReadinessRun = run("node scripts/validate-route-readiness-overlay.mjs");

addCheck(
  "cross-domain-contextual-awareness",
  designRun.exitCode === 0 && opsRun.exitCode === 0 && financeRun.exitCode === 0,
  [designRun.command, opsRun.command, financeRun.command],
  "One or more cross-domain workspace validators failed (design/ops/finance).",
);

addCheck(
  "atomic-module-trojan-horse-readiness",
  bidWorkspaceRun.exitCode === 0 && routeReadinessRun.exitCode === 0,
  [bidWorkspaceRun.command, routeReadinessRun.command],
  "Atomic standalone module proof is incomplete (bid workspace or route readiness validation failed).",
);

const centralApiRun = run("npm run verify:central-api");
const marginRun = run("npm run validate:finance-workspace");
const predictivePass =
  centralApiRun.exitCode === 0
  && hasOutputMatch(centralApiRun, /OK\s+commercial_pipeline_get/i)
  && marginRun.exitCode === 0;
addCheck(
  "predictive-risk-margin-protection",
  predictivePass,
  [centralApiRun.command, marginRun.command],
  "Commercial pipeline and/or finance margin surfaces are not proving predictive readiness.",
);

const lmsRun = run("npm run qc:lms");
const spineRun = run("npm run smoke:central-spine");
const jitPass =
  lmsRun.exitCode === 0
  && spineRun.exitCode === 0
  && hasOutputMatch(spineRun, /PASS:\s+POST\s+\/api\/auricrux\/actions recommend/i)
  && hasOutputMatch(spineRun, /PASS:\s+GET field intelligence via field-photos/i);
addCheck(
  "proactive-just-in-time-assistance",
  jitPass,
  [lmsRun.command, spineRun.command],
  "JIT assistance signals missing (LMS readiness, action recommendation, or field intelligence proof).",
);

const apiContractRun = run("npm run verify:central-api");
const adminOpsRun = run("npm run validate:operations-pipeline");
const adminPass =
  apiContractRun.exitCode === 0
  && hasOutputMatch(apiContractRun, /OK\s+bids_get/i)
  && hasOutputMatch(apiContractRun, /OK\s+onboarding_post/i)
  && adminOpsRun.exitCode === 0;
addCheck(
  "intelligent-administrative-automation",
  adminPass,
  [apiContractRun.command, adminOpsRun.command],
  "Administrative automation signals missing (bids/onboarding/operations).",
);

const approvalGateRun = run("node scripts/validate-admin-action-center.mjs");
const billingApprovalRun = run("node scripts/validate-billing-action-center.mjs");
const hitlPolicyRequired = readBooleanEnv("FCA_HITL_REQUIRED", false);
const hitlEvidencePass = approvalGateRun.exitCode === 0 && billingApprovalRun.exitCode === 0;
addCheck(
  "human-in-the-loop-governance",
  hitlPolicyRequired ? hitlEvidencePass : true,
  [
    approvalGateRun.command,
    billingApprovalRun.command,
    `policy:FCA_HITL_REQUIRED=${hitlPolicyRequired ? "true" : "false"}`,
  ],
  hitlPolicyRequired
    ? "Human-in-the-loop approval surfaces are required by policy but not fully validated for high-risk administrative or payment actions."
    : "Human-in-the-loop is configured as optional policy; evidence may still be incomplete.",
);

const fieldExecutionRun = run("node scripts/validate-field-execution-journey.mjs");
const uxSweepRun = run("node scripts/validate-portal-ux-sweep.mjs");
addCheck(
  "field-first-gloves-on-ux",
  fieldExecutionRun.exitCode === 0 && uxSweepRun.exitCode === 0,
  [fieldExecutionRun.command, uxSweepRun.command],
  "Field-first UX evidence is incomplete (field execution journey or portal UX sweep failed).",
);

const apiFirstRun = run("npm run validate:flat-api-proxy-alignment");
const openContractRun = run("npm run validate:nonlms-contract-envelope");
const dataLiquidityPass =
  apiFirstRun.exitCode === 0
  && openContractRun.exitCode === 0
  && centralApiRun.exitCode === 0
  && hasOutputMatch(centralApiRun, /OK\s+customer_verify_route/i);
addCheck(
  "data-liquidity-api-first-open-architecture",
  dataLiquidityPass,
  [apiFirstRun.command, openContractRun.command, centralApiRun.command],
  "API-first and open contract evidence is incomplete for data liquidity and external system integration continuity.",
);

const evidenceSpineRun = run("node scripts/validate-qualification-evidence-spine.mjs");
const fileGovernanceRun = run("node scripts/validate-file-governance.mjs");
addCheck(
  "trust-xai-audit-trail-transparency",
  evidenceSpineRun.exitCode === 0 && fileGovernanceRun.exitCode === 0,
  [evidenceSpineRun.command, fileGovernanceRun.command],
  "Trust transparency guardrails failed (qualification evidence spine and/or file governance audit trail).",
);

addCheck(
  "clean-data-standardization",
  designRun.exitCode === 0 && financeRun.exitCode === 0 && opsRun.exitCode === 0,
  [designRun.command, financeRun.command, opsRun.command],
  "Data standardization surfaces are not consistently passing across design, finance, and operations domains.",
);

const settings = readFunctionAppSettingNames();
const executionContextRun = run("npm run validate:execution-context-propagation");
const ecosystemReport = readJsonSafe(path.join(outputDir, "ecosystem-leader-grading-report.json"));
const modelSettings = [
  "AZURE_OPENAI_ENDPOINT",
  "AZURE_OPENAI_API_KEY",
  "AURICRUX_CHAT_DEPLOYMENT",
].filter((name) => !settings.names.has(name));
const hasEcosystemScores = Array.isArray(ecosystemReport?.moduleScores) && ecosystemReport.moduleScores.length > 0;
const knowledgePass =
  !settings.error
  && modelSettings.length === 0
  && executionContextRun.exitCode === 0
  && hasEcosystemScores;
addCheck(
  "seamless-knowledge-architecture",
  knowledgePass,
  [
    `${settings.source} app-settings`,
    executionContextRun.command,
    "docs/qc/ecosystem-leader-grading-report.json",
  ],
  [
    settings.error ? `Settings access issue: ${settings.error}` : "",
    modelSettings.length ? `Missing model settings: ${modelSettings.join(", ")}` : "",
    executionContextRun.exitCode !== 0 ? "Execution context propagation check failed." : "",
    !hasEcosystemScores ? "Ecosystem leader grading report missing module score evidence." : "",
  ].filter(Boolean).join(" | "),
);

const blocked = checks.filter((item) => item.status !== "PASS");
const status = blocked.length === 0 ? "PASS" : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status,
  strategyVersion: "2026-07-02-super-platform-hardening-v1",
  strategyFocus: [
    "atomic-architecture",
    "trust-governance-xai-hitl",
    "field-first-ux",
    "data-liquidity-api-first",
    "clean-data-standardization",
  ],
  policy: {
    hitlRequired: hitlPolicyRequired,
    hitlEnvironmentVariable: "FCA_HITL_REQUIRED",
  },
  checks,
  blockedChecks: blocked.map((item) => ({
    id: item.id,
    blocker: item.blocker,
  })),
};

fs.writeFileSync(path.join(outputDir, "ai-glue-audit-report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# AI Glue Audit Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  "",
  "## Capability Results",
  ...checks.map((item) => `- ${item.status} ${item.id}`),
  "",
  "## Blockers",
  ...(blocked.length
    ? blocked.map((item) => `- ${item.id}: ${item.blocker || "blocked"}`)
    : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "ai-glue-audit-report.md"), `${markdown}\n`);

if (status !== "PASS") {
  console.error(`AI glue audit failed (${blocked.length} blocked capabilities).`);
  process.exit(1);
}

console.log("AI glue audit passed.");
