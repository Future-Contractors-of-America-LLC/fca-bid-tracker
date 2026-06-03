import PortalShell from "../../components/PortalShell";
import { currentProject, portalBids } from "../../portalShell";
import { auricruxRail, routeStateOverlays, workspaceContext } from "../../workspaceState";

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

const actionLinkStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginTop: 12,
  marginRight: 10,
};

export default function PortalBids() {
  return (
    <PortalShell
      title="Bid Pipeline and Approval Readiness"
      subtitle="Bid-facing shell for production conversations, tied directly to project conversion and customer action."
      activeHref="/portal/bids"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/bid-entry/"
      primaryLabel="Open Bid Entry"
    >
      <div style={{ ...continuityCardStyle, marginBottom: 16 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Approval continuity focus</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Auricrux is using bid state to govern the next operating move</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Next customer action:</strong> {workspaceContext.currentNextAction}</div>
          <div><strong>Recommended approval move:</strong> {auricruxRail.nextRecommendedAction}</div>
          <div><strong>Current blocker:</strong> {auricruxRail.currentBlocker}</div>
          <div><strong>Downstream impact:</strong> {auricruxRail.blockerImpact}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Bid-to-Project Context</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Active project root:</strong> {currentProject.name}</div>
          <div><strong>Project ID:</strong> {currentProject.id}</div>
          <div>{currentProject.auricruxSummary}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {portalBids.map((bid) => (
          <div key={bid.package} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{bid.status}</div>
            <h3 style={{ marginTop: 0, marginBottom: 10 }}>{bid.package}</h3>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 10 }}>{bid.value}</div>
            <div style={{ color: "#4b5563", lineHeight: 1.6 }}>{bid.blocker}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Sales Narrative</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          This shell lets FCA show that bidding is not a disconnected tool. Auricrux can surface the approval queue, explain blockers,
          and move directly from estimate visibility into project execution, communications, and onboarding.
        </p>
        <div>
          <a href="/portal/messages" style={actionLinkStyle}>Open Messages</a>
          <a href="/portal/billing" style={{ ...actionLinkStyle, background: "#e5e7eb", color: "#111827" }}>Continue to Billing</a>
        </div>
      </div>
    </PortalShell>
  );
}
