import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import { shellJourney } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  border: "1px solid #dbe3ef",
};

const actionLinkStyle = {
  display: "inline-block",
  textDecoration: "none",
  background: "#111827",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  marginTop: 12,
  marginRight: 10,
};

export default function AcademyHome() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <ShellHeader
          eyebrow="FCA Academy"
          title="Training, Certification, and Workforce Readiness"
          subtitle="Academy shell connected to the same customer journey shown in the portal, so onboarding and training remain part of one operating flow."
          primaryHref="/portal"
          primaryLabel="Return to Portal"
          secondaryHref="/contact"
          secondaryLabel="Request Rollout"
          journey={shellJourney}
          currentJourney="academy"
        />

        <div style={{ ...actionCardStyle, marginBottom: 24 }}>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Academy continuity</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>This route closes the customer lifecycle story</h2>
          <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 0 }}>
            The academy is no longer a side destination. It shows how FCA can take the same customer from portal activity into workforce readiness, certification tracking, and ongoing enablement with Auricrux still visible across the journey.
          </p>
          <div>
            <a href="/portal/academy" style={actionLinkStyle}>Open Portal Academy Route</a>
            <a href="/pricing" style={{ ...actionLinkStyle, background: "#e5e7eb", color: "#111827" }}>Production Planning</a>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Learners Enrolled</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>24</div>
            <div>Across onboarding, safety, and estimating tracks</div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Certifications In Progress</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>9</div>
            <div>OSHA, field readiness, and platform onboarding</div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Completion Rate</div>
            <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>87%</div>
            <div>Workspace KPI for rollout confidence</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Recommended Learning Path</h2>
            <ol style={{ paddingLeft: 20, lineHeight: 1.9 }}>
              <li>Welcome to FCA Workspace</li>
              <li>Customer Portal Navigation</li>
              <li>Bid Workflow Fundamentals</li>
              <li>Field Onboarding and Safety Readiness</li>
              <li>Auricrux Guided Execution Overview</li>
            </ol>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Auricrux Coaching Notes</h2>
            <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
              <div>• Two new learners are ready for onboarding assignment.</div>
              <div>• One certification expires in 14 days.</div>
              <div>• Portal activity suggests scheduling estimating refresher training.</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Connected portal routes</h2>
            <div style={{ display: "grid", gap: 12 }}>
              <a href="/portal/projects" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Projects → show delivery continuity</a>
              <a href="/portal/files" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Files → show onboarding and compliance docs</a>
              <a href="/portal/messages" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Messages → show Auricrux follow-through</a>
              <a href="/portal/billing" style={{ textDecoration: "none", color: "#111827", fontWeight: 700 }}>Billing → show commercial continuity</a>
            </div>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Production close</h2>
            <p style={{ lineHeight: 1.7, color: "#4b5563" }}>
              Use this screen to prove FCA is not just a bid tool. The same customer can move from sales and portal visibility into workforce enablement, compliance readiness, and long-term support.
            </p>
            <a href="/contact" style={actionLinkStyle}>Book Production Review</a>
          </div>
        </div>

        <div style={{ marginTop: 24, ...cardStyle }}>
          <h2 style={{ marginTop: 0 }}>Why this matters in rollout</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            FCA is not just a bid tool. The academy view proves the system can carry a customer from sales and onboarding into workforce enablement, compliance visibility, and long-term operational support.
          </p>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
