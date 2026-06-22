import { useEffect, useState } from "react";
import { PortalEmptyState, PortalStatusBadge } from "../portal/PortalPrimitives";
import FinancePanelShell from "./FinancePanelShell";
import {
  financeCardStyle,
  financeInputStyle,
  financePrimaryButton,
  financeSecondaryButton,
  financeTdStyle,
  financeThStyle,
  financeTableStyle,
} from "./financeStyles";

export function FinancePaymentsPanel({ items, invoices, onRecord, busy, initialInvoiceId = "" }) {
  const [draft, setDraft] = useState({ invoiceId: initialInvoiceId, amount: "", method: "Check", reference: "", memo: "" });

  useEffect(() => {
    if (!initialInvoiceId) return;
    setDraft((current) => ({ ...current, invoiceId: initialInvoiceId }));
    const match = (invoices || []).find((inv) => inv.id === initialInvoiceId);
    if (match?.amount) {
      setDraft((current) => ({ ...current, invoiceId: initialInvoiceId, amount: match.amount.replace(/^\$/, "") }));
    }
  }, [initialInvoiceId, invoices]);

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FinancePanelShell
        eyebrow="Receive payment"
        title="Record native payment"
        detail="Post customer payments directly to FCA Books and GL — no external processor required."
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <select value={draft.invoiceId} onChange={(e) => setDraft({ ...draft, invoiceId: e.target.value })} style={financeInputStyle}>
            <option value="">Select invoice</option>
            {(invoices || []).filter((inv) => inv.status === "Issued").map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.invoiceName} · {inv.amount}</option>
            ))}
          </select>
          <input style={financeInputStyle} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value })} style={financeInputStyle}>
            {["Check", "ACH", "Wire", "Cash", "Card", "Other"].map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
          <input style={financeInputStyle} placeholder="Reference #" value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
        </div>
        <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={() => onRecord?.({ ...draft, targetType: "portal-invoice" })}>
          Record payment
        </button>
      </FinancePanelShell>

      {!(items || []).length ? (
        <PortalEmptyState title="No payments recorded" detail="Issued invoices appear above — record payment to close AR and post to GL." primaryHref="/portal/billing" primaryLabel="Open billing" />
      ) : (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <table style={financeTableStyle}>
            <thead>
              <tr>
                <th style={financeThStyle}>Amount</th>
                <th style={financeThStyle}>Method</th>
                <th style={financeThStyle}>Invoice</th>
                <th style={financeThStyle}>Received</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((payment) => (
                <tr key={payment.paymentId}>
                  <td style={financeTdStyle}><strong>{payment.amount}</strong></td>
                  <td style={financeTdStyle}>{payment.method}</td>
                  <td style={financeTdStyle}>{payment.targetId}</td>
                  <td style={financeTdStyle}>{payment.receivedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FinanceRecurringPanel({ items, onCreate, onRun, busy }) {
  const [draft, setDraft] = useState({ label: "", amount: "", customerName: "FCA Pilot Customer", projectId: "A-117", cadence: "monthly" });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FinancePanelShell eyebrow="Recurring billing" title="Create recurring invoice template" detail="Automate repeat customer billing on a monthly or custom cadence.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={financeInputStyle} placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <input style={financeInputStyle} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <input style={financeInputStyle} placeholder="Customer" value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} />
          <input style={financeInputStyle} placeholder="Project ID" value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })} />
        </div>
        <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={() => onCreate?.(draft)}>Save template</button>
      </FinancePanelShell>

      {!(items || []).length ? (
        <PortalEmptyState title="No recurring templates" detail="Create a template for retainers, service plans, or monthly billing." />
      ) : (
        (items || []).map((item) => (
          <div key={item.recurringId} style={financeCardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.label}</div>
                <div style={{ color: "#64748b", fontSize: 13 }}>{item.amount} · {item.cadence} · Next {item.nextRunDate}</div>
              </div>
              <button type="button" style={financePrimaryButton} disabled={busy} onClick={() => onRun?.(item.recurringId)}>Run now</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function FinanceBankImportPanel({ onImport, busy }) {
  const [csvText, setCsvText] = useState("date,description,amount\n2026-06-20,Deposit,5000\n2026-06-21,Vendor payment,-1200");

  return (
    <FinancePanelShell eyebrow="Bank import" title="Import bank transactions (FCA CSV)" detail="Paste CSV with columns: date, description, amount. Negative amounts are debits.">
      <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} style={{ ...financeInputStyle, minHeight: 140, fontFamily: "monospace" }} />
      <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={() => onImport?.({ csvText, bankAccountId: "BANK-001" })}>
        Import to bank register
      </button>
    </FinancePanelShell>
  );
}
