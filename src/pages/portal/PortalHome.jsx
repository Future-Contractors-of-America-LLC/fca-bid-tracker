import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
};

const metricStyle = {
  fontSize: 28,
  fontWeight: 700,
  margin: "6px 0",
};

export default function PortalHome() {
  return (
    <div style={{ padding: 40, fontFamily: "Arial", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <ShellHeader
          eyebrow="Customer Portal Demo"
          title="Tyler Construction Workspace"
          subtitle="Active pilot with Auricrux-guided next actions, communication visibility, and training continuity."
          primaryHref="/academy"
          primaryLabel="Open Academy"
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Active Projects</div>
            <div style={metricStyle}>4</div>
            <div>2 in estimating, 1 in execution, 1 in closeout</div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Unread Messages</div>
            <div style={metricStyle}>7</div>
            <div>Sales, project coordination, and onboarding updates</div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Documents Ready</div>
            <div style={metricStyle}>18</div>
            <div>Bids, permits, onboarding forms, and training docs</div>
          </div>
          <div style={cardStyle}>
            <div style={{ color: "#6b7280" }}>Auricrux Status</div>
            <div style={metricStyle}>Online</div>
            <div>Monitoring bid status, portal requests, and academy handoff</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 24 }}>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Auricrux Next Actions</h2>
            <ul style={{ paddingLeft: 20, lineHeight: 1.8 }}>
              <li>Review pending customer approval for Bid Package A-117.</li>
              <li>Send onboarding packet to 2 newly assigned field users.</li>
              <li>Confirm safety certification progress before project mobilization.</li>
              <li>Follow up on one open RFI blocking subcontractor pricing.</li>
            </ul>
          </div>
          <div style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Message Preview</h2>
            <div style={{ marginBottom: 12 }}>
              <strong>Estimator Team</strong>
              <div style={{ color: "#4b5563" }}>Bid review updated 18 minutes ago.</div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>Customer Success</strong>
              <div style={{ color: "#4b5563" }}>Training seats confirmed for Monday onboarding.</div>
            </div>
            <div>
              <strong>Auricrux</strong>
              <div style={{ color: "#4b5563" }}>One customer action is ready for approval.</div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, ...cardStyle }}>
          <h2 style={{ marginTop: 0 }}>Demo Walkthrough Path</h2>
          <p style={{ marginBottom: 8 }}>Use this portal view to show the founder shell flow:</p>
          <ol style={{ paddingLeft: 20, lineHeight: 1.8 }}>
            <li>Enter from <a href="/login">demo login</a>.</li>
            <li>Show customer metrics and Auricrux next actions.</li>
            <li>Open the Auricrux dock and send a sample message.</li>
            <li>Transition to the <a href="/academy">academy workspace</a> to show training continuity.</li>
          </ol>
        </div>

        <ShellFooter />
      </div>
    </div>
  );
}
