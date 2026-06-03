import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
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

const rolloutSteps = [
  "Confirm contractor fit, pilot scope, and current operating friction.",
  "Walk the live FCA shell from public entry through workspace, platform dashboard, portal, academy, and bid continuity.",
  "Select the rollout tier that matches readiness, team size, and continuity needs.",
  "Close on founder review, next deployment action, and production planning path.",
];

export default function Pricing() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA Production Planning"
        title="Production rollout planning"
        subtitle="This page is structured to support a real rollout conversation: pilot scope, operating readiness, founder review, and the next production action inside the FCA shell."
        primaryHref="/contact"
        primaryLabel="Request Founder Review"
        secondaryHref="/platform"
        secondaryLabel="Platform Overview"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Production planning flow</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Move from pricing into rollout readiness</h2>
        <p style={{ lineHeight: 1.7, color: "#334155", maxWidth: 860, marginBottom: 0 }}>
          The strongest motion here is not a static price sheet. It is a guided production conversation that ties scope to the live shell, platform dashboard, portal continuity, academy readiness, and Auricrux-guided next actions.
        </p>
        <div>
          <a href="/contact" style={linkStyle}>Request Founder Review</a>
          <a href="/portal/platform" style={{ ...linkStyle, background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}>Open Platform Dashboard</a>
          <a href="/login" style={{ ...linkStyle, background: "#e5e7eb", color: "#111827" }}>Open Demo Workspace</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16, marginBottom: 24, alignItems: "start" }}>
        <div style={{ ...cardStyle, background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
          <h2 style={{ marginTop: 0 }}>Founder rollout checklist</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8, marginBottom: 0, color: "#334155" }}>
            {rolloutSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <WorkspaceSnapshotCard
          title="Pricing now references live shell state"
          detail="This planning surface now points directly at persisted tenant, project, and Auricrux continuity so rollout conversations stay attached to the operating workspace."
          ctaHref="/portal/platform"
          ctaLabel="Review platform state before founder call"
        />
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>How to position the tiers</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            Use these tiers to frame the conversation around operational maturity, rollout depth, and continuity needs. The immediate objective is to match the contractor to the right production path, not to force a generic self-serve checkout motion.
          </p>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Immediate next actions</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <a href="/contact" style={{ display: "inline-block", textDecoration: "none", background: "#111827", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>
              Request Founder Review
            </a>
            <a href="/portal/platform" style={{ display: "inline-block", textDecoration: "none", background: "#eff6ff", color: "#1d4ed8", padding: "10px 14px", borderRadius: 10, fontWeight: 700, border: "1px solid #bfdbfe" }}>
              Open Platform Dashboard
            </a>
            <a href="/portal" style={{ display: "inline-block", textDecoration: "none", background: "#f8fafc", color: "#111827", padding: "10px 14px", borderRadius: 10, fontWeight: 700, border: "1px solid #cbd5e1" }}>
              Open Portal Workspace
            </a>
          </div>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
