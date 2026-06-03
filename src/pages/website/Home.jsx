const ctaStyle = {
  display: "inline-block",
  marginRight: 12,
  marginTop: 12,
  padding: "12px 18px",
  borderRadius: 10,
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  fontWeight: 600,
};

const secondaryStyle = {
  ...ctaStyle,
  background: "#f3f4f6",
  color: "#111827",
  border: "1px solid #d1d5db",
};

export default function Home() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 960 }}>
      <p style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>
        FCA + Auricrux Unified Shell
      </p>
      <h1 style={{ marginBottom: 12 }}>Future Contractors of America</h1>

      <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 760 }}>
        Unified construction platform for sales, customer portal operations,
        workforce training, and Auricrux-guided execution.
      </p>

      <div style={{ marginTop: 20 }}>
        <a href="/login" style={ctaStyle}>Enter Demo Workspace</a>
        <a href="/portal" style={secondaryStyle}>Open Customer Portal</a>
        <a href="/academy" style={secondaryStyle}>Open Academy</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 36 }}>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Customer Portal</h3>
          <p>Projects, files, notifications, and customer-facing task visibility.</p>
          <a href="/portal">View portal demo</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>FCA Academy</h3>
          <p>Training pathways, certification progress, and workforce readiness.</p>
          <a href="/academy">View academy demo</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Bid Product</h3>
          <p>Existing product UI remains available for bid entry and bid status review.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/tyler-entry/">Bid Entry</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/tyler-status/">Bid Status</a>
          </div>
        </div>
      </div>
    </div>
  );
}
