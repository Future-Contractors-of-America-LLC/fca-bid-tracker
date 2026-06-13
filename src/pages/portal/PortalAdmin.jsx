import { useEffect } from "react";
import PortalShell from "../../components/PortalShell";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import PublicCtaRow from "../../components/PublicCtaRow";
import SystemStateSummary from "../../components/SystemStateSummary";
import CustomerPlanSummaryPanel from "../../components/CustomerPlanSummaryPanel";
import AdminActionCenter from "../../components/AdminActionCenter";
import CredentialIssuanceLedger from "../../components/CredentialIssuanceLedger";
import AcademyStateAuthorityBanner from "../../components/AcademyStateAuthorityBanner";
import { AcademyLmsProvider, useAcademyLmsContext } from "../../context/AcademyLmsContext";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { publicBodyCtaSets } from "../../websiteShell";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";
import { resolvePlanPreset } from "../../pricingPlans";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function PortalAdminInner() {
  const { session, applyPlanPreset, setProductAccess, setCommsAccess } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const academyLms = useAcademyLmsContext();
  const { meta, mutationState, loading } = academyLms;

  useEffect(() => {
    refreshSyncStamp("Persisted admin governance state active");
  }, [refreshSyncStamp]);

  const selectedPlan = resolvePlanPreset(session?.selectedPlan || "startup");

  return (
    <PortalShell
      title="Admin, Rollout, and Governance Control"
      subtitle="Administrative surface for tenant status, seat visibility, construction-workflow rollout, commercial package awareness, Auricrux governance control, academic credential issuance, and one-click admin actions."
      activeHref="/portal/admin"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/pricing"
      primaryLabel="Plans & Rollout"
    >
      <AcademyStateAuthorityBanner meta={meta} mutationState={mutationState} loading={loading} />

      <div style={{ marginBottom: 24 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Admin route now reads from the canonical control state"
          detail="Tenant rollout, governance visibility, commercial packaging, academic issuance posture, and next-action context now come from the same shared system module as the rest of the FCA shell."
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <CustomerPlanSummaryPanel session={session} title="Admin-aligned customer plan summary" />
      </div>

      <div style={{ marginBottom: 24 }}>
        <AdminActionCenter
          session={session}
          state={state}
          applyPlanPreset={applyPlanPreset}
          setProductAccess={setProductAccess}
          setCommsAccess={setCommsAccess}
          refreshSyncStamp={refreshSyncStamp}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <CredentialIssuanceLedger academyLms={academyLms} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <div style={{ ...cardStyle, marginBottom: 24, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Governance continuity</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA administration now reads as a construction and academy control surface</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 0 }}>
          Tenant rollout posture, seat readiness, project governance, academic issuance visibility, and construction-workflow continuity remain inside the same FCA workspace, with Auricrux maintaining execution awareness rather than handing control off to separate admin and LMS products.
        </p>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Admin governance layer</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>FCA now models rollout, seats, governance visibility, and academic issuance as one governed product layer</h2>
        <div style={{ display: "grid", gap: 16 }}>
          {adminGovernance.controls.map((control) => (
            <div key={control.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{control.title}</h3>
              <p style={{ color: "#334155", lineHeight: 1.7 }}>{control.purpose}</p>
              <a href={control.route} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{control.label}</a>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 10, marginBottom: 0 }}>
                {control.artifacts.map((artifact) => (
                  <li key={artifact}>{artifact}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Readiness signals</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {adminGovernance.readinessSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Governance actions</div>
            <PublicCtaRow actions={adminGovernance.governanceActions} />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Tenant</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>{state.tenant.name}</div>
          <div>{state.tenant.roleSummary}</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Seat readiness</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>7 seats</div>
          <div>Owner, Admin, Estimator, Project Coordinator, Superintendent, Accounting, Learner</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Rollout state</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>Production shell active</div>
          <div>Bid, file, coordination, billing, academy, and plan continuity are live while deeper persistence hardening continues.</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Governance visibility</div>
          <div style={{ fontSize: 24, fontWeight: 700, margin: "6px 0" }}>Auricrux monitored</div>
          <div>Project {state.project.id} remains within shared audit and workspace control.</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Administrative priorities</h2>
          <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginBottom: 0 }}>
            <li>Confirm tenant rollout sequence and seat assignment by role</li>
            <li>Validate project-linked file, permit, and audit continuity</li>
            <li>Track billing, retainage, training readiness, and selected-plan growth together</li>
            <li>Preserve Auricrux visibility across estimating, job, closeout, credential issuance, and commercial upgrade routes</li>
          </ul>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Production posture</h2>
          <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
            This control surface is the beginning of the broader platform spine: tenant summary, seat/readiness view,
            rollout status, selected plan ({selectedPlan.name}), academic credential issuance, and governance visibility inside the same FCA shell for construction operations.
          </p>
        </div>
      </div>
    </PortalShell>
  );
}

export default function PortalAdmin() {
  return (
    <AcademyLmsProvider>
      <PortalAdminInner />
    </AcademyLmsProvider>
  );
}
