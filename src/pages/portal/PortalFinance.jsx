import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useCustomerSession from "../../hooks/useCustomerSession";
import useFinancialWorkspace from "../../hooks/useFinancialWorkspace";
import { fetchPortalInvoices } from "../../api/portalClient";
import FinanceSidebar from "../../components/finance/FinanceSidebar";
import FinanceConstructionPanel from "../../components/finance/FinanceConstructionPanel";
import FinanceJournalPanel from "../../components/finance/FinanceJournalPanel";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { FinanceBankImportPanel, FinancePaymentsPanel, FinanceRecurringPanel } from "../../components/finance/FinanceNativePanels";
import {
  FinanceBankingPanel,
  FinanceBillsPanel,
  FinanceDashboardPanel,
  FinanceExpensesPanel,
  FinanceMasterDataPanel,
  FinanceReportsPanel,
} from "../../components/finance/FinancePanels";
import { routeStateOverlays } from "../../systemState";

function readViewFromUrl() {
  if (typeof window === "undefined") return { view: "dashboard", projectId: "", invoiceId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get("view") || "dashboard",
    projectId: params.get("projectId") || "",
    invoiceId: params.get("invoiceId") || "",
  };
}

export default function PortalFinance() {
  const deepLink = useMemo(() => readViewFromUrl(), []);
  const { projectId: portalProjectId } = usePortalProjectId(deepLink.projectId);
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const finance = useFinancialWorkspace(deepLink.view, portalProjectId);
  const [portalInvoices, setPortalInvoices] = useState([]);
  const [actionError, setActionError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const companyName = state?.tenant?.name || session?.company || "FCA Books";

  useEffect(() => {
    refreshSyncStamp("Finance workspace active");
    fetchPortalInvoices()
      .then((payload) => setPortalInvoices(payload.items || []))
      .catch(() => setPortalInvoices([]));
  }, [refreshSyncStamp]);

  useEffect(() => {
    finance.setView(deepLink.view);
    if (deepLink.projectId) finance.setProjectId(deepLink.projectId);
  }, [deepLink.view, deepLink.projectId]);

  function navigate(view) {
    finance.setView(view);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("view", view);
      window.history.replaceState({}, "", url.toString());
    }
  }

  async function handleCreateExpense(body) {
    setBusy(true);
    try {
      await finance.createExpense(body);
      setStatusMessage(`Expense recorded for ${body.payee}.`);
    } catch (error) {
      setActionError(error.message || "Unable to record expense.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateBill(body) {
    setBusy(true);
    try {
      await finance.createBill(body);
      setStatusMessage(`Bill saved for ${body.vendorName}.`);
    } catch (error) {
      setActionError(error.message || "Unable to save bill.");
    } finally {
      setBusy(false);
    }
  }

  function renderContent() {
    if (finance.loading && !finance.data) return <div style={{ padding: 24 }}>Loading books…</div>;
    const payload = finance.data || {};
    switch (finance.view) {
      case "expenses":
        return <FinanceExpensesPanel items={payload.items} onCreate={handleCreateExpense} busy={busy} />;
      case "bills":
        return <FinanceBillsPanel items={payload.items} onCreate={handleCreateBill} onPay={(billId) => finance.payBill(billId)} busy={busy} />;
      case "banking":
        return (
          <div style={{ display: "grid", gap: 16 }}>
            <FinanceBankImportPanel
              onImport={async (body) => {
                setBusy(true);
                try {
                  const result = await finance.importBankCsv(body);
                  setStatusMessage(`${result?.importedCount ?? 0} bank transaction(s) imported into FCA register.`);
                } catch (error) {
                  setActionError(error.message || "Unable to import bank CSV.");
                } finally {
                  setBusy(false);
                }
              }}
              busy={busy}
            />
            <FinanceBankingPanel accounts={payload.accounts} transactions={payload.transactions} onReconcile={(id) => finance.reconcileTransaction(id)} busy={busy} />
          </div>
        );
      case "reports":
        return (
          <FinanceReportsPanel
            report={payload.report}
            availableReports={payload.availableReports}
            activeReport={finance.report}
            onSelectReport={(id) => finance.setReport(id)}
            onExport={async (reportType) => {
              const result = await finance.exportReport(reportType);
              if (result?.csv && typeof window !== "undefined") {
                const blob = new Blob([result.csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `fca-${reportType || finance.report}.csv`;
                link.click();
                URL.revokeObjectURL(url);
                setStatusMessage("Report exported from FCA native books.");
              }
            }}
            busy={busy}
          />
        );
      case "payments":
        return (
          <FinancePaymentsPanel
            items={payload.items}
            invoices={portalInvoices}
            initialInvoiceId={deepLink.invoiceId}
            onRecord={async (body) => {
              setBusy(true);
              try {
                await finance.recordNativePayment(body);
                await fetchPortalInvoices().then((p) => setPortalInvoices(p.items || []));
                setStatusMessage(`Payment recorded for ${body.invoiceId}.`);
              } catch (error) {
                setActionError(error.message || "Unable to record payment.");
              } finally {
                setBusy(false);
              }
            }}
            busy={busy}
          />
        );
      case "recurring":
        return (
          <FinanceRecurringPanel
            items={payload.items}
            onCreate={async (body) => {
              setBusy(true);
              try {
                await finance.createRecurringInvoice(body);
                setStatusMessage(`Recurring template saved: ${body.label}`);
              } catch (error) {
                setActionError(error.message || "Unable to save recurring template.");
              } finally {
                setBusy(false);
              }
            }}
            onRun={async (recurringId) => {
              setBusy(true);
              try {
                const result = await finance.runRecurringInvoice(recurringId);
                setStatusMessage(`Invoice ${result?.portalInvoice?.id || ""} generated from recurring template.`);
              } catch (error) {
                setActionError(error.message || "Unable to run recurring invoice.");
              } finally {
                setBusy(false);
              }
            }}
            busy={busy}
          />
        );
      case "construction":
        return (
          <FinanceConstructionPanel
            packageData={payload.package}
            projectId={finance.projectId}
            onProjectChange={(id) => finance.setProjectId(id)}
            onCreatePayApp={(id) => finance.createPayAppFromSov(id)}
            onAdvancePayApp={(payAppId, status) => finance.advancePayApp(payAppId, status)}
            onUpdateSovLine={(body) => finance.upsertSovLine(body)}
            onGeneratePayAppDoc={(pid, payAppId) => finance.generatePayAppDocument(pid, payAppId)}
            busy={busy}
          />
        );
      case "customers":
        return <FinanceMasterDataPanel customers={payload.customers} vendors={payload.vendors} />;
      case "coa":
        return <FinanceMasterDataPanel customers={[]} vendors={[]} accounts={payload.items} />;
      case "journal":
        return (
          <FinanceJournalPanel
            items={payload.items}
            busy={busy}
            onPost={async (body) => {
              setBusy(true);
              try {
                await finance.postJournalEntry(body);
                setStatusMessage("Journal entry posted to governed GL.");
              } catch (error) {
                setActionError(error.message || "Unable to post journal entry.");
              } finally {
                setBusy(false);
              }
            }}
          />
        );
      case "dashboard":
      default:
        return (
          <div style={{ display: "grid", gap: 16 }}>
            <FinanceDashboardPanel dashboard={payload.dashboard} intelligence={payload.intelligence} onNavigate={navigate} />
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800 }}>Open invoices</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Record payments natively in FCA Books — no external processor required.</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <a href="/portal/billing" style={{ textDecoration: "none", border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", color: "#334155", fontWeight: 700 }}>Create invoice</a>
                  <button type="button" onClick={() => navigate("payments")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "#2ca01c", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    Record payment
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {portalInvoices.map((inv) => (
                  <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{inv.invoiceName}</div>
                      <div style={{ color: "#64748b", fontSize: 13 }}>{inv.amount} · {inv.status}</div>
                    </div>
                    {inv.status === "Issued" ? (
                      <button type="button" onClick={() => navigate("payments")} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "#2ca01c", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                        Record payment
                      </button>
                    ) : null}
                  </div>
                ))}
                {!portalInvoices.length ? <div style={{ color: "#64748b" }}>No open invoices yet.</div> : null}
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <PortalShell
      title="Finance"
      subtitle="AR, AP, GL, job billing, pay apps, and governed payment recording."
      activeHref="/portal/finance"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Create invoice"
    >
      {actionError ? <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: "#fef2f2", border: "1px solid #fecaca", color: "#991b1b" }}>{actionError}</div> : null}
      {statusMessage ? <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, background: "#ecfdf5", border: "1px solid #86efac", color: "#166534" }}>{statusMessage}</div> : null}

      {finance.projectId ? (
        <AuricruxInsightPanel
          title="Auricrux Books Intelligence"
          targetObjectId={finance.projectId}
          sourceRoute="/portal/finance"
          rationale={finance.data?.intelligence?.nextAction || "Review books posture and advance the next governed finance move."}
          nextAction={finance.data?.intelligence?.nextAction}
          recommendations={finance.data?.intelligence?.recommendations}
          tone="green"
          liveRecommend
        />
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 18, alignItems: "start", marginTop: 16 }}>
        <FinanceSidebar activeView={finance.view} onNavigate={navigate} companyName={companyName} />
        <div>
          <div style={{ marginBottom: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ color: "#64748b", fontSize: 13 }}>Backing source: {finance.meta.backingSource}</div>
              <h1 style={{ margin: "4px 0 0", fontSize: 28, textTransform: "capitalize" }}>{finance.view.replace(/_/g, " ")}</h1>
            </div>
            <button type="button" onClick={() => finance.refresh()} style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
              Refresh books
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </PortalShell>
  );
}
