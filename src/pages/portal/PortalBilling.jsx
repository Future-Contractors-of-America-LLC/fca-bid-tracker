import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import { publishPortalPageContext } from "../../portalPageContext";
import {
  createPortalInvoice,
  deliverPortalInvoice,
  fetchBillingSummary,
  fetchPortalInvoices,
  issuePortalInvoice,
} from "../../api/portalClient";
import {
  createFcaPaymentIntake,
  submitFcaNativeCheckout,
} from "../../api/fcaPaymentClient";
import FcaNativeCheckoutPanel from "../../components/FcaNativeCheckoutPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalLoadingState,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalInputStyle,
} from "../../portalDesignTokens";

export default function PortalBilling() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const { activeProject } = useProjectWorkspace();
  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";

  const [draft, setDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [invoices, setInvoices] = useState([]);
  const [billingSummary, setBillingSummary] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [deliveryNotice, setDeliveryNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentIntake, setPaymentIntake] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("");

  async function reloadInvoices() {
    const [invoicesPayload, summaryPayload] = await Promise.all([
      fetchPortalInvoices(),
      fetchBillingSummary().catch(() => null),
    ]);
    setInvoices(invoicesPayload.items || []);
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
        refreshSyncStamp("Portal billing synced");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error.message || "Unable to load billing data.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshSyncStamp]);

  useEffect(() => {
    publishPortalPageContext({
      surface: "billing",
      projectId: activeProject?.id || state?.project?.id || "",
      pipelineStep: null,
    });
    return () => publishPortalPageContext(null);
  }, [activeProject?.id, state?.project?.id]);

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
        projectId: activeProject?.id || state?.project?.id || "",
      });
      await reloadInvoices();
      setDraft({ invoiceName: "", amount: "", note: "" });
      refreshSyncStamp("Invoice created");
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
      refreshSyncStamp("Invoice issued");
    } catch (error) {
      setActionError(error.message || "Unable to issue invoice.");
    } finally {
      setBusyId("");
    }
  }

  async function payInvoice(invoiceId) {
    setActionError("");
    setPaymentStatus("");
    setBusyId(`pay-${invoiceId}`);
    try {
      const payload = await createFcaPaymentIntake({
        invoiceId,
        email: session?.email,
        company: companyName,
      });
      setPaymentIntake(payload);
    } catch (error) {
      setActionError(error.message || "Unable to start FCA native payment.");
    } finally {
      setBusyId("");
    }
  }

  async function completeInvoicePayment(body) {
    setBusyId("pay-submit");
    setActionError("");
    setPaymentStatus("Recording payment in FCA Books...");
    try {
      await submitFcaNativeCheckout(body);
      setPaymentIntake(null);
      setPaymentStatus("");
      await reloadInvoices();
      refreshSyncStamp("Payment recorded in FCA Books");
      setDeliveryNotice("Payment recorded in FCA Books — invoice closed.");
    } catch (error) {
      setActionError(error.message || "Unable to record payment.");
      setPaymentStatus("");
    } finally {
      setBusyId("");
    }
  }

  async function deliverInvoice(invoiceId) {
    setActionError("");
    setDeliveryNotice("");
    setBusyId(`deliver-${invoiceId}`);
    try {
      const payload = await deliverPortalInvoice(invoiceId, {
        companyName,
        recipientEmail: session?.email,
      });
      const email = payload.recipientEmail || session?.email || "customer";
      setDeliveryNotice(payload.delivered ? `Invoice emailed to ${email}` : "Invoice saved to portal messages.");
      refreshSyncStamp("Invoice delivered");
    } catch (error) {
      setActionError(error.message || "Unable to deliver invoice.");
    } finally {
      setBusyId("");
    }
  }

  const stats = useMemo(() => {
    const draftCount = invoices.filter((inv) => inv.status === "Draft").length;
    const issuedCount = invoices.filter((inv) => inv.status === "Issued").length;
    const paidCount = invoices.filter((inv) => inv.status === "Paid").length;
    return { draftCount, issuedCount, paidCount };
  }, [invoices]);

  const tableRows = useMemo(
    () =>
      invoices.map((invoice) => ({
        id: invoice.id,
        invoice,
        invoiceName: invoice.invoiceName,
        amount: invoice.amount,
        status: invoice.status,
        note: invoice.note,
      })),
    [invoices],
  );

  return (
    <PortalShell
      title="Billing"
      subtitle={
        activeProject?.id
          ? `Invoices for ${activeProject.id}. Create, issue, and collect in FCA Books.`
          : "Create customer invoices and record payment in FCA Books."
      }
      activeHref="/portal/billing"
    >
      <PortalQuickStats
        items={[
          { label: "Draft", value: stats.draftCount, hint: "Ready to issue" },
          { label: "Issued", value: stats.issuedCount, hint: "Awaiting payment" },
          { label: "Paid", value: stats.paidCount, hint: "Closed invoices" },
          { label: "Billing records", value: billingSummary?.count ?? "—", hint: "Construction billing package" },
        ]}
      />

      {loadError ? <PortalAlert tone="error" title="Unable to load billing data">{loadError}</PortalAlert> : null}
      {actionError ? <PortalAlert tone="error">{actionError}</PortalAlert> : null}
      {deliveryNotice ? <PortalAlert tone="success">{deliveryNotice}</PortalAlert> : null}

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Create invoice</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice name</div>
            <input value={draft.invoiceName} onChange={(event) => updateField("invoiceName", event.target.value)} style={portalInputStyle} placeholder="Initial mobilization invoice" />
          </label>
          <label>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Amount</div>
            <input value={draft.amount} onChange={(event) => updateField("amount", event.target.value)} style={portalInputStyle} placeholder="$18,500" />
          </label>
        </div>
        <label>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Invoice note</div>
          <textarea value={draft.note} onChange={(event) => updateField("note", event.target.value)} style={{ ...portalInputStyle, minHeight: 96 }} placeholder="What this invoice covers" />
        </label>
        <button type="button" onClick={createInvoice} disabled={busyId === "create"} style={{ ...portalButtonPrimary, border: "none", cursor: "pointer", marginTop: 8 }}>
          {busyId === "create" ? "Creating..." : "Create invoice"}
        </button>
      </div>

      {loading ? <PortalLoadingState label="Loading invoices..." /> : (
        <PortalEntityTable
          columns={[
            { key: "invoiceName", label: "Invoice" },
            { key: "amount", label: "Amount" },
            {
              key: "status",
              label: "Status",
              render: (row) => <PortalStatusBadge status={row.status} />,
            },
            { key: "note", label: "Note" },
            {
              key: "actions",
              label: "Actions",
              render: (row) => (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {row.status === "Draft" ? (
                    <button type="button" onClick={() => issueInvoice(row.id)} disabled={busyId === row.id} style={portalButtonSecondary}>
                      {busyId === row.id ? "Issuing..." : "Issue"}
                    </button>
                  ) : null}
                  {row.status === "Issued" ? (
                    <>
                      <button type="button" onClick={() => payInvoice(row.id)} disabled={busyId === `pay-${row.id}`} style={portalButtonPrimary}>
                        {busyId === `pay-${row.id}` ? "Starting..." : "Pay"}
                      </button>
                      <button type="button" onClick={() => deliverInvoice(row.id)} disabled={busyId === `deliver-${row.id}`} style={portalButtonSecondary}>
                        {busyId === `deliver-${row.id}` ? "Sending..." : "Send"}
                      </button>
                      <a href={`/portal/finance?view=payments&invoiceId=${encodeURIComponent(row.id)}`} style={portalButtonSecondary}>Record payment</a>
                    </>
                  ) : null}
                  <a href={`/portal/billing/${row.id}`} style={portalButtonSecondary}>View</a>
                </div>
              ),
            },
          ]}
          rows={tableRows}
          emptyTitle="No invoices yet"
          emptyDetail="Create your first invoice above to start the billing flow."
          emptyPrimaryHref="/portal/pipeline"
          emptyPrimaryLabel="Open pipeline"
        />
      )}

      <div style={{ marginTop: 16 }}>
        <CommercialContinuityFeed title="Billing activity" detail="Recent billing and commercial events for this account." />
      </div>

      {paymentIntake ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", display: "grid", placeItems: "center", padding: 24, zIndex: 40 }}>
          <div style={{ ...portalCardStyle, width: "min(640px, 100%)", maxHeight: "90vh", overflow: "auto" }}>
            <FcaNativeCheckoutPanel
              intake={paymentIntake.intake}
              instructions={paymentIntake.instructions}
              methods={paymentIntake.methods}
              busy={busyId === "pay-submit"}
              error={actionError}
              status={paymentStatus}
              onBack={() => {
                setPaymentIntake(null);
                setActionError("");
                setPaymentStatus("");
              }}
              onSubmit={completeInvoicePayment}
            />
          </div>
        </div>
      ) : null}
    </PortalShell>
  );
}
