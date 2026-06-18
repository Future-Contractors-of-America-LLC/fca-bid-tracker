import { resolvePlanPreset } from "../pricingPlans";
import { navigateTo } from "../navigation";
import { PILOT_CHECKOUT_URL, STARTUP_CHECKOUT_URL } from "../commercialOffers";

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

const launchPlans = [
  { key: "startup", title: "Activate Startup Workspace", role: "Owner / Admin", nextHref: "/portal/platform", checkoutUrl: STARTUP_CHECKOUT_URL },
  { key: "pilot", title: "Buy Pilot Workspace", role: "Project Coordinator", nextHref: "/portal", checkoutUrl: PILOT_CHECKOUT_URL },
  { key: "operations", title: "Activate Operations Workspace", role: "Owner / Admin", nextHref: "/portal/platform", checkoutUrl: null },
  { key: "enterprise", title: "Activate Enterprise Rollout", role: "Owner / Admin", nextHref: "/portal/admin", checkoutUrl: null },
];

export default function PricingActionCenter({ session, login }) {
  const activePlan = resolvePlanPreset(session?.selectedPlan || "startup");

  function activatePlan(planKey, role, nextHref) {
    const planPreset = resolvePlanPreset(planKey);
    const company = `FCA ${planPreset.name} Customer`;
    const result = login({
      email: `${planKey}@futurecontractorsofamerica.com`,
      company,
      role,
      nextHref,
      selectedPlan: planPreset.key,
      enabledProducts: planPreset.enabledProducts,
      enabledComms: planPreset.enabledComms,
    });

    if (!result.ok) return;
    navigateTo(nextHref);
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Live pricing conversion action center</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>Activate a real authenticated workspace from pricing instead of stopping at plan review</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            These controls perform real customer-session provisioning from the public pricing route. Each action creates an authenticated workspace using the selected commercial package so product, portal, academy, Auricrux, and communications access stay truthful to the plan being sold.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active conversion posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{activePlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{activePlan.price} · {activePlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
        {launchPlans.map((plan) => {
          const preset = resolvePlanPreset(plan.key);
          return (
            <div key={plan.key} style={cardStyle}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>{preset.name}</div>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{preset.price}</div>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 12 }}>
                Launch a real authenticated customer session with {preset.enabledProducts.saas ? " SaaS" : ""}{preset.enabledProducts.lms ? " LMS" : ""}{preset.enabledProducts.auricrux ? " Auricrux" : ""} access and plan-matched communications controls.
              </div>
              <button type="button" onClick={() => activatePlan(plan.key, plan.role, plan.nextHref)} style={actionButtonStyle(plan.key === "enterprise" ? "secondary" : "primary")}>
                {plan.title}
              </button>
              {plan.checkoutUrl ? (
                <a href={plan.checkoutUrl} target="_blank" rel="noopener noreferrer" style={{ ...actionButtonStyle("secondary"), display: "inline-block", marginTop: 10, textDecoration: "none", textAlign: "center" }}>
                  Pay with Stripe — {preset.price}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
