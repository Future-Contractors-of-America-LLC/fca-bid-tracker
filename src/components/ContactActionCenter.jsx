import { useState } from "react";
import { resolvePlanPreset } from "../pricingPlans";
import { navigateTo } from "../navigation";
import { submitWalkthroughLead } from "../api/intakeClient";

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

const walkthroughActions = [
  { key: "pilot", title: "Launch Guided Pilot Walkthrough", role: "Project Coordinator", nextHref: "/portal/platform" },
  { key: "operations", title: "Launch Operations Walkthrough", role: "Owner / Admin", nextHref: "/portal/messages" },
  { key: "growth", title: "Launch Growth Workspace", role: "Owner / Admin", nextHref: "/portal/billing" },
  { key: "enterprise", title: "Launch Enterprise Rollout Review", role: "Owner / Admin", nextHref: "/portal/admin" },
];

export default function ContactActionCenter({ session, login }) {
  const activePlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const [status, setStatus] = useState("");

  async function launchWalkthrough(planKey, role, nextHref) {
    const planPreset = resolvePlanPreset(planKey);
    const company = `FCA ${planPreset.name} Walkthrough`;
    const email = `${planKey}-walkthrough@futurecontractorsofamerica.com`;
    setStatus("Creating governed walkthrough lead...");
    try {
      await submitWalkthroughLead({ planKey, role, email });
    } catch (error) {
      setStatus(error.message || "Walkthrough lead could not be created.");
      return;
    }

    const result = login({
      email,
      company,
      role,
      nextHref,
      selectedPlan: planPreset.key,
      enabledProducts: planPreset.enabledProducts,
      enabledComms: planPreset.enabledComms,
    });

    if (!result.ok) {
      setStatus(result.error || "Unable to start walkthrough session.");
      return;
    }
    setStatus("");
    navigateTo(nextHref);
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live contact conversion action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Activate a real authenticated walkthrough from contact instead of stopping at outreach options</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls create a governed lead record, then provision an authenticated customer session so a walkthrough can start immediately inside platform, billing, messaging, or admin surfaces.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active walkthrough posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{activePlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{activePlan.price} · {activePlan.billingModel}</div>
        </div>
      </div>

      {status ? (
        <div style={{ marginBottom: 12, color: status.includes("could not") || status.includes("Unable") ? "#b45309" : "#1d4ed8", fontWeight: 600 }}>{status}</div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {walkthroughActions.map((action) => {
          const preset = resolvePlanPreset(action.key);
          return (
            <div key={action.key} style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{preset.name}</div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{preset.price}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                Start a real walkthrough with plan-matched product access and communications controls, then land directly in {action.nextHref}.
              </div>
              <button type="button" onClick={() => launchWalkthrough(action.key, action.role, action.nextHref)} style={actionButtonStyle(action.key === "enterprise" ? "secondary" : "primary")}>
                {action.title}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
