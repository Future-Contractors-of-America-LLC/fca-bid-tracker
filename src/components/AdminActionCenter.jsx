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

export default function AdminActionCenter({ session, state, applyPlanPreset, setProductAccess, setCommsAccess, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const needsSaas = enabledProducts.saas === false;
  const needsLms = enabledProducts.lms === false;
  const needsAuricrux = enabledProducts.auricrux === false;
  const needsTeams = enabledComms.teams === false;
  const needsConference = enabledComms.conference === false;
  const needsPhone = enabledComms.phone === false;
  const needsSms = enabledComms.sms === false;
  const needsEmail = enabledComms.email === false;
  const canPromoteGrowth = ["startup", "pilot", "team", "operations"].includes(selectedPlan.key);
  const canPromoteEnterprise = selectedPlan.key !== "enterprise";

  function activateGrowthGovernance() {
    applyPlanPreset("growth");
    refreshSyncStamp("Growth governance posture activated from admin action center");
  }

  function activateEnterpriseGovernance() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Enterprise governance posture activated from admin action center");
  }

  function restoreCoreWorkspace() {
    if (needsSaas) setProductAccess("saas", true);
    if (needsAuricrux) setProductAccess("auricrux", true);
    if (needsLms) setProductAccess("lms", true);
    refreshSyncStamp("Core workspace products restored from admin action center");
  }

  function enableGovernanceCoordination() {
    if (needsTeams) setCommsAccess("teams", true);
    if (needsConference) setCommsAccess("conference", true);
    if (needsPhone) setCommsAccess("phone", true);
    refreshSyncStamp("Governance coordination channels enabled from admin action center");
  }

  function enableRevenueOpsChannels() {
    if (needsEmail) setCommsAccess("email", true);
    if (needsSms) setCommsAccess("sms", true);
    if (needsPhone) setCommsAccess("phone", true);
    refreshSyncStamp("Revenue and operations channels enabled from admin action center");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live admin action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Execute rollout and governance controls from admin instead of reading readiness summaries only</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real customer-session mutations so tenant rollout, product availability, governance coordination, and revenue operations remain inside the active FCA workspace rather than stopping at admin visibility.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active admin posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Enabled products</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledCount(enabledProducts)}/3</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>SaaS, LMS, and Auricrux should remain active for a true admin-controlled workspace.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Enabled comms</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{enabledCount(enabledComms)}/7</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Admin governance should have live coverage across phone, email, SMS, Teams, conference, and other Auricrux lanes.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Current blocker</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{state.auricrux.currentBlocker}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.blockerImpact}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Next governance move</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{state.workspace.currentNextAction}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.workspace.nextActionOwner}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Plan-backed rollout activation</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote the customer into a stronger governance package so rollout depth, commercial posture, and admin authority stay aligned.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={activateGrowthGovernance} style={actionButtonStyle("primary")} disabled={!canPromoteGrowth}>
              {canPromoteGrowth ? "Activate Growth Governance" : "Growth Already Covered"}
            </button>
            <button type="button" onClick={activateEnterpriseGovernance} style={actionButtonStyle()} disabled={!canPromoteEnterprise}>
              {canPromoteEnterprise ? "Activate Enterprise Governance" : "Enterprise Already Active"}
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Core workspace restoration</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Restore SaaS, LMS, and Auricrux together so the tenant stays inside a real admin-governed product surface.
          </div>
          <button type="button" onClick={restoreCoreWorkspace} style={actionButtonStyle("primary")} disabled={!needsSaas && !needsLms && !needsAuricrux}>
            {needsSaas || needsLms || needsAuricrux ? "Restore Core Workspace" : "Core Workspace Already Active"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Governance coordination repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable Teams, conference, and phone so administrative escalation and executive coordination can happen without channel gaps.
          </div>
          <button type="button" onClick={enableGovernanceCoordination} style={actionButtonStyle("primary")} disabled={!needsTeams && !needsConference && !needsPhone}>
            {needsTeams || needsConference || needsPhone ? "Enable Governance Coordination" : "Governance Coordination Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Revenue operations repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable email, SMS, and phone for admin-led revenue operations so billing, rollout notices, and account recovery stay active.
          </div>
          <button type="button" onClick={enableRevenueOpsChannels} style={actionButtonStyle("primary")} disabled={!needsEmail && !needsSms && !needsPhone}>
            {needsEmail || needsSms || needsPhone ? "Enable Revenue Ops" : "Revenue Ops Already Enabled"}
          </button>
        </div>
      </div>
    </div>
  );
}
