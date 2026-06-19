const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "▦" },
  { id: "construction", label: "Job billing & SOV", icon: "🏗" },
  { id: "payments", label: "Receive payment", icon: "💵" },
  { id: "recurring", label: "Recurring billing", icon: "🔁" },
  { id: "invoices", label: "Invoicing", icon: "📄", href: "/portal/billing" },
  { id: "expenses", label: "Expenses", icon: "💳" },
  { id: "bills", label: "Bills", icon: "🧾" },
  { id: "banking", label: "Banking", icon: "🏦" },
  { id: "customers", label: "Customers & Vendors", icon: "👥" },
  { id: "reports", label: "Reports", icon: "📊" },
  { id: "journal", label: "Journal / GL", icon: "📒" },
  { id: "coa", label: "Chart of Accounts", icon: "📋" },
];

export default function FinanceSidebar({ activeView, onNavigate, companyName }) {
  return (
    <aside style={{ background: "#2b3035", color: "#fff", borderRadius: 16, padding: "20px 0", minHeight: 640, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#9ca3af", marginBottom: 6 }}>Finance</div>
        <div style={{ fontWeight: 800, fontSize: 18, lineHeight: 1.3 }}>{companyName}</div>
        <div style={{ fontSize: 12, color: "#86efac", marginTop: 8, fontWeight: 600 }}>● Books are live</div>
      </div>
      <nav style={{ padding: "12px 10px", flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = activeView === item.id;
          const content = (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 14px",
                borderRadius: 10,
                marginBottom: 4,
                cursor: "pointer",
                background: active ? "#2ca01c" : "transparent",
                color: active ? "#fff" : "#e5e7eb",
                fontWeight: active ? 700 : 500,
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 14 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          );
          if (item.href) {
            return (
              <a key={item.id} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                {content}
              </a>
            );
          }
          return (
            <button key={item.id} type="button" onClick={() => onNavigate(item.id)} style={{ width: "100%", border: "none", background: "transparent", padding: 0, textAlign: "left" }}>
              {content}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: "16px 20px 0", borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>
        FCA Books · GL · CSV import · G702/G703
      </div>
    </aside>
  );
}
