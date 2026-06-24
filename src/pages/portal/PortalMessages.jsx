import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import {
  fetchPortalMessages,
  sendPortalMessage,
} from "../../api/portalClient";
import { drainCommsQueue, enqueueTransactionalEmail } from "../../api/commsClient";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import { auricruxCommsChannels, portalMessages, routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const MESSAGE_COMMAND_KEY = "fca_customer_message_command_v1";

const channelMap = {
  chat: ["Chat"],
  sms: ["SMS"],
  phone: ["Phone"],
  email: ["Email"],
  teams: ["Teams"],
  conference: ["Conference"],
  lecture: ["Lecture"],
};

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
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
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [drafts, setDrafts] = useState(() => readLocalJson(MESSAGE_COMMAND_KEY, { subject: "", message: "", channel: "email", sent: [] }));

  const [apiBacking, setApiBacking] = useState("local-fallback");

  useEffect(() => {
    let active = true;
    fetchPortalMessages()
      .then((payload) => {
        if (!active || !payload?.items?.length) return;
        setApiBacking(payload.backingSource || "auricrux-central-portal-store");
        setDrafts((current) => ({
          ...current,
          sent: payload.items.map((item) => ({
            id: item.id,
            subject: item.subject,
            message: item.message,
            channel: item.channel || "email",
          })),
        }));
        refreshSyncStamp("Messages synced");
      })
      .catch(() => {
        if (active) setApiBacking("local-fallback");
      });
    return () => {
      active = false;
    };
  }, [refreshSyncStamp]);

  useEffect(() => {
    function syncChannel() {
      setActiveChannel(readActiveChannel());
    }
    window.addEventListener("hashchange", syncChannel);
    return () => window.removeEventListener("hashchange", syncChannel);
  }, []);

  useEffect(() => {
    writeLocalJson(MESSAGE_COMMAND_KEY, drafts);
  }, [drafts]);

  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const filteredMessages = useMemo(() => {
    if (apiBacking !== "local-fallback" && (drafts.sent || []).length) {
      return (drafts.sent || []).map((message) => ({
        from: companyName,
        subject: message.subject,
        preview: message.message,
        channel: message.channel,
        priority: "Sent",
        nextAction: "Await customer or internal response",
      }));
    }
    if (!activeChannel || !channelMap[activeChannel]) {
      return portalMessages.map((message) => ({ ...message, priority: `${message.priority} · Sample` }));
    }
    return portalMessages
      .filter((message) => channelMap[activeChannel].includes(message.channel))
      .map((message) => ({ ...message, priority: `${message.priority} · Sample` }));
  }, [activeChannel, apiBacking, companyName, drafts.sent]);

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
      .then(() => fetchPortalMessages())
      .then((result) => {
        setApiBacking(result?.backingSource || "auricrux-central-portal-store");
        setDrafts((current) => ({
          ...current,
          sent: (result?.items || []).map((item) => ({
            id: item.id,
            subject: item.subject,
            message: item.message,
            channel: item.channel || "email",
          })),
          subject: "",
          message: "",
        }));
        refreshSyncStamp(`Customer communication sent through ${payload.channel}.`);
      })
      .catch(() => {
        setDrafts((current) => ({
          ...current,
          sent: [{
            id: `msg-${Date.now()}`,
            subject: current.subject,
            message: current.message,
            channel: current.channel,
          }, ...(current.sent || [])],
          subject: "",
          message: "",
        }));
        refreshSyncStamp(`Customer communication sent through ${drafts.channel}.`);
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
      {apiBacking === "local-fallback" ? (
        <PortalAlert tone="warning">
          Messages are temporarily offline. Drafts are saved on this device until sync returns.
        </PortalAlert>
      ) : null}
      <CustomerCommsLaunchpad session={session} title="Launch customer-enabled communications lanes" />

      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded communications experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
          {companyName} can now send branded customer communications, preserve message continuity across channels, and let Auricrux explain, recommend, and execute the next communication move.
        </p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Source:</strong> {apiBacking || state.meta.backingSource}</div>
          <div><strong>Status:</strong> {state.meta.persistenceState}</div>
          <div><strong>Channel focus:</strong> {activeChannel ? activeChannel.toUpperCase() : "All channels"}</div>
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
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
          <button type="button" onClick={sendMessage} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Send Customer Update</button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Sent communications</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {(drafts.sent || []).map((message) => (
            <div key={message.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{message.subject}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{message.channel.toUpperCase()}</span>
              </div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{message.message}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>{apiBacking !== "local-fallback" && (drafts.sent || []).length ? "Live communication stream" : "Sample communication stream"}</h2>
        {filteredMessages.map((message) => (
          <div key={`${message.from}-${message.subject}`} style={{ padding: "12px 0", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontWeight: 700 }}>{message.from}</div>
              <div style={{ fontSize: 12, color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{message.priority}</div>
            </div>
            <div style={{ color: "#111827", marginTop: 4, fontWeight: 700 }}>{message.subject}</div>
            <div style={{ color: "#4b5563", marginTop: 4 }}>{message.preview}</div>
            <div style={{ color: "#0f172a", lineHeight: 1.6, marginTop: 8 }}>
              <div><strong>Channel:</strong> {message.channel}</div>
              <div><strong>Next action:</strong> {message.nextAction}</div>
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
