import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import AdminActionCenter from "../../components/AdminActionCenter";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";
import { portalCardStyle } from "../../portalDesignTokens";

export default function PortalAdmin() {
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();

  useEffect(() => {
    refreshSyncStamp("Persisted admin governance state active");
  }, [refreshSyncStamp]);

  return (
    <PortalShell
      title="Admin"
      subtitle="Tenant controls, seats, rollout status, and governance."
      activeHref="/portal/admin"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/pricing"
      primaryLabel="Plans & Rollout"
    >
      <PortalSliceAuricrux
        title="Auricrux Admin Intelligence"
        targetObjectType="Tenant"
        targetObjectId={state?.tenant?.name || session?.email || "TENANT"}
        sourceRoute="/portal/admin"
        rationale="Tenant governance, entitlements, and rollout controls require Auricrux review."
        nextAction="Confirm plan entitlements match active commercial posture."
        actionHref="/portal/platform"
        actionLabel="Open workspace"
        tone="green"
      />
      <div style={{ marginBottom: 20 }}>
        <CustomerPlanSummaryPanel session={session} title="Plan and account" />
      </div>

      <div style={{ marginBottom: 20 }}>
        <AdminActionCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <div style={portalCardStyle}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>Tenant</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{state.tenant.name}</div>
          <div style={{ color: "#475569", fontSize: 14 }}>{state.tenant.roleSummary}</div>
        </div>
        <div style={portalCardStyle}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>Seats</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>7</div>
          <div style={{ color: "#475569", fontSize: 14 }}>Owner through Learner roles</div>
        </div>
        <div style={portalCardStyle}>
          <div style={{ color: "#64748b", fontSize: 12, fontWeight: 700 }}>Active project</div>
          <div style={{ fontSize: 22, fontWeight: 700, margin: "6px 0" }}>{state.project.id}</div>
          <div style={{ color: "#475569", fontSize: 14 }}>{state.project.stage}</div>
        </div>
      </div>

      <div style={portalCardStyle}>
        <h2 style={{ marginTop: 0, fontSize: 17 }}>Governance controls</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {adminGovernance.controls.map((control) => (
            <div key={control.title} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, background: "#f8fafc" }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{control.title}</div>
              <div style={{ color: "#475569", fontSize: 14, lineHeight: 1.55, marginBottom: 8 }}>{control.purpose}</div>
              <a href={control.route} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{control.label}</a>
            </div>
          ))}
        </div>
      </div>
    </PortalShell>
  );
}
