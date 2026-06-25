import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import {
  fetchPortalMessages,
  sendPortalMessage,
} from "../../api/portalClient";
import { drainCommsQueue, enqueueTransactionalEmail } from "../../api/commsClient";
import { PortalEmptyState } from "../../components/portal/PortalPrimitives";
import { auricruxCommsChannels, routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";

const channelMap = {
  chat: ["Chat"],
  sms: ["SMS"],
  phone: ["Phone"],
  email: ["Email"],
  teams: ["Teams"],
  conference: ["Conference"],
  lecture: ["Lecture"],
};

function readBrandSkin() {
  if (typeof window === "undefined") return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  try {
    return JSON.parse(window.localStorage.getItem(BRAND_STORAGE_KEY) || "{}") || {};
  } catch {
    return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  }
}

function readActiveChannel() {
  if (typeof window === "undefined") return "";
  return (window.location.hash || "").replace("#", "").toLowerCase();
}

export default function PortalMessages() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const [activeChannel, setActiveChannel] = useState(() => readActiveChannel());
  const brandSkin = readBrandSkin();
  const [drafts, setDrafts] = useState({ subject: "", message: "", channel: "email" });
  const [sendError, setSendError] = useState("");

  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  const sentItems = messagesLoad.data?.items || [];

  useEffect(() => {
    function syncChannel() {
      setActiveChannel(readActiveChannel());
    }
    window.addEventListener("hashchange", syncChannel);
    return () => window.removeEventListener("hashchange", syncChannel);
  }, []);

  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  const filteredMessages = useMemo(() => {
    const rows = sentItems.map((message) => ({
      from: companyName,
      subject: message.subject,
      preview: message.message,
      channel: message.channel || "email",
      priority: "Sent",
      nextAction: "Await customer or internal response",
    }));
    if (!activeChannel || !channelMap[activeChannel]) return rows;
    return rows.filter((message) => channelMap[activeChannel].includes(message.channel));
  }, [activeChannel, companyName, sentItems]);

  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Pending for this customer" : " · Enabled for this customer"}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));

  function updateDraft(key, value) {
    setDrafts((current) => ({ ...current, [key]: value }));
  }

  function sendMessage() {
    if (!drafts.subject.trim() || !drafts.message.trim()) return;
    setSendError("");
    const payload = {
      subject: drafts.subject,
      message: drafts.message,
      channel: drafts.channel,
    };
    const emailPromise = payload.channel === "email" && session?.email
      ? enqueueTransactionalEmail({
          subject: payload.subject,
          body: payload.message,
          recipientEmail: session.email,
          recipientName: session.company || companyName,
          sourceRoute: "/portal/messages",
        }).then(() => drainCommsQueue().catch(() => null))
      : Promise.resolve();

    emailPromise
      .then(() => sendPortalMessage(payload))
      .then(() => messagesLoad.reload())
      .then(() => {
        setDrafts({ subject: "", message: "", channel: drafts.channel });
        refreshSyncStamp(`Customer communication sent through ${payload.channel}.`);
      })
      .catch((err) => {
        setSendError(err?.message || "Unable to send message. Try again or contact support.");
      });
  }

  return (
    <PortalShell
      title={`${companyName} Communications Command`}
      subtitle="Team and customer updates tied to bids, jobs, and billing."
      activeHref="/portal/messages"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.messages}
      primaryHref="/portal/billing"
      primaryLabel="Open Billing"
    >
      <PortalSliceAuricrux
        title="Auricrux Communications Intelligence"
        targetObjectType="MessageThread"
        targetObjectId={state?.project?.id || session?.email || "COMMS"}
        sourceRoute="/portal/messages"
        rationale="Customer and team communications must stay on governed FCA comms surfaces."
        nextAction="Send the next customer update on the active channel."
        actionHref="/portal/notifications"
        actionLabel="Open notifications"
      />
      <PortalApiStatusBanner
        status={messagesLoad.status}
        error={messagesLoad.error}
        onRetry={messagesLoad.reload}
        label="messages"
      />
      {sendError ? (
        <PortalEmptyState title="Send failed" detail={sendError} />
      ) : null}
      <CustomerCommsLaunchpad session={session} title="Launch customer-enabled communications lanes" />

      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded communications experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
          Send branded customer communications and preserve message continuity across channels. Ask Auricrux for the next communication move.
        </p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {messagesLoad.backingSource || state.meta.backingSource}</div>
          <div><strong>Channel focus:</strong> {activeChannel ? activeChannel.toUpperCase() : "All channels"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Compose message</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Channel</div>
            <select value={drafts.channel} onChange={(event) => updateDraft("channel", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }}>
              <option value="email">Email</option>
              <option value="chat">Chat</option>
              <option value="sms">SMS</option>
              <option value="phone">Phone</option>
              <option value="teams">Teams</option>
              <option value="conference">Conference</option>
              <option value="lecture">Lecture</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Subject</div>
            <input value={drafts.subject} onChange={(event) => updateDraft("subject", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Kickoff schedule confirmed" />
          </label>
        </div>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Message</div>
          <textarea value={drafts.message} onChange={(event) => updateDraft("message", event.target.value)} style={{ width: "100%", minHeight: 96, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Write the next branded customer update" />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={sendMessage} disabled={messagesLoad.status !== "ready"} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer", opacity: messagesLoad.status === "ready" ? 1 : 0.6 }}>Send Customer Update</button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Sent communications</h2>
        {sentItems.length === 0 && messagesLoad.isLive ? (
          <PortalEmptyState title="No messages yet" detail="Compose your first customer update above." />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sentItems.map((message) => (
              <div key={message.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{message.subject}</strong>
                  <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{(message.channel || "email").toUpperCase()}</span>
                </div>
                <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{message.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filteredMessages.length > 0 ? (
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Live communication stream</h2>
          {filteredMessages.map((message) => (
            <div key={`${message.from}-${message.subject}`} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 700 }}>{message.from}</div>
                <div style={{ fontSize: 12, color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{message.priority}</div>
              </div>
              <div style={{ color: "#111827", marginTop: 4, fontWeight: 700 }}>{message.subject}</div>
              <div style={{ color: "#4b5563", marginTop: 4 }}>{message.preview}</div>
            </div>
          ))}
        </div>
      ) : null}
    </PortalShell>
  );
}
