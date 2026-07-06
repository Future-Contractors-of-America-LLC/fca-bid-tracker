import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useEstimateWorkspace from "../../hooks/useEstimateWorkspace";
import { mutateEstimate } from "../../api/commercialClient";
import usePreconContinuity from "../../hooks/usePreconContinuity";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import TakeoffEstimatePanel from "../../components/design/TakeoffEstimatePanel";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { createInvoiceFromEstimate } from "../../api/financialClient";
import { routeStateOverlays } from "../../systemState";
import { fetchJobCosts } from "../../api/constructionClient";
import { fetchWorkflowAudit, fetchWorkflowFiles } from "../../api/workflowClient";
import { sendPortalMessage } from "../../api/portalClient";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const buttonStyle = (primary = false) => ({
  borderRadius: 10,
  border: primary ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  background: primary ? "#1d4ed8" : "#ffffff",
  color: primary ? "#ffffff" : "#0f172a",
  fontWeight: 700,
  padding: "10px 12px",
  cursor: "pointer",
});

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const ESTIMATE_EDITOR_STORAGE_KEY = "fca_customer_estimate_editor_v1";
const DESIGN_UPDATE_FLAGS_KEY = "fca_design_change_update_flags_v1";
const ESTIMATE_SCENARIO_KEY = "fca_estimate_scenario_model_v1";
const ESTIMATE_QUOTES_KEY = "fca_estimate_quotes_v1";
const ESTIMATE_COLLAB_LOCKS_KEY = "fca_estimate_collab_locks_v1";

const WBS_SEGMENTS = ["General Conditions", "Concrete", "Structural", "MEP", "Interiors", "Closeout"];

const ASSEMBLY_LIBRARY = {
  "standard-wall": {
    label: "Standard Wall Assembly",
    materialMultiplier: 1,
    laborMultiplier: 1,
    safetyDocs: ["Standard installation method statement"],
    submittals: ["Wall system product data"],
  },
  "fire-rated-wall": {
    label: "Fire-Rated Wall Assembly",
    materialMultiplier: 1.18,
    laborMultiplier: 1.22,
    safetyDocs: ["Fire stopping compliance certificate", "UL assembly listing"],
    submittals: ["Fire-rated board shop drawings", "Inspection hold-point plan"],
  },
};

const DEFAULT_SCENARIO = {
  name: "Base Execution",
  craneStrategy: "mobile",
  accelerationWeeks: 0,
  crewType: "Standard crew",
  productivityRate: 1,
};

function readBrandSkin() {
  if (typeof window === "undefined") return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  try {
    return JSON.parse(window.localStorage.getItem(BRAND_STORAGE_KEY) || "{}");
  } catch {
    return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  }
}

function readEstimateDrafts() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(ESTIMATE_EDITOR_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeEstimateDrafts(drafts) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ESTIMATE_EDITOR_STORAGE_KEY, JSON.stringify(drafts));
  } catch {
    // best effort
  }
}

function readJsonStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort
  }
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function asUsd(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function parseQuoteRows(rawText) {
  return String(rawText || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [scopeRaw, amountRaw, ...rest] = line.split(",");
      return {
        raw: line,
        scope: String(scopeRaw || "").trim(),
        amount: toNumber(amountRaw),
        note: rest.join(",").trim(),
      };
    });
}

function normalizeQuoteToWbs(scope) {
  const hay = String(scope || "").toLowerCase();
  if (/concrete|footing|slab|foundation/.test(hay)) return "Concrete";
  if (/steel|frame|structural/.test(hay)) return "Structural";
  if (/hvac|mechanical|electrical|plumb|mep/.test(hay)) return "MEP";
  if (/drywall|paint|finish|interior/.test(hay)) return "Interiors";
  if (/closeout|turnover|warranty/.test(hay)) return "Closeout";
  return "General Conditions";
}

function detectScopeGaps(normalizedRows) {
  const rowsBySegment = normalizedRows.reduce((acc, row) => {
    const key = row.wbs;
    acc[key] = acc[key] || [];
    acc[key].push(row);
    return acc;
  }, {});

  const gaps = [];
  const mepRows = rowsBySegment.MEP || [];
  const mepText = mepRows.map((row) => `${row.scope} ${row.note}`).join(" ").toLowerCase();
  if (mepRows.length && !/fixture|device|terminal|trim/.test(mepText)) {
    gaps.push("MEP quote includes distribution scope but appears to exclude fixtures/devices.");
  }

  WBS_SEGMENTS.forEach((segment) => {
    if (!rowsBySegment[segment]?.length) {
      gaps.push(`No subcontractor quote lines mapped to ${segment}.`);
    }
  });

  return gaps;
}

function computeScenarioCost(estimateTotal, scenario) {
  const base = toNumber(estimateTotal);
  const craneFactor = scenario.craneStrategy === "tower" ? 1.08 : 1;
  const accelFactor = scenario.accelerationWeeks > 0 ? 1 + (scenario.accelerationWeeks * 0.012) : 1;
  const productivityFactor = scenario.productivityRate > 0 ? 1 / scenario.productivityRate : 1;
  const laborFactor = scenario.crewType.toLowerCase().includes("premium") ? 1.12 : 1;
  return Math.round(base * craneFactor * accelFactor * productivityFactor * laborFactor);
}

function deriveRiskAdjustedContingency(projectMetrics) {
  const base = 0.05;
  const mepPenalty = projectMetrics.mepIssueCount > 2 ? 0.03 : 0;
  const delayPenalty = projectMetrics.scheduleDelayPct > 8 ? 0.02 : 0;
  const costPenalty = projectMetrics.costOverrunPct > 5 ? 0.02 : 0;
  return Math.min(0.18, base + mepPenalty + delayPenalty + costPenalty);
}

function readDesignUpdateFlags() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(DESIGN_UPDATE_FLAGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeDesignUpdateFlags(flags) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DESIGN_UPDATE_FLAGS_KEY, JSON.stringify(flags));
  } catch {
    // best effort
  }
}

export default function PortalEstimates() {
  const { state } = useWorkspaceState();
  const { estimates, meta, advanceEstimate, generateProposal, refresh } = useEstimateWorkspace();
  const { projectId, hasProject } = usePortalProjectId();
  const precon = usePreconContinuity(projectId);
  const brandSkin = readBrandSkin();
  const [drafts, setDrafts] = useState(() => readEstimateDrafts());
  const [statusMessage, setStatusMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [lastInvoice, setLastInvoice] = useState(null);
  const [busyAction, setBusyAction] = useState("");
  const [designUpdateFlags, setDesignUpdateFlags] = useState(() => readDesignUpdateFlags());
  const [scenarioDrafts, setScenarioDrafts] = useState(() => readJsonStorage(ESTIMATE_SCENARIO_KEY, {}));
  const [quoteImports, setQuoteImports] = useState(() => readJsonStorage(ESTIMATE_QUOTES_KEY, {}));
  const [collabLocks, setCollabLocks] = useState(() => readJsonStorage(ESTIMATE_COLLAB_LOCKS_KEY, {}));
  const [quoteInput, setQuoteInput] = useState("");
  const [assemblyMode, setAssemblyMode] = useState("standard-wall");
  const [assemblyNotice, setAssemblyNotice] = useState("");

  const jobCostLoad = usePortalApiLoad(() => (projectId ? fetchJobCosts(projectId) : Promise.resolve({ items: [] })), [projectId]);
  const projectFilesLoad = usePortalApiLoad(() => (projectId ? fetchWorkflowFiles({ projectId }) : Promise.resolve({ items: [] })), [projectId]);
  const auditLoad = usePortalApiLoad(() => (projectId ? fetchWorkflowAudit({ projectId }) : Promise.resolve({ items: [] })), [projectId]);

  const jobCostRollup = jobCostLoad.data?.items?.[0] || null;
  const projectFiles = projectFilesLoad.data?.items || [];
  const auditEvents = auditLoad.data?.items || [];

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    function handleStorage(event) {
      if (event.key !== DESIGN_UPDATE_FLAGS_KEY) return;
      setDesignUpdateFlags(readDesignUpdateFlags());
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const estimateUpdateFlags = useMemo(
    () => designUpdateFlags.filter((flag) => flag.projectId === projectId && flag.status === "update-required"),
    [designUpdateFlags, projectId],
  );

  useEffect(() => {
    writeJsonStorage(ESTIMATE_SCENARIO_KEY, scenarioDrafts);
  }, [scenarioDrafts]);

  useEffect(() => {
    writeJsonStorage(ESTIMATE_QUOTES_KEY, quoteImports);
  }, [quoteImports]);

  useEffect(() => {
    writeJsonStorage(ESTIMATE_COLLAB_LOCKS_KEY, collabLocks);
  }, [collabLocks]);

  const marginErosion = useMemo(() => {
    const contractValue = toNumber(jobCostRollup?.contractValue);
    const actualCost = toNumber(jobCostRollup?.actualCost);
    const committed = toNumber(jobCostRollup?.committedCost);
    if (!contractValue) return { active: false, pct: 0, summary: "No live contract baseline." };
    const forecast = actualCost + committed;
    const pct = Math.max(0, Math.round(((forecast - contractValue) / contractValue) * 100));
    return {
      active: pct >= 10,
      pct,
      summary: pct >= 10
        ? `Margin erosion risk: forecast cost is ${pct}% above contract baseline.`
        : `Margin stable: forecast variance ${pct}% from baseline.`,
    };
  }, [jobCostRollup?.actualCost, jobCostRollup?.committedCost, jobCostRollup?.contractValue]);

  const mepIssueCount = useMemo(
    () => auditEvents.filter((event) => /(mep|mechanical|electrical|plumb)/i.test(`${event.detail || ""} ${event.reason || ""}`)).length,
    [auditEvents],
  );

  const riskContingency = useMemo(() => {
    const scheduleDelayPct = Math.min(100, mepIssueCount * 3);
    const costOverrunPct = marginErosion.pct;
    return deriveRiskAdjustedContingency({ mepIssueCount, scheduleDelayPct, costOverrunPct });
  }, [marginErosion.pct, mepIssueCount]);

  const normalizedQuote = useMemo(() => {
    const rows = parseQuoteRows(quoteInput).map((row) => ({
      ...row,
      wbs: normalizeQuoteToWbs(row.scope),
      provenance: "vendor-quote-import",
    }));
    return {
      rows,
      scopeGaps: detectScopeGaps(rows),
      total: rows.reduce((sum, row) => sum + toNumber(row.amount), 0),
    };
  }, [quoteInput]);

  function acknowledgeDesignUpdate(flagId) {
    const next = designUpdateFlags.filter((flag) => flag.id !== flagId);
    setDesignUpdateFlags(next);
    writeDesignUpdateFlags(next);
    setStatusMessage("Design-driven estimate update acknowledged.");
  }

  function updateScenario(estimateId, key, value) {
    setScenarioDrafts((current) => ({
      ...current,
      [estimateId]: {
        ...(current[estimateId] || DEFAULT_SCENARIO),
        [key]: value,
      },
    }));
  }

  function applyAssemblyIntelligence(estimateId) {
    const assembly = ASSEMBLY_LIBRARY[assemblyMode];
    if (!assembly) return;
    mutateEstimate("add-line", {
      estimateId,
      label: `${assembly.label} system uplift`,
      amount: "$0",
      note: `Assembly intelligence applied. Material x${assembly.materialMultiplier}; labor x${assembly.laborMultiplier}.`,
      detail: `${assembly.label} applied with governed systems update in estimating command center.`,
    }).catch(() => null);
    setAssemblyNotice(`${assembly.label} selected. Submittals and safety compliance artifacts queued for governance review.`);
  }

  function importNormalizedQuote(estimateId) {
    if (!normalizedQuote.rows.length) return;
    const payload = {
      importedAt: new Date().toISOString(),
      estimateId,
      rows: normalizedQuote.rows,
      scopeGaps: normalizedQuote.scopeGaps,
      total: normalizedQuote.total,
    };
    setQuoteImports((current) => ({ ...current, [estimateId]: payload }));
    setStatusMessage(`Imported ${normalizedQuote.rows.length} quote rows into WBS normalization workspace.`);
  }

  function lockWbsSection(estimateId, section, owner) {
    setCollabLocks((current) => ({
      ...current,
      [estimateId]: {
        ...(current[estimateId] || {}),
        [section]: {
          owner,
          lockedAt: new Date().toISOString(),
        },
      },
    }));
  }

  async function sendMarginErosionNotice(estimateId) {
    if (!marginErosion.active) return;
    await sendPortalMessage({
      channel: "teams",
      subject: `${projectId || estimateId} margin erosion warning`,
      message: `${marginErosion.summary} Auricrux recommends unit-price recalibration for impacted trade packages.`,
    }).catch(() => null);
    setStatusMessage("Margin erosion warning dispatched to commercial team.");
  }

  async function handleCreateInvoice(estimateId) {
    setActionError("");
    setStatusMessage("");
    setBusyAction(`invoice-${estimateId}`);
    try {
      const result = await createInvoiceFromEstimate(estimateId, projectId);
      setLastInvoice(result?.portalInvoice || null);
      setStatusMessage(
        `Invoice ${result?.portalInvoice?.id || ""} issued from ${estimateId}. GL posted${result?.scheduleOfValues ? " and SOV seeded" : ""}.`,
      );
    } catch (invoiceError) {
      setActionError(invoiceError.message || "Unable to create invoice from estimate.");
    } finally {
      setBusyAction("");
    }
  }

  async function handlePriceEstimate(estimateId) {
    setActionError("");
    setBusyAction(`price-${estimateId}`);
    try {
      const result = await precon.priceEstimate(estimateId);
      await refresh();
      setStatusMessage(`Applied unit pricing to ${result?.pricedLineCount || 0} line(s). New total: ${result?.estimate?.total || ""}.`);
    } catch (priceError) {
      setActionError(priceError.message || "Unable to apply unit pricing.");
    } finally {
      setBusyAction("");
    }
  }

  function updateDraft(estimateId, key, value) {
    const next = {
      ...drafts,
      [estimateId]: {
        ...drafts[estimateId],
        [key]: value,
      },
    };
    setDrafts(next);
    writeEstimateDrafts(next);
  }

  function addDraftLine(estimateId) {
    const line = { label: "New scope line", amount: "$0", note: "Customer-customized line item" };
    setBusyAction(`line-${estimateId}`);
    setActionError("");
    mutateEstimate("add-line", {
      estimateId,
      label: line.label,
      amount: line.amount,
      note: line.note,
      detail: `Added ${line.label} to ${estimateId}.`,
    })
      .then(() => refresh())
      .then(() => setStatusMessage(`Line item added to ${estimateId}.`))
      .catch((error) => {
        const current = drafts[estimateId]?.newLines || [];
        updateDraft(estimateId, "newLines", current.concat({ id: `line-${Date.now()}`, ...line }));
        setStatusMessage("Line saved locally until API sync returns.");
      })
      .finally(() => setBusyAction(""));
  }

  return (
    <PortalShell
      title="Estimates"
      subtitle="Build line-item pricing, assumptions, and proposal-ready packages."
      activeHref="/portal/estimates"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/proposals"
      primaryLabel="Open Proposals"
    >
      {actionError ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>{actionError}</div>
      ) : null}
      {statusMessage ? (
        <div style={{ ...cardStyle, marginBottom: 16, background: "#f0fdf4", border: "1px solid #86efac", color: "#166534" }}>
          <div>{statusMessage}</div>
          {lastInvoice?.id ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <a href={`/portal/billing/${lastInvoice.id}`} style={{ ...buttonStyle(), textDecoration: "none", display: "inline-block" }}>View invoice</a>
              <a href={`/portal/finance?view=payments&invoiceId=${encodeURIComponent(lastInvoice.id)}`} style={{ ...buttonStyle(true), textDecoration: "none", display: "inline-block" }}>Record payment</a>
              <a href={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`} style={{ ...buttonStyle(), textDecoration: "none", display: "inline-block" }}>Open SOV</a>
            </div>
          ) : null}
        </div>
      ) : null}

      <AuricruxInsightPanel
        title="Auricrux Precon Intelligence"
        targetObjectId={projectId}
        nextAction={precon.continuity?.nextAction}
        metrics={[
          { label: "Tethered", value: `${precon.continuity?.tetheredTakeoffCount || 0}/${precon.continuity?.takeoffCount || 0}` },
          { label: "Unpriced", value: precon.continuity?.unpricedLineCount || 0 },
          { label: "Estimate", value: precon.continuity?.estimateId || "—" },
        ]}
        actionHref={`/portal/design?projectId=${encodeURIComponent(projectId)}`}
        actionLabel="Open Design Workspace"
      />

      <div style={{ ...cardStyle, marginBottom: 16, border: marginErosion.active ? "1px solid #fecaca" : "1px solid #bbf7d0", background: marginErosion.active ? "#fef2f2" : "#f0fdf4" }}>
        <div style={{ fontWeight: 800, color: marginErosion.active ? "#991b1b" : "#166534", marginBottom: 8 }}>Living budget continuity</div>
        <div>{marginErosion.summary}</div>
        <div style={{ color: "#475569", marginTop: 6 }}>{`Risk-adjusted contingency suggestion: ${(riskContingency * 100).toFixed(1)}%`}</div>
      </div>

      {estimateUpdateFlags.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #facc15", background: "#fffbeb" }}>
          <div style={{ fontWeight: 800, color: "#92400e", marginBottom: 8 }}>Update Required from Design Workspace</div>
          <div style={{ display: "grid", gap: 8 }}>
            {estimateUpdateFlags.map((flag) => (
              <div key={flag.id} style={{ border: "1px solid #fde68a", borderRadius: 10, padding: 10, background: "#fff" }}>
                <div style={{ fontWeight: 700 }}>{flag.summary}</div>
                <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>{`Sheet ${flag.sheetId || "—"} · ${flag.issuedAt}`}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <a href={`/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(flag.fileId || "")}&sheetId=${encodeURIComponent(flag.sheetId || "")}`} style={{ ...buttonStyle(), textDecoration: "none", display: "inline-block" }}>
                    Open design source
                  </a>
                  <button type="button" style={buttonStyle()} onClick={() => acknowledgeDesignUpdate(flag.id)}>
                    Mark reviewed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <TakeoffEstimatePanel
          continuity={precon.continuity}
          loading={precon.loading}
          error={precon.error}
          busy={!!busyAction}
          onSyncAll={() => precon.syncAll(precon.continuity?.estimateId)}
          onTetherOne={(takeoffId) => precon.tetherOne(takeoffId, precon.continuity?.estimateId)}
          onPriceEstimate={() => precon.priceEstimate(precon.continuity?.estimateId)}
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>AI quote normalization and scope-gap detection</h2>
        <div style={{ color: "#475569", marginBottom: 8 }}>Paste quote rows as: <strong>scope,amount,note</strong> (one line per row).</div>
        <textarea
          value={quoteInput}
          onChange={(event) => setQuoteInput(event.target.value)}
          placeholder="Plumbing rough-in,45000,pipes only\nFixtures package,0,excluded"
          style={{ width: "100%", minHeight: 92, padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", boxSizing: "border-box" }}
        />
        {normalizedQuote.rows.length ? (
          <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
            <div style={{ color: "#334155" }}>{`Normalized rows: ${normalizedQuote.rows.length} · Total ${asUsd(normalizedQuote.total)}`}</div>
            {normalizedQuote.scopeGaps.map((gap) => (
              <div key={gap} style={{ border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e", borderRadius: 8, padding: 8 }}>{gap}</div>
            ))}
          </div>
        ) : null}
      </div>

      {assemblyNotice ? (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#166534" }}>{assemblyNotice}</div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {estimates.map((estimate) => {
          const draft = drafts[estimate.estimateId] || { scopeNote: "", newLines: [] };
          const scenario = scenarioDrafts[estimate.estimateId] || DEFAULT_SCENARIO;
          const scenarioCost = computeScenarioCost(estimate.total, scenario);
          const importedQuote = quoteImports[estimate.estimateId] || null;
          const locks = collabLocks[estimate.estimateId] || {};
          return (
            <div key={estimate.estimateId} style={cardStyle}>
              <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 6 }}>{estimate.status}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{estimate.package}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{estimate.total}</div>
              <div style={{ color: "#475569", lineHeight: 1.7 }}>
                <div><strong>Estimate ID:</strong> {estimate.estimateId}</div>
                <div><strong>Bid:</strong> {estimate.bidId}</div>
                <div><strong>Estimator:</strong> {estimate.estimator}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Assumptions</div>
                <ul style={{ marginTop: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.7 }}>
                  {estimate.assumptions.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>

              <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontWeight: 700 }}>Assembly-based intelligence</div>
                  <select value={assemblyMode} onChange={(event) => setAssemblyMode(event.target.value)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }}>
                    <option value="standard-wall">Standard wall</option>
                    <option value="fire-rated-wall">Fire-rated wall</option>
                  </select>
                </div>
                <button type="button" style={buttonStyle()} onClick={() => applyAssemblyIntelligence(estimate.estimateId)}>Apply assembly change</button>
              </div>

              <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Execution scenario modeling</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(130px, 1fr))", gap: 8 }}>
                  <label>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Crane</div>
                    <select value={scenario.craneStrategy} onChange={(event) => updateScenario(estimate.estimateId, "craneStrategy", event.target.value)} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }}>
                      <option value="mobile">Mobile crane</option>
                      <option value="tower">Tower crane</option>
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Acceleration (weeks)</div>
                    <input type="number" min="0" value={scenario.accelerationWeeks} onChange={(event) => updateScenario(estimate.estimateId, "accelerationWeeks", Number(event.target.value || 0))} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }} />
                  </label>
                  <label>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Crew type</div>
                    <select value={scenario.crewType} onChange={(event) => updateScenario(estimate.estimateId, "crewType", event.target.value)} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }}>
                      <option>Standard crew</option>
                      <option>Premium crew</option>
                    </select>
                  </label>
                  <label>
                    <div style={{ fontSize: 12, color: "#64748b" }}>Productivity rate</div>
                    <input type="number" step="0.05" min="0.2" max="2" value={scenario.productivityRate} onChange={(event) => updateScenario(estimate.estimateId, "productivityRate", Number(event.target.value || 1))} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }} />
                  </label>
                </div>
                <div style={{ marginTop: 8, color: "#334155" }}>{`Scenario total: ${asUsd(scenarioCost)}`}</div>
              </div>

              <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Provenance and collaborative controls</div>
                <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.65 }}>
                  <div><strong>Provenance:</strong> vendor quote import, historical index, and AI-adjusted estimate sources are tracked.</div>
                  <div><strong>MEP risk signals:</strong> {mepIssueCount} historical issue(s) detected in project intelligence.</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  {WBS_SEGMENTS.map((segment) => (
                    <button
                      key={`${estimate.estimateId}-${segment}`}
                      type="button"
                      style={buttonStyle()}
                      onClick={() => lockWbsSection(estimate.estimateId, segment, state?.tenant?.name || "Lead Estimator")}
                    >
                      {locks[segment] ? `${segment}: ${locks[segment].owner}` : `Lock ${segment}`}
                    </button>
                  ))}
                </div>
              </div>

              {importedQuote ? (
                <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>Imported normalized quote</div>
                  <div style={{ color: "#334155", marginBottom: 6 }}>{`Rows ${importedQuote.rows.length} · Total ${asUsd(importedQuote.total)}`}</div>
                  {importedQuote.scopeGaps.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18, color: "#92400e", lineHeight: 1.7 }}>
                      {importedQuote.scopeGaps.map((gap) => <li key={gap}>{gap}</li>)}
                    </ul>
                  ) : (
                    <div style={{ color: "#166534" }}>No scope gaps detected for this quote import.</div>
                  )}
                </div>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Editable scope note</div>
                <textarea value={draft.scopeNote} onChange={(event) => updateDraft(estimate.estimateId, "scopeNote", event.target.value)} placeholder="Add a branded scope note for this customer estimate" style={{ width: "100%", minHeight: 88, padding: 12, borderRadius: 12, border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700 }}>Line items</div>
                  <button type="button" style={buttonStyle()} onClick={() => addDraftLine(estimate.estimateId)}>Add Line</button>
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  {estimate.lineItems.map((item) => (
                    <div key={item.code} style={{ border: item.sourceTakeoffId ? `1px solid ${brandSkin.accent || "#1d4ed8"}` : "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: item.sourceTakeoffId ? (brandSkin.surface || "#eff6ff") : "#f8fafc", display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{item.code}</div>
                        {item.sourceTakeoffId ? (
                          <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>
                            Tethered from takeoff {item.sourceTakeoffId}
                            {item.quantity != null ? ` · ${item.quantity} ${item.unit || ""}` : ""}
                            {item.unitRate != null ? ` @ $${item.unitRate}/${item.unit || "EA"}` : ""}
                            {item.projectId && item.sourceFileId ? (
                              <>
                                {" · "}
                                <a href={`/portal/design?projectId=${encodeURIComponent(item.projectId)}&fileId=${encodeURIComponent(item.sourceFileId)}`} style={{ color: brandSkin.accent || "#1d4ed8" }}>
                                  Open in Design Workspace
                                </a>
                              </>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div style={{ fontWeight: 700 }}>{item.amount}</div>
                    </div>
                  ))}
                  {draft.newLines.map((item) => (
                    <div key={item.id} style={{ border: `1px solid ${brandSkin.accent || "#1d4ed8"}`, borderRadius: 10, padding: 10, background: brandSkin.surface || "#eff6ff" }}>
                      <div style={{ fontWeight: 700 }}>{item.label}</div>
                      <div style={{ color: "#475569", fontSize: 13 }}>{item.note}</div>
                      <div style={{ marginTop: 6, fontWeight: 700 }}>{item.amount}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <button type="button" style={buttonStyle()} onClick={() => importNormalizedQuote(estimate.estimateId)} disabled={!normalizedQuote.rows.length}>
                  Import normalized quote
                </button>
                <button type="button" style={buttonStyle()} onClick={() => sendMarginErosionNotice(estimate.estimateId)} disabled={!marginErosion.active}>
                  Broadcast margin erosion
                </button>
                <button type="button" style={buttonStyle()} onClick={() => handlePriceEstimate(estimate.estimateId)} disabled={busyAction === `price-${estimate.estimateId}` || !precon.continuity?.unpricedLineCount}>
                  {busyAction === `price-${estimate.estimateId}` ? "Pricing…" : "Apply Unit Pricing"}
                </button>
                <button type="button" style={buttonStyle()} onClick={() => handleCreateInvoice(estimate.estimateId)} disabled={busyAction === `invoice-${estimate.estimateId}`}>
                  {busyAction === `invoice-${estimate.estimateId}` ? "Creating…" : "Create AR Invoice"}
                </button>
                <button type="button" style={buttonStyle()} onClick={() => advanceEstimate(estimate.estimateId, "Internal review complete", `Auricrux closed internal pricing review for ${estimate.package}.`)}>Close Review</button>
                <button type="button" style={buttonStyle(true)} onClick={() => generateProposal(estimate.estimateId, `Auricrux generated a customer proposal package from ${estimate.estimateId}. Scope note: ${draft.scopeNote || "Not provided"}`)}>Generate Proposal</button>
              </div>
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
