import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchEstimates } from "../../api/commercialClient";
import {
  fetchChangeOrders,
  fetchJobCosts,
  postJobCostActual,
} from "../../api/constructionClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchPortalInvoices } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 12,
  boxSizing: "border-box",
  font: "inherit",
};
const button = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const DAILY_LOGS_KEY = "fca_field_daily_logs_v1";
const CO_AT_RISK_KEY = "fca_co_at_risk_costs_v1";
const COMMITMENTS_KEY = "fca_job_cost_commitments_v1";
const LEDGER_KEY = "fca_job_cost_immutable_ledger_v1";
const PROCESSED_TASKS_KEY = "fca_job_cost_processed_tasks_v1";
const EQUIPMENT_KEY = "fca_job_cost_equipment_hours_v1";
const RETENTION_KEY = "fca_job_cost_retainage_lines_v1";

const WBS_SEGMENTS = ["General Conditions", "Concrete", "Structural", "MEP", "Interiors", "Closeout"];

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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferWbs(text) {
  const hay = normalize(text);
  if (/concrete|slab|footing|foundation/.test(hay)) return "Concrete";
  if (/steel|structural|rebar|beam|column/.test(hay)) return "Structural";
  if (/mep|mechanical|electrical|plumb|duct|pipe|conduit/.test(hay)) return "MEP";
  if (/paint|finish|drywall|ceiling|door|interior/.test(hay)) return "Interiors";
  if (/closeout|warranty|turnover|punch/.test(hay)) return "Closeout";
  return "General Conditions";
}

function extractEquipmentHoursFromLogs(logs) {
  let total = 0;
  for (const log of logs || []) {
    const text = `${log.notes || ""} ${Array.isArray(log.safety) ? log.safety.join(" ") : log.safety || ""}`;
    const matches = text.matchAll(/(equipment|excavator|lift|crane|loader)[^\d]{0,20}(\d+(?:\.\d+)?)\s*h(?:ours?)?/gi);
    for (const match of matches) {
      total += toNumber(match[2]);
    }
  }
  return total;
}

function buildLedgerEntry(type, projectId, payload) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    type,
    projectId,
    payload,
    createdAt: new Date().toISOString(),
    immutable: true,
  };
}

function projectedCashDate(status) {
  const now = Date.now();
  if (/paid/i.test(status)) return new Date(now).toISOString().slice(0, 10);
  if (/issued/i.test(status)) return new Date(now + (10 * 86400000)).toISOString().slice(0, 10);
  return new Date(now + (18 * 86400000)).toISOString().slice(0, 10);
}

export default function PortalJobCost() {
  const { projectId, hasProject } = usePortalProjectId();
  const { projects } = useProjectWorkspace();
  const jobCost = useJobCost(hasProject ? projectId : "");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ amount: "", costCode: "FIELD-LABOR", description: "" });
  const [commitDraft, setCommitDraft] = useState({ trade: "", description: "", amount: "", poNumber: "", contractNumber: "", submittalApproval: "", receiptRef: "" });
  const [equipmentDraft, setEquipmentDraft] = useState({ trade: "", equipment: "", hours: "", rate: "" });

  const [commitmentsMap, setCommitmentsMap] = useState(() => readLocalJson(COMMITMENTS_KEY, {}));
  const [ledger, setLedger] = useState(() => readLocalJson(LEDGER_KEY, []));
  const [processedTasks, setProcessedTasks] = useState(() => readLocalJson(PROCESSED_TASKS_KEY, {}));
  const [equipmentEntries, setEquipmentEntries] = useState(() => readLocalJson(EQUIPMENT_KEY, {}));
  const [retentionLines, setRetentionLines] = useState(() => readLocalJson(RETENTION_KEY, {}));

  const fieldTasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const changeOrdersLoad = usePortalApiLoad(() => (hasProject ? fetchChangeOrders(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);
  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);

  const [portfolioSummary, setPortfolioSummary] = useState([]);

  useEffect(() => {
    writeLocalJson(COMMITMENTS_KEY, commitmentsMap);
  }, [commitmentsMap]);

  useEffect(() => {
    writeLocalJson(LEDGER_KEY, ledger);
  }, [ledger]);

  useEffect(() => {
    writeLocalJson(PROCESSED_TASKS_KEY, processedTasks);
  }, [processedTasks]);

  useEffect(() => {
    writeLocalJson(EQUIPMENT_KEY, equipmentEntries);
  }, [equipmentEntries]);

  useEffect(() => {
    writeLocalJson(RETENTION_KEY, retentionLines);
  }, [retentionLines]);

  useEffect(() => {
    let active = true;
    async function loadPortfolio() {
      const ids = (projects || []).map((project) => project.id).filter(Boolean);
      if (!ids.length) {
        setPortfolioSummary([]);
        return;
      }
      const rows = await Promise.all(ids.map(async (id) => {
        try {
          const payload = await fetchJobCosts(id);
          return { projectId: id, rollup: payload.items?.[0] || {} };
        } catch {
          return { projectId: id, rollup: {} };
        }
      }));
      if (active) setPortfolioSummary(rows);
    }
    loadPortfolio();
    return () => {
      active = false;
    };
  }, [projects]);

  const rollup = jobCost.rollup || {};
  const fieldTasks = fieldTasksLoad.data?.items || [];
  const changeOrders = changeOrdersLoad.data?.items || [];
  const estimates = estimatesLoad.data?.items || [];
  const invoices = invoicesLoad.data?.items || [];

  const dailyLogs = useMemo(() => readLocalJson(DAILY_LOGS_KEY, []).filter((row) => row.projectId === projectId), [projectId, fieldTasks.length]);
  const atRiskCosts = useMemo(() => readLocalJson(CO_AT_RISK_KEY, {})[projectId] || {}, [projectId, changeOrders.length]);

  const projectEstimate = useMemo(() => {
    const key = normalize(projectId);
    return estimates.find((estimate) => normalize(`${estimate.projectId || ""} ${estimate.bidId || ""} ${estimate.id || ""}`).includes(key)) || estimates[0] || null;
  }, [estimates, projectId]);

  const projectCommitments = commitmentsMap[projectId] || [];
  const projectEquipment = equipmentEntries[projectId] || [];
  const projectRetention = retentionLines[projectId] || [];

  const commitmentTotal = projectCommitments.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const equipmentCost = projectEquipment.reduce((sum, row) => sum + (toNumber(row.hours) * toNumber(row.rate)), 0);
  const logsEquipmentHours = extractEquipmentHoursFromLogs(dailyLogs);

  const approvedCoValue = changeOrders
    .filter((row) => /approved|signed/i.test(String(row.status || "")))
    .reduce((sum, row) => sum + toNumber(row.amount || row.total), 0);
  const pendingCoValue = changeOrders
    .filter((row) => /pending|draft/i.test(String(row.status || "")))
    .reduce((sum, row) => sum + toNumber(row.amount || row.total), 0);

  const contractValue = toNumber(rollup.contractValue || projectEstimate?.total || 0) + approvedCoValue;
  const actualCost = toNumber(rollup.actualCost || 0);
  const committedCostApi = toNumber(rollup.committedCost || 0);
  const committedCost = committedCostApi + commitmentTotal;

  const laborProductivity = useMemo(() => {
    const done = fieldTasks.filter((task) => /complete/i.test(String(task.status || ""))).length;
    const total = Math.max(1, fieldTasks.length);
    const ratio = done / total;
    return {
      done,
      total,
      ratio,
    };
  }, [fieldTasks]);

  const burdenedLaborCost = useMemo(() => {
    const burdenFactor = 1.37;
    let total = 0;
    for (const task of fieldTasks) {
      const id = task.id || task.taskId;
      if (!id) continue;
      if (!/complete/i.test(String(task.status || ""))) continue;
      const baseHours = toNumber(task.laborHours || task.hours || 8);
      const hourly = toNumber(task.hourlyRate || 62);
      total += baseHours * hourly * burdenFactor;
    }
    return total;
  }, [fieldTasks]);

  const remainingBudget = contractValue - actualCost - committedCost - burdenedLaborCost - equipmentCost;
  const etcRiskFactor = laborProductivity.ratio < 0.75 ? 1.15 : laborProductivity.ratio < 0.9 ? 1.07 : 1;
  const estimateToComplete = Math.max(0, (contractValue - actualCost) * etcRiskFactor);
  const projectedCostAtCompletion = actualCost + estimateToComplete + commitmentTotal + equipmentCost;
  const projectedMargin = contractValue > 0 ? ((contractValue - projectedCostAtCompletion) / contractValue) * 100 : 0;

  const varianceFlags = useMemo(() => {
    const baseline = toNumber(projectEstimate?.total || contractValue);
    return projectCommitments
      .map((entry) => {
        const amount = toNumber(entry.amount);
        const ratio = baseline ? (amount / baseline) : 0;
        const anomaly = ratio >= 0.15 || amount > (toNumber(entry.originalContract) * 1.15);
        return { ...entry, anomaly, ratioPct: Math.round(ratio * 100) };
      })
      .filter((entry) => entry.anomaly)
      .slice(0, 8);
  }, [contractValue, projectCommitments, projectEstimate?.total]);

  const wbsAlignment = useMemo(() => {
    const estimateWbs = new Set(WBS_SEGMENTS);
    const scheduleWbs = new Set(fieldTasks.map((task) => inferWbs(task.task || task.description || "")));
    const jobCostCodes = new Set([
      ...projectCommitments.map((row) => inferWbs(row.description || row.trade || "")),
      ...fieldTasks.map((task) => inferWbs(task.task || "")),
    ]);
    const missingFromCost = [...estimateWbs].filter((segment) => !jobCostCodes.has(segment));
    const missingFromSchedule = [...estimateWbs].filter((segment) => !scheduleWbs.has(segment));
    return {
      missingFromCost,
      missingFromSchedule,
      aligned: !missingFromCost.length && !missingFromSchedule.length,
    };
  }, [fieldTasks, projectCommitments]);

  const ledgerRows = useMemo(() => ledger.filter((row) => row.projectId === projectId).slice(0, 30), [ledger, projectId]);

  useEffect(() => {
    if (!hasProject) return;
    const currentProcessed = processedTasks[projectId] || {};
    const newEntries = [];
    const nextProcessed = { ...currentProcessed };

    for (const task of fieldTasks) {
      const id = String(task.id || task.taskId || "");
      if (!id || nextProcessed[id]) continue;
      if (!/complete/i.test(String(task.status || ""))) continue;

      const hours = toNumber(task.laborHours || task.hours || 8);
      const rate = toNumber(task.hourlyRate || 62);
      const amount = hours * rate * 1.37;
      nextProcessed[id] = new Date().toISOString();
      newEntries.push(buildLedgerEntry("labor-burden", projectId, {
        taskId: id,
        wbs: inferWbs(task.task || ""),
        amount,
        trace: {
          source: "PortalFieldTasks",
          poRef: task.poNumber || "",
          receiptRef: task.receiptRef || "",
          submittalApprovalRef: task.submittalReference || "",
          invoiceRef: task.invoiceRef || "",
        },
      }));
    }

    if (newEntries.length) {
      setProcessedTasks((current) => ({ ...current, [projectId]: nextProcessed }));
      setLedger((current) => [...newEntries, ...current].slice(0, 1000));
    }
  }, [fieldTasks, hasProject, processedTasks, projectId]);

  async function handlePostActual(event) {
    event.preventDefault();
    if (!hasProject || !draft.amount.trim()) return;

    setBusy(true);
    setError("");
    setNotice("");
    try {
      await postJobCostActual({
        projectId,
        amount: draft.amount.trim(),
        costCode: draft.costCode.trim() || "FIELD-LABOR",
        description: draft.description.trim() || "Job cost actual posted from portal.",
        sourceType: "portal_job_cost",
        sourceRoute: "/portal/job-cost",
      });

      setLedger((current) => [
        buildLedgerEntry("actual-post", projectId, {
          amount: toNumber(draft.amount),
          costCode: draft.costCode,
          description: draft.description,
          trace: {
            source: "PortalJobCost",
            poRef: "manual",
            receiptRef: "manual",
            submittalApprovalRef: "manual",
            invoiceRef: "manual",
          },
        }),
        ...current,
      ].slice(0, 1000));

      setDraft({ amount: "", costCode: "FIELD-LABOR", description: "" });
      setNotice("Job cost actual posted.");
      await jobCost.refresh();
    } catch (err) {
      setError(err.message || "Unable to post job cost actual.");
    } finally {
      setBusy(false);
    }
  }

  function addCommitment() {
    if (!commitDraft.trade.trim() || !commitDraft.amount.trim()) {
      setError("Trade and amount are required for commitment encumbrance.");
      return;
    }

    const row = {
      id: `commit-${Date.now()}`,
      trade: commitDraft.trade.trim(),
      description: commitDraft.description.trim(),
      amount: toNumber(commitDraft.amount),
      poNumber: commitDraft.poNumber.trim(),
      contractNumber: commitDraft.contractNumber.trim(),
      submittalApproval: commitDraft.submittalApproval.trim(),
      receiptRef: commitDraft.receiptRef.trim(),
      originalContract: toNumber(commitDraft.amount),
      createdAt: new Date().toISOString(),
      wbs: inferWbs(`${commitDraft.trade} ${commitDraft.description}`),
    };

    setCommitmentsMap((current) => ({ ...current, [projectId]: [row, ...(current[projectId] || [])].slice(0, 400) }));
    setLedger((current) => [
      buildLedgerEntry("commitment", projectId, {
        amount: row.amount,
        trade: row.trade,
        wbs: row.wbs,
        trace: {
          source: "PO/Contract",
          poRef: row.poNumber,
          receiptRef: row.receiptRef,
          submittalApprovalRef: row.submittalApproval,
          invoiceRef: "",
        },
      }),
      ...current,
    ].slice(0, 1000));

    const retention = {
      id: `ret-${Date.now()}`,
      trade: row.trade,
      commitmentId: row.id,
      contractAmount: row.amount,
      retainagePct: 10,
      heldAmount: row.amount * 0.1,
      releasedAmount: 0,
      status: "holding",
      createdAt: new Date().toISOString(),
    };
    setRetentionLines((current) => ({ ...current, [projectId]: [retention, ...(current[projectId] || [])].slice(0, 400) }));

    setCommitDraft({ trade: "", description: "", amount: "", poNumber: "", contractNumber: "", submittalApproval: "", receiptRef: "" });
    setNotice("Commitment encumbered and retainage line initialized.");
  }

  function addEquipmentHours() {
    if (!equipmentDraft.equipment.trim() || !equipmentDraft.hours.trim()) {
      setError("Equipment and hours are required.");
      return;
    }
    const row = {
      id: `eq-${Date.now()}`,
      trade: equipmentDraft.trade.trim() || "Equipment",
      equipment: equipmentDraft.equipment.trim(),
      hours: toNumber(equipmentDraft.hours),
      rate: toNumber(equipmentDraft.rate || 125),
      createdAt: new Date().toISOString(),
    };
    setEquipmentEntries((current) => ({ ...current, [projectId]: [row, ...(current[projectId] || [])].slice(0, 300) }));
    setLedger((current) => [
      buildLedgerEntry("equipment", projectId, {
        amount: row.hours * row.rate,
        wbs: inferWbs(row.trade),
        trace: {
          source: "PortalFieldSupervision",
          poRef: "",
          receiptRef: `eq-hours-${row.id}`,
          submittalApprovalRef: "",
          invoiceRef: "",
        },
      }),
      ...current,
    ].slice(0, 1000));
    setEquipmentDraft({ trade: "", equipment: "", hours: "", rate: "" });
    setNotice("Equipment actual captured.");
  }

  function releaseRetainage(lineId) {
    setRetentionLines((current) => ({
      ...current,
      [projectId]: (current[projectId] || []).map((line) => (line.id === lineId
        ? { ...line, releasedAmount: line.heldAmount, heldAmount: 0, status: "released", releasedAt: new Date().toISOString() }
        : line)),
    }));
    setNotice("Retainage released for line item.");
  }

  const projectInvoices = useMemo(() => invoices.filter((row) => normalize(`${row.invoiceName || ""} ${row.note || ""}`).includes(normalize(projectId))), [invoices, projectId]);
  const billedAmount = projectInvoices.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const underOverBilled = billedAmount - actualCost;

  const financeHref = hasProject
    ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`
    : "/portal/finance";

  const cfoRows = useMemo(() => {
    return portfolioSummary.map((row) => {
      const invoiceRows = invoices.filter((inv) => normalize(`${inv.invoiceName || ""} ${inv.note || ""}`).includes(normalize(row.projectId)));
      const billed = invoiceRows.reduce((sum, inv) => sum + toNumber(inv.amount), 0);
      const actual = toNumber(row.rollup?.actualCost || 0);
      const variance = billed - actual;
      const cashDate = invoiceRows[0] ? projectedCashDate(invoiceRows[0].status || "") : projectedCashDate("draft");
      return {
        projectId: row.projectId,
        billed,
        actual,
        variance,
        cashDate,
      };
    });
  }, [invoices, portfolioSummary]);

  return (
    <PortalShell
      title="Job Cost Financial Nervous System"
      subtitle="Real-time commitments, burdened actuals, anomaly controls, and CFO portfolio visibility."
      activeHref="/portal/job-cost"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={financeHref}
      primaryLabel="Open construction finance"
    >
      <AuricruxInsightPanel
        title="Auricrux Financial Intelligence"
        targetObjectId={projectId}
        sourceRoute="/portal/job-cost"
        rationale="Detect margin erosion before month-end by synchronizing commitments, labor burden, equipment, billing, and CO risk in real time."
        nextAction="Review ETC variance flags and release trade retainage only when line-level closeout evidence is complete."
        actionHref={financeHref}
        actionLabel="Open SOV"
        tone="green"
        liveRecommend={hasProject}
      />

      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to review job cost.</div>
      ) : null}

      {hasProject ? (
        <>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Real-time cost-to-complete — {projectId}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Contract (incl approved CO):</strong> {formatUsd(contractValue)}</div>
              <div><strong>Actual cost:</strong> {formatUsd(actualCost)}</div>
              <div><strong>Committed (API + encumbered):</strong> {formatUsd(committedCost)}</div>
              <div><strong>Labor burdened:</strong> {formatUsd(burdenedLaborCost)}</div>
              <div><strong>Equipment actuals:</strong> {formatUsd(equipmentCost)}</div>
              <div><strong>Remaining budget:</strong> {formatUsd(remainingBudget)}</div>
              <div><strong>ETC (predictive):</strong> {formatUsd(estimateToComplete)}</div>
              <div><strong>Projected margin:</strong> {projectedMargin.toFixed(2)}%</div>
              <div><strong>CO pending at risk:</strong> {formatUsd(pendingCoValue)} ({Object.keys(atRiskCosts).length} item(s))</div>
              <div><strong>Billing posture:</strong> {underOverBilled >= 0 ? `Over-billed ${formatUsd(underOverBilled)}` : `Under-billed ${formatUsd(Math.abs(underOverBilled))}`}</div>
              <div><strong>Field logs equipment hours:</strong> {logsEquipmentHours.toFixed(1)}h</div>
              <div><strong>Labor completion trend:</strong> {(laborProductivity.ratio * 100).toFixed(1)}%</div>
            </div>
          </div>

          {varianceFlags.length ? (
            <div style={{ ...card, marginBottom: 16, borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Auricrux anomaly detection (variance review)</div>
              {varianceFlags.map((entry) => (
                <div key={entry.id} style={{ marginBottom: 6 }}>
                  {entry.trade} commitment {formatUsd(entry.amount)} is {entry.ratioPct}% of estimate baseline. Review before approval queue.
                </div>
              ))}
            </div>
          ) : null}

          {!wbsAlignment.aligned ? (
            <div style={{ ...card, marginBottom: 16, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>WBS alignment warnings</div>
              {wbsAlignment.missingFromCost.length ? <div>Missing in job cost mapping: {wbsAlignment.missingFromCost.join(", ")}</div> : null}
              {wbsAlignment.missingFromSchedule.length ? <div>Missing in scheduling/task mapping: {wbsAlignment.missingFromSchedule.join(", ")}</div> : null}
            </div>
          ) : null}

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Commitment management (encumbrance)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              <input value={commitDraft.trade} onChange={(event) => setCommitDraft((c) => ({ ...c, trade: event.target.value }))} placeholder="Trade / vendor" style={input} />
              <input value={commitDraft.description} onChange={(event) => setCommitDraft((c) => ({ ...c, description: event.target.value }))} placeholder="Scope description" style={input} />
              <input value={commitDraft.amount} onChange={(event) => setCommitDraft((c) => ({ ...c, amount: event.target.value }))} placeholder="Committed amount" style={input} />
              <input value={commitDraft.poNumber} onChange={(event) => setCommitDraft((c) => ({ ...c, poNumber: event.target.value }))} placeholder="PO number" style={input} />
              <input value={commitDraft.contractNumber} onChange={(event) => setCommitDraft((c) => ({ ...c, contractNumber: event.target.value }))} placeholder="Contract number" style={input} />
              <input value={commitDraft.submittalApproval} onChange={(event) => setCommitDraft((c) => ({ ...c, submittalApproval: event.target.value }))} placeholder="Submittal approval ref" style={input} />
              <input value={commitDraft.receiptRef} onChange={(event) => setCommitDraft((c) => ({ ...c, receiptRef: event.target.value }))} placeholder="Field receipt ref" style={input} />
            </div>
            <button type="button" style={button} onClick={addCommitment}>Encumber commitment</button>
          </div>

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Automated labor burdening and equipment loop</div>
            <div style={{ color: "#475569", marginBottom: 8 }}>
              Burdened labor posts automatically from completed field tasks. Add equipment hours for real-time actuals.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              <input value={equipmentDraft.trade} onChange={(event) => setEquipmentDraft((c) => ({ ...c, trade: event.target.value }))} placeholder="Trade" style={input} />
              <input value={equipmentDraft.equipment} onChange={(event) => setEquipmentDraft((c) => ({ ...c, equipment: event.target.value }))} placeholder="Equipment" style={input} />
              <input value={equipmentDraft.hours} onChange={(event) => setEquipmentDraft((c) => ({ ...c, hours: event.target.value }))} placeholder="Hours" style={input} />
              <input value={equipmentDraft.rate} onChange={(event) => setEquipmentDraft((c) => ({ ...c, rate: event.target.value }))} placeholder="Rate/hour" style={input} />
            </div>
            <button type="button" style={button} onClick={addEquipmentHours}>Add equipment actual</button>
          </div>

          <form onSubmit={handlePostActual} style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Manual actual entry</div>
            <label>
              Amount
              <input
                value={draft.amount}
                onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                placeholder="1250 or $1,250"
                style={input}
                required
              />
            </label>
            <label>
              Cost code
              <input
                value={draft.costCode}
                onChange={(event) => setDraft((current) => ({ ...current, costCode: event.target.value }))}
                placeholder="FIELD-LABOR"
                style={input}
              />
            </label>
            <label>
              Description
              <input
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Material delivery, labor, equipment"
                style={input}
              />
            </label>
            <button type="submit" disabled={busy || !draft.amount.trim()} style={{ ...button, background: "#166534", color: "#fff" }}>
              {busy ? "Posting..." : "Post actual"}
            </button>
          </form>

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Automated retention tracking (line-item by trade)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {projectRetention.map((line) => (
                <div key={line.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                  <div><strong>{line.trade}</strong> · Contract {formatUsd(line.contractAmount)} · Retainage {line.retainagePct}%</div>
                  <div style={{ color: "#475569", marginTop: 4 }}>Held {formatUsd(line.heldAmount)} · Released {formatUsd(line.releasedAmount)} · {line.status}</div>
                  {line.status !== "released" ? <button type="button" style={{ ...button, marginTop: 8 }} onClick={() => releaseRetainage(line.id)}>Release retainage</button> : null}
                </div>
              ))}
              {!projectRetention.length ? <div style={{ color: "#64748b" }}>Retainage lines initialize automatically when commitments are encumbered.</div> : null}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>Immutable transactional ledger</div>
            <div style={{ display: "grid", gap: 8, maxHeight: 240, overflowY: "auto" }}>
              {ledgerRows.map((entry) => (
                <div key={entry.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div><strong>{entry.type}</strong> · {entry.createdAt.slice(0, 10)} · {formatUsd(entry.payload?.amount)}</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>
                    PO {entry.payload?.trace?.poRef || "-"} · Receipt {entry.payload?.trace?.receiptRef || "-"} · Submittal {entry.payload?.trace?.submittalApprovalRef || "-"} · Invoice {entry.payload?.trace?.invoiceRef || "-"}
                  </div>
                </div>
              ))}
              {!ledgerRows.length ? <div style={{ color: "#64748b" }}>No ledger events yet.</div> : null}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 10 }}>CFO unified financial dashboard</div>
            <div style={{ display: "grid", gap: 8 }}>
              {cfoRows.map((row) => (
                <div key={row.projectId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                  <div><strong>{row.projectId}</strong> · Billed {formatUsd(row.billed)} · Actual {formatUsd(row.actual)}</div>
                  <div style={{ color: row.variance >= 0 ? "#166534" : "#991b1b" }}>
                    {row.variance >= 0 ? `Over-billed ${formatUsd(row.variance)}` : `Under-billed ${formatUsd(Math.abs(row.variance))}`}
                  </div>
                  <div style={{ color: "#475569", fontSize: 13 }}>Projected cash date: {row.cashDate}</div>
                </div>
              ))}
              {!cfoRows.length ? <div style={{ color: "#64748b" }}>CFO portfolio rows will appear when project and billing data are available.</div> : null}
            </div>
          </div>
        </>
      ) : null}

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4" }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
    </PortalShell>
  );
}
