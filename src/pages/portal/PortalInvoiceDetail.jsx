import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import FcaNativeCheckoutPanel from "../../components/FcaNativeCheckoutPanel";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { deliverPortalInvoice, fetchInvoiceSummary } from "../../api/portalClient";
import { createFcaPaymentIntake, submitFcaNativeCheckout } from "../../api/fcaPaymentClient";
import { routeStateOverlays } from "../../systemState";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle } from "../../portalDesignTokens";

export default function PortalInvoiceDetail({ routeParams = {} }) {
  const invoiceId = routeParams.invoiceId;
  const { state } = useWorkspaceState();
  const { session } = useCustomerSession();
  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";

  const [summary, setSummary] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentIntake, setPaymentIntake] = useState(null);

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
    setPaymentError("");
    setPaymentMessage("");
    try {
      const payload = await createFcaPaymentIntake({
        invoiceId,
        email: session?.email,
        company: companyName,
      });
      setPaymentIntake(payload);
      setPaymentMessage("Complete payment in FCA Books — no external processor required.");
    } catch (error) {
      setPaymentError(error.message || "Unable to start FCA native payment.");
    } finally {
      setBusy(false);
    }
  }

  async function completeInvoicePayment(body) {
    setBusy(true);
    setPaymentError("");
    setPaymentMessage("Recording payment in FCA Books...");
    try {
      await submitFcaNativeCheckout(body);
      setPaymentIntake(null);
      setPaymentMessage("Payment recorded in FCA Books.");
      const refreshed = await fetchInvoiceSummary(invoiceId, { companyName });
      setSummary(refreshed.summary);
    } catch (error) {
      setPaymentError(error.message || "Unable to record payment.");
      setPaymentMessage("");
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
      subtitle="Printable invoice view, customer delivery, and FCA native payment."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Back to Billing"
    >
      <PortalSliceAuricrux
        title="Auricrux Invoice Intelligence"
        targetObjectType="Invoice"
        targetObjectId={invoiceId}
        sourceRoute="/portal/billing"
        rationale="Invoice payment must post through FCA Books without requiring Stripe or external processors."
        nextAction={summary?.status === "Issued" ? "Record payment in FCA Books to close AR." : "Issue or deliver invoice before collecting payment."}
        actionHref="/portal/finance?view=payments"
        actionLabel="Open payments"
        tone="green"
      />

      {loadError ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="warning" title="Invoice unavailable">
            {loadError}
          </PortalAlert>
        </div>
      ) : null}

      {paymentIntake ? (
        <div style={{ ...portalCardStyle, marginBottom: 18 }}>
          <FcaNativeCheckoutPanel
            intake={paymentIntake.intake}
            instructions={paymentIntake.instructions}
            methods={paymentIntake.methods}
            busy={busy}
            error={paymentError}
            status={paymentMessage}
            onBack={() => {
              setPaymentIntake(null);
              setPaymentError("");
              setPaymentMessage("");
            }}
            onSubmit={completeInvoicePayment}
          />
        </div>
      ) : null}

      {summary && !paymentIntake ? (
        <>
          <div style={{ ...portalCardStyle, marginBottom: 18 }}>
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
                  {busy ? "Starting FCA payment..." : "Pay with FCA Books"}
                </button>
              ) : null}
              {summary.status === "Issued" || summary.status === "Paid" ? (
                <button type="button" onClick={sendInvoice} disabled={busy} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }}>
                  {busy ? "Sending..." : "Send Invoice"}
                </button>
              ) : null}
            </div>
            {deliveryMessage ? <div style={{ marginTop: 12, color: "#15803d" }}>{deliveryMessage}</div> : null}
            {paymentError ? <div style={{ marginTop: 12, color: "#991b1b" }}>{paymentError}</div> : null}
            {mailtoUrl ? (
              <a href={mailtoUrl} style={{ display: "inline-block", marginTop: 10, color: "#2563eb", fontWeight: 700 }}>
                Open email draft with invoice summary
              </a>
            ) : null}
          </div>

          {summary.html ? (
            <div style={portalCardStyle}>
              <h3 style={{ marginTop: 0 }}>Preview</h3>
              <iframe title="Invoice preview" srcDoc={summary.html} style={{ width: "100%", minHeight: 420, border: "1px solid #e2e8f0", borderRadius: 12 }} />
            </div>
          ) : null}
        </>
      ) : !loadError && !paymentIntake ? (
        <div style={portalCardStyle}>Loading invoice...</div>
      ) : null}
    </PortalShell>
  );
}
