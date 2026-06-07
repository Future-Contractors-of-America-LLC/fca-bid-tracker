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

export default function BillingActionCenter({ session, state, applyPlanPreset, setProductAccess, setCommsAccess, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const needsLms = enabledProducts.lms === false;
  const needsSms = enabledComms.sms === false;
  const needsPhone = enabledComms.phone === false;
  const needsEmail = enabledComms.email === false;
  const canPromoteGrowth = ["startup", "pilot", "team", "operations"].includes(selectedPlan.key);
  const canPromoteEnterprise = selectedPlan.key !== "enterprise";

  function activateGrowthPlan() {
    applyPlanPreset("growth");
    refreshSyncStamp("Growth plan activated from billing action center");
  }

  function activateEnterprisePlan() {
    applyPlanPreset("enterprise");
    refreshSyncStamp("Enterprise plan activated from billing action center");
  }

  function enableCollectionsComms() {
    if (needsSms) setCommsAccess("sms", true);
    if (needsPhone) setCommsAccess("phone", true);
    if (needsEmail) setCommsAccess("email", true);
    refreshSyncStamp("Collections and revenue communications enabled from billing action center");
  }

  function restoreAcademyContinuity() {
    setProductAccess("lms", true);
    refreshSyncStamp("Academy continuity restored from billing action center");
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live billing action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Execute revenue continuity moves from billing instead of stopping at invoice summaries</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real customer-session actions. They strengthen plan packaging, collections communications, and academy continuity directly from the billing route.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active billing posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Revenue blocker</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{state.auricrux.currentBlocker}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.blockerImpact}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Commercial next action</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{state.workspace.currentNextAction}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{state.auricrux.nextRecommendedAction}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Collections channels</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{[enabledComms.email, enabledComms.sms, enabledComms.phone].filter(Boolean).length}/3</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Email {enabledComms.email ? "enabled" : "pending"} · SMS {enabledComms.sms ? "enabled" : "pending"} · Phone {enabledComms.phone ? "enabled" : "pending"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Training continuity</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{enabledProducts.lms ? "Connected" : "Pending"}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>Billing and onboarding stay aligned when academy access remains active.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Plan promotion</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Promote the customer into a stronger recurring package so billing posture matches rollout depth and live product access.
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={activateGrowthPlan} style={actionButtonStyle("primary")} disabled={!canPromoteGrowth}>
              {canPromoteGrowth ? "Activate Growth Plan" : "Growth Already Covered"}
            </button>
            <button type="button" onClick={activateEnterprisePlan} style={actionButtonStyle()} disabled={!canPromoteEnterprise}>
              {canPromoteEnterprise ? "Activate Enterprise Plan" : "Enterprise Already Active"}
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Collections communications repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Enable email, SMS, and phone together so invoice follow-through and account recovery do not stall on a limited channel mix.
          </div>
          <button type="button" onClick={enableCollectionsComms} style={actionButtonStyle("primary")} disabled={!needsSms && !needsPhone && !needsEmail}>
            {needsSms || needsPhone || needsEmail ? "Enable Revenue Comms" : "Revenue Comms Already Enabled"}
          </button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Training continuity repair</div>
          <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
            Restore academy access so billing, onboarding, and rollout readiness stay on one customer spine.
          </div>
          <button type="button" onClick={restoreAcademyContinuity} style={actionButtonStyle("primary")} disabled={!needsLms}>
            {needsLms ? "Restore Academy / LMS" : "Academy Already Connected"}
          </button>
        </div>
      </div>
    </div>
  );
}
