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

export default function SupportActionCenter({ session, state, applyPlanPreset, setProductAccess, setCommsAccess, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const needsPhone = enabledComms.phone === false;
  const needsSms = enabledComms.sms === false;
  const needsEmail = enabledComms.email === false;
  const needsTeams = enabledComms.teams === false;
  const needsConference = enabledComms.conference === false;
  const needsLecture = enabledComms.lecture === false;
  const needsLms = enabledProducts.lms === false;
  const canPromoteOperations = ["startup", "pilot", "team"].includes(selectedPlan.key);
  const canPromoteEnterprise = selectedPlan.key !== "enterprise";

  function activateOperationsSupport() {
    applyPlanPreset("operations");
    refreshSyncStamp("Operations support posture activated from support action center");
  }

  function activateEnterpriseSupport() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Enterprise support posture activated from support action center");
  }

  function enableEscalationRecovery() {
    if (needsPhone) setCommsAccess("phone", true);
    if (needsSms) setCommsAccess("sms", true);
    if (needsEmail) setCommsAccess("email", true);
    refreshSyncStamp("Escalation recovery channels enabled from support action center");
  }

  function enableExecutiveSupport() {
    if (needsTeams) setCommsAccess("teams", true);
    if (needsConference) setCommsAccess("conference", true);
    refreshSyncStamp("Executive support coordination enabled from support action center");
  }

  function restoreTrainingSupport() {
    if (needsLms) setProductAccess("lms", true);
    if (needsLecture) setCommsAccess("lecture", true);
    refreshSyncStamp("Training continuity restored from support action center");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live support action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Execute escalation recovery from support instead of reading blocker summaries only</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real customer-session mutations so support can repair communications, restore training continuity, and strengthen commercial recovery directly from the escalation route.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active support posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Enabled comms</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledCount(enabledComms)}/7</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Support should keep phone, SMS, email, Teams, conference, and lecture ready when escalation pressure rises.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current blocker</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{state.auricrux.currentBlocker}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.blockerImpact}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Support owner</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{state.workspace.nextActionOwner}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.workspace.currentNextAction}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Training continuity</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledProducts.lms && enabledComms.lecture ? "Connected" : "Pending"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Support recovery should keep academy coaching and lecture delivery attached to the same customer workspace.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Support plan activation</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote this customer into a stronger support posture so recovery, rollout, and account continuity stay aligned.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={activateOperationsSupport} style={actionButtonStyle("primary")} disabled={!canPromoteOperations}>
              {canPromoteOperations ? "Activate Operations Support" : "Operations Already Covered"}
            </button>
            <button type="button" onClick={activateEnterpriseSupport} style={actionButtonStyle()} disabled={!canPromoteEnterprise}>
              {canPromoteEnterprise ? "Activate Enterprise Support" : "Enterprise Already Active"}
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Escalation communications repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable phone, SMS, and email together so support can recover approvals, billing follow-through, and field issues without channel gaps.
          </div>
          <button type="button" onClick={enableEscalationRecovery} style={actionButtonStyle("primary")} disabled={!needsPhone && !needsSms && !needsEmail}>
            {needsPhone || needsSms || needsEmail ? "Enable Escalation Recovery" : "Escalation Channels Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Executive coordination repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable Teams and conference so support escalations can move into live multi-party coordination without leaving the Auricrux control plane.
          </div>
          <button type="button" onClick={enableExecutiveSupport} style={actionButtonStyle("primary")} disabled={!needsTeams && !needsConference}>
            {needsTeams || needsConference ? "Enable Teams + Conference" : "Coordination Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Training continuity repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Restore LMS and lecture access together so remediation, coaching, and onboarding recovery remain inside the authenticated workspace.
          </div>
          <button type="button" onClick={restoreTrainingSupport} style={actionButtonStyle("primary")} disabled={!needsLms && !needsLecture}>
            {needsLms || needsLecture ? "Restore LMS + Lecture" : "Training Already Connected"}
          </button>
        </div>
      </div>
    </div>
  );
}
