import { resolvePlanPreset } from "../pricingPlans";

const shellStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const actionButtonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#1d4ed8" : "#fff",
  color: tone === "primary" ? "#fff" : "#0f172a",
  font: "inherit",
});

function enabledCount(selection = {}) {
  return Object.values(selection).filter(Boolean).length;
}

export default function MessageActionCenter({ session, state, applyPlanPreset, setProductAccess, setCommsAccess, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const needsRevenueChannels = enabledComms.sms === false || enabledComms.phone === false || enabledComms.email === false;
  const needsCoordinationChannels = enabledComms.teams === false || enabledComms.conference === false;
  const needsLecture = enabledComms.lecture === false;
  const needsLms = enabledProducts.lms === false;
  const canPromoteOperations = ["startup", "pilot", "team"].includes(selectedPlan.key);
  const canPromoteGrowth = ["startup", "pilot", "team", "operations"].includes(selectedPlan.key);

  function activateOperationsMessaging() {
    applyPlanPreset("operations");
    refreshSyncStamp("Operations messaging posture activated from message action center");
  }

  function activateGrowthMessaging() {
    applyPlanPreset("growth");
    refreshSyncStamp("Growth messaging posture activated from message action center");
  }

  function enableRevenueFollowThrough() {
    if (enabledComms.email === false) setCommsAccess("email", true);
    if (enabledComms.sms === false) setCommsAccess("sms", true);
    if (enabledComms.phone === false) setCommsAccess("phone", true);
    refreshSyncStamp("Revenue follow-through channels enabled from message action center");
  }

  function enableExecutiveCoordination() {
    if (enabledComms.teams === false) setCommsAccess("teams", true);
    if (enabledComms.conference === false) setCommsAccess("conference", true);
    refreshSyncStamp("Executive coordination channels enabled from message action center");
  }

  function restoreAcademyLectureLane() {
    if (enabledProducts.lms === false) setProductAccess("lms", true);
    if (enabledComms.lecture === false) setCommsAccess("lecture", true);
    refreshSyncStamp("Academy lecture continuity restored from message action center");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live message action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Execute channel recovery and customer follow-through from messages instead of reading coordination summaries only</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real session mutations so communications, commercial response, academy continuity, and Auricrux coordination can recover directly from the route where message breakdown appears.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active comms posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Enabled channels</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledCount(enabledComms)}/7</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Email, SMS, phone, Teams, conference, lecture, and chat stay tied to one customer session.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Commercial blocker</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{state.auricrux.currentBlocker}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.blockerImpact}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Next customer move</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{state.workspace.currentNextAction}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.nextRecommendedAction}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Academy continuity</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledProducts.lms && enabledComms.lecture ? "Connected" : "Pending"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Lecture delivery and LMS access should remain attached to the same communications control plane.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Commercial messaging activation</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote the customer into a plan posture that supports stronger response coverage and rollout coordination.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={activateOperationsMessaging} style={actionButtonStyle("primary")} disabled={!canPromoteOperations}>
              {canPromoteOperations ? "Activate Operations Messaging" : "Operations Already Covered"}
            </button>
            <button type="button" onClick={activateGrowthMessaging} style={actionButtonStyle()} disabled={!canPromoteGrowth}>
              {canPromoteGrowth ? "Activate Growth Messaging" : "Growth Already Covered"}
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Revenue follow-through repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable email, SMS, and phone together so customer approvals, invoice follow-up, and urgent recovery are not bottlenecked by missing channels.
          </div>
          <button type="button" onClick={enableRevenueFollowThrough} style={actionButtonStyle("primary")} disabled={!needsRevenueChannels}>
            {needsRevenueChannels ? "Enable Revenue Follow-Through" : "Revenue Channels Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Executive coordination repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable Teams and conference together so customer reviews, internal handoffs, and Auricrux-led escalation stay inside one control plane.
          </div>
          <button type="button" onClick={enableExecutiveCoordination} style={actionButtonStyle("primary")} disabled={!needsCoordinationChannels}>
            {needsCoordinationChannels ? "Enable Teams + Conference" : "Coordination Channels Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Academy lecture continuity repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Restore LMS and lecture access together so training, coaching, and rollout messaging do not drift outside the authenticated workspace.
          </div>
          <button type="button" onClick={restoreAcademyLectureLane} style={actionButtonStyle("primary")} disabled={!needsLecture && !needsLms}>
            {needsLecture || needsLms ? "Restore LMS + Lecture" : "LMS + Lecture Already Connected"}
          </button>
        </div>
      </div>
    </div>
  );
}
