import PortalShell from "../../components/PortalShell";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import BidActionCenter from "../../components/BidActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import { qualificationEvidencePackets } from "../../qualificationEvidence";
import { publicBodyCtaSets, portalNarrativeCtaSets } from "../../websiteShell";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const continuityCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  border: "1px solid #e5d3a1",
};

const qualificationCardStyle = {
  marginTop: 14,
  padding: 14,
  borderRadius: 12,
  background: "#f8fafc",
  border: "1px solid #dbe4f0",
};

const actionButtonStyle = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  padding: "10px 12px",
  cursor: "pointer",
};

export default function PortalBids() {
  const { state } = useWorkspaceState();
  const { bids, meta, updateBidStatus, clearBidBlocker, updateBidQualification, routeBidToEstimate, markWonAndCreateProject } = useBidWorkspace();

  return (
    <PortalShell
      title="Bid Pipeline and Approval Readiness"
      subtitle="Bid-facing shell for intake qualification, estimating, scope alignment, and conversion into job-start execution rather than a disconnected sales-only view."
      activeHref="/portal/bids"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/bid-entry"
      primaryLabel="Open Bid Entry"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Bid route now reads from the canonical operating state"
          detail="Bid approval, next action, qualification posture, and execution blocker data are now sourced from the shared system module rather than split wrapper files."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Workflow spine source</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Backing source:</strong> {meta.backingSource}</div>
          <div><strong>Persistence state:</strong> {meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {meta.lastSyncedAt || "Pending initial sync"}</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <CommercialContinuityFeed title="Bid revenue continuity feed" detail="Recent bid-state mutations, qualification repairs, approval-path recovery, and won-package transitions remain visible here so preconstruction actions stay tied to revenue continuity." />
      <AutomationRecoveryFeed title="Bid automation feed" detail="Recent Auricrux bid repairs, qualification commands, and status transitions remain visible across routes so the preconstruction spine is not trapped inside one card click." />

      <div style={{ ...continuityCardStyle, marginBottom: 16 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Approval continuity focus</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is using bid state to govern the next operating move</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Next customer action:</strong> {state.workspace.currentNextAction}</div>
          <div><strong>Recommended approval move:</strong> {state.auricrux.nextRecommendedAction}</div>
          <div><strong>Current blocker:</strong> {state.auricrux.currentBlocker}</div>
          <div><strong>Downstream impact:</strong> {state.auricrux.blockerImpact}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Bid-to-Project Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Active project root:</strong> {state.project.name}</div>
          <div><strong>Project ID:</strong> {state.project.id}</div>
          <div><strong>Current stage:</strong> {state.project.stage}</div>
          <div>{state.project.auricruxSummary}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {bids.map((bid) => {
          const evidencePacket = qualificationEvidencePackets.find((packet) => packet.bidId === bid.id);

          return (
            <div key={bid.id} style={cardStyle}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{bid.status}</div>
              <h3 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h3>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{bid.value}</div>
              <div style={{ color: "#0f172a", lineHeight: 1.7 }}>
                <div><strong>Estimator:</strong> {bid.estimator}</div>
                <div><strong>Scope package:</strong> {bid.scopePackage}</div>
                <div><strong>Decision due:</strong> {bid.dueDate}</div>
                <div><strong>Trade coverage:</strong> {bid.tradeCoverage}</div>
              </div>
              <div style={{ color: "#4b5563", lineHeight: 1.6, marginTop: 12 }}>
                <div><strong>Current blocker:</strong> {bid.blocker}</div>
                <div><strong>Next commercial move:</strong> {bid.nextCommercialMove}</div>
                {bid.linkedProjectId ? <div><strong>Project root:</strong> {bid.linkedProjectId}</div> : null}
              </div>

              <div style={qualificationCardStyle}>
                <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Qualification command surface</div>
                <div style={{ color: "#475569", lineHeight: 1.7 }}>
                  <div><strong>Qualification score:</strong> {bid.qualification.score}</div>
                  <div><strong>Qualification status:</strong> {bid.qualification.status}</div>
                  <div><strong>Budget fit:</strong> {bid.qualification.budgetFit}</div>
                  <div><strong>Scope fit:</strong> {bid.qualification.scopeFit}</div>
                  <div><strong>Jurisdiction:</strong> {bid.qualification.jurisdiction}</div>
                  <div><strong>Travel posture:</strong> {bid.qualification.travel}</div>
                  <div><strong>Evidence packet:</strong> {bid.qualification.evidence}</div>
                  <div><strong>Next gate:</strong> {bid.qualification.nextGate}</div>
                </div>
                {evidencePacket ? (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>Qualification evidence packet</div>
                    <div style={{ color: "#475569", lineHeight: 1.7 }}>
                      <div><strong>Readiness:</strong> {evidencePacket.readiness}</div>
                      <div><strong>Summary:</strong> {evidencePacket.summary}</div>
                      <div><strong>Next evidence action:</strong> {evidencePacket.nextAction}</div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <strong>Linked files</strong>
                      <ul style={{ paddingLeft: 18, color: "#475569", lineHeight: 1.7, marginTop: 8, marginBottom: 0 }}>
                        {evidencePacket.files.map((file) => (
                          <li key={file}>{file}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() =>
                      updateBidQualification(
                        bid.id,
                        {
                          score: "78/100",
                          status: "Budget review",
                          budgetFit: "Confirmed",
                          evidence: "Buyer budget and scope evidence verified",
                          nextGate: "Route to estimator handoff",
                        },
                        "Budget fit confirmed and qualification packet strengthened."
                      )
                    }
                  >
                    Mark Budget Fit
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() =>
                      updateBidQualification(
                        bid.id,
                        {
                          score: "86/100",
                          status: "Ready for estimate",
                          jurisdiction: "Verified for licensed coverage",
                          travel: "Inside service zone",
                          evidence: "Qualification packet verified",
                          nextGate: "Estimator handoff active",
                        },
                        "Qualification command advanced with verified scope, jurisdiction, and travel posture."
                      )
                    }
                  >
                    Advance Qualification
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => routeBidToEstimate(bid.id, "Qualified opportunity routed into estimating and preconstruction handoff.")}
                  >
                    Route to Estimate
                  </button>
                </div>
              </div>

              <BidActionCenter bid={bid} updateBidStatus={updateBidStatus} clearBidBlocker={clearBidBlocker} markWonAndCreateProject={markWonAndCreateProject} />
            </div>
          );
        })}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Construction-facing narrative</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          This shell now shows bidding as a true preconstruction control surface. FCA can hold intake qualification, estimator ownership, scope package clarity,
          trade coverage gaps, approval timing, attached evidence packets, and the move from won work into job-start setup instead of leaving bid activity as detached CRM copy.
        </p>
        <PublicCtaRow actions={portalNarrativeCtaSets.bidSalesNarrative} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
      </div>
    </PortalShell>
  );
}
