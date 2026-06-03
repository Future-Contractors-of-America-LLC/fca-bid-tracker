import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import { contactPaths, shellJourney } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const checklistStyle = {
  margin: 0,
  paddingLeft: 20,
  lineHeight: 1.8,
  color: "#334155",
};

export default function Contact() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 1120, margin: "0 auto" }}>
      <ShellHeader
        eyebrow="FCA Contact"
        title="Move from interest to founder demo"
        subtitle="This contact surface is structured around the immediate sales objective: converting interest into a founder-led walkthrough, pilot conversation, or broader platform review."
        primaryHref="/login"
        primaryLabel="Open Demo Workspace"
        secondaryHref="/pricing"
        secondaryLabel="Pricing"
        journey={shellJourney}
        currentJourney="conversion"
      />

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 16 }}>
          <WorkspaceSnapshotCard
            title="Founder demo starts from real shell state"
            detail="This conversion page now reinforces that the demo is not a disconnected pitch deck flow. Tenant, project, and Auricrux continuity already exist before the walkthrough begins."
            ctaHref="/portal/platform"
            ctaLabel="Open unified platform dashboard"
          />

          <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
            <h2 style={{ marginTop: 0 }}>What happens in the founder demo</h2>
            <ol style={checklistStyle}>
              <li>Frame the FCA platform story from the public shell.</li>
              <li>Show persisted workspace continuity before entry.</li>
              <li>Open the platform dashboard to summarize tenant, project, support, academy, and admin state.</li>
              <li>Transition into portal, academy, and bid routes based on customer fit.</li>
              <li>Close on pilot scope, rollout path, and next production action.</li>
            </ol>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {contactPaths.map((path) => (
            <div key={path.title} style={cardStyle}>
              <h3 style={{ marginTop: 0 }}>{path.title}</h3>
              <p style={{ color: "#4b5563", lineHeight: 1.6 }}>{path.detail}</p>
              <a
                href={path.cta}
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  background: "#111827",
                  color: "#fff",
                  padding: "10px 14px",
                  borderRadius: 10,
                  fontWeight: 700,
                }}
              >
                {path.label}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Immediate founder CTA</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 12 }}>
          For this stage of the product, the strongest conversion path is still a direct founder-led walkthrough. This page supports that motion while the underlying platform continues to harden.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a href="/login" style={{ display: "inline-block", textDecoration: "none", background: "#111827", color: "#fff", padding: "10px 14px", borderRadius: 10, fontWeight: 700 }}>
            Open Demo Workspace
          </a>
          <a href="/portal/platform" style={{ display: "inline-block", textDecoration: "none", background: "#eff6ff", color: "#1d4ed8", padding: "10px 14px", borderRadius: 10, fontWeight: 700, border: "1px solid #bfdbfe" }}>
            Open Platform Dashboard
          </a>
          <a href="mailto:hello@futurecontractorsofamerica.com?subject=Founder%20Demo%20Request" style={{ display: "inline-block", textDecoration: "none", background: "#f8fafc", color: "#111827", padding: "10px 14px", borderRadius: 10, fontWeight: 700, border: "1px solid #d1d5db" }}>
            Request Founder Demo
          </a>
        </div>
      </div>

      <ShellFooter />
    </div>
  );
}
