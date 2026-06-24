import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import EmbeddedStripeCheckout from "../../components/EmbeddedStripeCheckout";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { deliverPortalInvoice, fetchInvoiceSummary } from "../../api/portalClient";
import { createInvoiceCheckout } from "../../api/stripeClient";
import { routeStateOverlays } from "../../systemState";
import { portalButtonPrimary, portalButtonSecondary } from "../../portalDesignTokens";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function PortalInvoiceDetail({ routeParams = {} }) {
  const invoiceId = routeParams.invoiceId;
  const { state } = useWorkspaceState();
  const { session } = useCustomerSession();
  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";

  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentStep, setPaymentStep] = useState("detail");
  const [embeddedSession, setEmbeddedSession] = useState(null);

  useEffect(() => {
    if (!invoiceId) return;
    setLoadError("");
    fetchInvoiceSummary(invoiceId, { companyName })
      .then((payload) => setSummary(payload.summary))
      .catch((error) => setLoadError(error.message || "Unable to load invoice."));
  }, [invoiceId, companyName]);

  async function sendInvoice() {
    setBusy(true);
    setDeliveryMessage("");
    try {
      const payload = await deliverPortalInvoice(invoiceId, {
        companyName,
        recipientEmail: session?.email,
      });
      const email = payload.recipientEmail || session?.email || "customer";
      if (payload.delivered) {
        setDeliveryMessage(`Email sent to ${email}`);
        setMailtoUrl("");
      } else {
        setDeliveryMessage("Saved to portal messages (email pending setup)");
        setMailtoUrl(payload.mailtoUrl || "");
      }
    } catch (error) {
      setDeliveryMessage(error.message || "Delivery failed.");
    } finally {
      setBusy(false);
    }
  }

  async function startInvoicePayment() {
    if (!invoiceId) return;
    setBusy(true);
    setPaymentMessage("");
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const payload = await createInvoiceCheckout(invoiceId, {
        customerEmail: session?.email,
        successUrl: `${origin}/portal/billing/${encodeURIComponent(invoiceId)}?payment=success`,
        cancelUrl: `${origin}/portal/billing/${encodeURIComponent(invoiceId)}?payment=cancelled`,
        returnUrl: `${origin}/portal/billing/${encodeURIComponent(invoiceId)}?payment=success`,
        uiMode: "embedded",
      });
      if (payload?.clientSecret) {
        setEmbeddedSession(payload);
        setPaymentStep("pay");
        setPaymentMessage("Complete payment in FCA's secure checkout.");
        return;
      }
      if (payload?.checkoutUrl) {
        window.location.assign(payload.checkoutUrl);
        return;
      }
      throw new Error("Stripe checkout is not available for this invoice.");
    } catch (error) {
      setPaymentMessage(error.message || "Unable to start payment.");
    } finally {
      setBusy(false);
    }
  }

  function printInvoice() {
    if (!summary?.html) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(summary.html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <PortalShell
      title={`Invoice ${invoiceId || ""}`}
      subtitle="Printable invoice view, customer delivery, and in-house payment."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Back to Billing"
    >
      {loadError ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="warning" title="Invoice unavailable">
            {loadError}
          </PortalAlert>
        </div>
      ) : null}

      {paymentStep === "pay" && embeddedSession?.clientSecret ? (
        <div style={{ ...cardStyle, marginBottom: 18 }}>
          <h2 style={{ marginTop: 0 }}>Pay invoice</h2>
          {paymentMessage ? <PortalAlert tone="info">{paymentMessage}</PortalAlert> : null}
          <EmbeddedStripeCheckout
            clientSecret={embeddedSession.clientSecret}
            publishableKey={embeddedSession.publishableKey}
            onBack={() => {
              setPaymentStep("detail");
              setEmbeddedSession(null);
            }}
          />
        </div>
      ) : null}

      {summary && paymentStep !== "pay" ? (
        <>
          <div style={{ ...cardStyle, marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <div style={{ color: "#1d4ed8", fontWeight: 700 }}>{companyName}</div>
                <h2 style={{ margin: "8px 0" }}>{summary.invoiceName}</h2>
                <div style={{ color: "#475569" }}>Status: {summary.status}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.amount}</div>
            </div>
            <p style={{ color: "#334155", lineHeight: 1.7 }}>{summary.note || "No additional note."}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
              <button type="button" onClick={printInvoice} style={portalButtonSecondary}>
                Print / Save PDF
              </button>
              {summary.status === "Issued" ? (
                <button type="button" onClick={startInvoicePayment} disabled={busy} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
                  {busy ? "Starting payment..." : "Pay with FCA Checkout"}
                </button>
              ) : null}
              {summary.status === "Issued" || summary.status === "Paid" ? (
                <button type="button" onClick={sendInvoice} disabled={busy} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
                  {busy ? "Sending..." : "Send Invoice"}
                </button>
              ) : null}
            </div>
            {deliveryMessage ? <div style={{ marginTop: 12, color: "#15803d" }}>{deliveryMessage}</div> : null}
            {paymentMessage && paymentStep !== "pay" ? <div style={{ marginTop: 12, color: "#b45309" }}>{paymentMessage}</div> : null}
            {mailtoUrl ? (
              <a href={mailtoUrl} style={{ display: "inline-block", marginTop: 10, color: "#2563eb", fontWeight: 700 }}>
                Open email draft with invoice summary
              </a>
            ) : null}
          </div>

          {summary.html ? (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>Preview</h3>
              <iframe title="Invoice preview" srcDoc={summary.html} style={{ width: "100%", minHeight: 420, border: "1px solid #e2e8f0", borderRadius: 12 }} />
            </div>
          ) : null}
        </>
      ) : !loadError && paymentStep !== "pay" ? (
        <div style={cardStyle}>Loading invoice...</div>
      ) : null}
    </PortalShell>
  );
}
