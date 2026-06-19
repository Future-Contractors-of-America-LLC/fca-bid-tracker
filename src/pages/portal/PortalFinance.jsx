import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { fetchBillingSummary, fetchPortalInvoices } from "../../api/portalClient";
import { createInvoiceCheckout, createBillingPortalSession } from "../../api/stripeClient";
import { routeStateOverlays } from "../../systemState";
import useCustomerSession from "../../hooks/useCustomerSession";

const cardStyle = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalFinance() {
  const { refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    refreshSyncStamp("Finance workspace active");
    setLoadError("");
    Promise.all([
      fetchPortalInvoices(),
      fetchBillingSummary().catch(() => null),
    ])
      .then(([inv, sum]) => {
        setInvoices(inv?.items || []);
        if (sum) setSummary(sum);
      })
      .catch((error) => {
        setLoadError(error.message || "Unable to load finance data.");
      });
  }, [refreshSyncStamp]);

  async function payInvoice(invoiceId) {
    setActionError("");
    setBusyId(invoiceId);
    try {
      const checkout = await createInvoiceCheckout(invoiceId, {
        successUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/finance?payment=success` : undefined,
        cancelUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/finance?payment=cancelled` : undefined,
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

  async function openBillingPortal() {
    setActionError("");
    setBusyId("portal");
    try {
      const portal = await createBillingPortalSession({
        customerEmail: session?.email,
        returnUrl: typeof window !== "undefined" ? `${window.location.origin}/portal/finance` : undefined,
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

  const outstanding = invoices.filter((invoice) => invoice.status !== "Paid");

  return (
    <PortalShell
      title="Finance and Revenue"
      subtitle="Track invoices, payment status, and billing milestones for active jobs."
      activeHref="/portal/finance"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Open billing"
    >
      {loadError ? (
        <div style={{ ...cardStyle, marginBottom: 20, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
          {loadError}
        </div>
      ) : null}
      {actionError ? (
        <div style={{ ...cardStyle, marginBottom: 20, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>
          {actionError}
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Outstanding invoices</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{outstanding.length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Paid invoices</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{invoices.filter((invoice) => invoice.status === "Paid").length}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#64748b", fontSize: 13 }}>Billing records</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{summary?.count ?? invoices.length}</div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Subscription and payment methods</div>
        <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
          Update cards, view invoices, and manage your Stripe subscription from the customer portal.
        </div>
        <button type="button" onClick={openBillingPortal} disabled={busyId === "portal"} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 8, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
          {busyId === "portal" ? "Opening portal..." : "Manage billing"}
        </button>
      </div>

      <h2 style={{ fontSize: 18 }}>Invoices</h2>
      <div style={{ display: "grid", gap: 12 }}>
        {invoices.length === 0 ? (
          <div style={cardStyle}>No invoices yet. Stage invoices from Billing or project milestones.</div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} style={cardStyle}>
              <strong>{inv.invoiceName || inv.id}</strong>
              <div style={{ color: "#475569", marginTop: 6 }}>{inv.amount} ù {inv.status || "Draft"}</div>
              {inv.note ? <div style={{ color: "#64748b", marginTop: 6 }}>{inv.note}</div> : null}
              {inv.status === "Issued" ? (
                <button type="button" onClick={() => payInvoice(inv.id)} disabled={busyId === inv.id} style={{ marginTop: 10, border: "1px solid #16a34a", background: "#16a34a", color: "#fff", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}>
                  {busyId === inv.id ? "Opening Stripeù" : "Pay via Stripe"}
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </PortalShell>
  );
}
