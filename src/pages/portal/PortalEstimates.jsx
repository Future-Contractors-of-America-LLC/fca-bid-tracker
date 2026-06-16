import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useEstimateWorkspace from "../../hooks/useEstimateWorkspace";
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
const ESTIMATE_REVISION_QUEUE_KEY = "fca_customer_estimate_revision_queue_v1";
const CHANGE_ORDER_REVIEW_QUEUE_KEY = "fca_customer_change_order_review_queue_v1";

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

function readRevisionQueue() {
  if (typeof window === "undefined") return { revisions: [] };
  try {
    return JSON.parse(window.localStorage.getItem(ESTIMATE_REVISION_QUEUE_KEY) || "{\"revisions\":[]}");
  } catch {
    return { revisions: [] };
  }
}

function writeRevisionQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ESTIMATE_REVISION_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // best effort
  }
}

function readChangeOrderQueue() {
  if (typeof window === "undefined") return { items: [] };
  try {
    return JSON.parse(window.localStorage.getItem(CHANGE_ORDER_REVIEW_QUEUE_KEY) || "{\"items\":[]}");
  } catch {
    return { items: [] };
  }
}

function writeChangeOrderQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHANGE_ORDER_REVIEW_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // best effort
  }
}

export default function PortalEstimates() {
  const { state } = useWorkspaceState();
  const { estimates, meta, advanceEstimate, generateProposal } = useEstimateWorkspace();
  const brandSkin = readBrandSkin();
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const [drafts, setDrafts] = useState(() => readEstimateDrafts());
  const [revisionQueue, setRevisionQueue] = useState(() => readRevisionQueue());
  const [changeOrderQueue, setChangeOrderQueue] = useState(() => readChangeOrderQueue());

  const brandedNarrative = useMemo(() => `${companyName} estimate studio turns qualified opportunities into customer-ready pricing packages with editable line items, scope notes, change-order pricing review, and Auricrux-guided next actions.`, [companyName]);

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

  function closeRevisionRequest(revisionId) {
    const next = {
      ...revisionQueue,
      revisions: (revisionQueue.revisions || []).map((revision) => revision.id === revisionId ? { ...revision, status: "Closed", nextAction: "Customer notified" } : revision),
    };
    setRevisionQueue(next);
    writeRevisionQueue(next);
  }

  function completeChangeOrderReview(itemId) {
    const next = {
      ...changeOrderQueue,
      items: (changeOrderQueue.items || []).map((item) => item.id === itemId ? { ...item, status: "Completed", nextAction: "Send priced change order" } : item),
    };
    setChangeOrderQueue(next);
    writeChangeOrderQueue(next);
  }

  return (
    <PortalShell
      title={`${companyName} Estimate Studio`}
      subtitle="A branded pricing workspace for real estimate entry, scope packaging, exclusions, assumptions, change-order pricing, and proposal launch."
      activeHref="/portal/estimates"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/proposals"
      primaryLabel="Open Proposals"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary tenant={state.tenant} project={state.project} workspace={state.workspace} auricrux={state.auricrux} title="Estimate route extends the Contractor Command bid spine" detail="Estimate state now lives as its own pricing workspace so FCA can move from qualification into structured pricing, change-order review, and customer-ready packaging." />
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

      <CommercialContinuityFeed title="Estimate commercial continuity feed" detail="Estimate advancement, pricing review, change-order review, and proposal generation events remain visible here so pricing does not disappear between bid qualification and customer packaging." />
      <AutomationRecoveryFeed title="Estimate automation feed" detail="Recent estimate, change-order, and proposal-generation actions remain visible across routes so pricing actions are durable rather than local-only UI gestures." />

      <div style={{ ...cardStyle, marginTop: 24, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Estimate revision queue</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Customers can immediately use this queue to stage estimate revisions, preserve pricing change context, and close review loops with their estimator inside the same workspace.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {(revisionQueue.revisions || []).map((revision) => (
            <div key={revision.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: revision.status === "Closed" ? "#f0fdf4" : "#eff6ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{revision.estimateId}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{revision.status}</span>
              </div>
              <div style={{ color: "#334155", lineHeight: 1.7, marginTop: 8 }}>{revision.scope}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Next action:</strong> {revision.nextAction}</div>
              {revision.status !== "Closed" ? <button type="button" style={{ ...buttonStyle(), marginTop: 10 }} onClick={() => closeRevisionRequest(revision.id)}>Close Revision</button> : null}
            </div>
          ))}
          {!revisionQueue.revisions?.length ? <div style={{ color: "#64748b" }}>No staged estimate revisions yet.</div> : null}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Change order pricing review queue</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Customers can immediately use this queue to hold change-order pricing work, preserve scope-change context, and track the next commercial move before sending the package.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {(changeOrderQueue.items || []).map((item) => (
            <div key={item.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: item.status === "Completed" ? "#f0fdf4" : "#eff6ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{item.changeOrderTitle}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{item.status}</span>
              </div>
              <div style={{ color: "#334155", lineHeight: 1.7, marginTop: 8 }}>{item.detail}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Next action:</strong> {item.nextAction}</div>
              {item.status !== "Completed" ? <button type="button" style={{ ...buttonStyle(), marginTop: 10 }} onClick={() => completeChangeOrderReview(item.id)}>Complete Review</button> : null}
            </div>
          ))}
          {!changeOrderQueue.items?.length ? <div style={{ color: "#64748b" }}>No queued change-order pricing reviews yet.</div> : null}
        </div>
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
                    <div key={item.code} style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 10, background: "#f8fafc", display: "flex", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ color: "#64748b", fontSize: 12 }}>{item.code}</div>
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
          <li>Explains estimate status, assumptions, exclusions, revision queue posture, and change-order pricing review state</li>
          <li>Recommends next pricing and proposal actions</li>
          <li>Executes estimate advancement, proposal generation, revision closeout, and change-order review completion signaling</li>
        </ul>
      </div>
    </PortalShell>
  );
}
