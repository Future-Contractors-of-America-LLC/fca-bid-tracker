import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useEstimateWorkspace from "../../hooks/useEstimateWorkspace";
import usePreconContinuity from "../../hooks/usePreconContinuity";
import TakeoffEstimatePanel from "../../components/design/TakeoffEstimatePanel";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { createInvoiceFromEstimate } from "../../api/financialClient";
import { routeStateOverlays } from "../../systemState";

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

export default function PortalEstimates() {
  const { state } = useWorkspaceState();
  const { estimates, meta, advanceEstimate, generateProposal, refresh } = useEstimateWorkspace();
  const { projectId, hasProject } = usePortalProjectId();
  const precon = usePreconContinuity(projectId);
  const brandSkin = readBrandSkin();
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const [drafts, setDrafts] = useState(() => readEstimateDrafts());
  const [statusMessage, setStatusMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [lastInvoice, setLastInvoice] = useState(null);
  const [busyAction, setBusyAction] = useState("");

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

  const brandedNarrative = useMemo(() => `${companyName} estimate studio turns qualified opportunities into customer-ready pricing packages with editable line items, scope notes, and Auricrux-guided next actions.`, [companyName]);

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
    const current = drafts[estimateId]?.newLines || [];
    updateDraft(estimateId, "newLines", current.concat({ id: `line-${Date.now()}`, label: "New scope line", amount: "$0", note: "Customer-customized line item" }));
  }

  return (
    <PortalShell
      title={`${companyName} Estimate Studio`}
      subtitle="Build line-item pricing, assumptions, and proposal-ready packages."
      activeHref="/portal/estimates"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/proposals"
      primaryLabel="Open Proposals"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary tenant={state.tenant} project={state.project} workspace={state.workspace} auricrux={state.auricrux} title="Estimate route extends the Contractor Command bid spine" detail="Estimate state now lives as its own pricing workspace so FCA can move from qualification into structured pricing and customer-ready packaging." />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded estimate experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>{brandedNarrative}</p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {meta.backingSource}</div>
          <div><strong>Status:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
        </div>
      </div>

      <CommercialContinuityFeed title="Estimate commercial continuity feed" detail="Estimate advancement, pricing review, and proposal generation events remain visible here so pricing does not disappear between bid qualification and customer packaging." />
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {estimates.map((estimate) => {
          const draft = drafts[estimate.estimateId] || { scopeNote: "", newLines: [] };
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

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Estimate Studio</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains estimate status, assumptions, and exclusions</li>
          <li>Recommends next pricing and proposal actions</li>
          <li>Executes estimate advancement and proposal generation</li>
        </ul>
      </div>
    </PortalShell>
  );
}
