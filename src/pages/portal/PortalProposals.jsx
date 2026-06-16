import { useState } from "react";
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

const PROPOSAL_FOLLOWUP_QUEUE_KEY = "fca_customer_proposal_followup_queue_v1";

function readFollowupQueue() {
  if (typeof window === "undefined") return { followups: [] };
  try {
    return JSON.parse(window.localStorage.getItem(PROPOSAL_FOLLOWUP_QUEUE_KEY) || "{\"followups\":[]}");
  } catch {
    return { followups: [] };
  }
}

function writeFollowupQueue(queue) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROPOSAL_FOLLOWUP_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // best effort
  }
}

export default function PortalProposals() {
  const { state } = useWorkspaceState();
  const { proposals, meta, advanceProposal } = useProposalWorkspace();
  const [followupQueue, setFollowupQueue] = useState(() => readFollowupQueue());

  function completeFollowup(followupId) {
    const next = {
      ...followupQueue,
      followups: (followupQueue.followups || []).map((followup) => followup.id === followupId ? { ...followup, status: "Completed", nextAction: "Customer response logged" } : followup),
    };
    setFollowupQueue(next);
    writeFollowupQueue(next);
  }

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
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
        </div>
      </div>

      <CommercialContinuityFeed title="Proposal commercial continuity feed" detail="Proposal drafting, delivery, approval, and project handoff signals remain visible here so the customer package stays attached to live product state." />
      <AutomationRecoveryFeed title="Proposal automation feed" detail="Recent proposal mutations remain visible across routes so FCA can prove proposal handling is part of the operating system rather than static copy." />

      <div style={{ ...cardStyle, marginTop: 24, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Proposal follow-up queue</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Customers can immediately use this queue to preserve proposal follow-up obligations, track approval outreach, and keep handoff momentum visible inside the same commercial workspace.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {(followupQueue.followups || []).map((followup) => (
            <div key={followup.id} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 14, background: followup.status === "Completed" ? "#f0fdf4" : "#eff6ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{followup.proposalId}</strong>
                <span style={{ color: "#1d4ed8", fontWeight: 700 }}>{followup.status}</span>
              </div>
              <div style={{ color: "#334155", lineHeight: 1.7, marginTop: 8 }}>{followup.objective}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Contact:</strong> {followup.contact}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Next action:</strong> {followup.nextAction}</div>
              {followup.status !== "Completed" ? <button type="button" style={{ ...buttonStyle(), marginTop: 10 }} onClick={() => completeFollowup(followup.id)}>Complete Follow-Up</button> : null}
            </div>
          ))}
          {!followupQueue.followups?.length ? <div style={{ color: "#64748b" }}>No staged proposal follow-ups yet.</div> : null}
        </div>
      </div>

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

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Proposal Workspace</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains proposal delivery mode, assumptions summary, and follow-up queue posture</li>
          <li>Recommends next approval and project handoff actions</li>
          <li>Executes proposal advancement and follow-up completion signaling</li>
        </ul>
      </div>
    </PortalShell>
  );
}
