#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  FCA_API_BASE,
  FCA_MARKETING_ORIGIN,
} from "./domainHosts.constants.mjs";

const base = FCA_API_BASE.replace(/\/$/, "");

const endpoints = {
  baseUrl: base,
  bidsApi: `${base}/api/bids`,
  leadsApi: `${base}/api/leads`,
  commercialPipelineApi: `${base}/api/commercial-pipeline`,
  onboardingApi: `${base}/api/onboarding`,
  healthApi: `${base}/api/health`,
  statusApi: `${base}/api/status`,
  executeApi: `${base}/api/execute`,
  projectsApi: `${base}/api/projects`,
  filesApi: `${base}/api/files`,
  academyLmsApi: `${base}/api/academy-lms`,
  academyRemediationApi: `${base}/api/academy-remediation-summary`,
  customerLoginApi: `${base}/api/customer-login`,
  customerSessionApi: `${base}/api/customer-session`,
  customerLogoutApi: `${base}/api/customer-logout`,
  customerAuthStateApi: `${base}/api/customer-auth-state`,
  workflowAuditApi: `${base}/api/workflow-audit`,
  stripeWebhookApi: `${base}/api/stripe/webhook`,
  stripeCheckoutApi: `${base}/api/stripe-checkout`,
  stripeWebhookSwaApi: `${FCA_MARKETING_ORIGIN}/api/stripe-webhook`,
  mobileRegisterApi: `${base}/api/mobile/register`,
  portalMessagesApi: `${base}/api/portal-messages`,
  portalInvoicesApi: `${base}/api/portal-invoices`,
  supportTicketsApi: `${base}/api/support-tickets`,
  billingSummaryApi: `${base}/api/billing-summary`,
  fieldTasksApi: `${base}/api/field-tasks`,
  fieldScheduleApi: `${base}/api/field-schedule`,
  auricruxApi: `${base}/api/auricrux`,
  pilotCheckout: "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01",
  startupCheckout: "",
};

const lines = [
  "window.FCA_BACKEND = {",
  ...Object.entries(endpoints).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`),
  "  projectRfisApi: function (projectId) {",
  '    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/rfis";',
  "  },",
  "  projectTakeoffsApi: function (projectId) {",
  '    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/takeoffs";',
  "  },",
  "  projectWorkspaceApi: function (projectId) {",
  '    return this.baseUrl + "/api/projects/" + encodeURIComponent(projectId) + "/workspace";',
  "  }",
  "};",
  "",
];

const target = path.join(process.cwd(), "public", "fca-backend-config.js");
fs.writeFileSync(target, lines.join("\n"), "utf8");
console.log(`Wrote ${target} with baseUrl ${base}`);
