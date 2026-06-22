import { portalCardStyle, portalEyebrowStyle, portalStatusPill, portalTokens } from "../portalDesignTokens";
import { resolveLiveProjectIdentity, resolveLiveTenantIdentity } from "../liveWorkspaceIdentity";

export default function WorkspaceContextBar({ tenant, project, workspace }) {
  if (!tenant || !project || !workspace) return null;

  const liveTenant = resolveLiveTenantIdentity(tenant);
  const liveProject = resolveLiveProjectIdentity(project);

  return (
    <div
      style={{
        ...portalCardStyle,
        marginBottom: 16,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", minWidth: 0 }}>
        <div>
          <div style={{ ...portalEyebrowStyle, marginBottom: 2 }}>Workspace</div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{liveProject.name}</div>
        </div>
        <div style={{ fontSize: 13, color: portalTokens.body, lineHeight: 1.5, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={portalStatusPill()}>{liveTenant.name}</span>
          <span>{workspace.currentStageLabel || liveProject.stage}</span>
        </div>
      </div>
      <div style={{ fontSize: 13, color: portalTokens.body, maxWidth: 420, lineHeight: 1.45 }}>
        <strong>Next:</strong> {workspace.currentNextAction}
      </div>
    </div>
  );
}
