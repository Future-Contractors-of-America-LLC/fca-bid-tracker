import AuricruxNarrativeInsight from "./AuricruxNarrativeInsight";
import AutomationStatusCard from "./AutomationStatusCard";
import useWorkspaceState from "../hooks/useWorkspaceState";

const cardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 18,
  padding: 20,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 10px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontWeight: 700,
  fontSize: 12,
  letterSpacing: 0.3,
  textTransform: "uppercase",
};

const linkStyle = {
  display: "inline-block",
  marginTop: 14,
  textDecoration: "none",
  fontWeight: 700,
  color: "#111827",
};

const labelStyle = {
  color: "#64748b",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

function resolveAvailabilityLabel(backingSource = "") {
  if (backingSource === "api") return "Live connected workspace";
  if (backingSource === "session") return "Customer-guided workspace";
  return "Guided rollout workspace";
}

export default function WorkspaceSnapshotCard({
  title = "Live workspace snapshot",
  detail = "This public shell now previews the same tenant, project, and guided next-step context customers see inside the platform.",
  ctaHref = "/portal/platform",
  ctaLabel = "Open platform dashboard",
}) {
  const { state } = useWorkspaceState();
  const availabilityLabel = resolveAvailabilityLabel(state.meta.backingSource);

  return (
    <div style={cardStyle}>
      <div style={pillStyle}>Live workspace</div>
      <h2 style={{ marginTop: 14, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: "#334155", lineHeight: 1.7, marginTop: 0 }}>{detail}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginTop: 14 }}>
        <div>
          <div style={labelStyle}>Customer</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.tenant.name}</div>
        </div>
        <div>
          <div style={labelStyle}>Project</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.project.name}</div>
        </div>
        <div>
          <div style={labelStyle}>Current stage</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.project.stage}</div>
        </div>
        <div>
          <div style={labelStyle}>Guided support</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{state.auricrux.systemState || state.auricrux.readinessState}</div>
        </div>
      </div>

      <div style={{ marginTop: 16, color: "#475569", lineHeight: 1.7 }}>
        <div><strong>Recommended next step:</strong> {state.auricrux.nextRecommendedAction}</div>
        <div><strong>Workspace availability:</strong> {availabilityLabel}</div>
        {state.meta.authenticatedCustomer ? <div><strong>Signed-in customer:</strong> {state.meta.authenticatedCustomer}</div> : null}
      </div>

      <AutomationStatusCard
        title="System status"
        eyebrow="Platform reliability"
        detail="Customers can see that guided support and system checks are active without needing to read internal engineering logs."
      />

      <AuricruxNarrativeInsight mode="snapshot" ctaHref={ctaHref} ctaLabel={ctaLabel} />

      <a href={ctaHref} style={linkStyle}>{ctaLabel}</a>
    </div>
  );
}
