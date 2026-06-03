import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { pricingTiers } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
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
      />

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
