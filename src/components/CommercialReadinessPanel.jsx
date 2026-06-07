import { auricruxRail, currentProject, workspaceContext } from "../workspaceState";
import AuricruxTrustInsight from "./AuricruxTrustInsight";

const panelStyle = {
  border: "1px solid #dbe3ef",
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  borderRadius: 16,
  padding: 18,
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const cellStyle = {
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  borderRadius: 12,
  padding: 12,
};

function summarizeEnabledComms(enabledComms = {}) {
  return Object.entries(enabledComms)
    .filter(([, enabled]) => enabled !== false)
    .map(([key]) => key)
    .join(", ") || "None enabled";
}

function summarizeEnabledProducts(enabledProducts = {}) {
  return Object.entries(enabledProducts)
    .filter(([, enabled]) => enabled !== false)
    .map(([key]) => key.toUpperCase())
    .join(", ") || "None enabled";
}

export default function CommercialReadinessPanel({
  title = "Rollout readiness",
  detail = "Auricrux is keeping approval, revenue, and rollout readiness visible so your team can move forward with confidence.",
  primaryHref = "/contact",
  primaryLabel = "Schedule a Walkthrough",
  secondaryHref = "/portal/platform",
  secondaryLabel = "Open Platform Dashboard",
  session = null,
}) {
  const enabledProducts = session?.enabledProducts || { saas: true, lms: true, auricrux: true };
  const enabledComms = session?.enabledComms || {
    chat: true,
    sms: true,
    phone: true,
    email: true,
    teams: true,
    conference: true,
    lecture: true,
  };

  return (
    <div style={panelStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Readiness snapshot</div>
          <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
          <div style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860 }}>{detail}</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a href={primaryHref} style={buttonStyle("primary")}>{primaryLabel}</a>
          <a href={secondaryHref} style={buttonStyle("secondary")}>{secondaryLabel}</a>
          <a href="/portal/messages" style={buttonStyle("secondary")}>Open Comms Workspace</a>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        <ReadinessCell label="Next action" value={workspaceContext.currentNextAction} />
        <ReadinessCell label="Approval blocker" value={auricruxRail.currentBlocker} />
        <ReadinessCell label="Revenue impact" value={auricruxRail.blockerImpact} />
        <ReadinessCell label="Rollout move" value={auricruxRail.nextRecommendedAction} />
        <ReadinessCell label="Project spine" value={`${currentProject.id} · ${currentProject.stage}`} />
        <ReadinessCell label="Enabled products" value={summarizeEnabledProducts(enabledProducts)} />
        <ReadinessCell label="Enabled comms" value={summarizeEnabledComms(enabledComms)} />
        <ReadinessCell label="Revenue truth" value="Customer-facing claims stay aligned to live product and communications access." />
      </div>

      <AuricruxTrustInsight mode="readiness" primaryHref={primaryHref} primaryLabel={primaryLabel} />
    </div>
  );
}

function ReadinessCell({ label, value }) {
  return (
    <div style={cellStyle}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em", color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ color: "#111827", lineHeight: 1.5, fontSize: 14 }}>{value}</div>
    </div>
  );
}

function buttonStyle(kind) {
  if (kind === "primary") {
    return {
      textDecoration: "none",
      background: "#111827",
      color: "#fff",
      padding: "10px 14px",
      borderRadius: 10,
      fontWeight: 700,
    };
  }

  return {
    textDecoration: "none",
    background: "#ffffff",
    color: "#111827",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    border: "1px solid #cbd5e1",
  };
}
