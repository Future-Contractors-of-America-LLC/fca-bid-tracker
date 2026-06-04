import AuricruxStateExplanation from "./AuricruxStateExplanation";
import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";

const summaryCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 14,
  padding: 18,
  background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

export default function SystemStateSummary({
  tenant,
  project,
  workspace,
  auricrux,
  title = "Canonical operating state",
  detail = "This route is reading the shared tenant, project, next-action, and Auricrux state from the canonical system module.",
}) {
  const liveTenant = resolveLiveTenantIdentity(tenant);
  const liveProject = resolveLiveProjectIdentity(project);

  return (
    <div style={summaryCardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Shared system state</div>
      <h2 style={{ marginTop: 0, marginBottom: 10 }}>{title}</h2>
      <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>{detail}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#1f2937", lineHeight: 1.7 }}>
        <div>
          <strong>Tenant</strong>
          <div>{liveTenant.name}</div>
          {liveTenant.authenticatedEmail ? <div style={{ color: "#64748b", fontSize: 13 }}>{liveTenant.authenticatedEmail}</div> : null}
        </div>
        <div>
          <strong>Project</strong>
          <div>{liveProject.id} · {liveProject.name}</div>
        </div>
        <div>
          <strong>Next action</strong>
          <div>{workspace.currentNextAction}</div>
        </div>
        <div>
          <strong>Current blocker</strong>
          <div>{auricrux.currentBlocker}</div>
        </div>
      </div>

      <AuricruxStateExplanation
        mode="summary"
        title="Auricrux explanation of live state continuity"
        detail={`Auricrux is interpreting ${workspace.currentNextAction.toLowerCase()} against ${auricrux.currentBlocker.toLowerCase()} so ${liveProject.id} stays attached to one operating story for ${liveTenant.name} instead of fragmented route state.`}
      />
    </div>
  );
}
