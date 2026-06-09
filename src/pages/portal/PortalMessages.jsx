import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import MessageActionCenter from "../../components/MessageActionCenter";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { auricruxCommsChannels, routeStateOverlays } from "../../systemState";
import { readPortalMessages } from "../../portalContinuityStore";
import { portalNarrativeCtaSets } from "../../websiteShell";
import { portalMessagesMessaging } from "../../systemContinuity";

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

const launchCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  border: "1px solid #dbe3ef",
};

const channelMap = {
  chat: ["Chat"],
  sms: ["SMS"],
  phone: ["Phone"],
  email: ["Email"],
  teams: ["Teams"],
  conference: ["Conference"],
  lecture: ["Lecture"],
};

export default function PortalMessages() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();
  const [activeChannel, setActiveChannel] = useState(() => readActiveChannel());
  const liveMessages = useMemo(() => readPortalMessages(), [state.project.id, state.workspace.currentNextAction, state.auricrux.currentBlocker]);

  useEffect(() => {
    refreshSyncStamp("Persisted message continuity state active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    function syncChannel() {
      setActiveChannel(readActiveChannel());
    }

    window.addEventListener("hashchange", syncChannel);
    return () => window.removeEventListener("hashchange", syncChannel);
  }, []);

  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const accountSource = session?.accountSource || "workspace-shell";
  const launchReadiness = accountSource === "api"
    ? "Production-backed login active"
    : accountSource === "local-fallback"
      ? "Seeded launch/test login active"
      : "Shell continuity mode";

  const filteredMessages = useMemo(() => {
    if (!activeChannel || !channelMap[activeChannel]) return liveMessages;
    return liveMessages.filter((message) => channelMap[activeChannel].includes(message.channel));
  }, [activeChannel, liveMessages]);

  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Pending for this customer" : " · Enabled for this customer"}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));

  return (
    <PortalShell
      title={portalMessagesMessaging.header.title}
      subtitle={`${portalMessagesMessaging.header.subtitle} This route now includes one-click communications recovery controls.`}
      activeHref="/portal/messages"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.messages}
      primaryHref="/portal/billing"
      primaryLabel="Open Billing"
    >
      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Message route is anchored to the shared operating state"
          detail="Communication continuity now reads from the same tenant, project, next action, blocker data, customer channel access, launch posture, warranty follow-through, and referral-growth posture that power bids, files, billing, and academy routes."
        />
      </div>

      <CustomerCommsLaunchpad session={session} title="Launch customer-enabled communications lanes" />

      <div style={{ marginBottom: 24 }}>
        <MessageActionCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <AuricruxCommsPanel
          title="Auricrux comms now spans every external and internal follow-through lane"
          detail="Chat, SMS, phone, email, Teams, conference, and lecture are now framed as one coordinated FCA and Auricrux communications system instead of disconnected handoff points, and they now support support recovery, warranty continuity, referral conversion, and launch-account truth in the same shell."
          statusLabel="Comms command status"
          statusValue={activeChannel ? `${activeChannel.toUpperCase()} lane active` : "Unified coordination active"}
          items={commItems}
        />
      </div>

      <div style={{ ...launchCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Launch account continuity</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Account source:</strong> {accountSource}</div>
          <div><strong>Launch readiness:</strong> {launchReadiness}</div>
          <div><strong>Comms recovery posture:</strong> {accountSource === "api" ? "Production comms path verified" : "Keep seeded launch accounts visible until production auth is live"}</div>
          <div><strong>Recommended escalation:</strong> {accountSource === "api" ? "Continue customer follow-through in active lane" : "Route login hardening and customer credential issuance into launch checklist"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Persisted message state</div>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Last sync:</strong> {state.meta.lastSyncedAt || "Pending initial sync"}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
          <div><strong>Channel focus:</strong> {activeChannel ? activeChannel.toUpperCase() : "All channels"}</div>
          <div><strong>Active project lane:</strong> {state.project.id}</div>
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Warranty message lane</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Service follow-through, document retrieval, and post-handover updates can now be positioned as real communications continuity instead of detached support mail.
          </p>
          <a href="/warranty" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open Warranty Continuity</a>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Referral conversion lane</h2>
          <p style={{ color: "#475569", lineHeight: 1.7 }}>
            Reviews, introductions, and customer advocacy now stay attached to project proof and guided message follow-through instead of separate manual outreach loops.
          </p>
          <a href="/referrals" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open Referral Continuity</a>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Coordination stream</h2>
        <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 16 }}>
          {activeChannel
            ? `Showing only ${activeChannel.toUpperCase()}-aligned coordination so customer channel access stays honest to the active session.`
            : "Showing all live coordination lanes across chat, SMS, phone, email, Teams, conference, lecture, warranty follow-through, and referral continuity."}
        </div>
        {filteredMessages.length ? filteredMessages.map((message) => (
          <div key={`${message.id}-${message.subject}`} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700 }}>{message.from}</div>
              <div style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>{message.priority}</div>
            </div>
            <div style={{ color: "#111827", marginTop: 4, fontWeight: 700 }}>{message.subject}</div>
            <div style={{ color: "#4b5563", marginTop: 4 }}>{message.preview}</div>
            <div style={{ color: "#0f172a", lineHeight: 1.6, marginTop: 8 }}>
              <div><strong>Channel:</strong> {message.channel}</div>
              <div><strong>Next action:</strong> {message.nextAction}</div>
              <div><strong>Project lane:</strong> {message.projectId || state.project.id}</div>
            </div>
            <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>{message.time}</div>
          </div>
        )) : <div style={{ color: "#475569", lineHeight: 1.7 }}>No messages are currently mapped to this lane. Use the customer profile to enable additional communications channels for this workspace.</div>}
        <div style={{ marginTop: 16 }}>
          <PublicCtaRow actions={portalNarrativeCtaSets.messageStream} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
        </div>
      </div>
    </PortalShell>
  );
}

function readActiveChannel() {
  if (typeof window === "undefined") return "";
  return (window.location.hash || "").replace("#", "").toLowerCase();
}
