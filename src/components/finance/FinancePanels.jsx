import { useState } from "react";
import {
  PortalEmptyState,
  PortalQuickStats,
  PortalStatusBadge,
} from "../portal/PortalPrimitives";
import FinancePanelShell from "./FinancePanelShell";
import {
  financeCardStyle,
  financeInputStyle,
  financeMutedText,
  financePrimaryButton,
  financeSecondaryButton,
  financeSectionTitle,
  financeTdStyle,
  financeThStyle,
  financeTableStyle,
} from "./financeStyles";
import { portalTokens } from "../../portalDesignTokens";

export function FinanceDashboardPanel({ dashboard, intelligence, onNavigate }) {
  if (!dashboard) {
    return (
      <PortalEmptyState
        title="Finance dashboard unavailable"
        detail="Refresh books or confirm your workspace has financial data connected."
        primaryHref="/portal/billing"
        primaryLabel="Create invoice"
      />
    );
  }

  const recommendations = intelligence?.recommendations || [];
  const kpis = [
    { label: "Cash on hand", value: dashboard.cashOnHand, hint: "Operating cash" },
    { label: "Accounts receivable", value: dashboard.accountsReceivable, hint: "Open customer balances" },
    { label: "Accounts payable", value: dashboard.accountsPayable, hint: "Vendor obligations" },
    { label: "Net income (YTD)", value: dashboard.netIncomeYtd, hint: "Year to date" },
  ];

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PortalQuickStats items={kpis} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Profit & Loss snapshot</div>
          <div style={{ display: "grid", gap: 8, color: portalTokens.body, lineHeight: 1.8 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Income</span><strong>{dashboard.profitAndLoss?.income}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>COGS</span><strong>{dashboard.profitAndLoss?.cogs}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>Expenses</span><strong>{dashboard.profitAndLoss?.expenses}</strong></div>
            <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #e5e7eb", paddingTop: 8, marginTop: 4 }}>
              <span>Net income</span><strong style={{ color: "#047857" }}>{dashboard.profitAndLoss?.netIncome}</strong>
            </div>
          </div>
        </div>

        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Operations summary</div>
          <div style={{ ...financeMutedText, lineHeight: 1.9, marginBottom: 14 }}>
            <div>{dashboard.openBillCount} open bill(s)</div>
            <div>{dashboard.openArCount} open AR invoice(s)</div>
            <div>{dashboard.unreconciledTransactions} unreconciled bank transaction(s)</div>
            <div>Expenses MTD: <strong>{dashboard.expensesMtd}</strong></div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(dashboard.quickActions || []).map((action) => (
              action.href ? (
                <a key={action.label} href={action.href} style={{ ...financeSecondaryButton, textDecoration: "none" }}>{action.label}</a>
              ) : (
                <button key={action.label} type="button" style={financeSecondaryButton} onClick={() => onNavigate(action.action === "create-expense" ? "expenses" : action.action === "create-bill" ? "bills" : "dashboard")}>
                  {action.label}
                </button>
              )
            ))}
          </div>
        </div>
      </div>

      {recommendations.length ? (
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Auricrux next actions</div>
          <div style={{ ...financeMutedText, marginBottom: 12 }}>{intelligence?.nextAction}</div>
          <div style={{ display: "grid", gap: 10 }}>
            {recommendations.map((item) => (
              <div key={item.action} style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderTop: "1px solid #f1f5f9", paddingTop: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, textTransform: "capitalize" }}>{item.action.replace(/-/g, " ")}</div>
                  <div style={{ color: "#64748b", fontSize: 13 }}>{item.summary}</div>
                </div>
                {item.href ? (
                  <a href={item.href} style={{ ...financePrimaryButton, textDecoration: "none", fontSize: 13 }}>Open</a>
                ) : (
                  <button type="button" style={{ ...financePrimaryButton, fontSize: 13 }} onClick={() => onNavigate?.("dashboard")}>Review</button>
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
      <FinancePanelShell eyebrow="Expenses" title="Record expense" detail="Capture job or overhead spend and post it to the governed ledger.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={financeInputStyle} placeholder="Payee" value={draft.payee} onChange={(e) => setDraft({ ...draft, payee: e.target.value })} />
          <input style={financeInputStyle} placeholder="Amount" value={draft.amount} onChange={(e) => setDraft({ ...draft, amount: e.target.value })} />
          <input style={financeInputStyle} placeholder="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
          <input style={financeInputStyle} placeholder="Memo" value={draft.memo} onChange={(e) => setDraft({ ...draft, memo: e.target.value })} />
        </div>
        <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={() => onCreate(draft)}>Save expense</button>
      </FinancePanelShell>

      {!(items || []).length ? (
        <PortalEmptyState title="No expenses recorded" detail="Record your first expense to populate job cost and P&L reporting." />
      ) : (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <table style={financeTableStyle}>
            <thead>
              <tr>
                <th style={financeThStyle}>Payee</th>
                <th style={financeThStyle}>Date</th>
                <th style={financeThStyle}>Category</th>
                <th style={financeThStyle}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item) => (
                <tr key={item.expenseId}>
                  <td style={financeTdStyle}>
                    <div style={{ fontWeight: 700 }}>{item.payee}</div>
                    {item.memo ? <div style={{ color: "#64748b", fontSize: 13 }}>{item.memo}</div> : null}
                  </td>
                  <td style={financeTdStyle}>{item.date}</td>
                  <td style={financeTdStyle}>{item.category}</td>
                  <td style={financeTdStyle}><strong>{item.amount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FinanceBillsPanel({ items, onCreate, onPay, busy }) {
  const [draft, setDraft] = useState({ vendorName: "", total: "", billNumber: "", projectId: "A-117" });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <FinancePanelShell eyebrow="Accounts payable" title="Enter bill" detail="Track vendor bills and pay them from FCA Books.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          <input style={financeInputStyle} placeholder="Vendor" value={draft.vendorName} onChange={(e) => setDraft({ ...draft, vendorName: e.target.value })} />
          <input style={financeInputStyle} placeholder="Bill #" value={draft.billNumber} onChange={(e) => setDraft({ ...draft, billNumber: e.target.value })} />
          <input style={financeInputStyle} placeholder="Total" value={draft.total} onChange={(e) => setDraft({ ...draft, total: e.target.value })} />
        </div>
        <button type="button" style={{ ...financePrimaryButton, marginTop: 12 }} disabled={busy} onClick={() => onCreate(draft)}>Save bill</button>
      </FinancePanelShell>

      {!(items || []).length ? (
        <PortalEmptyState title="No bills yet" detail="Enter vendor bills here to manage accounts payable." />
      ) : (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <table style={financeTableStyle}>
            <thead>
              <tr>
                <th style={financeThStyle}>Vendor</th>
                <th style={financeThStyle}>Due</th>
                <th style={financeThStyle}>Status</th>
                <th style={financeThStyle}>Total</th>
                <th style={financeThStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((item) => (
                <tr key={item.billId}>
                  <td style={financeTdStyle}>
                    <div style={{ fontWeight: 700 }}>{item.vendorName}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{item.billNumber}</div>
                  </td>
                  <td style={financeTdStyle}>{item.dueDate}</td>
                  <td style={financeTdStyle}><PortalStatusBadge status={item.status} /></td>
                  <td style={financeTdStyle}><strong>{item.total}</strong></td>
                  <td style={financeTdStyle}>
                    {item.status !== "Paid" ? (
                      <button type="button" style={{ ...financePrimaryButton, fontSize: 12, padding: "8px 12px" }} disabled={busy} onClick={() => onPay(item.billId)}>Pay bill</button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FinanceBankingPanel({ accounts, transactions, onReconcile, busy }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PortalQuickStats
        items={(accounts || []).map((account) => ({
          label: account.name,
          value: `$${Number(account.balance || 0).toLocaleString()}`,
          hint: `${account.unreconciledCount || 0} unreconciled`,
        }))}
      />

      {!(transactions || []).length ? (
        <PortalEmptyState title="No bank transactions" detail="Import a CSV or connect banking activity to reconcile cash." primaryHref="/portal/finance?view=banking" primaryLabel="Open banking" />
      ) : (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <table style={financeTableStyle}>
            <thead>
              <tr>
                <th style={financeThStyle}>Description</th>
                <th style={financeThStyle}>Date</th>
                <th style={financeThStyle}>Status</th>
                <th style={financeThStyle}>Amount</th>
                <th style={financeThStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(transactions || []).map((txn) => (
                <tr key={txn.transactionId}>
                  <td style={financeTdStyle}><strong>{txn.description}</strong></td>
                  <td style={financeTdStyle}>{txn.date}</td>
                  <td style={financeTdStyle}><PortalStatusBadge status={txn.status} /></td>
                  <td style={{ ...financeTdStyle, fontWeight: 700, color: txn.amount < 0 ? "#b91c1c" : "#047857" }}>
                    {txn.amount < 0 ? "-" : "+"}${Math.abs(txn.amount).toLocaleString()}
                  </td>
                  <td style={financeTdStyle}>
                    {txn.status === "unreconciled" ? (
                      <button type="button" style={{ ...financePrimaryButton, fontSize: 12, padding: "8px 12px" }} disabled={busy} onClick={() => onReconcile(txn.transactionId)}>Reconcile</button>
                    ) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function FinanceReportsPanel({ report, availableReports, activeReport, onSelectReport, onExport, busy }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {(availableReports || []).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelectReport(id)}
            style={activeReport === id ? financePrimaryButton : financeSecondaryButton}
          >
            {id.replace(/_/g, " ")}
          </button>
        ))}
        <button type="button" style={financePrimaryButton} disabled={busy} onClick={() => onExport?.(activeReport)}>
          Download CSV
        </button>
      </div>
      {!report ? (
        <PortalEmptyState title="Select a report" detail="Choose P&L, balance sheet, or job cost from the report tabs above." />
      ) : (
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>{report.title}</div>
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
      )}
    </div>
  );
}

export function FinanceMasterDataPanel({ customers, vendors, accounts }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Customers</div>
          {(customers || []).length ? (customers || []).map((item) => (
            <div key={item.customerId} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{item.email} · {item.terms}</div>
              <div style={{ marginTop: 4 }}>Balance: <strong>${Number(item.balance || 0).toLocaleString()}</strong></div>
            </div>
          )) : <div style={financeMutedText}>No customers yet.</div>}
        </div>
        <div style={financeCardStyle}>
          <div style={financeSectionTitle}>Vendors</div>
          {(vendors || []).length ? (vendors || []).map((item) => (
            <div key={item.vendorId} style={{ padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
              <div style={{ fontWeight: 700 }}>{item.name}</div>
              <div style={{ color: "#64748b", fontSize: 13 }}>{item.email} · {item.terms}</div>
              <div style={{ marginTop: 4 }}>Balance: <strong>${Number(item.balance || 0).toLocaleString()}</strong></div>
            </div>
          )) : <div style={financeMutedText}>No vendors yet.</div>}
        </div>
      </div>
      {accounts ? (
        <div style={{ ...financeCardStyle, padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 18, paddingBottom: 0 }}>
            <div style={financeSectionTitle}>Chart of accounts</div>
          </div>
          <table style={financeTableStyle}>
            <thead>
              <tr>
                <th style={financeThStyle}>Account</th>
                <th style={financeThStyle}>Name</th>
                <th style={financeThStyle}>Type</th>
                <th style={financeThStyle}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.accountId}>
                  <td style={financeTdStyle}>{account.accountId}</td>
                  <td style={financeTdStyle}><strong>{account.name}</strong></td>
                  <td style={financeTdStyle}>{account.type}</td>
                  <td style={financeTdStyle}>${Number(account.balance || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
