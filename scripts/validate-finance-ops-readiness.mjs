#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
const args = new Set(process.argv.slice(2));
const requireFunctionApp = args.has("--require-function-app");

const requirements = [
  {
    key: "STRIPE_SECRET_KEY",
    domain: "commerce-receipts",
    description: "Stripe secret key configured for checkout and settlement event handling.",
    sensitive: true,
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    domain: "commerce-receipts",
    description: "Stripe webhook signature validation secret configured.",
    sensitive: true,
  },
  {
    key: "FCA_BANK_NAME",
    domain: "bank-routing",
    description: "Destination financial institution name for operating receipts.",
    sensitive: false,
  },
  {
    key: "FCA_BANK_ROUTING_FINGERPRINT",
    domain: "bank-routing",
    description: "Masked routing proof (for example last4 or hashed fingerprint).",
    sensitive: false,
  },
  {
    key: "FCA_BANK_ACCOUNT_FINGERPRINT",
    domain: "bank-routing",
    description: "Masked account proof (for example last4 or hashed fingerprint).",
    sensitive: false,
  },
  {
    key: "FCA_PAYOUT_DESTINATION_ID",
    domain: "bank-routing",
    description: "Provider destination id that receives receipts (for example Stripe account/external account id).",
    sensitive: false,
  },
  {
    key: "FCA_PAYROLL_PROVIDER",
    domain: "payroll",
    description: "Payroll system name used for payroll runs and filing.",
    sensitive: false,
  },
  {
    key: "FCA_PAYROLL_COMPANY_ID",
    domain: "payroll",
    description: "Payroll company identifier in provider.",
    sensitive: false,
  },
  {
    key: "FCA_PAYROLL_EMPLOYEE_MICHAEL_ID",
    domain: "payroll",
    description: "Provider employee id for Michael Bartholomew.",
    sensitive: false,
  },
  {
    key: "FCA_PAYROLL_EMPLOYEE_AMANDA_ID",
    domain: "payroll",
    description: "Provider employee id for Amanda Bartholomew.",
    sensitive: false,
  },
  {
    key: "FCA_AP_PROVIDER",
    domain: "payables",
    description: "Accounts payable provider/system name used to pay invoices/services.",
    sensitive: false,
  },
  {
    key: "FCA_AP_COMPANY_ID",
    domain: "payables",
    description: "Accounts payable company identifier in provider.",
    sensitive: false,
  },
  {
    key: "FCA_TAX_PROVIDER",
    domain: "tax",
    description: "Tax filing system/provider name.",
    sensitive: false,
  },
  {
    key: "FCA_TAX_ACCOUNT_ID",
    domain: "tax",
    description: "Tax provider account identifier.",
    sensitive: false,
  },
  {
    key: "FCA_REFUND_POLICY_MODE",
    domain: "refunds",
    description: "Refund policy mode for commerce surfaces (for example manual-approval or auto-under-threshold).",
    sensitive: false,
  },
  {
    key: "FCA_REFUND_APPROVER_EMAIL",
    domain: "refunds",
    description: "Refund approver distribution email or mailbox.",
    sensitive: false,
  },
  {
    key: "FCA_FINANCE_CONTROLLER_EMAIL",
    domain: "governance",
    description: "Controller/owner mailbox for reconciliation and exceptions.",
    sensitive: false,
  },
];

function readFunctionAppSettingNames() {
  const appName = (process.env.FCA_READINESS_FUNCTIONAPP_NAME || "Auricrux-Central").trim();
  const resourceGroup = (process.env.FCA_READINESS_FUNCTIONAPP_RG || "Auricrux_group").trim();

  if (!appName || !resourceGroup) {
    return { enabled: false, names: new Set(), note: "Function App evidence disabled." };
  }

  const result = spawnSync(
    `az functionapp config appsettings list --resource-group ${resourceGroup} --name ${appName} --query "[].name" -o tsv`,
    {
      cwd: root,
      shell: true,
      stdio: "pipe",
      encoding: "utf8",
      env: process.env,
    },
  );

  if ((result.status ?? 1) !== 0) {
    return {
      enabled: true,
      names: new Set(),
      note: (result.stderr || result.stdout || "Unable to read Function App app setting names.").trim(),
    };
  }

  const names = new Set(
    String(result.stdout || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );

  return {
    enabled: true,
    names,
    note: `Function App evidence loaded from ${resourceGroup}/${appName}.`,
  };
}

const functionAppEvidence = readFunctionAppSettingNames();

const checks = requirements.map((requirement) => {
  const localValue = process.env[requirement.key];
  const localPresent = typeof localValue === "string" && localValue.trim().length > 0;
  const functionAppPresent = functionAppEvidence.names.has(requirement.key);
  const present = requireFunctionApp ? functionAppPresent : (localPresent || functionAppPresent);

  let source = "missing";
  if (localPresent) {
    source = "local-env";
  } else if (functionAppPresent) {
    source = "function-app-setting";
  }

  return {
    ...requirement,
    present,
    source,
    strictFunctionAppSatisfied: requireFunctionApp ? functionAppPresent : true,
    valuePreview: present
      ? requirement.sensitive
        ? "configured (sensitive)"
        : localPresent
          ? localValue.trim().slice(0, 8) + (localValue.trim().length > 8 ? "..." : "")
          : "configured (function-app-setting)"
      : "missing",
  };
});

const missing = checks.filter((item) => !item.present);
const status = missing.length === 0 ? "PASS" : "FAIL";

const grouped = checks.reduce((acc, item) => {
  acc[item.domain] = acc[item.domain] || [];
  acc[item.domain].push(item);
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  status,
  mode: {
    requireFunctionApp,
    description: requireFunctionApp
      ? "Strict mode: all keys must be present as Function App settings. Local shell values are ignored."
      : "Standard mode: key can be present in local shell env or Function App settings.",
  },
  evidenceSources: {
    functionApp: {
      enabled: functionAppEvidence.enabled,
      note: functionAppEvidence.note,
      settingNameCount: functionAppEvidence.names.size,
    },
  },
  totals: {
    required: checks.length,
    present: checks.length - missing.length,
    missing: missing.length,
  },
  checks,
};

fs.writeFileSync(
  path.join(outputDir, "finance-ops-readiness-report.json"),
  JSON.stringify(report, null, 2),
);

const markdown = [
  "# Finance Ops Readiness Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${status}`,
  `- Required: ${report.totals.required}`,
  `- Present: ${report.totals.present}`,
  `- Missing: ${report.totals.missing}`,
  `- Mode: ${report.mode.description}`,
  "",
  "## Domain Summary",
  ...Object.entries(grouped).map(([domain, items]) => {
    const domainMissing = items.filter((item) => !item.present).length;
    const domainStatus = domainMissing === 0 ? "PASS" : "MISSING";
    return `- ${domainStatus} ${domain} (${items.length - domainMissing}/${items.length})`;
  }),
  "",
  "## Missing Inputs",
  ...(missing.length
    ? missing.map(
        (item) =>
          `- ${item.key} (${item.domain}) - ${item.description}`,
      )
    : ["- none"]),
  "",
  "## Notes",
  "- This validator checks presence only; it does not print or persist sensitive secret values.",
  `- ${functionAppEvidence.note}`,
  "- Strict mode is intended for production release checks and CI policy lanes tied to secure secret stores.",
  "- Provide banking and provider values through secure secret storage, not source-controlled files.",
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "finance-ops-readiness-report.md"), markdown + "\n");

if (status !== "PASS") {
  console.error(`Finance ops readiness failed: ${missing.length} required inputs missing.`);
  process.exit(1);
}

console.log("Finance ops readiness validation passed.");
