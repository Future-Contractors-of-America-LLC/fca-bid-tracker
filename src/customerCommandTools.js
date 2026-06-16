import { navigateTo } from "./navigation";

const SUPPORT_COMMAND_KEY = "fca_customer_support_command_v3";
const BILLING_COMMAND_KEY = "fca_customer_billing_command_v2";
const ESTIMATE_REVISION_QUEUE_KEY = "fca_customer_estimate_revision_queue_v1";
const PROPOSAL_FOLLOWUP_QUEUE_KEY = "fca_customer_proposal_followup_queue_v1";
const FILE_INTAKE_DRAFTS_KEY = "fca_customer_file_intake_v1";
const MESSAGE_COMMAND_KEY = "fca_customer_message_command_v1";
const PROJECT_COMMAND_CENTER_QUEUE_KEY = "fca_customer_project_command_center_queue_v1";
const CHANGE_ORDER_REVIEW_QUEUE_KEY = "fca_customer_change_order_review_queue_v1";
const WARRANTY_CASE_QUEUE_KEY = "fca_customer_warranty_case_queue_v1";
const PAY_APP_QUEUE_KEY = "fca_customer_pay_app_queue_v1";
const RETENTION_RELEASE_QUEUE_KEY = "fca_customer_retention_release_queue_v1";
const SUBMITTAL_RESPONSE_QUEUE_KEY = "fca_customer_submittal_response_queue_v1";
const COLLECTION_NOTICE_QUEUE_KEY = "fca_customer_collection_notice_queue_v1";
const PUNCHLIST_RECOVERY_QUEUE_KEY = "fca_customer_punchlist_recovery_queue_v1";
const COORDINATION_NOTICE_QUEUE_KEY = "fca_customer_coordination_notice_queue_v1";
const FIELD_LOG_QUEUE_KEY = "fca_customer_field_log_queue_v1";
const SCHEDULE_RISK_QUEUE_KEY = "fca_customer_schedule_risk_queue_v1";
const RFI_RESPONSE_QUEUE_KEY = "fca_customer_rfi_response_queue_v1";
const PROCUREMENT_RELEASE_QUEUE_KEY = "fca_customer_procurement_release_queue_v1";
const INSPECTION_RESPONSE_QUEUE_KEY = "fca_customer_inspection_response_queue_v1";
const DELIVERY_CONFIRMATION_QUEUE_KEY = "fca_customer_delivery_confirmation_queue_v1";
const STARTUP_CHECKLIST_QUEUE_KEY = "fca_customer_startup_checklist_queue_v1";
const TURNOVER_CONFIRMATION_QUEUE_KEY = "fca_customer_turnover_confirmation_queue_v1";
const PERMIT_RESUBMISSION_QUEUE_KEY = "fca_customer_permit_resubmission_queue_v1";
const DOCUMENT_TRANSMITTAL_QUEUE_KEY = "fca_customer_document_transmittal_queue_v1";
const COMPLIANCE_AUDIT_QUEUE_KEY = "fca_customer_compliance_audit_queue_v1";
const CLOSEOUT_NOTICE_QUEUE_KEY = "fca_customer_closeout_notice_queue_v1";
const LIEN_WAIVER_QUEUE_KEY = "fca_customer_lien_waiver_queue_v1";
const ASBUILT_RELEASE_QUEUE_KEY = "fca_customer_asbuilt_release_queue_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

export function stageLienWaiverReviewTool({ companyName = "Customer Workspace", projectId = "PRJ-A117", amount = "$12,000", detail = "Prepare lien waiver package tied to payment release continuity." } = {}) {
  const current = readLocalJson(LIEN_WAIVER_QUEUE_KEY, { items: [] });
  const item = { id: `lien-${Date.now()}`, companyName, projectId, amount, detail, status: "Queued", nextAction: "Release lien waiver package" };
  writeLocalJson(LIEN_WAIVER_QUEUE_KEY, { ...current, items: [item, ...(current.items || [])] });
  navigateTo("/portal/billing");
  return item;
}

export function stageAsBuiltReleaseTool({ projectId = "PRJ-A117", packageName = "As-built turnover set", detail = "Prepare as-built release preserving closeout and warranty continuity." } = {}) {
  const current = readLocalJson(ASBUILT_RELEASE_QUEUE_KEY, { items: [] });
  const item = { id: `asbuilt-${Date.now()}`, projectId, packageName, detail, status: "Queued", nextAction: "Release as-built package" };
  writeLocalJson(ASBUILT_RELEASE_QUEUE_KEY, { ...current, items: [item, ...(current.items || [])] });
  navigateTo("/portal/files");
  return item;
}
