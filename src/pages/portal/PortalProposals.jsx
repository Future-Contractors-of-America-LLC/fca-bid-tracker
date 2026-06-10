import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProposalWorkspace from "../../hooks/useProposalWorkspace";
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

export default function PortalProposals() {
  const { state } = useWorkspaceState();
  const { proposals, meta, advanceProposal } = useProposalWorkspace();

  return (
    <PortalShell
      title="Proposal Workspace and Customer Packaging"
      subtitle="Customer-facing commercial packaging for proposal narrative, delivery posture, and approval-path follow-through."
      activeHref="/portal/proposals"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary tenant={state.tenant} project={state.project} workspace={state.workspace} auricrux={state.auricrux} title="Proposal route completes the sales-to-operations vertical slice" detail="Proposal state now sits between estimate readiness and project handoff so FCA can package scope, assumptions, and approval follow-through inside the live product spine." />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Proposal persistence source</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {meta.backingSource}</div>
          <div><strong>Status:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <CommercialContinuityFeed title="Proposal commercial continuity feed" detail="Proposal drafting, delivery, approval, and project handoff signals remain visible here so the customer package stays attached to live product state." />
      <AutomationRecoveryFeed title="Proposal automation feed" detail="Recent proposal mutations remain visible across routes so FCA can prove proposal handling is part of the operating system rather than static copy." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {proposals.map((proposal) => (
          <div key={proposal.proposalId} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{proposal.status}</div>
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>{proposal.package}</h3>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              <div><strong>Proposal ID:</strong> {proposal.proposalId}</div>
              <div><strong>Estimate:</strong> {proposal.estimateId}</div>
              <div><strong>Bid:</strong> {proposal.bidId}</div>
              <div><strong>Delivery mode:</strong> {proposal.deliveryMode}</div>
            </div>
            <div style={{ marginTop: 12, color: "#475569", lineHeight: 1.7 }}>
              <div><strong>Narrative:</strong> {proposal.commercialNarrative}</div>
              <div style={{ marginTop: 8 }}><strong>Assumptions summary:</strong> {proposal.assumptionsSummary}</div>
              <div style={{ marginTop: 8 }}><strong>Next action:</strong> {proposal.nextAction}</div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" style={buttonStyle()} onClick={() => advanceProposal(proposal.proposalId, "Sent", `Auricrux sent ${proposal.proposalId} into customer review.`, "Track customer response")}>Send Proposal</button>
              <button type="button" style={buttonStyle(true)} onClick={() => advanceProposal(proposal.proposalId, "Approved", `Auricrux recorded approval for ${proposal.proposalId}.`, "Create project handoff package")}>Mark Approved</button>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
