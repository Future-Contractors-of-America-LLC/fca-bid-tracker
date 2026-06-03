import PortalShell from "../../components/PortalShell";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import { portalMessages } from "../../portalShell";
import { portalMessagesMessaging } from "../../systemContinuity";
import { auricruxRail, currentProject, routeStateOverlays, workspaceContext } from "../../workspaceState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const highlightCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  border: "1px solid #e5d3a1",
};

const ctaStyle = {
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

export default function PortalMessages() {
  return (
    <PortalShell
      title={portalMessagesMessaging.header.title}
      subtitle={portalMessagesMessaging.header.subtitle}
      activeHref="/portal/messages"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.messages}
      primaryHref="/portal/billing"
      primaryLabel="Continue to Billing"
    >
      <div style={{ ...highlightCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Continuity signal</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{portalMessagesMessaging.continuity.title}</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Next customer action:</strong> {workspaceContext.currentNextAction}</div>
          <div><strong>Revenue blocker:</strong> {auricruxRail.currentBlocker}</div>
          <div><strong>Training continuity:</strong> Two learners still need assignment under {currentProject.id}.</div>
          <div><strong>Recommended route:</strong> {portalMessagesMessaging.continuity.recommendation}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <BuildExpansionCommandDeck
          title={portalMessagesMessaging.expansion.title}
          detail={portalMessagesMessaging.expansion.detail}
          primaryHref="/portal/billing"
          primaryLabel="Advance to billing"
          secondaryHref="/academy"
          secondaryLabel="Preserve training continuity"
        />
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Message stream</h2>
        {portalMessages.map((message) => (
          <div key={message.subject} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontWeight: 700 }}>{message.from}</div>
            <div style={{ color: "#111827", marginTop: 4 }}>{message.subject}</div>
            <div style={{ color: "#4b5563", marginTop: 4 }}>{message.preview}</div>
            <div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>{message.time}</div>
          </div>
        ))}
        <div>
          <a href="/portal/billing" style={ctaStyle}>Continue to Billing</a>
          <a href="/academy" style={{ ...ctaStyle, background: "#e5e7eb", color: "#111827" }}>Open Academy</a>
          <a href="/contact" style={{ ...ctaStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>Request Rollout Review</a>
        </div>
      </div>
    </PortalShell>
  );
}
