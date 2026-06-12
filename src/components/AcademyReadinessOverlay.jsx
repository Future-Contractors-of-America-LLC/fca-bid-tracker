import { resolvePlanPreset } from "../pricingPlans";

const shellStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 24,
};

const cardStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 12,
  padding: 14,
  background: "#fff",
};

const actionButtonStyle = (tone = "primary") => ({
  border: tone === "primary" ? "1px solid #8a6a14" : "1px solid #d6c28a",
  borderRadius: 10,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
  background: tone === "primary" ? "#8a6a14" : "#fff",
  color: tone === "primary" ? "#fff" : "#6b5a19",
  font: "inherit",
});

export default function AcademyReadinessOverlay({ session, setProductAccess, setCommsAccess, applyPlanPreset, refreshSyncStamp, readiness = null }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const needsLms = enabledProducts.lms === false;
  const needsLecture = enabledComms.lecture === false;
  const needsEmail = enabledComms.email === false;
  const needsConference = enabledComms.conference === false;
  const needsTeams = enabledComms.teams === false;
  const academyBlocked = readiness?.readinessStatus === "blocked";
  const academyInProgress = readiness?.readinessStatus === "in-progress";
  const missingCount = [needsLms, needsLecture, needsEmail, needsConference, needsTeams, academyBlocked].filter(Boolean).length;

  if (missingCount === 0 && !academyInProgress) return null;

  function repairAcademyDependencies() {
    if (needsLms) setProductAccess("lms", true);
    if (needsLecture) setCommsAccess("lecture", true);
    if (needsEmail) setCommsAccess("email", true);
    if (needsConference) setCommsAccess("conference", true);
    if (needsTeams) setCommsAccess("teams", true);
    refreshSyncStamp("Repaired academy readiness dependencies from proactive overlay");
  }

  function activateEnterpriseAcademyReadiness() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Activated enterprise academy readiness from proactive overlay");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Proactive academy readiness</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Academy should repair training dependencies before learners hit continuity gaps</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            Auricrux now checks LMS, coaching lanes, and project-linked training readiness before academy continuity breaks downstream.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active academy posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{missingCount} academy dependency{missingCount === 1 ? "" : "ies"} need repair</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>LMS dependency</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{needsLms ? "Pending" : "Ready"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Academy product access should remain active for onboarding, safety, and rollout continuity.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Lecture and coaching lanes</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{[needsLecture, needsConference, needsTeams].filter(Boolean).length}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Lecture, conference, and Teams channels should stay available for training delivery and multi-party coaching.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Project readiness</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{readiness?.readinessStatus || "Unknown"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{readiness?.blockingReason || readiness?.nextAcademyAction || "Project-linked academy readiness has not been loaded yet."}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Follow-through lane</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{needsEmail ? "Pending" : "Ready"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Email continuity should remain enabled for assignments, certification reminders, and rollout summaries.</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={repairAcademyDependencies} style={actionButtonStyle("primary")}>
          Repair Academy Dependencies
        </button>
        <button type="button" onClick={activateEnterpriseAcademyReadiness} style={actionButtonStyle()}>
          Activate Enterprise Academy Readiness
        </button>
      </div>
    </div>
  );
}
