import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import WorkspaceSnapshotCard from "../../components/WorkspaceSnapshotCard";
import { shellJourney } from "../../websiteShell";
import { cardStyle, ctaLightStyle, ctaPrimaryStyle, ctaSecondaryStyle, heroCardStyle, pageShellStyle, responsiveGrid, twoColumnGridStyle } from "../../publicShellStyles";

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
      <div style={pageShellStyle}>
        <ShellHeader
          eyebrow="Auricrux Guided Entry"
          title="Access FCA Workspace"
          subtitle="This workspace entry routes customers into the unified FCA shell for portal operations, lifecycle visibility, academy continuity, and Auricrux-guided execution."
          primaryHref="/portal"
          primaryLabel="Continue to Workspace"
          journey={shellJourney}
          currentJourney="workspace"
        />

        <div style={{ ...heroCardStyle, marginBottom: 20 }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Workspace continuity</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>Entry now feels like part of the operating shell</h2>
          <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
            This route now carries the same visual rhythm as the rest of the public shell while keeping the strongest conversion path focused on entering the FCA workspace and unified platform dashboard.
          </p>
        </div>

        <div style={twoColumnGridStyle}>
          <div style={cardStyle}>
            <label>Work Email</label>
            <input style={fieldStyle} defaultValue="pilot@fca-demo.com" />

            <label>Company</label>
            <input style={fieldStyle} defaultValue="FCA Pilot Customer" />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <a href="/portal" style={ctaPrimaryStyle}>
                Continue to Workspace
              </a>
              <a href="/portal/platform" style={ctaSecondaryStyle}>
                Open Platform Dashboard
              </a>
              <a href="/academy" style={ctaLightStyle}>
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
              <div style={responsiveGrid(180)}>
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
