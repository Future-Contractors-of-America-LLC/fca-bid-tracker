import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const SUPPORT_COMMAND_KEY = "fca_customer_support_command_v3";

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

export default function PortalSupport() {
  const { session } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [supportState, setSupportState] = useState(() => readLocalJson(SUPPORT_COMMAND_KEY, { subject: "", priority: "normal", detail: "", tickets: [] }));
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  useEffect(() => {
    refreshSyncStamp("Persisted support continuity state active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(SUPPORT_COMMAND_KEY, supportState);
  }, [supportState]);

  function updateField(key, value) {
    setSupportState((current) => ({ ...current, [key]: value }));
  }

  function createTicket() {
    if (!supportState.subject.trim() || !supportState.detail.trim()) return;
    setSupportState((current) => ({
      ...current,
      tickets: [{
        id: `ticket-${Date.now()}`,
        subject: current.subject,
        priority: current.priority,
        detail: current.detail,
        status: "Open",
      }, ...(current.tickets || [])],
      subject: "",
      detail: "",
      priority: "normal",
    }));
    refreshSyncStamp("Customer support request created");
  }

  function resolveTicket(ticketId) {
    setSupportState((current) => ({
      ...current,
      tickets: current.tickets.map((ticket) => ticket.id === ticketId ? { ...ticket, status: "Resolved" } : ticket),
    }));
    refreshSyncStamp("Support ticket resolved");
  }

  return (
    <PortalShell
      title={`${companyName} Support and Service Request Command`}
      subtitle="A branded support workspace where customers can open real service requests, keep recovery tied to active work, and let Auricrux guide the next support move."
      activeHref="/portal/support"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.support}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded support experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
          {companyName} can now open service requests, preserve support continuity, and keep customer-facing recovery visible inside the branded workspace.
        </p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Workspace state source:</strong> {state.meta.backingSource}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
          <div><strong>Selected plan:</strong> {session?.selectedPlan || "enterprise"}</div>
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Support and service request command</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Subject</div>
            <input value={supportState.subject} onChange={(event) => updateField("subject", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Permit review blocked" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Priority</div>
            <select value={supportState.priority} onChange={(event) => updateField("priority", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
        </div>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Support request detail</div>
          <textarea value={supportState.detail} onChange={(event) => updateField("detail", event.target.value)} style={{ width: "100%", minHeight: 96, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Describe the customer issue, blocker, or service request" />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={createTicket} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Create Support Request</button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Support request board</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {(supportState.tickets || []).map((ticket) => (
            <div key={ticket.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: ticket.status === "Resolved" ? "#f0fdf4" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{ticket.subject}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{ticket.priority.toUpperCase()}</span>
              </div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{ticket.detail}</div>
              <div style={{ color: "#0f172a", marginTop: 8 }}><strong>Status:</strong> {ticket.status}</div>
              {ticket.status !== "Resolved" ? <button type="button" onClick={() => resolveTicket(ticket.id)} style={{ marginTop: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Resolve Ticket</button> : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Support Command</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains the customer issue, blocker, and recovery posture</li>
          <li>Recommends the next support, file, project, or communication action</li>
          <li>Executes support request creation and resolution signaling</li>
        </ul>
      </div>
    </PortalShell>
  );
}
