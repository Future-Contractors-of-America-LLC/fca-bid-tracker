import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import { deliverPortalInvoice, fetchInvoiceSummary } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

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
  const [mailtoUrl, setMailtoUrl] = useState("");
  const [busy, setBusy] = useState(false);

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
      subtitle="Printable invoice view and customer delivery."
      activeHref="/portal/billing"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Back to Billing"
    >
      {loadError ? (
        <div style={{ ...cardStyle, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{loadError}</div>
      ) : null}

      {summary ? (
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
              <button type="button" onClick={printInvoice} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                Print / Save PDF
              </button>
              {summary.status === "Issued" || summary.status === "Paid" ? (
                <button type="button" onClick={sendInvoice} disabled={busy} style={{ border: "1px solid #2563eb", background: "#2563eb", color: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                  {busy ? "Sending..." : "Send Invoice"}
                </button>
              ) : null}
            </div>
            {deliveryMessage ? <div style={{ marginTop: 12, color: "#15803d" }}>{deliveryMessage}</div> : null}
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
      ) : !loadError ? (
        <div style={cardStyle}>Loading invoice...</div>
      ) : null}
    </PortalShell>
  );
}
