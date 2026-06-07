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

function summarizeProducts(enabledProducts = {}) {
  return Object.entries(enabledProducts)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key.toUpperCase())
    .join(" · ");
}

function summarizeComms(enabledComms = {}) {
  return Object.entries(enabledComms)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
    .join(" · ");
}

export default function ExecutionCommandCenter({ session, state, applyPlanPreset, setProductAccess, setCommsAccess, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const enabledProductCount = Object.values(enabledProducts).filter(Boolean).length;
  const enabledCommsCount = Object.values(enabledComms).filter(Boolean).length;
  const revenueReadiness = state?.auricrux?.currentBlocker ? "Blocked" : "Ready";
  const needsLms = enabledProducts.lms === false;
  const needsPhone = enabledComms.phone === false;
  const needsSms = enabledComms.sms === false;
  const needsTeams = enabledComms.teams === false;
  const needsConference = enabledComms.conference === false;
  const canPromoteOperations = ["startup", "pilot", "team"].includes(selectedPlan.key);
  const canPromoteEnterprise = selectedPlan.key !== "enterprise";

  function activateOperationsWorkspace() {
    applyPlanPreset("operations");
    refreshSyncStamp("Operations workspace activated from platform command center");
  }

  function activateEnterpriseRollout() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Enterprise rollout activated from platform command center");
  }

  function enableAcademyContinuity() {
    setProductAccess("lms", true);
    refreshSyncStamp("Academy continuity enabled from platform command center");
  }

  function enableRevenueComms() {
    if (needsSms) setCommsAccess("sms", true);
    if (needsPhone) setCommsAccess("phone", true);
    refreshSyncStamp("Revenue follow-through communications enabled from platform command center");
  }

  function enableExecutiveCoordination() {
    if (needsTeams) setCommsAccess("teams", true);
    if (needsConference) setCommsAccess("conference", true);
    refreshSyncStamp("Executive coordination lanes enabled from platform command center");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live execution command center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Take real workspace actions instead of reading status-only summaries</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls change the authenticated customer session now. They move plan packaging, product access, communications coverage, and operational continuity forward without requiring a founder-side reset.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active command posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Product truth</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledProductCount}/3</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{summarizeProducts(enabledProducts) || "No product access enabled"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Comms coverage</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledCommsCount}/7</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{summarizeComms(enabledComms) || "No communications lanes enabled"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Revenue readiness</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{revenueReadiness}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.currentBlocker || "No blocker detected"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Next operational move</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{state.workspace.currentNextAction}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.nextRecommendedAction}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Commercial activation</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote this customer into a stronger plan so product access, billing posture, and rollout coverage stay aligned.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={activateOperationsWorkspace} style={actionButtonStyle("primary")} disabled={!canPromoteOperations}>
              {canPromoteOperations ? "Activate Operations Workspace" : "Operations Already Covered"}
            </button>
            <button type="button" onClick={activateEnterpriseRollout} style={actionButtonStyle()} disabled={!canPromoteEnterprise}>
              {canPromoteEnterprise ? "Activate Enterprise Rollout" : "Enterprise Already Active"}
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Academy continuity repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable LMS access so onboarding, safety, and rollout execution stop drifting away from the paying workspace.
          </div>
          <button type="button" onClick={enableAcademyContinuity} style={actionButtonStyle("primary")} disabled={!needsLms}>
            {needsLms ? "Enable Academy / LMS" : "Academy Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Revenue follow-through communications</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Turn on SMS and phone so approvals, collections, and urgent recovery can move without email-only bottlenecks.
          </div>
          <button type="button" onClick={enableRevenueComms} style={actionButtonStyle("primary")} disabled={!needsSms && !needsPhone}>
            {needsSms || needsPhone ? "Enable SMS + Phone" : "SMS + Phone Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Executive coordination lanes</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Turn on Teams and conference support so customer reviews and internal coordination stay inside Auricrux control.
          </div>
          <button type="button" onClick={enableExecutiveCoordination} style={actionButtonStyle("primary")} disabled={!needsTeams && !needsConference}>
            {needsTeams || needsConference ? "Enable Teams + Conference" : "Teams + Conference Already Enabled"}
          </button>
        </div>
      </div>
    </div>
  );
}
