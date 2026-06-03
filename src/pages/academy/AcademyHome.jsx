import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
};

export default function AcademyHome() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <ShellHeader
          eyebrow="FCA Academy Demo"
          title="Training, Certification, and Workforce Readiness"
          subtitle="Academy shell connected to the same customer journey shown in the portal."
          primaryHref="/portal"
          primaryLabel="Return to Portal"
        />

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
            <div>Demo KPI for customer rollout confidence</div>
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

        <div style={{ marginTop: 24, ...cardStyle }}>
          <h2 style={{ marginTop: 0 }}>Why this matters in the pitch</h2>
          <p style={{ lineHeight: 1.7 }}>
            FCA is not just a bid tool. The academy view proves the system can carry a customer from sales and onboarding into workforce enablement, compliance visibility, and long-term operational support.
          </p>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
