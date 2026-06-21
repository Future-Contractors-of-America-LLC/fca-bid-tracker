import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProposalWorkspace from "../../hooks/useProposalWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
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
  const focusProposal = proposals[0] || null;

  return (
    <PortalShell
      title="Proposals"
      subtitle="Package scope, narrative, and approval-ready customer proposals."
      activeHref="/portal/proposals"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
    >
      {focusProposal?.proposalId ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux Proposal Intelligence"
            targetObjectType="Proposal"
            targetObjectId={focusProposal.proposalId}
            sourceRoute="/portal/proposals"
            rationale={focusProposal.nextAction || "Package scope, assumptions, and approval follow-through for customer delivery."}
            nextAction={focusProposal.nextAction || "Advance proposal delivery posture toward customer approval."}
            actionHref="/portal/projects"
            actionLabel="Open projects"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

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
              <div><strong>Total:</strong> {proposal.total || proposal.scopePackage?.total || "—"}</div>
              <div style={{ marginTop: 8 }}><strong>Narrative:</strong> {proposal.commercialNarrative}</div>
              <div style={{ marginTop: 8 }}><strong>Assumptions summary:</strong> {proposal.assumptionsSummary}</div>
              {proposal.exclusionsSummary ? <div style={{ marginTop: 8 }}><strong>Exclusions:</strong> {proposal.exclusionsSummary}</div> : null}
              <div style={{ marginTop: 8 }}><strong>Next action:</strong> {proposal.nextAction}</div>
            </div>
            {proposal.scopePackage?.designSourcedLines?.length ? (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Design-sourced scope ({proposal.scopePackage.designLineCount})</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {proposal.scopePackage.designSourcedLines.map((line) => (
                    <div key={line.code} style={{ border: "1px solid #dbeafe", borderRadius: 10, padding: 10, background: "#eff6ff" }}>
                      <div style={{ fontWeight: 700 }}>{line.label}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                        {line.quantity} {line.unit} · {line.amount}
                        {line.sourceTakeoffId ? ` · takeoff ${line.sourceTakeoffId}` : ""}
                      </div>
                      {line.projectId && line.sourceFileId ? (
                        <a href={`/portal/design?projectId=${encodeURIComponent(line.projectId)}&fileId=${encodeURIComponent(line.sourceFileId)}`} style={{ fontSize: 12, color: "#2563eb" }}>
                          Trace to Design Workspace
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
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
