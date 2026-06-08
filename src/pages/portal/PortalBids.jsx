import PortalShell from "../../components/PortalShell";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import BidActionCenter from "../../components/BidActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
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
  ...cardStyle,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  border: "1px solid #bfdbfe",
};

export default function PortalBids() {
  const { state } = useWorkspaceState();
  const { bids, updateBidStatus, clearBidBlocker } = useBidWorkspace();

  const approvalSensitiveBids = bids.filter((bid) => bid.status === "Awaiting Approval").length;
  const wonBids = bids.filter((bid) => bid.status === "Won").length;
  const blockedBids = bids.filter((bid) => bid.blocker && !/all coverage in hand/i.test(bid.tradeCoverage)).length;
  const qualificationScore = Math.max(42, 92 - blockedBids * 11 - approvalSensitiveBids * 7 + wonBids * 5);
  const qualificationState =
    qualificationScore >= 85 ? "Qualified and ready to advance" : qualificationScore >= 70 ? "Conditionally qualified" : "Qualification at risk";
  const missingEvidence = [
    approvalSensitiveBids > 0 ? "Recorded customer scope approval" : null,
    bids.some((bid) => /provisional|refresh/i.test(`${bid.tradeCoverage} ${bid.blocker}`)) ? "Final trade coverage and pricing refresh" : null,
    bids.some((bid) => /contract workspace|startup packet/i.test(`${bid.blocker} ${bid.nextCommercialMove}`)) ? "Award-to-project conversion packet" : null,
  ].filter(Boolean);

  return (
    <PortalShell
      title="Bid Pipeline and Approval Readiness"
      subtitle="Bid-facing shell for estimating, qualification, scope alignment, and conversion into job-start execution rather than a disconnected sales-only view."
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
          detail="Bid approval, qualification readiness, next action, and execution blocker data are now sourced from the shared system module rather than split wrapper files."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <CommercialContinuityFeed title="Bid revenue continuity feed" detail="Recent bid-state mutations, approval-path repairs, and won-package transitions remain visible here so preconstruction actions stay tied to revenue continuity." />
      <AutomationRecoveryFeed title="Bid automation feed" detail="Recent Auricrux bid repairs and status transitions remain visible across routes so the preconstruction spine is not trapped inside one card click." />

      <div style={{ ...qualificationCardStyle, marginBottom: 16 }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Qualification command surface</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is scoring opportunity readiness before deeper production work is released</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ color: "#1e3a8a", fontSize: 30, fontWeight: 800 }}>{qualificationScore}/100</div>
            <div style={{ color: "#334155", fontWeight: 600 }}>{qualificationState}</div>
          </div>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>Approval-sensitive bids:</strong> {approvalSensitiveBids}</div>
            <div><strong>Blocked packages:</strong> {blockedBids}</div>
            <div><strong>Won packages ready for handoff:</strong> {wonBids}</div>
          </div>
        </div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Next qualification owner:</strong> {state.workspace.nextActionOwner}</div>
          <div><strong>Current customer action:</strong> {state.workspace.currentNextAction}</div>
          <div><strong>Auricrux recommendation:</strong> {state.auricrux.nextRecommendedAction}</div>
          <div><strong>Reason:</strong> {state.auricrux.recommendationReason}</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ color: "#1e3a8a", fontWeight: 700, marginBottom: 8 }}>Missing evidence before clean bid-to-project conversion</div>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.8 }}>
            {missingEvidence.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {bids.map((bid) => (
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
            </div>
            <BidActionCenter bid={bid} updateBidStatus={updateBidStatus} clearBidBlocker={clearBidBlocker} />
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Construction-facing narrative</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          This shell now shows bidding as a true preconstruction control surface. FCA can hold qualification posture, estimator ownership, scope package clarity,
          trade coverage gaps, approval timing, and the move from won work into job-start setup instead of leaving bid activity as detached CRM copy.
        </p>
        <PublicCtaRow actions={portalNarrativeCtaSets.bidSalesNarrative} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
      </div>
    </PortalShell>
  );
}
