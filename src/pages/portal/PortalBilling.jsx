import { useEffect, useState } from "react";
import PortalShell from "./PortalShell";
import useWorkspaceState from "../hooks/useWorkspaceState";
import useCustomerSession from "../hooks/useCustomerSession";
import {
  createPortalInvoice,
  deliverPortalInvoice,
  fetchBillingSummary,
  fetchPortalInvoices,
  issuePortalInvoice,
} from "../api/portalClient";
import { createInvoiceCheckout, createBillingPortalSession } from "../api/stripeClient";
import { routeStateOverlays } from "../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function statusStyle(status) {
  if (status === "Paid") return { background: "#ecfdf5", border: "1px solid #86efac" };
  if (status === "Issued") return { background: "#f0fdf4", border: "1px solid #bbf7d0" };
  return { background: "#fff", border: "1px solid #e5e7eb" };
}

export default function PortalBilling() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const companyName = state?.tenant?.name || session?.company || brandSkin.companyName || "Customer Workspace";

  const [draft, setDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [invoices, setInvoices] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [apiBacking, setApiBacking] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);

  async function reloadInvoices() {
    const [invoicesPayload, summaryPayload] = await Promise.all([
      fetchPortalInvoices(),
      fetchBillingSummary().catch(() => null),
    ]);
    setInvoices(invoicesPayload.items || []);
    setApiBacking(invoicesPayload.backingSource || "auricrux-central-portal-store");
    if (summaryPayload) setBillingSummary(summaryPayload);
    return invoicesPayload;
  }

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    reloadInvoices()
      .then(() => {
        if (!active) return;
        refreshSyncStamp("Portal billing synced from Auricrux-Central");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error.message || "Unable to load billing data.");
        setApiBacking("unavailable");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshSyncStamp]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("payment") === "success") {
      reloadInvoices().catch(() => null);
    }
  }, []);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function createInvoice() {
    if (!draft.invoiceName.trim() || !draft.amount.trim()) return;
    setActionError("");
    setBusyId("create");
    try {
      await createPortalInvoice({
        invoiceName: draft.invoiceName,
        amount: draft.amount,
        note: draft.note,
      });
      await reloadInvoices();
      setDraft({ invoiceName: "", amount: "", note: "" });
      refreshSyncStamp("Invoice created via Auricrux-Central");
    } catch (error) {
      setActionError(error.message || "Unable to create invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function issueInvoice(invoiceId) {
    setActionError("");
    setBusyId(invoiceId);
    try {
      await issuePortalInvoice(invoiceId);
      await reloadInvoices();
      refreshSyncStamp("Invoice issued via Auricrux-Central");
    } catch (error) {
      setActionError(error.message || "Unable to issue invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function deliverInvoice(invoiceId) {
    setActionError("");
    setBusyId(`deliver-${invoiceId}`);
    try {
      const payload = await deliverPortalInvoice(invoiceId, {
        companyName,
        recipientEmail: session?.email,
      });
      if (payload.mailtoUrl && typeof window !== "undefined") {
        window.open(payload.mailtoUrl, "_blank");
      }
      refreshSyncStamp("Invoice delivered via customer messages");
    } catch (error) {
      setActionError(error.message || "Unable to deliver invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function openBillingPortal() {
    setActionError("");
    setBusyId("portal");
    try {
      const portal = await createBillingPortalSession({
        customerEmail: session?.email,
        returnUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/billing` : undefined,
      });
      if (portal.portalUrl) {
        window.location.href = portal.portalUrl;
        return;
      }
      throw new Error("Stripe billing portal URL was not returned.");
    } catch (error) {
      setActionError(error.message || "Unable to open billing portal.");
      setBusyId("");
    }
  }

  async function payInvoice(invoiceId) {
    setActionError("");
    setBusyId(`pay-${invoiceId}`);
    try {
      const checkout = await createInvoiceCheckout(invoiceId, {
        customerEmail: session?.email,
        successUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/billing?payment=success` : undefined,
        cancelUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/billing?payment=cancelled` : undefined,
      });
      if (checkout.checkoutUrl) {
        window.location.href = checkout.checkoutUrl;
        return;
      }
      throw new Error("Stripe checkout URL was not returned.");
    } catch (error) {
      setActionError(error.message || "Unable to start Stripe checkout.");
      setBusyId("");
    }
  }

  return (
    <PortalShell
      title={`${companyName} Billing`}
      subtitle="Create invoices, issue them to customers, and collect payment through Stripe."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/finance"
      primaryLabel="Open Finance"
    >
      <div style={{ ...cardStyle, marginBottom: 24, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Billing workspace</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Data source:</strong> {apiBacking}</div>
          {billingSummary?.count != null ? <div><strong>Construction billing records:</strong> {billingSummary.count}</div> : null}
          <div><strong>Account:</strong> {session?.email || "Not signed in"}</div>
          <div><strong>Plan:</strong> {session?.selectedPlan || "startup"}</div>
        </div>
        <button type="button" onClick={openBillingPortal} disabled={busyId === "portal"} style={{ marginTop: 14, border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
          {busyId === "portal" ? "Opening portal..." : "Manage billing"}
        </button>
      </div>

      {loadError ? (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
          <strong>Unable to load billing data.</strong> {loadError}
        </div>
      ) : null}

      {actionError ? (
        <div style={{ ...cardStyle, marginBottom: 24, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
          {actionError}
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Create invoice</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice name</div>
            <input value={draft.invoiceName} onChange={(event) => updateField("invoiceName", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Initial mobilization invoice" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Amount</div>
            <input value={draft.amount} onChange={(event) => updateField("amount", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="$18,500" />
          </label>
        </div>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice note</div>
          <textarea value={draft.note} onChange={(event) => updateField("note", event.target.value)} style={{ width: "100%", minHeight: 96, padding: "12px 14px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="What this invoice covers" />
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          <button type="button" onClick={createInvoice} disabled={busyId === "create"} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
            {busyId === "create" ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <h2 style={{ marginTop: 0 }}>Invoice board</h2>
        {loading ? <div style={{ color: "#64748b" }}>Loading invoices...</div> : null}
        {!loading && invoices.length === 0 ? (
          <div style={{ color: "#64748b" }}>No invoices yet. Create one above to start the billing flow.</div>
        ) : null}
        <div style={{ display: "grid", gap: 12 }}>
          {invoices.map((invoice) => (
            <div key={invoice.id} style={{ ...statusStyle(invoice.status), borderRadius: 12, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{invoice.invoiceName}</strong>
                <span style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700 }}>{invoice.amount}</span>
              </div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginTop: 8 }}>{invoice.note}</div>
              <div style={{ color: "#0f172a", marginTop: 8 }}><strong>Status:</strong> {invoice.status}</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                {invoice.status === "Draft" ? (
                  <button type="button" onClick={() => issueInvoice(invoice.id)} disabled={busyId === invoice.id} style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                    {busyId === invoice.id ? "Issuing..." : "Issue Invoice"}
                  </button>
                ) : null}
                {invoice.status === "Issued" ? (
                  <>
                    <button type="button" onClick={() => deliverInvoice(invoice.id)} disabled={busyId === `deliver-${invoice.id}`} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                      {busyId === `deliver-${invoice.id}` ? "Sending..." : "Send Invoice"}
                    </button>
                    <a href={`/portal/billing/${invoice.id}`} style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}>View / Print</a>
                    <button type="button" onClick={() => payInvoice(invoice.id)} disabled={busyId === `pay-${invoice.id}`} style={{ border: "1px solid #16a34a", background: "#16a34a", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                      {busyId === `pay-${invoice.id}` ? "Opening Stripe..." : "Pay via Stripe"}
                    </button>
                  </>
                ) : null}
                {invoice.status === "Paid" ? (
                  <a href={`/portal/billing/${invoice.id}`} style={{ border: "1px solid #cbd5e1", background: "#fff", color: "#0f172a", borderRadius: 10, padding: "10px 14px", fontWeight: 700, textDecoration: "none" }}>View receipt</a>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
