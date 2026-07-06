import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import FcaNativeCheckoutPanel from "../../components/FcaNativeCheckoutPanel";
import {
  createPortalInvoice,
  deliverPortalInvoice,
  fetchBillingSummary,
  fetchPortalInvoices,
  issuePortalInvoice,
  sendPortalMessage,
} from "../../api/portalClient";
import { createFcaPaymentIntake, submitFcaNativeCheckout } from "../../api/fcaPaymentClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchChangeOrders, fetchJobCosts } from "../../api/constructionClient";
import { fetchEstimates } from "../../api/commercialClient";
import { routeStateOverlays } from "../../systemState";

const PAYAPP_KEY = "fca_billing_pay_apps_v1";
const RETAINAGE_KEY = "fca_billing_retainage_register_v1";
const OWNER_APPROVAL_KEY = "fca_billing_owner_payapp_approval_v1";
const SUB_COMPLIANCE_KEY = "fca_billing_sub_pay_when_paid_v1";
const EVIDENCE_PACKAGE_KEY = "fca_billing_invoice_evidence_packages_v1";
const COLLECTION_HISTORY_KEY = "fca_billing_payment_velocity_history_v1";
const DAILY_LOGS_KEY = "fca_field_daily_logs_v1";
const JOB_COST_RETENTION_KEY = "fca_job_cost_retainage_lines_v1";

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

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysBetween(start, end) {
  const a = parseDate(start);
  const b = parseDate(end);
  if (!a || !b) return 0;
  return Math.max(0, Math.round((b - a) / 86400000));
}

function statusBadgeTone(status) {
  const text = normalize(status);
  if (text.includes("paid")) return { bg: "#dcfce7", color: "#166534" };
  if (text.includes("issued") || text.includes("submitted")) return { bg: "#dbeafe", color: "#1d4ed8" };
  if (text.includes("overdue") || text.includes("blocked")) return { bg: "#fee2e2", color: "#991b1b" };
  return { bg: "#e2e8f0", color: "#334155" };
}

function cardStyle(border = "#e5e7eb", bg = "#fff") {
  return {
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: 16,
    background: bg,
  };
}

function btnStyle(primary = false) {
  return {
    borderRadius: 10,
    border: primary ? "1px solid #166534" : "1px solid #cbd5e1",
    background: primary ? "#166534" : "#fff",
    color: primary ? "#fff" : "#0f172a",
    fontWeight: 700,
    padding: "8px 12px",
    cursor: "pointer",
  };
}

function inputStyle() {
  return {
    width: "100%",
    border: "1px solid #cbd5e1",
    borderRadius: 10,
    padding: "10px 12px",
    boxSizing: "border-box",
    font: "inherit",
  };
}

function inferScheduledValue(estimate, projectId) {
  const lines = [
    ...(estimate?.lineItems || []),
    ...(estimate?.lines || []),
    ...(estimate?.items || []),
  ];
  const totalFromLines = lines.reduce((sum, row) => sum + toNumber(row.amount || row.total || row.value || row.price), 0);
  const projectMatch = normalize(`${estimate?.projectId || ""} ${estimate?.id || ""} ${estimate?.bidId || ""}`);
  const projectHit = normalize(projectId) && projectMatch.includes(normalize(projectId));
  return {
    amount: totalFromLines || toNumber(estimate?.total),
    projectHit,
  };
}

function buildAiaPayApp({
  projectId,
  estimate,
  prevWork,
  currentWork,
  retainagePct,
  approvedCos,
}) {
  const scheduled = toNumber(estimate);
  const previous = toNumber(prevWork);
  const current = toNumber(currentWork);
  const totalToDate = previous + current;
  const balanceToFinish = Math.max(0, scheduled + toNumber(approvedCos) - totalToDate);
  const retainage = (totalToDate * toNumber(retainagePct)) / 100;
  return {
    projectId,
    generatedAt: new Date().toISOString(),
    form: "AIA G702/G703",
    g702: {
      originalContractSum: scheduled,
      netChangeByChangeOrders: toNumber(approvedCos),
      contractSumToDate: scheduled + toNumber(approvedCos),
      totalCompletedAndStoredToDate: totalToDate,
      retainage,
      totalEarnedLessRetainage: totalToDate - retainage,
      balanceToFinish,
    },
    g703: {
      scheduledValue: scheduled,
      previousApplications: previous,
      thisPeriod: current,
      materialsStored: 0,
      totalCompletedAndStored: totalToDate,
      percentComplete: scheduled ? Math.min(100, (totalToDate / (scheduled + toNumber(approvedCos))) * 100) : 0,
      balanceToFinish,
    },
  };
}

function makeEvidencePackage({ projectId, invoice, approvedCoRows, dailyLogs, files }) {
  const photos = (dailyLogs || []).flatMap((log) => Array.isArray(log.photos) ? log.photos : []).slice(0, 40);
  const signedCos = (approvedCoRows || []).map((row) => ({
    id: row.id || row.changeOrderId || "",
    title: row.title || "Change Order",
    amount: toNumber(row.amount || row.total),
    approvedBy: row.approver || row.approvedBy || "",
    approvedAt: row.approvedAt || row.updatedAt || row.createdAt || "",
    sourceId: row.sourceId || "",
  }));
  const fileEvidence = (files || []).slice(0, 40).map((file) => ({
    fileId: file.fileId || file.id || "",
    name: file.name || "",
    category: file.category || "",
    discipline: file.discipline || "",
    status: file.status || "",
  }));

  return {
    id: `inv-evidence-${Date.now()}`,
    projectId,
    invoiceId: invoice?.id || "",
    generatedAt: new Date().toISOString(),
    signedChangeOrders: signedCos,
    dailyLogs: (dailyLogs || []).slice(0, 40),
    photos,
    files: fileEvidence,
  };
}

function downloadJson(name, data) {
  if (typeof window === "undefined") return;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  URL.revokeObjectURL(href);
}

function PortalBillingAdvanced() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const { projectId, hasProject } = usePortalProjectId();
  const { files } = useWorkflowEvidence(projectId);
  const jobCost = useJobCost(projectId);

  const [draft, setDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [paymentIntake, setPaymentIntake] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  const [payApps, setPayApps] = useState(() => readLocalJson(PAYAPP_KEY, {}));
  const [retainageMap, setRetainageMap] = useState(() => readLocalJson(RETAINAGE_KEY, {}));
  const [ownerApprovals, setOwnerApprovals] = useState(() => readLocalJson(OWNER_APPROVAL_KEY, {}));
  const [subCompliance, setSubCompliance] = useState(() => readLocalJson(SUB_COMPLIANCE_KEY, {}));
  const [evidencePackages, setEvidencePackages] = useState(() => readLocalJson(EVIDENCE_PACKAGE_KEY, {}));
  const [collectionHistory, setCollectionHistory] = useState(() => readLocalJson(COLLECTION_HISTORY_KEY, {}));

  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);
  const summaryLoad = usePortalApiLoad(() => fetchBillingSummary().catch(() => ({ count: 0 })), []);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);
  const fieldTasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const changeOrdersLoad = usePortalApiLoad(() => (hasProject ? fetchChangeOrders(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const portfolioJobCostLoad = usePortalApiLoad(() => (hasProject ? fetchJobCosts(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);

  const invoices = invoicesLoad.data?.items || [];
  const billingSummary = summaryLoad.data || null;
  const estimates = estimatesLoad.data?.items || [];
  const fieldTasks = fieldTasksLoad.data?.items || [];
  const changeOrders = changeOrdersLoad.data?.items || [];

  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";

  useEffect(() => {
    writeLocalJson(PAYAPP_KEY, payApps);
  }, [payApps]);
  useEffect(() => {
    writeLocalJson(RETAINAGE_KEY, retainageMap);
  }, [retainageMap]);
  useEffect(() => {
    writeLocalJson(OWNER_APPROVAL_KEY, ownerApprovals);
  }, [ownerApprovals]);
  useEffect(() => {
    writeLocalJson(SUB_COMPLIANCE_KEY, subCompliance);
  }, [subCompliance]);
  useEffect(() => {
    writeLocalJson(EVIDENCE_PACKAGE_KEY, evidencePackages);
  }, [evidencePackages]);
  useEffect(() => {
    writeLocalJson(COLLECTION_HISTORY_KEY, collectionHistory);
  }, [collectionHistory]);

  const projectInvoices = useMemo(() => {
    if (!hasProject) return invoices;
    return invoices.filter((invoice) => normalize(`${invoice.note || ""} ${invoice.invoiceName || ""}`).includes(normalize(projectId)));
  }, [hasProject, invoices, projectId]);

  const scheduleValue = useMemo(() => {
    const match = estimates
      .map((estimate) => ({ ...inferScheduledValue(estimate, projectId), estimate }))
      .find((row) => row.projectHit)
      || estimates.map((estimate) => ({ ...inferScheduledValue(estimate, projectId), estimate }))[0]
      || { amount: 0, estimate: null };
    return {
      amount: toNumber(match.amount),
      estimate: match.estimate,
    };
  }, [estimates, projectId]);

  const evm = useMemo(() => {
    const completed = fieldTasks.filter((task) => /complete|closed|done/i.test(String(task.status || ""))).length;
    const total = Math.max(1, fieldTasks.length);
    const pct = completed / total;

    const pv = scheduleValue.amount * pct;
    const ev = pv;
    const ac = toNumber(jobCost.rollup?.actualCost || portfolioJobCostLoad.data?.items?.[0]?.actualCost || 0);

    return {
      completed,
      total,
      pct,
      pv,
      ev,
      ac,
      cpi: ac > 0 ? ev / ac : 0,
    };
  }, [fieldTasks, jobCost.rollup?.actualCost, portfolioJobCostLoad.data?.items, scheduleValue.amount]);

  const earnedReadyToBill = Math.max(0, evm.ev - projectInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0));

  const approvedCoValue = useMemo(
    () => changeOrders.filter((row) => /approved|signed/i.test(String(row.status || ""))).reduce((sum, row) => sum + toNumber(row.amount || row.total), 0),
    [changeOrders],
  );

  const payAppsForProject = payApps[projectId] || [];
  const retainageForProject = retainageMap[projectId] || [];
  const ownerApprovalForProject = ownerApprovals[projectId] || {};
  const evidenceForProject = evidencePackages[projectId] || [];

  const overUnderBilling = useMemo(() => {
    const billed = projectInvoices.reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
    const cost = toNumber(jobCost.rollup?.actualCost || 0);
    return {
      billed,
      cost,
      variance: billed - cost,
      marginPct: billed > 0 ? ((billed - cost) / billed) * 100 : 0,
    };
  }, [jobCost.rollup?.actualCost, projectInvoices]);

  const paymentVelocity = useMemo(() => {
    const historyRows = collectionHistory[projectId] || [];
    const avgDays = historyRows.length
      ? historyRows.reduce((sum, row) => sum + toNumber(row.daysToPay), 0) / historyRows.length
      : 0;
    const riskLevel = avgDays >= 15 ? "High" : avgDays >= 9 ? "Moderate" : "Normal";
    return {
      avgDays,
      riskLevel,
      rows: historyRows,
    };
  }, [collectionHistory, projectId]);

  const dailyLogs = useMemo(() => readLocalJson(DAILY_LOGS_KEY, []).filter((row) => row.projectId === projectId), [projectId, fieldTasks.length]);
  const jobCostRetentionRows = useMemo(() => (readLocalJson(JOB_COST_RETENTION_KEY, {})[projectId] || []), [projectId]);

  useEffect(() => {
    if (!hasProject) return;
    const byTrade = {};
    for (const row of jobCostRetentionRows) {
      const trade = row.trade || "Unassigned";
      byTrade[trade] = byTrade[trade] || {
        trade,
        contractAmount: 0,
        heldAmount: 0,
        releasedAmount: 0,
        retainagePct: row.retainagePct || 10,
      };
      byTrade[trade].contractAmount += toNumber(row.contractAmount);
      byTrade[trade].heldAmount += toNumber(row.heldAmount);
      byTrade[trade].releasedAmount += toNumber(row.releasedAmount);
    }

    const rows = Object.values(byTrade).map((row) => ({
      ...row,
      milestone50ReleaseEligible: row.contractAmount > 0 && evm.pct >= 0.5,
      stateLawTrigger: evm.pct >= 0.5 ? "Milestone trigger reached" : "Awaiting 50% completion",
    }));

    setRetainageMap((current) => ({ ...current, [projectId]: rows }));
  }, [evm.pct, hasProject, jobCostRetentionRows, projectId]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function createInvoice() {
    if (!draft.invoiceName.trim() || !draft.amount.trim()) return;
    setBusyId("create");
    setError("");
    setNotice("");

    try {
      const payload = await createPortalInvoice({
        invoiceName: draft.invoiceName,
        amount: draft.amount,
        note: `${draft.note || ""} | project:${projectId}`,
      });

      const created = payload?.item || payload?.invoice || null;
      if (created) {
        const evidence = makeEvidencePackage({
          projectId,
          invoice: created,
          approvedCoRows: changeOrders.filter((row) => /approved|signed/i.test(String(row.status || ""))),
          dailyLogs,
          files,
        });
        setEvidencePackages((current) => ({ ...current, [projectId]: [evidence, ...(current[projectId] || [])].slice(0, 150) }));
      }

      await Promise.all([invoicesLoad.reload(), summaryLoad.reload()]);
      setDraft({ invoiceName: "", amount: "", note: "" });
      refreshSyncStamp("Revenue invoice draft created");
      setNotice("Invoice draft created with audit-evidence package link.");
    } catch (invoiceError) {
      setError(invoiceError.message || "Unable to create invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function issueInvoice(invoiceId) {
    setBusyId(`issue-${invoiceId}`);
    setError("");
    setNotice("");
    try {
      await issuePortalInvoice(invoiceId);
      await invoicesLoad.reload();
      refreshSyncStamp("Revenue invoice issued");
      setNotice("Invoice issued.");
    } catch (issueError) {
      setError(issueError.message || "Unable to issue invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function deliverInvoice(invoiceId) {
    setBusyId(`deliver-${invoiceId}`);
    setError("");
    setNotice("");
    try {
      const payload = await deliverPortalInvoice(invoiceId, {
        companyName,
        recipientEmail: session?.email,
      });
      const email = payload.recipientEmail || session?.email || "customer";
      setNotice(payload.delivered ? `Invoice emailed to ${email}.` : "Invoice delivered into portal message lane.");
    } catch (deliverError) {
      setError(deliverError.message || "Unable to deliver invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function payInvoice(invoiceId) {
    setBusyId(`pay-${invoiceId}`);
    setError("");
    setNotice("");
    setPaymentStatus("");

    try {
      const payload = await createFcaPaymentIntake({
        invoiceId,
        email: session?.email,
        company: companyName,
      });
      setPaymentIntake(payload);
    } catch (payError) {
      setError(payError.message || "Unable to start payment intake.");
    } finally {
      setBusyId("");
    }
  }

  async function openBillingPortal(invoiceId) {
    return payInvoice(invoiceId);
  }

  async function completeInvoicePayment(body) {
    setBusyId("pay-submit");
    setError("");
    setNotice("");
    setPaymentStatus("Recording payment in FCA Books...");
    try {
      await submitFcaNativeCheckout(body);
      setPaymentIntake(null);
      setPaymentStatus("");
      await invoicesLoad.reload();

      const paidInvoice = projectInvoices.find((row) => row.id === body.invoiceId) || null;
      if (paidInvoice) {
        const issuedAt = paidInvoice.issuedAt || paidInvoice.updatedAt || paidInvoice.createdAt || new Date().toISOString();
        const daysToPay = daysBetween(issuedAt, new Date().toISOString());
        setCollectionHistory((current) => ({
          ...current,
          [projectId]: [
            {
              invoiceId: paidInvoice.id,
              daysToPay,
              amount: toNumber(paidInvoice.amount),
              paidAt: new Date().toISOString(),
            },
            ...(current[projectId] || []),
          ].slice(0, 250),
        }));
      }

      refreshSyncStamp("Payment recorded in FCA Books");
      setNotice("Payment recorded in FCA Books — invoice closed.");
    } catch (checkoutError) {
      setError(checkoutError.message || "Unable to record payment.");
      setPaymentStatus("");
    } finally {
      setBusyId("");
    }
  }

  function generateRollingDraftInvoice() {
    const billable = Math.max(0, earnedReadyToBill);
    setDraft((current) => ({
      ...current,
      invoiceName: current.invoiceName || `Progress Billing · ${projectId}`,
      amount: billable > 0 ? String(Math.round(billable)) : current.amount,
      note: `Earned value ready to bill based on progress ${(evm.pct * 100).toFixed(1)}% and EV ${formatUsd(evm.ev)}.`,
    }));
    setNotice("Draft invoice prefilled from rolling earned-value billing.");
  }

  async function generateAiaPayApp() {
    if (!hasProject) return;

    const previousWork = payAppsForProject.length
      ? toNumber(payAppsForProject[0]?.g703?.totalCompletedAndStored || 0)
      : projectInvoices.filter((invoice) => /paid|issued/i.test(String(invoice.status || ""))).reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);

    const currentWork = Math.max(0, evm.ev - previousWork);

    const payApp = buildAiaPayApp({
      projectId,
      estimate: scheduleValue.amount,
      prevWork: previousWork,
      currentWork,
      retainagePct: 10,
      approvedCos: approvedCoValue,
    });

    const next = {
      id: `payapp-${Date.now()}`,
      ...payApp,
      ownerApprovalStatus: "pending",
      ownerApprovalAt: "",
      ownerApprovalBy: "",
    };

    setPayApps((current) => ({ ...current, [projectId]: [next, ...(current[projectId] || [])].slice(0, 120) }));
    setOwnerApprovals((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || {}),
        [next.id]: { status: "pending", approvedAt: "", approvedBy: "" },
      },
    }));

    await sendPortalMessage({
      channel: "email",
      subject: `AIA Pay App ready · ${projectId}`,
      message: `AIA G702/G703 generated for owner review. Contract to date ${formatUsd(next.g702.contractSumToDate)}.`,
    }).catch(() => null);

    setNotice("AIA G702/G703 pay app generated and sent for owner approval.");
  }

  function approveOwnerPayApp(payAppId) {
    setOwnerApprovals((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || {}),
        [payAppId]: {
          status: "approved",
          approvedAt: new Date().toISOString(),
          approvedBy: session?.email || "owner-portal-user",
        },
      },
    }));

    setPayApps((current) => ({
      ...current,
      [projectId]: (current[projectId] || []).map((row) => (row.id === payAppId
        ? {
          ...row,
          ownerApprovalStatus: "approved",
          ownerApprovalAt: new Date().toISOString(),
          ownerApprovalBy: session?.email || "owner-portal-user",
        }
        : row)),
    }));

    setNotice("Owner pay-app approved inside portal. Cash cycle acceleration unlocked.");
  }

  function updateSubCompliance() {
    const lines = retainageForProject.map((row) => {
      const trade = row.trade || "Trade";
      const waiverUploaded = (files || []).some((file) => matchesTrade(file, trade) && /lien waiver|waiver/i.test(`${file.name || ""} ${file.note || ""}`));
      const workVerified = (readLocalJson("fca_punch_closeout_sync_v1", {})[projectId] || {})[trade] || (readLocalJson("fca_punch_holdback_notices_v1", [])).some((item) => normalize(`${item.trade || ""}`).includes(normalize(trade)));
      return {
        trade,
        waiverUploaded: Boolean(waiverUploaded),
        workVerified: Boolean(workVerified),
        payEligible: Boolean(waiverUploaded) && Boolean(workVerified),
      };
    });
    setSubCompliance((current) => ({ ...current, [projectId]: lines }));
    setNotice("Subcontractor pay-when-paid compliance refreshed.");
  }

  function releaseRetainage(trade) {
    setRetainageMap((current) => ({
      ...current,
      [projectId]: (current[projectId] || []).map((row) => (row.trade === trade && row.milestone50ReleaseEligible
        ? { ...row, releasedAmount: row.releasedAmount + row.heldAmount, heldAmount: 0, releasedAt: new Date().toISOString(), stateLawTrigger: "Released at 50% milestone" }
        : row)),
    }));
    setNotice(`Retainage released for ${trade}.`);
  }

  function openEvidencePackage(invoiceId) {
    const evidence = evidenceForProject.find((row) => row.invoiceId === invoiceId) || evidenceForProject[0] || null;
    if (!evidence) {
      setError("No evidence package found for this invoice.");
      return;
    }
    downloadJson(`${projectId}-invoice-${invoiceId || "evidence"}-package.json`, evidence);
    setNotice("Invoice evidence package downloaded.");
  }

  async function runCollectionsSignal() {
    if (paymentVelocity.avgDays < 15) {
      setNotice("Payment velocity within policy threshold.");
      return;
    }

    await sendPortalMessage({
      channel: "teams",
      subject: `Collections risk signal · ${projectId}`,
      message: `Average payment velocity is ${paymentVelocity.avgDays.toFixed(1)} days. Recommend late-payment clause/interest terms for next bid risk profile.`,
    }).catch(() => null);

    setNotice("Collections risk signal routed to bid risk scoring lane.");
  }

  const stats = useMemo(() => {
    const draftCount = projectInvoices.filter((row) => normalize(row.status).includes("draft")).length;
    const issuedCount = projectInvoices.filter((row) => normalize(row.status).includes("issued")).length;
    const paidCount = projectInvoices.filter((row) => normalize(row.status).includes("paid")).length;
    return { draftCount, issuedCount, paidCount };
  }, [projectInvoices]);

  return (
    <PortalShell
      title="Revenue Optimization Billing"
      subtitle="Rolling earned-value billing, AIA automation, and collections governance across the operating system."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/finance?view=construction"
      primaryLabel="Open construction finance"
    >
      <div style={{ marginBottom: 14 }}>
        <AuricruxInsightPanel
          title="Auricrux Billing Copilot"
          targetObjectType="Project"
          targetObjectId={projectId || "workspace"}
          sourceRoute="/portal/billing"
          rationale="Revenue optimization depends on real-time earned value, owner approvals, collections velocity, and compliance-gated disbursement."
          nextAction="Generate rolling draft invoice, issue AIA pay app, and enforce sub pay eligibility gates before release."
          actionHref="/portal/finance?view=payments"
          actionLabel="Open payments"
          tone="green"
          liveRecommend={Boolean(hasProject)}
        />
      </div>

      {!hasProject ? <div style={cardStyle()}>Select an active project from Projects to run billing optimization.</div> : null}

      {hasProject ? (
        <>
          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Continuous billing architecture (rolling EV)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
              <div><strong>Scheduled value:</strong> {formatUsd(scheduleValue.amount)}</div>
              <div><strong>Percent complete:</strong> {(evm.pct * 100).toFixed(1)}%</div>
              <div><strong>PV:</strong> {formatUsd(evm.pv)}</div>
              <div><strong>EV (earned):</strong> {formatUsd(evm.ev)}</div>
              <div><strong>AC:</strong> {formatUsd(evm.ac)}</div>
              <div><strong>CPI:</strong> {evm.cpi.toFixed(2)}</div>
              <div><strong>Ready to bill:</strong> {formatUsd(earnedReadyToBill)}</div>
              <div><strong>Approved CO value:</strong> {formatUsd(approvedCoValue)}</div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={btnStyle(true)} onClick={generateRollingDraftInvoice}>Generate rolling draft invoice</button>
              <button type="button" style={btnStyle()} onClick={generateAiaPayApp}>Generate AIA G702/G703</button>
            </div>
          </div>

          <div style={{ ...cardStyle("#dbeafe", "#f8fbff"), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Create invoice</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice name</div>
                <input value={draft.invoiceName} onChange={(event) => updateDraft("invoiceName", event.target.value)} style={inputStyle()} placeholder="Progress Billing Application #4" />
              </label>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Amount</div>
                <input value={draft.amount} onChange={(event) => updateDraft("amount", event.target.value)} style={inputStyle()} placeholder="$95,000" />
              </label>
            </div>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice note</div>
              <textarea value={draft.note} onChange={(event) => updateDraft("note", event.target.value)} style={{ ...inputStyle(), minHeight: 92 }} placeholder="Reference pay app period and approved change context" />
            </label>
            <button type="button" style={btnStyle(true)} onClick={createInvoice} disabled={busyId === "create"}>{busyId === "create" ? "Creating..." : "Create invoice"}</button>
          </div>

          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Invoice lane</div>
            <div style={{ color: "#475569", marginBottom: 8 }}>Draft {stats.draftCount} · Issued {stats.issuedCount} · Paid {stats.paidCount} · Billing records {billingSummary?.count ?? "-"}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {projectInvoices.map((invoice) => {
                const tone = statusBadgeTone(invoice.status || "");
                return (
                  <div key={invoice.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{invoice.invoiceName}</div>
                        <div style={{ color: "#475569", marginTop: 4 }}>{formatUsd(invoice.amount)} · {invoice.note || "No note"}</div>
                      </div>
                      <div style={{ alignSelf: "center", padding: "4px 10px", borderRadius: 999, background: tone.bg, color: tone.color, fontWeight: 700 }}>
                        {invoice.status || "Draft"}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      {normalize(invoice.status).includes("draft") ? (
                        <button type="button" style={btnStyle()} onClick={() => issueInvoice(invoice.id)} disabled={busyId === `issue-${invoice.id}`}>{busyId === `issue-${invoice.id}` ? "Issuing..." : "Issue"}</button>
                      ) : null}
                      {normalize(invoice.status).includes("issued") ? (
                        <>
                            <button type="button" style={btnStyle(true)} onClick={() => openBillingPortal(invoice.id)} disabled={busyId === `pay-${invoice.id}`}>{busyId === `pay-${invoice.id}` ? "Starting..." : "Pay"}</button>
                          <button type="button" style={btnStyle()} onClick={() => deliverInvoice(invoice.id)} disabled={busyId === `deliver-${invoice.id}`}>{busyId === `deliver-${invoice.id}` ? "Sending..." : "Send"}</button>
                        </>
                      ) : null}
                      <button type="button" style={btnStyle()} onClick={() => openEvidencePackage(invoice.id)}>Download dispute evidence package</button>
                      <a href={`/portal/finance?view=payments&invoiceId=${encodeURIComponent(invoice.id)}`} style={{ ...btnStyle(), textDecoration: "none" }}>Record payment</a>
                    </div>
                  </div>
                );
              })}
              {!projectInvoices.length ? <div style={{ color: "#64748b" }}>No invoices yet for this project.</div> : null}
            </div>
          </div>

          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Owner client-portal approval (pay-app acceleration)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {payAppsForProject.map((app) => {
                const ownerState = ownerApprovalForProject[app.id]?.status || app.ownerApprovalStatus || "pending";
                return (
                  <div key={app.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                    <div style={{ fontWeight: 700 }}>{app.form} · {app.id}</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>
                      Contract to date {formatUsd(app.g702.contractSumToDate)} · This period {formatUsd(app.g703.thisPeriod)} · Retainage {formatUsd(app.g702.retainage)}
                    </div>
                    <div style={{ marginTop: 6 }}>
                      Owner approval: <strong>{ownerState}</strong>
                      {ownerApprovalForProject[app.id]?.approvedAt ? ` · ${ownerApprovalForProject[app.id].approvedAt}` : ""}
                    </div>
                    {ownerState !== "approved" ? (
                      <button type="button" style={{ ...btnStyle(true), marginTop: 8 }} onClick={() => approveOwnerPayApp(app.id)}>Approve in owner portal</button>
                    ) : null}
                  </div>
                );
              })}
              {!payAppsForProject.length ? <div style={{ color: "#64748b" }}>Generate the first AIA pay app to begin owner in-portal approvals.</div> : null}
            </div>
          </div>

          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Automated compliance gate (pay-when-paid)</div>
            <div style={{ color: "#475569", marginBottom: 8 }}>Subcontractor pay eligibility requires lien waiver + verified work completion.</div>
            <button type="button" style={btnStyle()} onClick={updateSubCompliance}>Refresh sub compliance</button>
            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              {(subCompliance[projectId] || []).map((row) => (
                <div key={row.trade} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{row.trade}</div>
                  <div style={{ color: row.payEligible ? "#166534" : "#991b1b", marginTop: 4 }}>
                    Waiver {row.waiverUploaded ? "uploaded" : "missing"} · Work {row.workVerified ? "verified" : "unverified"} · {row.payEligible ? "Pay eligible" : "Blocked"}
                  </div>
                </div>
              ))}
              {!(subCompliance[projectId] || []).length ? <div style={{ color: "#64748b" }}>No trade compliance rows yet. Refresh after retainage sync.</div> : null}
            </div>
          </div>

          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Retainage management and release</div>
            <div style={{ display: "grid", gap: 8 }}>
              {retainageForProject.map((row) => (
                <div key={row.trade} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700 }}>{row.trade}</div>
                  <div style={{ color: "#475569", marginTop: 4 }}>
                    Contract {formatUsd(row.contractAmount)} · Held {formatUsd(row.heldAmount)} · Released {formatUsd(row.releasedAmount)} · Trigger {row.stateLawTrigger}
                  </div>
                  {row.milestone50ReleaseEligible && row.heldAmount > 0 ? (
                    <button type="button" style={{ ...btnStyle(true), marginTop: 8 }} onClick={() => releaseRetainage(row.trade)}>Release retainage</button>
                  ) : null}
                </div>
              ))}
              {!retainageForProject.length ? <div style={{ color: "#64748b" }}>Retainage rows will populate from Job Cost line-item registers.</div> : null}
            </div>
          </div>

          <div style={{ ...cardStyle(), marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Revenue recognition and collections intelligence</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <div><strong>Billed:</strong> {formatUsd(overUnderBilling.billed)}</div>
              <div><strong>Cost incurred:</strong> {formatUsd(overUnderBilling.cost)}</div>
              <div><strong>{overUnderBilling.variance >= 0 ? "Over-billed" : "Under-billed"}:</strong> {formatUsd(Math.abs(overUnderBilling.variance))}</div>
              <div><strong>Project margin:</strong> {overUnderBilling.marginPct.toFixed(2)}%</div>
              <div><strong>Avg days to pay:</strong> {paymentVelocity.avgDays.toFixed(1)}</div>
              <div><strong>Collections risk:</strong> {paymentVelocity.riskLevel}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button type="button" style={btnStyle()} onClick={runCollectionsSignal}>Run payment velocity risk signal</button>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Audit signal linkage</div>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              Every invoice can export a dispute-ready evidence package including signed change orders, daily logs, and linked files.
              Evidence packages stored: {evidenceForProject.length}.
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href={`/portal/audit?projectId=${encodeURIComponent(projectId)}`} style={{ ...btnStyle(), textDecoration: "none" }}>Open Audit trail</a>
              <a href={`/portal/change-orders?projectId=${encodeURIComponent(projectId)}`} style={{ ...btnStyle(), textDecoration: "none" }}>Open Change Orders</a>
              <a href={`/portal/job-cost?projectId=${encodeURIComponent(projectId)}`} style={{ ...btnStyle(), textDecoration: "none" }}>Open Job Cost</a>
            </div>
          </div>
        </>
      ) : null}

      {notice ? <div style={{ ...cardStyle("#bbf7d0", "#f0fdf4"), marginTop: 12, color: "#166534" }}>{notice}</div> : null}
      {error ? <div style={{ ...cardStyle("#fecaca", "#fef2f2"), marginTop: 12, color: "#991b1b" }}>{error}</div> : null}

      {paymentIntake ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "grid", placeItems: "center", padding: 24, zIndex: 40 }}>
          <div style={{ ...cardStyle(), width: "min(640px, 100%)", maxHeight: "90vh", overflow: "auto" }}>
            <FcaNativeCheckoutPanel
              intake={paymentIntake.intake}
              instructions={paymentIntake.instructions}
              methods={paymentIntake.methods}
              busy={busyId === "pay-submit"}
              error={error}
              status={paymentStatus}
              onBack={() => {
                setPaymentIntake(null);
                setError("");
                setPaymentStatus("");
              }}
              onSubmit={completeInvoicePayment}
            />
          </div>
        </div>
      ) : null}
    </PortalShell>
  );
}

function matchesTrade(file, trade) {
  const hay = normalize(`${file?.name || ""} ${file?.note || ""} ${file?.discipline || ""} ${file?.category || ""}`);
  const t = normalize(trade);
  return hay.includes(t) || (t && t.split(" ").some((token) => token.length > 3 && hay.includes(token)));
}
