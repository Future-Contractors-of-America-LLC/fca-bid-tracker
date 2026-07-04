import { useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import {
  createSupportTicket,
  fetchSupportTickets,
  resolveSupportTicket,
} from "../../api/portalClient";
import { PortalAlert, PortalEmptyState } from "../../components/portal/PortalPrimitives";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";

function readBrandSkin() {
  if (typeof window === "undefined") return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  try {
    return JSON.parse(window.localStorage.getItem(BRAND_STORAGE_KEY) || "{}") || {};
  } catch {
    return { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" };
  }
}

export default function PortalSupport() {
  const { session } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const brandSkin = readBrandSkin();
  const [form, setForm] = useState({ subject: "", priority: "normal", detail: "" });
  const [actionError, setActionError] = useState("");
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  const ticketsLoad = usePortalApiLoad(() => fetchSupportTickets(), []);
  const tickets = ticketsLoad.data?.items || [];
  const apiBacking = ticketsLoad.backingSource || state.meta.backingSource;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function createTicket() {
    if (!form.subject.trim() || !form.detail.trim()) return;
    setActionError("");
    createSupportTicket({
      subject: form.subject,
      priority: form.priority,
      detail: form.detail,
    })
      .then(() => ticketsLoad.reload())
      .then(() => {
        setForm({ subject: "", priority: "normal", detail: "" });
        refreshSyncStamp("Support ticket created.");
      })
      .catch((err) => setActionError(err?.message || "Unable to create ticket."));
  }

  function resolveTicket(ticketId) {
    setActionError("");
    resolveSupportTicket(ticketId)
      .then(() => ticketsLoad.reload())
      .then(() => refreshSyncStamp("Support ticket resolved."))
      .catch((err) => setActionError(err?.message || "Unable to resolve ticket."));
  }

  return (
    <PortalShell
      title={`${companyName} Support`}
      subtitle="Open tickets, track resolution, and keep Auricrux in the loop."
      activeHref="/portal/support"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.support}
      primaryHref="/portal/messages"
      primaryLabel="Open Messages"
    >
      <PortalSliceAuricrux
        title="Auricrux Support Intelligence"
        targetObjectType="SupportTicket"
        targetObjectId={session?.customerId || "SUPPORT"}
        sourceRoute="/portal/support"
        rationale="Support continuity must stay tied to the active project and customer workspace."
        nextAction="Open a ticket when revenue or delivery is blocked."
        actionHref="/portal/auricrux"
        actionLabel="Open Auricrux hub"
      />
      <PortalApiStatusBanner
        status={ticketsLoad.status}
        error={ticketsLoad.error}
        onRetry={ticketsLoad.reload}
        label="support tickets"
      />
      {apiBacking === "local-fallback" ? (
        <PortalAlert tone="warning" title="Workspace continuity mode">
          Support is currently running in local-fallback mode. Continue triage while live API connectivity restores.
        </PortalAlert>
      ) : null}
      {actionError ? <PortalEmptyState title="Action failed" detail={actionError} /> : null}

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create support ticket</h2>
        <div style={{ display: "grid", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Subject</div>
            <input value={form.subject} onChange={(e) => updateField("subject", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Priority</div>
            <select value={form.priority} onChange={(e) => updateField("priority", e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Detail</div>
            <textarea value={form.detail} onChange={(e) => updateField("detail", e.target.value)} style={{ width: "100%", minHeight: 96, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
          </label>
          <button type="button" onClick={createTicket} disabled={ticketsLoad.status !== "ready"} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer", width: "fit-content" }}>
            Submit ticket
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ marginTop: 0 }}>Open tickets</h2>
        {tickets.length === 0 && ticketsLoad.isLive ? (
          <PortalEmptyState title="No open tickets" detail="Create a ticket when you need help from the FCA team." />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {tickets.map((ticket) => (
              <div key={ticket.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{ticket.subject}</strong>
                  <span style={{ fontWeight: 700, color: ticket.status === "Resolved" ? "#16a34a" : "#d97706" }}>{ticket.status || "Open"}</span>
                </div>
                <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{ticket.detail}</div>
                {ticket.status !== "Resolved" ? (
                  <button type="button" onClick={() => resolveTicket(ticket.id)} style={{ marginTop: 10, border: "1px solid #cbd5e1", background: "#fff", borderRadius: 8, padding: "8px 12px", cursor: "pointer", fontWeight: 600 }}>
                    Mark resolved
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
