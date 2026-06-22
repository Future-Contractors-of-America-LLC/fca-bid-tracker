import { useState } from "react";
import { PortalEmptyState } from "../portal/PortalPrimitives";
import FinancePanelShell from "./FinancePanelShell";
import {
  financeCardStyle,
  financeInputStyle,
  financePrimaryButton,
  financeSectionTitle,
} from "./financeStyles";

export default function FinanceJournalPanel({ items, onPost, busy }) {
  const [draft, setDraft] = useState({
    memo: "",
    debitAccount: "1000",
    debitAmount: "",
    creditAccount: "1100",
    creditAmount: "",
  });

  async function handlePost() {
    const debit = Number(draft.debitAmount);
    const credit = Number(draft.creditAmount);
    if (!draft.memo.trim() || debit <= 0 || debit !== credit) return;
    await onPost?.({
      memo: draft.memo,
      lines: [
        { accountId: draft.debitAccount, debit, credit: 0 },
        { accountId: draft.creditAccount, debit: 0, credit },
      ],
    });
    setDraft({ memo: "", debitAccount: "1000", debitAmount: "", creditAccount: "1100", creditAmount: "" });
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FinancePanelShell eyebrow="General ledger" title="Post manual journal entry" detail="Governed double-entry posting — debits must equal credits.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          <input style={financeInputStyle} placeholder="Memo" value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} />
          <input style={financeInputStyle} placeholder="Debit account" value={draft.debitAccount} onChange={(e) => setDraft({ ...draft, debitAccount: e.target.value })} />
          <input style={financeInputStyle} placeholder="Debit amount" value={draft.debitAmount} onChange={(e) => setDraft({ ...draft, debitAmount: e.target.value, creditAmount: e.target.value })} />
          <input style={financeInputStyle} placeholder="Credit account" value={draft.creditAccount} onChange={(e) => setDraft({ ...draft, creditAccount: e.target.value })} />
        </div>
        <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={handlePost}>
          Post to GL
        </button>
      </FinancePanelShell>

      <div style={financeCardStyle}>
        <div style={financeSectionTitle}>Journal register</div>
        {!(items || []).length ? (
          <PortalEmptyState title="No journal entries yet" detail="Bills, expenses, invoices, and payments post automatically when you use FCA Books." />
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {(items || []).map((entry) => (
              <div key={entry.journalId} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{entry.memo}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{entry.journalId} · {entry.date} · {entry.sourceType}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{entry.sourceId || "—"}</div>
                </div>
                <div style={{ marginTop: 8, display: "grid", gap: 4 }}>
                  {(entry.lines || []).map((line, index) => (
                    <div key={`${entry.journalId}-${index}`} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#475569" }}>
                      <span>Acct {line.accountId}</span>
                      <span>
                        {line.debit ? `DR $${Number(line.debit).toLocaleString()}` : ""}
                        {line.credit ? ` CR $${Number(line.credit).toLocaleString()}` : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
