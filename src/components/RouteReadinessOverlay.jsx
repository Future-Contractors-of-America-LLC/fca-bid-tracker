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
      title: "Messages need a few channels",
      detail: "Turn on email, SMS, phone, or Teams so your team can coordinate without leaving the workspace.",
      products: [],
      comms: ["email", "sms", "phone", "teams", "conference"],
    };
  }

  if (activeHref.startsWith("/portal/support")) {
    return {
      title: "Support works best with training enabled",
      detail: "Enable Academy and contact channels so escalations include training and reach-back context.",
      products: ["lms"],
      comms: ["phone", "sms", "email", "teams", "conference", "lecture"],
    };
  }

  if (activeHref.startsWith("/portal/billing")) {
    return {
      title: "Billing needs collections channels",
      detail: "Enable email, SMS, and phone so invoices and payment follow-up reach customers.",
      products: ["lms"],
      comms: ["email", "sms", "phone"],
    };
  }

  if (activeHref.startsWith("/portal/admin")) {
    return {
      title: "Setup should include all products",
      detail: "Turn on workspace, Academy, and Auricrux guidance before rolling out to your team.",
      products: ["saas", "lms", "auricrux"],
      comms: ["email", "sms", "phone", "teams", "conference"],
    };
  }

  if (activeHref.startsWith("/portal/platform")) {
    return {
      title: "Workspace is missing a product",
      detail: "Enable workspace tools and Auricrux guidance so the dashboard can show your full operating picture.",
      products: ["saas", "auricrux"],
      comms: ["email", "sms", "phone"],
    };
  }

  return {
    title: "A few settings are not enabled yet",
    detail: "Auricrux flagged products or channels that this page expects. Turn them on to avoid dead ends.",
    products: [],
    comms: [],
  };
}

const productLabels = {
  saas: "Workspace",
  lms: "Academy",
  auricrux: "Auricrux",
};

export default function RouteReadinessOverlay({ activeHref, session, setProductAccess, setCommsAccess, applyPlanPreset, refreshSyncStamp }) {
  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const dependencySet = resolveRouteDependencies(activeHref);
  const missingProducts = dependencySet.products.filter((product) => enabledProducts[product] === false);
  const missingComms = dependencySet.comms.filter((channel) => enabledComms[channel] === false);
  const missingCount = missingProducts.length + missingComms.length;

  if (missingCount === 0) return null;

  function enableMissingAccess() {
    missingProducts.forEach((product) => setProductAccess(product, true));
    missingComms.forEach((channel) => setCommsAccess(channel, true));
    refreshSyncStamp(`Enabled missing access for ${activeHref}`);
  }

  function activateEnterpriseReadiness() {
    applyPlanPreset("enterprise");
    refreshSyncStamp(`Applied enterprise plan for ${activeHref}`);
  }

  return (
    <div style={shellStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Before you continue</div>
          <h2 style={{ marginTop: 0, marginBottom: 8 }}>{dependencySet.title}</h2>
          <div style={{ color: "#475569", lineHeight: 1.7, maxWidth: 920 }}>{dependencySet.detail}</div>
        </div>
        <div style={{ ...cardStyle, minWidth: 240 }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Your plan</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 6 }}>{selectedPlan.name}</div>
          <div style={{ color: "#475569", lineHeight: 1.6 }}>{missingCount} item{missingCount === 1 ? "" : "s"} to enable</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Products to turn on</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{missingProducts.length}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>
            {missingProducts.length ? missingProducts.map((key) => productLabels[key] || key).join(" · ") : "All set"}
          </div>
        </div>
        <div style={cardStyle}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", fontWeight: 700, marginBottom: 6 }}>Channels to turn on</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>{missingComms.length}</div>
          <div style={{ color: "#475569", lineHeight: 1.7 }}>{missingComms.length ? missingComms.join(" · ") : "All set"}</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" onClick={enableMissingAccess} style={actionButtonStyle("primary")}>
          Enable missing access
        </button>
        <button type="button" onClick={activateEnterpriseReadiness} style={actionButtonStyle()}>
          Switch to Enterprise plan
        </button>
        <a href="/portal/profile" style={{ ...actionButtonStyle(), textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Review in profile
        </a>
      </div>
    </div>
  );
}
