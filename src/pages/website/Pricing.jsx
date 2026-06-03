import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { pricingTiers, shellJourney } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const linkStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginRight: 10,
  marginTop: 12,
};

export default function Pricing() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA Pricing"
        title="Pitch-ready pricing conversation"
        subtitle="This page is structured to support sales conversations now, even while deeper backend and delivery systems continue to mature behind the shell."
        primaryHref="/contact"
        primaryLabel="Request Demo"
        secondaryHref="/platform"
        secondaryLabel="Platform Overview"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Conversion flow</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Move from pricing conversation into a live founder walkthrough</h2>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          The strongest motion right now is to connect pricing directly to the product shell. Use this page to frame scope, then move prospects into the live workspace, customer portal, academy continuity, and Auricrux-guided demo path.
        </p>
        <div>
          <a href="/contact" style={linkStyle}>Request Demo</a>
          <a href="/login" style={{ ...linkStyle, background: "#e5e7eb", color: "#111827" }}>Open Demo Workspace</a>
          <a href="/portal" style={{ ...linkStyle, background: "#f8fafc", color: "#111827", border: "1px solid #cbd5e1" }}>View Portal</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {pricingTiers.map((tier) => (
          <div key={tier.name} style={cardStyle}>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{tier.name}</div>
            <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 12 }}>{tier.price}</div>
            <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{tier.detail}</p>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0 }}>
              {tier.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Sales guidance</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          Use these tiers to frame the conversation around scope and rollout maturity. The immediate objective is not a static price sheet—it is a confident founder-led path into pilot, expansion, and broader operating-system adoption.
        </p>
      </div>

      <ShellFooter />
    </div>
  );
}
