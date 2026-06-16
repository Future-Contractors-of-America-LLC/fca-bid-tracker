import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const BILLING_COMMAND_KEY = "fca_customer_billing_command_v2";
const PAY_APP_QUEUE_KEY = "fca_customer_pay_app_queue_v1";
const RETENTION_RELEASE_QUEUE_KEY = "fca_customer_retention_release_queue_v1";

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

export default function PortalBilling() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [billingState, setBillingState] = useState(() => readLocalJson(BILLING_COMMAND_KEY, { invoiceName: "", amount: "", note: "", invoices: [] }));
  const [payAppState, setPayAppState] = useState(() => readLocalJson(PAY_APP_QUEUE_KEY, { items: [] }));
  const [retentionState, setRetentionState] = useState(() => readLocalJson(RETENTION_RELEASE_QUEUE_KEY, { items: [] }));
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";

  useEffect(() => {
    refreshSyncStamp("Persisted billing continuity state active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(BILLING_COMMAND_KEY, billingState);
  }, [billingState]);

  useEffect(() => {
    writeLocalJson(PAY_APP_QUEUE_KEY, payAppState);
  }, [payAppState]);

  useEffect(() => {
    writeLocalJson(RETENTION_RELEASE_QUEUE_KEY, retentionState);
  }, [retentionState]);

  function updateField(key, value) {
    setBillingState((current) => ({ ...current, [key]: value }));
  }

  function createInvoice() {
    if (!billingState.invoiceName.trim() || !billingState.amount.trim()) return;
    setBillingState((current) => ({
      ...current,
      invoices: [{
        id: `invoice-${Date.now()}`,
        invoiceName: current.invoiceName,
        amount: current.amount,
        note: current.note,
        status: "Draft",
      }, ...(current.invoices || [])],
      invoiceName: "",
      amount: "",
      note: "",
    }));
    refreshSyncStamp("Customer billing command invoice created");
  }

  function issueInvoice(invoiceId) {
    setBillingState((current) => ({
      ...current,
      invoices: current.invoices.map((invoice) => invoice.id === invoiceId ? { ...invoice, status: "Issued" } : invoice),
    }));
    refreshSyncStamp("Customer billing command invoice issued");
  }

  function submitPayApp(itemId) {
    setPayAppState((current) => ({
      ...current,
      items: current.items.map((item) => item.id === itemId ? { ...item, status: "Submitted", nextAction: "Await owner approval" } : item),
    }));
    refreshSyncStamp("Customer pay application submitted");
  }

  function releaseRetention(itemId) {
    setRetentionState((current) => ({
      ...current,
      items: current.items.map((item) => item.id === itemId ? { ...item, status: "Released", nextAction: "Confirm final billing closeout" } : item),
    }));
    refreshSyncStamp("Retention release review completed");
  }

  return (
    <PortalShell
      title={`${companyName} Billing and Revenue Command`}
      subtitle="A branded billing workspace where customers can stage invoices, manage pay applications, release retention, and keep Auricrux attached to commercial follow-through."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/support"
      primaryLabel="Open Support"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded billing experience</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>
          {companyName} can now stage invoices, manage pay applications, release retention, and keep customer-ready billing continuity visible inside the branded workspace.
        </p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Workspace state source:</strong> {state.meta.backingSource}</div>
          <div><strong>Authenticated customer:</strong> {state.meta.authenticatedCustomer || "Continuity shell visitor"}</div>
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
          <div><strong>Selected plan:</strong> {session?.selectedPlan || "enterprise"}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Billing and revenue command</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice name</div>
            <input value={billingState.invoiceName} onChange={(event) => updateField("invoiceName", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Initial mobilization invoice" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Amount</div>
            <input value={billingState.amount} onChange={(event) => updateField("amount", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="$18,500" />
          </label>
        </div>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice note</div>
          <textarea value={billingState.note} onChange={(event) => updateField("note", event.target.value)} style={{ width: "100%", minHeight: 96, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Explain what this invoice covers and what customer milestone it supports" />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={createInvoice} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Create Invoice</button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Invoice board</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {(billingState.invoices || []).map((invoice) => (
            <div key={invoice.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: invoice.status === "Issued" ? "#f0fdf4" : "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{invoice.invoiceName}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{invoice.amount}</span>
              </div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{invoice.note}</div>
              <div style={{ color: "#0f172a", marginTop: 8 }}><strong>Status:</strong> {invoice.status}</div>
              {invoice.status !== "Issued" ? <button type="button" onClick={() => issueInvoice(invoice.id)} style={{ marginTop: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Issue Invoice</button> : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Pay application queue</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Customers can immediately use this queue to manage pay application readiness and submission sequencing in the same billing command.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {(payAppState.items || []).map((item) => (
            <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: item.status === "Submitted" ? "#f0fdf4" : "#eff6ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{item.period}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{item.amount}</span>
              </div>
              <div style={{ color: "#0f172a", marginTop: 8 }}><strong>Status:</strong> {item.status}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Next action:</strong> {item.nextAction}</div>
              {item.status !== "Submitted" ? <button type="button" onClick={() => submitPayApp(item.id)} style={{ marginTop: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Submit Pay App</button> : null}
            </div>
          ))}
          {!payAppState.items?.length ? <div style={{ color: "#64748b" }}>No staged pay applications yet.</div> : null}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Retention release queue</h2>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>Customers can immediately use this queue to preserve retention-release review and final commercial closeout in the same billing command.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {(retentionState.items || []).map((item) => (
            <div key={item.id} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 14, background: item.status === "Released" ? "#f0fdf4" : "#eff6ff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{item.projectId}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{item.amount}</span>
              </div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{item.condition}</div>
              <div style={{ color: "#0f172a", marginTop: 8 }}><strong>Status:</strong> {item.status}</div>
              <div style={{ color: "#475569", marginTop: 6 }}><strong>Next action:</strong> {item.nextAction}</div>
              {item.status !== "Released" ? <button type="button" onClick={() => releaseRetention(item.id)} style={{ marginTop: 10, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>Release Retention</button> : null}
            </div>
          ))}
          {!retentionState.items?.length ? <div style={{ color: "#64748b" }}>No staged retention release reviews yet.</div> : null}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Billing Command</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains invoice posture, pay-app readiness, retention-release state, and revenue continuity</li>
          <li>Recommends the next customer billing and follow-through action</li>
          <li>Executes invoice staging, issuance, pay-app submission, and retention-release signaling</li>
        </ul>
      </div>
    </PortalShell>
  );
}
