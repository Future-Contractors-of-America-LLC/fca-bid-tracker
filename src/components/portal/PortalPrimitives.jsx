import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalTokens,
} from "../../portalDesignTokens";

export function formatFinanceViewTitle(view = "dashboard") {
  const labels = {
    dashboard: "Finance dashboard",
    construction: "Job billing & schedule of values",
    payments: "Receive payment",
    recurring: "Recurring billing",
    expenses: "Expenses",
    bills: "Bills & accounts payable",
    banking: "Banking & reconciliation",
    customers: "Customers & vendors",
    reports: "Financial reports",
    journal: "Journal register",
    coa: "Chart of accounts",
  };
  return labels[view] || "Finance workspace";
}

export function PortalAlert({ tone = "info", title, children, onDismiss }) {
  const palette = {
    info: { border: "#bfdbfe", background: "#eff6ff", color: "#1e3a8a" },
    success: { border: "#86efac", background: "#ecfdf5", color: "#166534" },
    warning: { border: "#fde68a", background: "#fffbeb", color: "#92400e" },
    error: { border: "#fecaca", background: "#fef2f2", color: "#991b1b" },
  }[tone];

  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, border: `1px solid ${palette.border}`, background: palette.background, color: palette.color }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        <div>
          {title ? <strong style={{ display: "block", marginBottom: 6 }}>{title}</strong> : null}
          <div style={{ lineHeight: 1.6 }}>{children}</div>
        </div>
        {onDismiss ? (
          <button type="button" onClick={onDismiss} style={{ border: "none", background: "transparent", color: "inherit", cursor: "pointer", fontWeight: 700 }}>
            Dismiss
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function PortalEmptyState({ title, detail, primaryHref, primaryLabel, secondaryHref, secondaryLabel }) {
  return (
    <div style={{ ...portalCardStyle, textAlign: "center", padding: "36px 24px", background: `linear-gradient(180deg, ${portalTokens.primarySoft} 0%, ${portalTokens.panel} 100%)` }}>
      <div style={{ ...portalEyebrowStyle, marginBottom: 8 }}>Nothing here yet</div>
      <h2 style={{ margin: "0 0 10px", fontSize: "1.25rem" }}>{title}</h2>
      <p style={{ color: portalTokens.body, lineHeight: 1.65, maxWidth: 520, margin: "0 auto 18px" }}>{detail}</p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {primaryHref ? <a href={primaryHref} style={portalButtonPrimary}>{primaryLabel}</a> : null}
        {secondaryHref ? <a href={secondaryHref} style={portalButtonSecondary}>{secondaryLabel}</a> : null}
      </div>
    </div>
  );
}

export function PortalLoadingState({ label = "Loading workspace data..." }) {
  return (
    <div style={{ ...portalCardStyle, display: "grid", gap: 10 }}>
      <div style={{ color: portalTokens.muted, fontWeight: 600 }}>{label}</div>
      {[1, 2, 3].map((row) => (
        <div key={row} style={{ height: 54, borderRadius: 12, background: "linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)", backgroundSize: "200% 100%", animation: "fcaPulse 1.4s ease infinite" }} />
      ))}
      <style>{`@keyframes fcaPulse { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }`}</style>
    </div>
  );
}

export function PortalQuickStats({ items = [] }) {
  if (!items.length) return null;
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 16 }}>
      {items.map((item) => (
        <div key={item.label} style={{ ...portalCardStyle, padding: 14 }}>
          <div style={{ ...portalEyebrowStyle, marginBottom: 6 }}>{item.label}</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: portalTokens.ink }}>{item.value}</div>
          {item.hint ? <div style={{ color: portalTokens.muted, fontSize: 12, marginTop: 4 }}>{item.hint}</div> : null}
        </div>
      ))}
    </div>
  );
}

export function PortalPageIntro({ eyebrow, title, detail, actions = null }) {
  return (
    <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
      {eyebrow ? <div style={portalEyebrowStyle}>{eyebrow}</div> : null}
      {title ? <h2 style={{ margin: "6px 0 8px", fontSize: "1.2rem" }}>{title}</h2> : null}
      {detail ? <p style={{ color: portalTokens.body, lineHeight: 1.65, margin: 0 }}>{detail}</p> : null}
      {actions ? <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>{actions}</div> : null}
    </div>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 14,
};

const thStyle = {
  textAlign: "left",
  padding: "12px 14px",
  borderBottom: `1px solid ${portalTokens.border}`,
  color: portalTokens.muted,
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const tdStyle = {
  padding: "14px",
  borderBottom: `1px solid ${portalTokens.border}`,
  verticalAlign: "top",
};

export function PortalStatusBadge({ status, active = false }) {
  const normalized = String(status || "").toLowerCase();
  let tone = { background: portalTokens.surface, color: portalTokens.body, border: portalTokens.border };
  if (["paid", "qualified", "won", "complete", "done"].some((token) => normalized.includes(token))) {
    tone = { background: "#ecfdf5", color: "#166534", border: "#86efac" };
  } else if (["issued", "in review", "mobilization"].some((token) => normalized.includes(token))) {
    tone = { background: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  } else if (["draft", "new", "pending"].some((token) => normalized.includes(token))) {
    tone = { background: "#fffbeb", color: "#92400e", border: "#fde68a" };
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "5px 10px", borderRadius: 999, fontSize: 12, fontWeight: 700, border: `1px solid ${tone.border}`, background: active ? portalTokens.primarySoft : tone.background, color: active ? portalTokens.primaryInk : tone.color }}>
      {status}
    </span>
  );
}

export function PortalEntityTable({ columns, rows, emptyTitle, emptyDetail, emptyPrimaryHref, emptyPrimaryLabel }) {
  if (!rows.length) {
    return (
      <PortalEmptyState
        title={emptyTitle}
        detail={emptyDetail}
        primaryHref={emptyPrimaryHref}
        primaryLabel={emptyPrimaryLabel}
      />
    );
  }

  return (
    <div style={{ ...portalCardStyle, padding: 0, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={tableStyle}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} style={{ ...thStyle, width: column.width }}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} style={{ background: row.active ? portalTokens.primarySoft : portalTokens.panel }}>
                {columns.map((column) => (
                  <td key={column.key} style={tdStyle}>
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function PortalWorkflowStepper({ steps, currentKey, completeMap = {} }) {
  const currentIndex = steps.findIndex((step) => step.key === currentKey);
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))`, gap: 8, marginBottom: 16 }}>
      {steps.map((step, index) => {
        const done = completeMap[step.key];
        const active = currentIndex === index;
        return (
          <div
            key={step.key}
            style={{
              borderRadius: 12,
              padding: "12px 10px",
              border: active ? `2px solid ${portalTokens.primary}` : `1px solid ${portalTokens.border}`,
              background: done ? "#ecfdf5" : active ? portalTokens.primarySoft : portalTokens.surface,
              minHeight: 72,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: portalTokens.muted, marginBottom: 4 }}>Step {index + 1}</div>
            <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.35 }}>{done ? `Done: ${step.label}` : step.label}</div>
          </div>
        );
      })}
    </div>
  );
}
