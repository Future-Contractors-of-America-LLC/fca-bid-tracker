import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useCustomerSession from "../../hooks/useCustomerSession";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { adminGovernance } from "../../adminGovernance";
import { fetchEstimates } from "../../api/commercialClient";
import { fetchAcademyLms } from "../../api/academyClient";
import { mutateFinancialWorkspace } from "../../api/financialClient";
import {
  advanceChangeOrder,
  createChangeOrder,
  fetchChangeOrders,
  fetchProjectRfis,
} from "../../api/constructionClient";
import { fetchWorkflowFiles } from "../../api/workflowClient";
import { fetchDesignMarkups } from "../../api/designWorkspaceClient";
import { createFieldScheduleEvent, fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { sendPortalMessage } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const input = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 10, boxSizing: "border-box", font: "inherit" };
const button = { border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", padding: "8px 12px", fontWeight: 700, cursor: "pointer" };

const CO_AT_RISK_KEY = "fca_co_at_risk_costs_v1";
const CO_HARD_STOP_KEY = "fca_co_scope_hard_stops_v1";
const CO_BUDGET_REV_KEY = "fca_co_budget_revision_requests_v1";
const CO_SCHED_EXT_KEY = "fca_co_schedule_extension_requests_v1";
const PULL_PLAN_KEY = "fca_schedule_pull_plan_v2";
const ADMIN_POLICY_RUNTIME_KEY = "fca_admin_policy_runtime_v1";
const JIT_CO_FIRST_USE_KEY = "fca_jit_co_first_use_v1";

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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysOpen(createdAt) {
  const created = parseDate(createdAt);
  if (!created) return 0;
  return Math.max(0, Math.floor((Date.now() - created) / 86400000));
}

function flattenEstimateLines(estimate) {
  const pools = [
    ...(estimate?.lineItems || []),
    ...(estimate?.lines || []),
    ...(estimate?.items || []),
    ...(estimate?.scopeLines || []),
  ];
  return pools.map((line) => ({
    label: line.label || line.scope || line.description || "",
    amount: toNumber(line.amount || line.total || line.price || line.value),
    hours: toNumber(line.hours || line.laborHours),
    equipmentUnits: toNumber(line.equipmentUnits || line.units),
  }));
}

function matchEstimateForSource(projectId, estimates, sourceText) {
  const projectNorm = normalize(projectId);
  const sourceNorm = normalize(sourceText);
  const filtered = (estimates || []).filter((estimate) => normalize(`${estimate.projectId || ""} ${estimate.id || ""}`).includes(projectNorm) || !projectId);
  let best = { score: -1, estimate: null, line: null };
  for (const estimate of filtered.length ? filtered : (estimates || [])) {
    for (const line of flattenEstimateLines(estimate)) {
      const lineNorm = normalize(line.label);
      let score = 0;
      if (sourceNorm && lineNorm.includes(sourceNorm)) score += 8;
      if (sourceNorm && sourceNorm.split(" ").some((token) => token.length > 4 && lineNorm.includes(token))) score += 3;
      if (score > best.score) {
        best = { score, estimate, line };
      }
    }
  }
  return best;
}

function determineApprover(amount) {
  const rules = adminGovernance?.changeOrderGovernance?.approvalHierarchy || [];
  const numeric = toNumber(amount);
  return rules.find((rule) => numeric <= rule.maxAmount) || { approverRole: "Project Director", reason: "Default approval route" };
}

function sourceRiskFlags(reason, narrative) {
  const reasonText = normalize(reason);
  const narrativeText = normalize(narrative);
  const vagueTerms = ["extra work", "misc", "as needed", "to be confirmed", "unknown"]; 
  const vagueHit = vagueTerms.find((term) => narrativeText.includes(normalize(term)));
  return {
    needsDelayClause: /owner request|design revision|unforeseen condition/.test(reasonText),
    vagueNarrative: Boolean(vagueHit),
    vagueTerm: vagueHit || "",
  };
}

function hasCriticalPathImpact(sourceId, sourceLabel, scheduleItems, pullPlanRows) {
  const labelNorm = normalize(sourceLabel);
  const scheduleHit = (scheduleItems || []).find((item) => {
    const hay = normalize(`${item.title || ""} ${item.task || ""} ${item.id || ""} ${item.eventId || ""}`);
    return hay.includes(labelNorm) || String(item.id || item.eventId || "") === String(sourceId);
  });
  if (!scheduleHit) return false;
  const id = String(scheduleHit.id || scheduleHit.eventId || "");
  const dependent = (pullPlanRows || []).filter((row) => String(row.dependsOn || "") === id).length;
  const due = parseDate(scheduleHit.date || scheduleHit.dueDate || "");
  const isNear = due && (due - Date.now()) < (7 * 86400000);
  return dependent > 0 || Boolean(isNear);
}

function buildDelayClause(projectId) {
  return `Schedule Extension Claim: This change impacts critical path activities for ${projectId}. Contractor reserves all rights to equitable time extension and associated delay costs.`;
}

function certificationRows(payload) {
  const rows = [
    ...(payload?.learners || []),
    ...(payload?.items || []),
    ...(payload?.summary?.learners || []),
  ];
  return rows.map((row) => ({
    worker: String(row.email || row.name || row.learnerId || row.id || "").trim(),
    certs: Array.isArray(row.certifications)
      ? row.certifications
      : Array.isArray(row.credentials)
      ? row.credentials
      : row.badges
      ? (Array.isArray(row.badges) ? row.badges : [row.badges])
      : [],
  })).filter((row) => row.worker);
}

function hasRequiredCredential(payload, worker, requiredCredential) {
  if (!requiredCredential) return true;
  const who = normalize(worker);
  const need = normalize(requiredCredential);
  const match = certificationRows(payload).find((row) => {
    const identity = normalize(row.worker);
    return identity.includes(who) || who.includes(identity);
  });
  if (!match) return false;
  return match.certs.some((cert) => normalize(String(cert)).includes(need));
}

export default function PortalChangeOrders() {
  const { session } = useCustomerSession();
  const { projectId, hasProject } = usePortalProjectId();
  const jobCost = useJobCost(projectId);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [atRiskCosts, setAtRiskCosts] = useState(() => readLocalJson(CO_AT_RISK_KEY, {}));
  const [hardStops, setHardStops] = useState(() => readLocalJson(CO_HARD_STOP_KEY, {}));
  const [budgetRevisions, setBudgetRevisions] = useState(() => readLocalJson(CO_BUDGET_REV_KEY, []));
  const [scheduleExtensions, setScheduleExtensions] = useState(() => readLocalJson(CO_SCHED_EXT_KEY, []));
  const [showJitMicroLearning, setShowJitMicroLearning] = useState(() => !readLocalJson(JIT_CO_FIRST_USE_KEY, false));

  const [draft, setDraft] = useState({
    sourceType: "",
    sourceId: "",
    sourceLabel: "",
    title: "",
    reason: "Owner Request",
    narrative: "",
    quantity: "",
    laborHours: "",
    equipmentUnits: "",
    proposedCost: "",
    markupPct: String(adminGovernance?.changeOrderGovernance?.enterpriseMinimumMarkupPct || 15),
    overrideApproved: false,
    overrideNote: "",
    targetUnsignedDays: String(adminGovernance?.changeOrderGovernance?.hardStopUnsignedDays || 7),
  });

  const rfisLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const tasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const scheduleLoad = usePortalApiLoad(() => (hasProject ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const designLoad = usePortalApiLoad(() => (hasProject ? fetchDesignMarkups(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);
  const filesLoad = usePortalApiLoad(() => (hasProject ? fetchWorkflowFiles({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const academyLoad = usePortalApiLoad(() => fetchAcademyLms({ view: "summary" }), []);

  const rfis = rfisLoad.data || [];
  const fieldTasks = tasksLoad.data?.items || [];
  const scheduleItems = scheduleLoad.data?.items || [];
  const designMarkupsRaw = Array.isArray(designLoad.data) ? designLoad.data : designLoad.data?.items || [];
  const designRevisions = designMarkupsRaw.filter((item) => /revision|cloud|delta|change/i.test(normalize(`${item.type || ""} ${item.label || ""} ${item.note || ""}`)));
  const estimates = estimatesLoad.data?.items || [];
  const projectFiles = filesLoad.data?.items || [];

  useEffect(() => {
    if (!showJitMicroLearning) return;
    writeLocalJson(JIT_CO_FIRST_USE_KEY, true);
  }, [showJitMicroLearning]);

  const pullPlanRows = useMemo(() => {
    const map = readLocalJson(PULL_PLAN_KEY, {});
    return map[projectId] || [];
  }, [projectId, scheduleItems.length]);

  useEffect(() => {
    writeLocalJson(CO_AT_RISK_KEY, atRiskCosts);
  }, [atRiskCosts]);

  useEffect(() => {
    writeLocalJson(CO_HARD_STOP_KEY, hardStops);
  }, [hardStops]);

  useEffect(() => {
    writeLocalJson(CO_BUDGET_REV_KEY, budgetRevisions);
  }, [budgetRevisions]);

  useEffect(() => {
    writeLocalJson(CO_SCHED_EXT_KEY, scheduleExtensions);
  }, [scheduleExtensions]);

  async function reloadChangeOrders() {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await fetchChangeOrders(projectId);
      setItems(payload.items || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load change orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadChangeOrders();
  }, [projectId, hasProject]);

  const sourceOptions = useMemo(() => {
    const rfiRows = rfis.map((rfi) => ({
      type: "RFI",
      id: rfi.id || rfi.rfiId || rfi.number,
      label: `${rfi.number || rfi.rfiId || rfi.id} · ${rfi.question || "RFI"}`,
    }));
    const taskRows = fieldTasks.map((task) => ({
      type: "FieldTask",
      id: task.id || task.taskId,
      label: `${task.task || task.title || "Task"} · ${task.assignee || "crew"}`,
    }));
    const revisionRows = designRevisions.map((rev) => ({
      type: "DesignRevision",
      id: rev.id || rev.markupId,
      label: `${rev.label || rev.id || "Revision"} · ${rev.sheetId || "sheet"}`,
    }));
    return [...rfiRows, ...taskRows, ...revisionRows];
  }, [designRevisions, fieldTasks, rfis]);

  const selectedSource = sourceOptions.find((option) => option.type === draft.sourceType && String(option.id) === String(draft.sourceId)) || null;

  const estimateMatch = useMemo(() => {
    const sourceText = selectedSource?.label || draft.sourceLabel || draft.title;
    return matchEstimateForSource(projectId, estimates, sourceText);
  }, [draft.sourceLabel, draft.title, estimates, projectId, selectedSource]);

  const originalEstimateCost = toNumber(estimateMatch.line?.amount || estimateMatch.estimate?.total || 0);
  const proposedCost = toNumber(draft.proposedCost);
  const deltaCost = proposedCost - originalEstimateCost;
  const requiredMarkup = adminGovernance?.changeOrderGovernance?.enterpriseMinimumMarkupPct || 15;
  const markupPct = toNumber(draft.markupPct);
  const markupViolation = markupPct < requiredMarkup;
  const approver = determineApprover(proposedCost);
  const risk = sourceRiskFlags(draft.reason, draft.narrative);
  const criticalPath = hasCriticalPathImpact(draft.sourceId, selectedSource?.label || draft.sourceLabel, scheduleItems, pullPlanRows);
  const coNarrative = useMemo(() => {
    const base = draft.narrative.trim();
    if (!base) return "";
    if (criticalPath && risk.needsDelayClause) {
      return `${base}\n\n${buildDelayClause(projectId)}`;
    }
    return base;
  }, [criticalPath, draft.narrative, projectId, risk.needsDelayClause]);

  const atRiskTotal = useMemo(() => {
    const rows = Object.values(atRiskCosts[projectId] || {});
    return rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  }, [atRiskCosts, projectId]);

  useEffect(() => {
    if (!hasProject) return;
    const unsignedDays = toNumber(draft.targetUnsignedDays) || (adminGovernance?.changeOrderGovernance?.hardStopUnsignedDays || 7);
    const pending = items.filter((row) => /pending/i.test(String(row.status || "")) || /draft/i.test(String(row.status || "")));

    const existingStops = hardStops[projectId] || {};
    const nextStops = { ...existingStops };
    let changed = false;

    for (const row of pending) {
      const rowId = row.changeOrderId || row.id;
      const openDays = daysOpen(row.createdAt || row.updatedAt || new Date().toISOString());
      if (openDays < unsignedDays || existingStops[rowId]) continue;
      nextStops[rowId] = {
        id: rowId,
        title: row.title || rowId,
        projectId,
        createdAt: new Date().toISOString(),
        message: `Formal Notice of Delay triggered for ${row.title || rowId}. Work scope is paused until owner sign-off.`,
      };
      changed = true;
      sendPortalMessage({
        channel: "email",
        subject: `Formal Notice of Delay · ${projectId} · ${row.title || rowId}`,
        message: `Unsigned change order exceeded ${unsignedDays} days. Scope work is paused until signed CO is received.`,
      }).catch(() => null);
    }

    if (changed) {
      setHardStops((current) => ({ ...current, [projectId]: nextStops }));
    }
  }, [draft.targetUnsignedDays, hardStops, hasProject, items, projectId]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function selectSource(value) {
    const option = sourceOptions.find((row) => `${row.type}:${row.id}` === value);
    if (!option) return;
    setDraft((current) => ({
      ...current,
      sourceType: option.type,
      sourceId: String(option.id),
      sourceLabel: option.label,
      title: current.title || `CO · ${option.label}`,
    }));
  }

  function validateDraft() {
    if (!draft.sourceType || !draft.sourceId) return "Change Order must be initiated from a source event (RFI, Field Task, or Design Revision).";
    if (!draft.title.trim()) return "Title is required.";
    if (!proposedCost) return "Proposed cost is required.";
    if (risk.vagueNarrative) return `Narrative is too vague. Replace term: ${risk.vagueTerm}.`;
    if (!draft.quantity.trim() || !draft.laborHours.trim() || !draft.equipmentUnits.trim()) {
      return "Narrative support fields are required: quantity, labor hours, and equipment units.";
    }
    if (markupViolation && (!draft.overrideApproved || !draft.overrideNote.trim())) {
      return `Markup is below enterprise standard (${requiredMarkup}%). Executive override approval and note are required.`;
    }

    const runtimePolicy = readLocalJson(ADMIN_POLICY_RUNTIME_KEY, {});
    const signoffThreshold = toNumber(runtimePolicy.changeOrderPdfSignoffOverUsd || adminGovernance.policyAsCode?.changeOrder?.externalPdfSignoffRequiredOverUsd || 10000);
    if (proposedCost > signoffThreshold) {
      const tokens = adminGovernance.policyAsCode?.changeOrder?.signoffFileTagTokens || ["change-order-signoff", "external-signoff", "owner-signoff"];
      const hasExternalPdfSignoff = projectFiles.some((file) => {
        const hay = normalize(`${file.name || ""} ${file.category || ""} ${file.description || ""} ${file.tags || ""}`);
        const tokenMatch = tokens.some((token) => hay.includes(normalize(token)));
        const isPdf = /\.pdf$/i.test(String(file.name || ""));
        const approved = /approved|accepted|signed|verified/i.test(String(file.status || ""));
        return tokenMatch && isPdf && approved;
      });
      if (!hasExternalPdfSignoff) {
        return `Policy enforcement blocked: COs above ${formatUsd(signoffThreshold)} require an approved external PDF sign-off.`;
      }
    }

    return "";
  }

  async function handleCreate(event) {
    event.preventDefault();
    if (!hasProject) return;

    const invalid = validateDraft();
    if (invalid) {
      setError(invalid);
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const payload = await createChangeOrder({
        projectId,
        title: draft.title.trim(),
        amount: formatUsd(proposedCost),
        reason: draft.reason,
        sourceType: draft.sourceType,
        sourceId: draft.sourceId,
        sourceLabel: draft.sourceLabel,
        originalEstimateCost: formatUsd(originalEstimateCost),
        deltaCost: formatUsd(deltaCost),
        markupPct,
        approvalRoute: approver.approverRole,
        narrative: coNarrative,
        quantity: draft.quantity,
        laborHours: draft.laborHours,
        equipmentUnits: draft.equipmentUnits,
        delayClaimIncluded: Boolean(criticalPath && risk.needsDelayClause),
      });

      const created = payload.changeOrder || payload.item || payload;
      const coId = created.changeOrderId || created.id;

      setAtRiskCosts((current) => ({
        ...current,
        [projectId]: {
          ...(current[projectId] || {}),
          [coId]: {
            id: coId,
            amount: proposedCost,
            source: draft.sourceLabel,
            status: "Pending Owner Approval",
            createdAt: new Date().toISOString(),
          },
        },
      }));

      await sendPortalMessage({
        channel: "teams",
        subject: `CO Approval Route · ${projectId} · ${coId}`,
        message: `Change order ${draft.title} (${formatUsd(proposedCost)}) routed to ${approver.approverRole}. Delta vs estimate: ${formatUsd(deltaCost)}.`,
      }).catch(() => null);

      setDraft({
        sourceType: "",
        sourceId: "",
        sourceLabel: "",
        title: "",
        reason: "Owner Request",
        narrative: "",
        quantity: "",
        laborHours: "",
        equipmentUnits: "",
        proposedCost: "",
        markupPct: String(requiredMarkup),
        overrideApproved: false,
        overrideNote: "",
        targetUnsignedDays: String(adminGovernance?.changeOrderGovernance?.hardStopUnsignedDays || 7),
      });

      setNotice("Change order created with source lineage, delta intelligence, and approval hierarchy routing.");
      await reloadChangeOrders();
    } catch (createError) {
      setError(createError.message || "Unable to create change order.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOwnerSignOff(row) {
    const coId = row.changeOrderId || row.id;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const credentialGate = adminGovernance.academyGovernance?.qualificationEngine?.authorityGates?.find(
        (gate) => gate.action === "change-order:approve-over-threshold",
      );
      const threshold = toNumber(credentialGate?.thresholdUsd || 50000);
      const amount = toNumber(row.amount || row.total || 0);
      const actor = session?.email || session?.customerId || "";
      const requiredCredential = credentialGate?.requiredCredential || "Financial Governance & Ethics";
      if (amount >= threshold && !hasRequiredCredential(academyLoad.data, actor, requiredCredential)) {
        setError(`Credential gate blocked: approving COs above ${formatUsd(threshold)} requires ${requiredCredential}.`);
        return;
      }

      const advancePayload = await advanceChangeOrder({
        changeOrderId: coId,
        projectId,
        status: "approved",
        ownerSignedAt: new Date().toISOString(),
        sourceRoute: "/portal/change-orders",
      });
      if (advancePayload?.pendingReview) {
        setNotice(`Safe-Mode active: CO signoff queued for Instructor Review (${advancePayload.reviewItem?.id || "pending"}).`);
        return;
      }

      const budgetReq = {
        id: `budget-${coId}`,
        projectId,
        changeOrderId: coId,
        amount: toNumber(row.amount || row.total),
        createdAt: new Date().toISOString(),
      };
      setBudgetRevisions((current) => [budgetReq, ...current].slice(0, 300));

      const scheduleReq = {
        id: `schedule-${coId}`,
        projectId,
        changeOrderId: coId,
        requestedDays: Math.max(1, Math.round(toNumber(draft.laborHours || 8) / 8)),
        createdAt: new Date().toISOString(),
      };
      setScheduleExtensions((current) => [scheduleReq, ...current].slice(0, 300));

      setAtRiskCosts((current) => {
        const next = { ...(current[projectId] || {}) };
        delete next[coId];
        return { ...current, [projectId]: next };
      });

      setHardStops((current) => {
        const next = { ...(current[projectId] || {}) };
        delete next[coId];
        return { ...current, [projectId]: next };
      });

      await mutateFinancialWorkspace("upsert-sov-line", {
        projectId,
        code: `CO-${coId}`,
        description: row.title || coId,
        amount: String(toNumber(row.amount || row.total || 0)),
      }).catch(() => null);

      await createFieldScheduleEvent({
        projectId,
        title: `Schedule Extension Request · CO ${coId}`,
        date: new Date().toISOString().slice(0, 10),
        crew: "Project Controls",
        estimatedCost: String(toNumber(row.amount || row.total || 0)),
        sourceRoute: "/portal/change-orders",
      }).catch(() => null);

      await sendPortalMessage({
        channel: "teams",
        subject: `CO Signed · Project state updated · ${projectId}`,
        message: `CO ${coId} signed. Budget revision request and schedule extension request were generated automatically.`,
      }).catch(() => null);

      setNotice("CO signed. Budget revision and schedule extension requests were triggered as project-state transactions.");
      await reloadChangeOrders();
    } catch (signError) {
      setError(signError.message || "Unable to sign off change order.");
    } finally {
      setBusy(false);
    }
  }

  const activeHardStops = Object.values(hardStops[projectId] || {});
  const activeAtRisk = Object.values(atRiskCosts[projectId] || {});
  const marginForecast = toNumber(jobCost.rollup?.grossMarginForecast || 0);

  return (
    <PortalShell
      title="Change Order Governance"
      subtitle="Source-anchored, margin-protected change transactions that automatically update project state."
      activeHref="/portal/change-orders"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Open construction finance"
    >
      <AuricruxInsightPanel
        title="Auricrux Risk and Margin Guard"
        targetObjectId={projectId}
        sourceRoute="/portal/change-orders"
        rationale="Every change order must preserve legal lineage, margin standards, and synchronized project state."
        nextAction="Create from valid source, confirm delta and markup, and route by governance hierarchy."
        actionHref={hasProject ? `/portal/job-cost?projectId=${encodeURIComponent(projectId)}` : "/portal/job-cost"}
        actionLabel="Open job cost"
        tone="green"
        liveRecommend={hasProject}
      />

      {showJitMicroLearning ? (
        <div style={{ ...card, marginTop: 12, marginBottom: 12, borderColor: "#bfdbfe", background: "#eff6ff", color: "#1e3a8a" }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>Just-in-Time Micro-Learning</div>
          <div style={{ lineHeight: 1.7, marginBottom: 8 }}>
            First time in Change Orders: complete the 2-minute walkthrough before creating or approving high-risk commercial changes.
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <a href="/academy/pathway?pathway=operator-guides&topic=change-order-governance" style={{ color: "#1d4ed8", fontWeight: 700 }}>
              Open 2-min walkthrough
            </a>
            <button type="button" style={button} onClick={() => setShowJitMicroLearning(false)}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {!hasProject ? <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to govern change orders.</div> : null}

      {hasProject ? (
        <>
          <div style={{ ...card, marginTop: 12, marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <div><strong>Open COs:</strong> {items.filter((row) => !/approved|closed/i.test(String(row.status || ""))).length}</div>
              <div><strong>Costs at risk:</strong> {formatUsd(atRiskTotal)}</div>
              <div><strong>Scope hard stops:</strong> {activeHardStops.length}</div>
              <div><strong>Margin forecast:</strong> {marginForecast ? `${marginForecast.toFixed(2)}%` : "n/a"}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <a href={hasProject ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}` : "/portal/finance"} style={{ ...button, textDecoration: "none", display: "inline-block" }}>
                Review SOV and job billing
              </a>
            </div>
          </div>

          {activeHardStops.length ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>No-pay protection hard stops</div>
              {activeHardStops.map((row) => (
                <div key={row.id} style={{ marginBottom: 6 }}>{row.message}</div>
              ))}
            </div>
          ) : null}

          {activeAtRisk.length ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Status-linked invoicing risk register</div>
              {activeAtRisk.map((row) => (
                <div key={row.id} style={{ marginBottom: 6 }}>
                  {row.id} · {row.source} · {formatUsd(row.amount)} · {row.status}
                </div>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleCreate} style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Create source-anchored change transaction</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 8 }}>
              <select value={draft.sourceType && draft.sourceId ? `${draft.sourceType}:${draft.sourceId}` : ""} onChange={(event) => selectSource(event.target.value)} style={input}>
                <option value="">Select source event (required)</option>
                {sourceOptions.map((source) => (
                  <option key={`${source.type}:${source.id}`} value={`${source.type}:${source.id}`}>{source.type} · {source.label}</option>
                ))}
              </select>
              <input value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="CO title" style={input} />
              <select value={draft.reason} onChange={(event) => updateDraft("reason", event.target.value)} style={input}>
                <option>Owner Request</option>
                <option>Unforeseen Condition</option>
                <option>Design Revision</option>
                <option>Field Deviation</option>
              </select>
              <input value={draft.proposedCost} onChange={(event) => updateDraft("proposedCost", event.target.value)} placeholder="Proposed cost" style={input} />
              <input value={draft.markupPct} onChange={(event) => updateDraft("markupPct", event.target.value)} placeholder="Markup %" style={input} />
              <input value={draft.quantity} onChange={(event) => updateDraft("quantity", event.target.value)} placeholder="Quantity" style={input} />
              <input value={draft.laborHours} onChange={(event) => updateDraft("laborHours", event.target.value)} placeholder="Labor hours" style={input} />
              <input value={draft.equipmentUnits} onChange={(event) => updateDraft("equipmentUnits", event.target.value)} placeholder="Equipment units" style={input} />
              <input value={draft.targetUnsignedDays} onChange={(event) => updateDraft("targetUnsignedDays", event.target.value)} placeholder="Unsigned hard stop days" style={input} />
            </div>
            <textarea value={draft.narrative} onChange={(event) => updateDraft("narrative", event.target.value)} placeholder="CO narrative with measurable scope details" style={{ ...input, marginTop: 8, minHeight: 88 }} />

            {risk.vagueNarrative ? (
              <div style={{ marginTop: 8, color: "#991b1b" }}>Narrative check: replace vague term "{risk.vagueTerm}" with measurable scope detail.</div>
            ) : null}

            <div style={{ marginTop: 8, color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Estimate baseline:</strong> {formatUsd(originalEstimateCost)}</div>
              <div><strong>Proposed cost:</strong> {formatUsd(proposedCost)}</div>
              <div><strong>Delta:</strong> {formatUsd(deltaCost)}</div>
              <div><strong>Approval route:</strong> {approver.approverRole} ({approver.reason})</div>
              <div><strong>Critical path impact:</strong> {criticalPath ? "Yes" : "No"}</div>
              <div><strong>Delay claim clause:</strong> {criticalPath && risk.needsDelayClause ? "Auto-appended" : "Not required"}</div>
            </div>

            {markupViolation ? (
              <div style={{ marginTop: 8, border: "1px solid #fecaca", borderRadius: 10, padding: 10, background: "#fef2f2", color: "#991b1b" }}>
                <div>Markup alert: drafted markup ({markupPct}%) is below enterprise minimum ({requiredMarkup}%). Executive override required.</div>
                <label style={{ display: "block", marginTop: 8 }}>
                  <input type="checkbox" checked={draft.overrideApproved} onChange={(event) => updateDraft("overrideApproved", event.target.checked)} /> Executive override approved
                </label>
                <textarea value={draft.overrideNote} onChange={(event) => updateDraft("overrideNote", event.target.value)} placeholder="Executive override justification" style={{ ...input, marginTop: 8, minHeight: 72 }} />
              </div>
            ) : null}

            <button type="submit" disabled={busy} style={{ ...button, marginTop: 10 }}>{busy ? "Creating..." : "Create change transaction"}</button>
          </form>

          {notice ? <div style={{ ...card, marginBottom: 12, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>{notice}</div> : null}
          {error ? <div style={{ ...card, marginBottom: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div> : null}
          {loading ? <div style={card}>Loading change orders...</div> : null}

          <div style={{ display: "grid", gap: 10 }}>
            {items.map((row) => {
              const id = row.changeOrderId || row.id;
              const pending = /pending|draft/i.test(String(row.status || ""));
              return (
                <div key={id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <strong>{row.title || id}</strong>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{row.status || "Draft"} · {row.amount || row.total || "—"}</div>
                    </div>
                    {pending ? (
                      <button type="button" style={button} disabled={busy} onClick={() => handleOwnerSignOff(row)}>Owner sign-off and sync state</button>
                    ) : null}
                  </div>
                  <div style={{ color: "#334155", marginTop: 8, lineHeight: 1.6 }}>
                    <div><strong>Source:</strong> {row.sourceType || "n/a"} · {row.sourceLabel || row.sourceId || "n/a"}</div>
                    <div><strong>Delta:</strong> {row.deltaCost || "n/a"} · <strong>Markup:</strong> {row.markupPct || "n/a"}%</div>
                    <div><strong>Approval route:</strong> {row.approvalRoute || determineApprover(row.amount || row.total).approverRole}</div>
                  </div>
                </div>
              );
            })}
            {!loading && !items.length ? <div style={card}>No change orders recorded for {projectId}.</div> : null}
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
