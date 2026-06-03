const linkStyle = {
  textDecoration: "none",
  color: "#111827",
  fontWeight: 600,
};

export default function ShellFooter() {
  return (
    <div
      style={{
        marginTop: 40,
        padding: "24px 0 12px",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>
            FCA Demo Conversion Path
          </div>
          <div style={{ color: "#4b5563", lineHeight: 1.7 }}>
            Use this shell to pitch the full contractor lifecycle: entry,
            portal visibility, academy enablement, and Auricrux-guided next
            actions.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Demo Links</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/login" style={linkStyle}>Enter Demo Workspace</a>
            <a href="/portal" style={linkStyle}>Customer Portal</a>
            <a href="/academy" style={linkStyle}>FCA Academy</a>
            <a href="/tyler-entry/" style={linkStyle}>Bid Entry</a>
            <a href="/tyler-status/" style={linkStyle}>Bid Status</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Legacy Customer UI</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Bid Entry and Bid Status open the classic customer-facing tools while
            the new FCA shell remains the primary demo surface.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/fca-customer-entry/index.html" style={linkStyle}>Open classic customer intake</a>
            <a href="/fca-customer-status/index.html" style={linkStyle}>Open classic customer status</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sales CTA</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Ready for a founder-led walkthrough or pilot discussion.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/login"
              style={{
                textDecoration: "none",
                background: "#111827",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Start Demo
            </a>
            <a
              href="mailto:hello@futurecontractorsofamerica.com?subject=FCA%20Demo%20Request"
              style={{
                textDecoration: "none",
                background: "#f3f4f6",
                color: "#111827",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
                border: "1px solid #d1d5db",
              }}
            >
              Request Demo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
