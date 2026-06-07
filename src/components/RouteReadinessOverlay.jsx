import { resolvePlanPreset } from "../pricingPlans";

const shellStyle = {
  border: "1px solid #e5d3a1",
  borderRadius: 16,
  padding: 18,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
  marginBottom: 20,
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

function resolveRouteDependencies(activeHref = "/portal/platform") {
  if (activeHref.startsWith("/portal/messages")) {
    return {
      title: "Message route readiness",
      detail: "Messages work best when revenue follow-through and coordination channels are active before customer communication stalls.",
      products: [],
      comms: ["email", "sms", "phone", "teams", "conference"],
    };
  }

  if (activeHref.startsWith("/portal/support")) {
    return {
      title: "Support route readiness",
      detail: "Support recovery should keep escalation, training, and executive coordination live before issues compound.",
      products: ["lms"],
      comms: ["phone", "sms", "email", "teams", "conference", "lecture"],
    };
  }

  if (activeHref.startsWith("/portal/billing")) {
    return {
      title: "Billing route readiness",
      detail: "Billing continuity is stronger when collections channels and academy continuity are already enabled.",
      products: ["lms"],
      comms: ["email", "sms", "phone"],
    };
  }

  if (activeHref.startsWith("/portal/admin")) {
    return {
      title: "Admin route readiness",
      detail: "Admin governance should keep all product layers and governance channels live before rollout drift appears.",
      products: ["saas", "lms", "auricrux"],
      comms: ["email", "sms", "phone", "teams", "conference"],
    };
  }

  if (activeHref.startsWith("/portal/platform")) {
    return {
      title: "Platform route readiness",
      detail: "The platform dashboard should proactively expose missing workspace dependencies before users hit blocked routes downstream.",
      products: ["saas", "auricrux"],
      comms: ["email", "sms", "phone"],
    };
  }

  return {
    title: "Route readiness",
    detail: "Auricrux is checking whether this route has the product and communications depth needed for honest customer continuity.",
    products: [],
    comms: [],
  };
}

export default function RouteReadinessOverlay({ activeHref, session, setProductAccess, setCommsAccess, applyPlanPreset, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const dependencySet = resolveRouteDependencies(activeHref);
  const missingProducts = dependencySet.products.filter((product) => enabledProducts[product] === false);
  const missingComms = dependencySet.comms.filter((channel) => enabledComms[channel] === false);
  const missingCount = missingProducts.length + missingComms.length;

  if (missingCount === 0) return null;

  function repairRouteDependencies() {
    missingProducts.forEach((product) => setProductAccess(product, true));
    missingComms.forEach((channel) => setCommsAccess(channel, true));
    refreshSyncStamp(`Repaired route readiness for ${activeHref} from proactive overlay`);
  }

  function activateEnterpriseReadiness() {
    applyPlanPreset("enterprise");
    refreshSyncStamp(`Activated enterprise route readiness for ${activeHref} from proactive overlay`);
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Proactive route readiness</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{dependencySet.title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>{dependencySet.detail}</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Active plan posture</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{missingCount} route dependency{missingCount === 1 ? "" : "ies"} need repair</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Missing products</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{missingProducts.length}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{missingProducts.length ? missingProducts.join(" · ").toUpperCase() : "No missing product layers"}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Missing channels</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{missingComms.length}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{missingComms.length ? missingComms.join(" · ").toUpperCase() : "No missing communications lanes"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={repairRouteDependencies} style={actionButtonStyle("primary")}>
          Repair Route Dependencies
        </button>
        <button type="button" onClick={activateEnterpriseReadiness} style={actionButtonStyle()}>
          Activate Enterprise Readiness
        </button>
      </div>
    </div>
  );
}
