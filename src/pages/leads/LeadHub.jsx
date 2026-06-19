export default function LeadHub() {
  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, Arial, sans-serif", maxWidth: 900, margin: "0 auto" }}>
      <h1>FCA Lead Intelligence</h1>
      <p style={{ color: "#64748b", lineHeight: 1.6 }}>
        Enterprise lead generation backed by Auricrux Central. Mobile experiences ship via auricrux-mobile-maui.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <a href="/leads/index.html" style={{ padding: "12px 18px", background: "#2563eb", color: "white", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          Open Lead Pipeline
        </a>
        <a href="/leads/new.html" style={{ padding: "12px 18px", background: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          Capture Lead
        </a>
        <a href="/pipeline/" style={{ padding: "12px 18px", background: "white", color: "#0f172a", border: "1px solid #e2e8f0", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
          Auricrux Sync
        </a>
      </div>
    </div>
  );
}
