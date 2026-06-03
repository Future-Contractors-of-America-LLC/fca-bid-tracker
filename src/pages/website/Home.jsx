import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";

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
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA + Auricrux Unified Shell"
        title="Future Contractors of America"
        subtitle="Unified contractor lifecycle platform for sales, portal operations, bid visibility, workforce readiness, and Auricrux-guided execution."
        primaryHref="/login"
        primaryLabel="Enter Demo Workspace"
        secondaryHref="/platform"
        secondaryLabel="Explore Platform"
      />

      <div style={{ marginTop: 20 }}>
        <a href="/login" style={ctaStyle}>Enter Demo Workspace</a>
        <a href="/platform" style={secondaryStyle}>Platform Overview</a>
        <a href="/auricrux" style={secondaryStyle}>Meet Auricrux</a>
        <a href="/pricing" style={secondaryStyle}>Pricing</a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 36 }}>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Platform Story</h3>
          <p>Show FCA as one connected operating system instead of a standalone tool.</p>
          <a href="/platform">View platform page</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Auricrux Layer</h3>
          <p>Frame the intelligence layer that keeps next actions and continuity visible across the shell.</p>
          <a href="/auricrux">View Auricrux page</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Customer Portal</h3>
          <p>Projects, files, notifications, billing follow-through, and customer-facing visibility.</p>
          <a href="/portal">View portal demo</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>FCA Academy</h3>
          <p>Training pathways, certification progress, and workforce readiness tied to the same customer journey.</p>
          <a href="/academy">View academy demo</a>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>FCA Bid Product</h3>
          <p>FCA and Auricrux branded bid entry and bid status tools remain available for customer use.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/bid-entry/">Bid Entry</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/bid-status/">Bid Status</a>
          </div>
          <p style={{ marginTop: 12, color: "#4b5563", lineHeight: 1.6 }}>
            Direct FCA customer tool links are also available for deployment validation.
          </p>
          <div style={{ marginTop: 8 }}>
            <a href="/fca-customer-entry/index.html">FCA customer intake</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/fca-customer-status/index.html">FCA customer status</a>
          </div>
        </div>
        <div style={{ padding: 18, border: "1px solid #e5e7eb", borderRadius: 12 }}>
          <h3 style={{ marginTop: 0 }}>Pricing and Contact</h3>
          <p>Support founder-led sales motion with pitch-ready pricing language and direct demo requests.</p>
          <div style={{ marginTop: 10 }}>
            <a href="/pricing">Pricing</a>
            <span style={{ margin: "0 8px" }}>•</span>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
