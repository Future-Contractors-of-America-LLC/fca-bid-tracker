import { pricingPlanOptions, resolvePlanPreset } from "../pricingPlans";

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

export default function CustomerPlanSummaryPanel({ session, title = "Customer plan and expansion path" }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const upgradeCandidates = pricingPlanOptions.filter((plan) => plan.key !== selectedPlan.key).slice(0, 3);

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Plan-aware activation</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>
            The authenticated customer workspace now carries a selected commercial plan that governs default product access, communications lanes, and billing posture.
          </div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active commercial package</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{selectedPlan.price} · {selectedPlan.billingModel}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included products</div>
          <div style={{ color: "#111827", lineHeight: 1.7 }}>{selectedPlan.enabledProducts.saas ? "SaaS workspace" : null}{selectedPlan.enabledProducts.saas && (selectedPlan.enabledProducts.lms || selectedPlan.enabledProducts.auricrux) ? " · " : ""}{selectedPlan.enabledProducts.lms ? "Academy / LMS" : null}{selectedPlan.enabledProducts.lms && selectedPlan.enabledProducts.auricrux ? " · " : ""}{selectedPlan.enabledProducts.auricrux ? "Auricrux guidance" : null}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Included communications</div>
          <div style={{ color: "#111827", lineHeight: 1.7 }}>{Object.entries(selectedPlan.enabledComms).filter(([, enabled]) => enabled).map(([key]) => key).join(" · ")}</div>
        </div>
      </div>

      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 8 }}>Expansion-ready next offers</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {upgradeCandidates.map((plan) => (
          <div key={plan.key} style={cardStyle}>
            <div style={{ fontWeight: 700, marginBottom: 6, color: "#111827" }}>{plan.name}</div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>{plan.price}</div>
            <div style={{ color: "#475569", lineHeight: 1.6, marginBottom: 10 }}>{plan.billingModel === "one-time" ? "Guided launch package" : "Recurring operating package"}</div>
            <a href="/contact" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Discuss {plan.name}</a>
          </div>
        ))}
      </div>
    </div>
  );
}
