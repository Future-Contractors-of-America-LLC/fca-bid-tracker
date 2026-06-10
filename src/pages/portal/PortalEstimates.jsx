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

export default function PortalEstimates() {
  const { state } = useWorkspaceState();
  const { estimates, meta, advanceEstimate, generateProposal } = useEstimateWorkspace();

  return (
    <PortalShell
      title="Estimate Workspace and Pricing Readiness"
      subtitle="Pricing-facing workspace for line-item confidence, assumptions, exclusions, and clean conversion into customer proposal packaging."
      activeHref="/portal/estimates"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/proposals"
      primaryLabel="Open Proposals"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary tenant={state.tenant} project={state.project} workspace={state.workspace} auricrux={state.auricrux} title="Estimate route extends the Contractor Command bid spine" detail="Estimate state now lives as its own pricing workspace so FCA can move from qualification into structured pricing and customer-ready packaging." />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Estimate persistence source</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {meta.backingSource}</div>
          <div><strong>Status:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <CommercialContinuityFeed title="Estimate commercial continuity feed" detail="Estimate advancement, pricing review, and proposal generation events remain visible here so pricing does not disappear between bid qualification and customer packaging." />
      <AutomationRecoveryFeed title="Estimate automation feed" detail="Recent estimate and proposal-generation actions remain visible across routes so pricing actions are durable rather than local-only UI gestures." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {estimates.map((estimate) => (
          <div key={estimate.estimateId} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{estimate.status}</div>
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
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Exclusions</div>
              <ul style={{ marginTop: 0, paddingLeft: 18, color: "#475569", lineHeight: 1.7 }}>
                {estimate.exclusions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Line items</div>
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
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" style={buttonStyle()} onClick={() => advanceEstimate(estimate.estimateId, "Internal review complete", `Auricrux closed internal pricing review for ${estimate.package}.`)}>Close Review</button>
              <button type="button" style={buttonStyle(true)} onClick={() => generateProposal(estimate.estimateId, `Auricrux generated a customer proposal package from ${estimate.estimateId}.`)}>Generate Proposal</button>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
