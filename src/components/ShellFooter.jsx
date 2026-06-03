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
            Use this shell to pitch the full contractor lifecycle: public entry,
            platform framing, portal visibility, academy enablement, and
            Auricrux-guided next actions.
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Public Pages</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/platform" style={linkStyle}>Platform</a>
            <a href="/auricrux" style={linkStyle}>Auricrux</a>
            <a href="/pricing" style={linkStyle}>Pricing</a>
            <a href="/contact" style={linkStyle}>Contact</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Canonical Demo Routes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/login" style={linkStyle}>Enter Demo Workspace</a>
            <a href="/portal" style={linkStyle}>Customer Portal</a>
            <a href="/academy" style={linkStyle}>FCA Academy</a>
            <a href="/bid-entry/" style={linkStyle}>Bid Entry</a>
            <a href="/bid-status/" style={linkStyle}>Bid Status</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Compatibility Routes</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Legacy customer intake and status surfaces remain available for continuity,
            but the canonical FCA shell routes above should be used first.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="/fca-customer-entry/index.html" style={linkStyle}>Legacy intake route</a>
            <a href="/fca-customer-status/index.html" style={linkStyle}>Legacy status route</a>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Sales CTA</div>
          <div style={{ color: "#4b5563", lineHeight: 1.7, marginBottom: 12 }}>
            Ready for a founder-led walkthrough or pilot discussion.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href="/contact"
              style={{
                textDecoration: "none",
                background: "#111827",
                color: "#fff",
                padding: "10px 14px",
                borderRadius: 10,
                fontWeight: 700,
              }}
            >
              Request Demo
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
              Email FCA
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
