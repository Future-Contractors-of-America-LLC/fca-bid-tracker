import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import PublicCtaRow from "../../components/PublicCtaRow";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { portalMessages } from "../../portalShell";
import { portalNarrativeCtaSets } from "../../websiteShell";
import { portalMessagesMessaging } from "../../systemContinuity";
import { routeStateOverlays } from "../../workspaceState";

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

export default function PortalMessages() {
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Persisted message continuity state active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title={portalMessagesMessaging.header.title}
      subtitle={portalMessagesMessaging.header.subtitle}
      activeHref="/portal/messages"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.messages}
      primaryHref="/portal/billing"
      primaryLabel="Open Billing"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted message state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
        </div>
      </div>

      <div style={{ ...highlightCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Continuity signal</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{portalMessagesMessaging.continuity.title}</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Next customer action:</strong> {state.workspace.currentNextAction}</div>
          <div><strong>Revenue blocker:</strong> {state.auricrux.currentBlocker}</div>
          <div><strong>Training continuity:</strong> Two learners still need assignment under {state.project.id}.</div>
          <div><strong>Recommended route:</strong> {portalMessagesMessaging.continuity.recommendation}</div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <BuildExpansionCommandDeck
          title={portalMessagesMessaging.expansion.title}
          detail={portalMessagesMessaging.expansion.detail}
          primaryHref="/portal/billing"
          primaryLabel="Open Billing"
          secondaryHref="/academy"
          secondaryLabel="Open Academy"
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
        <PublicCtaRow actions={portalNarrativeCtaSets.messageStream} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
      </div>
    </PortalShell>
  );
}
