import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import { shellJourney } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  background: "#fff",
};

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid #d1d5db",
  marginTop: 8,
  marginBottom: 16,
  boxSizing: "border-box",
};

const moduleStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 14,
  background: "#f8fafc",
};

export default function Login() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Arial", padding: 24 }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <ShellHeader
          eyebrow="Auricrux Guided Entry"
          title="Access FCA Workspace"
          subtitle="This workspace entry routes customers into the unified FCA shell for portal operations, lifecycle visibility, academy continuity, and Auricrux-guided execution."
          primaryHref="/portal"
          primaryLabel="Continue to Workspace"
          journey={shellJourney}
          currentJourney="workspace"
        />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(320px, 520px) 1fr", gap: 20, alignItems: "start" }}>
          <div style={cardStyle}>
            <label>Work Email</label>
            <input style={fieldStyle} defaultValue="pilot@fca-demo.com" />

            <label>Company</label>
            <input style={fieldStyle} defaultValue="FCA Pilot Customer" />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <a href="/portal" style={{ padding: "12px 18px", borderRadius: 10, textDecoration: "none", background: "#111827", color: "#fff", fontWeight: 700 }}>
                Continue to Workspace
              </a>
              <a href="/portal/platform" style={{ padding: "12px 18px", borderRadius: 10, textDecoration: "none", background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, border: "1px solid #bfdbfe" }}>
                Open Platform Dashboard
              </a>
              <a href="/academy" style={{ padding: "12px 18px", borderRadius: 10, textDecoration: "none", background: "#e5e7eb", color: "#111827", fontWeight: 700 }}>
                Open Academy
              </a>
            </div>
          </div>

          <div style={{ display: "grid", gap: 16 }}>
            <WorkspaceSnapshotCard
              title="Workspace continuity before login"
              detail="Customers can see that tenant, project, and Auricrux state already exist before entering the portal, reinforcing one continuous operating shell."
              ctaHref="/portal"
              ctaLabel="Continue into portal workspace"
            />

            <div style={{ ...cardStyle, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)" }}>
              <h2 style={{ marginTop: 0 }}>What opens after entry</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {[
                  ["Projects", "Execution visibility and stage continuity"],
                  ["Bids", "Approval queue and pipeline context"],
                  ["Files", "Bid packages, permits, and onboarding docs"],
                  ["Messages", "Auricrux-guided customer communications"],
                  ["Billing", "Invoice readiness and account follow-through"],
                  ["Academy", "Workforce training continuity"],
                ].map(([title, detail]) => (
                  <div key={title} style={moduleStyle}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                    <div style={{ color: "#4b5563", lineHeight: 1.5 }}>{detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
