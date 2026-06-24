import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];

function requireFile(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function requireIncludes(relativePath, needles) {
  const content = requireFile(relativePath);
  needles.forEach((needle) => {
    if (!content.includes(needle)) {
      errors.push(`${relativePath} missing expected content: ${needle}`);
    }
  });
}

requireIncludes("src/routes.js", ["/portal/finance", "PortalFinance", "/portal/design", "PortalDesignWorkspace", "/portal/rfis", "/portal/change-orders", "/portal/closeout", "PortalCloseout"]);
requireIncludes("src/api/financialClient.js", [
  "fetchFinancialWorkspace",
  "recordNativePayment",
  "importBankCsv",
  "createRecurringInvoice",
  "runRecurringInvoice",
  "generatePayAppDocument",
  "fetchReportExport",
  "upsertSovLine",
]);
requireIncludes("src/hooks/useFinancialWorkspace.js", [
  "recordNativePayment",
  "importBankCsv",
  "createRecurringInvoice",
  "generatePayAppDocument",
  "exportReport",
]);
requireIncludes("src/pages/portal/PortalFinance.jsx", [
  "FinancePaymentsPanel",
  "FinanceRecurringPanel",
  "FinanceBankImportPanel",
  "FCA-native books",
  "Record payment",
]);
requireIncludes("src/pages/portal/PortalBilling.jsx", [
  "Record payment",
  "FCA Books",
]);
requireIncludes("src/pages/portal/PortalPipeline.jsx", [
  "Record payment in FCA Books",
]);
requireIncludes("src/components/finance/FinanceSidebar.jsx", [
  "Receive payment",
  "Recurring billing",
  "Journal / GL",
  "FCA Books",
]);
requireIncludes("src/components/finance/FinanceJournalPanel.jsx", ["Post manual journal entry", "Journal register"]);
requireIncludes("src/components/auricrux/AuricruxInsightPanel.jsx", ["Auricrux Intelligence"]);
requireIncludes("src/pages/portal/PortalEstimates.jsx", ["TakeoffEstimatePanel", "Auricrux Precon Intelligence", "Create AR Invoice"]);
requireIncludes("../auricrux-central/core/design_precon_http.py", ["register_design_precon_routes", "precon-continuity"]);
requireIncludes("../auricrux-central/core/commercial_invoice_bridge.py", ["seed_sov_from_estimate", "_persist_financial"]);
requireIncludes("../auricrux-central/core/construction_billing.py", ["seed_sov_from_estimate"]);
requireIncludes("../auricrux-central/core/field_ops.py", ["ensure_project", "A-117"]);
requireIncludes("src/components/finance/FinanceConstructionPanel.jsx", [
  "Generate G702/G703",
  "onUpdateSovLine",
]);
requireIncludes("src/components/finance/FinanceNativePanels.jsx", [
  "Record native payment",
  "Import bank transactions",
]);
requireIncludes("src/pages/portal/PortalProjectDetail.jsx", [
  "onUpdateSovLine",
  "onGeneratePayAppDoc",
]);
requireIncludes("../auricrux-central/core/financial_accounting.py", [
  "get_finance_dashboard",
  "get_financial_workspace",
  "record-native-payment",
  "paymentRecording",
]);
requireIncludes("../auricrux-central/core/fca_native_finance.py", [
  "record_native_payment",
  "import_bank_csv",
  "create_recurring_invoice",
  "export_report_csv",
]);
requireIncludes("../auricrux-central/core/finance_intelligence.py", [
  "analyze_finance_workspace",
  "recommendations",
]);
requireIncludes("../auricrux-central/core/pay_app_documents.py", [
  "build_pay_app_documents",
]);
requireIncludes("../auricrux-central/core/construction_billing.py", [
  "get_construction_billing_package",
  "upsert-sov-line",
]);
requireIncludes("../auricrux-central/core/commercial_invoice_bridge.py", [
  "create_invoice_from_estimate",
]);
requireIncludes("../auricrux-central/core/finance.py", [
  "post_job_cost_actual",
  "journalEntry",
]);
requireIncludes("../auricrux-central/core/auricrux_chat.py", [
  "without external integrations",
  "FCA Books",
]);

if (errors.length) {
  console.error("Finance workspace validation failed:\n" + errors.map((item) => `- ${item}`).join("\n"));
  process.exit(1);
}

console.log("Finance workspace validation passed.");
