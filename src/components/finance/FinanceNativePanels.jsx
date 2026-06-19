import { useEffect, useState } from "react";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const btn = (primary = false) => ({
  border: primary ? "none" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: primary ? "#2ca01c" : "#fff",
  color: primary ? "#fff" : "#0f172a",
});

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
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 8 }}>Record native payment</div>
        <p style={{ color: "#64748b", marginTop: 0, lineHeight: 1.6 }}>Post customer payments directly to FCA books and GL — no external processor required.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <select value={draft.invoiceId} onChange={(e) => setDraft({ ...draft, invoiceId: e.target.value })} style={input}>
            <option value="">Select invoice</option>
            {(invoices || []).filter((inv) => inv.status === "Issued").map((inv) => (
              <option key={inv.id} value={inv.id}>{inv.invoiceName} · {inv.amount}</option>
            ))}
          </select>
          <input style={input} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <select value={draft.method} onChange={(e) => setDraft({ ...draft, method: e.target.value })} style={input}>
            {["Check", "ACH", "Wire", "Cash", "Card", "Other"].map((method) => <option key={method} value={method}>{method}</option>)}
          </select>
          <input style={input} placeholder="Reference #" value={draft.reference} onChange={(e) => setDraft({ ...draft, reference: e.target.value })} />
        </div>
        <button type="button" style={{ ...btn(true), marginTop: 12 }} disabled={busy} onClick={() => onRecord?.({ ...draft, targetType: "portal-invoice" })}>
          Record payment
        </button>
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Payment register</div>
        {(items || []).map((payment) => (
          <div key={payment.paymentId} style={{ borderBottom: "1px solid #f1f5f9", padding: "10px 0" }}>
            <div style={{ fontWeight: 700 }}>{payment.amount} · {payment.method}</div>
            <div style={{ color: "#64748b", fontSize: 13 }}>{payment.targetId} · {payment.reference || "No ref"} · {payment.receivedAt}</div>
          </div>
        ))}
        {!(items || []).length ? <div style={{ color: "#64748b" }}>No native payments recorded yet.</div> : null}
      </div>
    </div>
  );
}

export function FinanceRecurringPanel({ items, onCreate, onRun, busy }) {
  const [draft, setDraft] = useState({ label: "", amount: "", customerName: "FCA Pilot Customer", projectId: "A-117", cadence: "monthly" });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Create recurring invoice template</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={input} placeholder="Label" value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
          <input style={input} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <input style={input} placeholder="Customer" value={draft.customerName} onChange={(e) => setDraft({ ...draft, customerName: e.target.value })} />
          <input style={input} placeholder="Project ID" value={draft.projectId} onChange={(e) => setDraft({ ...draft, projectId: e.target.value })} />
        </div>
        <button type="button" style={{ ...btn(true), marginTop: 12 }} disabled={busy} onClick={() => onCreate?.(draft)}>Save template</button>
      </div>
      {(items || []).map((item) => (
        <div key={item.recurringId} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.label}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{item.amount} · {item.cadence} · Next {item.nextRunDate}</div>
            </div>
            <button type="button" style={btn(true)} disabled={busy} onClick={() => onRun?.(item.recurringId)}>Run now</button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FinanceBankImportPanel({ onImport, busy }) {
  const [csvText, setCsvText] = useState("date,description,amount\n2026-06-20,Deposit,5000\n2026-06-21,Vendor payment,-1200");
  return (
    <div style={card}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Import bank transactions (FCA CSV)</div>
      <p style={{ color: "#64748b", lineHeight: 1.6 }}>Paste CSV with columns: date, description, amount. Negative amounts are debits.</p>
      <textarea value={csvText} onChange={(e) => setCsvText(e.target.value)} style={{ ...input, minHeight: 140, fontFamily: "monospace" }} />
      <button type="button" style={{ ...btn(true), marginTop: 12 }} disabled={busy} onClick={() => onImport?.({ csvText, bankAccountId: "BANK-001" })}>
        Import to bank register
      </button>
    </div>
  );
}
