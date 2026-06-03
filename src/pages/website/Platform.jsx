import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { platformModules } from "../../websiteShell";

const heroCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 24,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
};

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function Platform() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA Platform"
        title="One contractor lifecycle operating system"
        subtitle="FCA is being shaped as a unified operating surface for sales, portal visibility, project follow-through, workforce enablement, and Auricrux-guided execution."
        primaryHref="/login"
        primaryLabel="Open Demo Workspace"
        secondaryHref="/pricing"
        secondaryLabel="View Pricing"
      />

      <div style={heroCardStyle}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Platform story</div>
        <h2 style={{ marginTop: 0 }}>Built to feel like one connected system</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>
          The current shell is designed for founder-led sales conversations and believable customer demos. It shows how FCA can carry a contractor from public entry into login, portal operations, bid visibility, academy continuity, and Auricrux-guided next actions without fragmenting the experience.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
        {platformModules.map((module) => (
          <div key={module.title} style={cardStyle}>
            <h3 style={{ marginTop: 0 }}>{module.title}</h3>
            <p style={{ color: "#4b5563", lineHeight: 1.6, marginBottom: 0 }}>{module.detail}</p>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Current founder demo path</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Start on the public home page and frame the FCA platform story.</li>
            <li>Enter through <a href="/login">demo login</a>.</li>
            <li>Show the <a href="/portal">customer portal</a> and module continuity.</li>
            <li>Transition into <a href="/portal/academy">academy continuity</a>.</li>
            <li>Use the Auricrux dock to narrate next actions and system visibility.</li>
          </ol>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Linked product surfaces</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <a href="/portal" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Customer Portal Workspace</a>
            <a href="/academy" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>FCA Academy</a>
            <a href="/bid-entry/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Entry Tool</a>
            <a href="/bid-status/" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Bid Status Tool</a>
          </div>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
