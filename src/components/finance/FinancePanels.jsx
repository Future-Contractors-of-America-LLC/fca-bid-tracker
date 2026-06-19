import { useState } from "react";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" };
const input = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" };
const btn = (primary = false) => ({
  border: "none",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: primary ? "#2ca01c" : "#fff",
  color: primary ? "#fff" : "#0f172a",
  border: primary ? "none" : "1px solid #cbd5e1",
});

export function FinanceDashboardPanel({ dashboard, intelligence, onNavigate }) {
  if (!dashboard) return null;
  const recommendations = intelligence?.recommendations || [];
  const kpis = [
    { label: "Cash on hand", value: dashboard.cashOnHand, tone: "#047857" },
    { label: "Accounts receivable", value: dashboard.accountsReceivable, tone: "#1d4ed8" },
    { label: "Accounts payable", value: dashboard.accountsPayable, tone: "#b45309" },
    { label: "Net income (YTD)", value: dashboard.netIncomeYtd, tone: "#0f172a" },
  ];
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        {kpis.map((kpi) => (
          <div key={kpi.label} style={card}>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 8 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: kpi.tone }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Profit & Loss snapshot</div>
          <div style={{ display: "grid", gap: 8, color: "#334155", lineHeight: 1.8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Income</span><strong>{dashboard.profitAndLoss?.income}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>COGS</span><strong>{dashboard.profitAndLoss?.cogs}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Expenses</span><strong>{dashboard.profitAndLoss?.expenses}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 4 }}>
              <span>Net income</span><strong style={{ color: "#047857" }}>{dashboard.profitAndLoss?.netIncome}</strong>
            </div>
          </div>
        </div>
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Operations</div>
          <div style={{ color: "#475569", lineHeight: 1.9, marginBottom: 14 }}>
            <div>{dashboard.openBillCount} open bill(s)</div>
            <div>{dashboard.openArCount} open AR invoice(s)</div>
            <div>{dashboard.unreconciledTransactions} unreconciled bank transaction(s)</div>
            <div>Expenses MTD: <strong>{dashboard.expensesMtd}</strong></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(dashboard.quickActions || []).map((action) => (
              action.href ? (
                <a key={action.label} href={action.href} style={{ ...btn(), textDecoration: "none", display: "inline-block" }}>{action.label}</a>
              ) : (
                <button key={action.label} type="button" style={btn()} onClick={() => onNavigate(action.action === "create-expense" ? "expenses" : action.action === "create-bill" ? "bills" : "dashboard")}>
                  {action.label}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...card, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ fontWeight: 800 }}>Connectivity</div>
        {Object.entries(dashboard.connectivity || {}).map(([key, value]) => (
          <span key={key} style={{ background: "#ecfdf5", color: "#047857", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700 }}>
            {key}: {value}
          </span>
        ))}
      </div>

      {recommendations.length ? (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 8 }}>Auricrux next actions</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>{intelligence?.nextAction}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {recommendations.map((item) => (
              <div key={item.action} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{item.action.replace(/-/g, " ")}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{item.summary}</div>
                </div>
                {item.href ? (
                  <a href={item.href} style={{ ...btn(true), textDecoration: "none", fontSize: 13 }}>Open</a>
                ) : (
                  <button type="button" style={{ ...btn(true), fontSize: 13 }} onClick={() => onNavigate?.("dashboard")}>Review</button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function FinanceExpensesPanel({ items, onCreate, busy }) {
  const [draft, setDraft] = useState({ payee: "", amount: "", category: "Office & Administrative", memo: "", projectId: "A-117" });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Record expense</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={input} placeholder="Payee" value={draft.payee} onChange={(e) => setDraft({ ...draft, payee: e.target.value })} />
          <input style={input} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <input style={input} placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <input style={input} placeholder="Memo" value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} />
        </div>
        <button type="button" style={{ ...btn(true), marginTop: 12 }} disabled={busy} onClick={() => onCreate(draft)}>Save expense</button>
      </div>
      <div style={{ display: "grid", gap: 10 }}>
        {(items || []).map((item) => (
          <div key={item.expenseId} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700 }}>{item.payee}</div>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{item.date} · {item.category} · {item.paymentMethod}</div>
                {item.memo ? <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>{item.memo}</div> : null}
              </div>
              <div style={{ fontWeight: 800 }}>{item.amount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceBillsPanel({ items, onCreate, onPay, busy }) {
  const [draft, setDraft] = useState({ vendorName: "", total: "", billNumber: "", projectId: "A-117" });
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Enter bill</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={input} placeholder="Vendor" value={draft.vendorName} onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })} />
          <input style={input} placeholder="Bill #" value={draft.billNumber} onChange={(e) => setDraft({ ...draft, billNumber: e.target.value })} />
          <input style={input} placeholder="Total" value={draft.total} onChange={(e) => setDraft({ ...draft, total: e.target.value })} />
        </div>
        <button type="button" style={{ ...btn(true), marginTop: 12 }} disabled={busy} onClick={() => onCreate(draft)}>Save bill</button>
      </div>
      {(items || []).map((item) => (
        <div key={item.billId} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
            <div>
              <div style={{ fontWeight: 700 }}>{item.vendorName}</div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{item.billNumber} · Due {item.dueDate} · {item.status}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 800 }}>{item.total}</div>
              {item.status !== "Paid" ? (
                <button type="button" style={{ ...btn(true), marginTop: 8, fontSize: 12 }} disabled={busy} onClick={() => onPay(item.billId)}>Pay bill</button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FinanceBankingPanel({ accounts, transactions, onReconcile, busy }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
        {(accounts || []).map((account) => (
          <div key={account.bankAccountId} style={card}>
            <div style={{ fontWeight: 700 }}>{account.name}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{account.institution} · {account.accountNumberMasked}</div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 10 }}>${Number(account.balance || 0).toLocaleString()}</div>
            <div style={{ color: "#64748b", fontSize: 12, marginTop: 8 }}>Last reconciled {account.lastReconciled} · {account.unreconciledCount} unreconciled</div>
          </div>
        ))}
      </div>
      <div style={card}>
        <div style={{ fontWeight: 800, marginBottom: 12 }}>Bank transactions</div>
        <div style={{ display: "grid", gap: 8 }}>
          {(transactions || []).map((txn) => (
            <div key={txn.transactionId} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{txn.description}</div>
                <div style={{ color: "#64748b", fontSize: 12 }}>{txn.date} · {txn.status}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ fontWeight: 700, color: txn.amount < 0 ? "#b91c1c" : "#047857" }}>
                  {txn.amount < 0 ? "-" : "+"}${Math.abs(txn.amount).toLocaleString()}
                </div>
                {txn.status === "unreconciled" ? (
                  <button type="button" style={{ ...btn(true), fontSize: 12, padding: "6px 10px" }} disabled={busy} onClick={() => onReconcile(txn.transactionId)}>Reconcile</button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FinanceReportsPanel({ report, availableReports, activeReport, onSelectReport, onExport, busy }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {(availableReports || []).map((id) => (
          <button key={id} type="button" onClick={() => onSelectReport(id)} style={{ ...btn(activeReport === id), background: activeReport === id ? "#2ca01c" : "#fff", color: activeReport === id ? "#fff" : "#0f172a", border: activeReport === id ? "none" : "1px solid #cbd5e1" }}>
            {id.replace(/_/g, " ")}
          </button>
        ))}
        <button type="button" style={btn(true)} disabled={busy} onClick={() => onExport?.(activeReport)}>
          Download CSV
        </button>
      </div>
      {report ? (
        <div style={card}>
          <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>{report.title}</div>
          {report.totals ? (
            <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              {Object.entries(report.totals).map(([key, value]) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 6 }}>
                  <span style={{ textTransform: "capitalize" }}>{key.replace(/([A-Z])/g, " $1")}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          ) : null}
          {report.buckets ? (
            <div style={{ display: "grid", gap: 8 }}>
              {Object.entries(report.buckets).map(([bucket, value]) => (
                <div key={bucket} style={{ display: "flex", justifyContent: "space-between" }}><span>{bucket}</span><strong>{value}</strong></div>
              ))}
            </div>
          ) : null}
          {report.lines ? (
            <div style={{ display: "grid", gap: 6 }}>
              {report.lines.map((line) => (
                <div key={line.accountId} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span>{line.accountId} · {line.name}</span>
                  <strong>{line.balance}</strong>
                </div>
              ))}
            </div>
          ) : null}
          {report.rows ? report.rows.map((section) => (
            <div key={section.section} style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{section.section}</div>
              {(section.lines || []).map((line) => (
                <div key={line.accountId} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, padding: "4px 0" }}>
                  <span>{line.name}</span>
                  <span>${Number(line.balance || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )) : null}
        </div>
      ) : null}
    </div>
  );
}

export function FinanceMasterDataPanel({ customers, vendors, accounts }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Customers</div>
          {(customers || []).map((item) => (
            <div key={item.customerId} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{item.email} · {item.terms}</div>
              <div style={{ marginTop: 4 }}>Balance: <strong>${Number(item.balance || 0).toLocaleString()}</strong></div>
            </div>
          ))}
        </div>
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Vendors</div>
          {(vendors || []).map((item) => (
            <div key={item.vendorId} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{item.email} · {item.terms}</div>
              <div style={{ marginTop: 4 }}>Balance: <strong>${Number(item.balance || 0).toLocaleString()}</strong></div>
            </div>
          ))}
        </div>
      </div>
      {accounts ? (
        <div style={card}>
          <div style={{ fontWeight: 800, marginBottom: 12 }}>Chart of Accounts</div>
          <div style={{ display: "grid", gap: 6 }}>
            {accounts.map((account) => (
              <div key={account.accountId} style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 120px", gap: 8, fontSize: 14, padding: "6px 0", borderBottom: "1px solid #f8fafc" }}>
                <span style={{ color: "#64748b" }}>{account.accountId}</span>
                <span style={{ fontWeight: 600 }}>{account.name}</span>
                <span style={{ color: "#64748b" }}>{account.type}</span>
                <span style={{ textAlign: "right", fontWeight: 700 }}>${Number(account.balance || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}