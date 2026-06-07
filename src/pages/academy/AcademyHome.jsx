import ShellHeader from "../../components/ShellHeader";
import ShellFooter from "../../components/ShellFooter";
import ProjectSpineBar from "../../components/ProjectSpineBar";
import WorkspaceContextBar from "../../components/WorkspaceContextBar";
import AuricruxStatusRail from "../../components/AuricruxStatusRail";
import ProjectFileAuditPanel from "../../components/ProjectFileAuditPanel";
import RouteStateOverlay from "../../components/RouteStateOverlay";
import ExecutiveSignalBar from "../../components/ExecutiveSignalBar";
import BuildExpansionCommandDeck from "../../components/BuildExpansionCommandDeck";
import PublicCtaRow from "../../components/PublicCtaRow";
import FcaBrandMark from "../../components/FcaBrandMark";
import AuricruxBrandMark from "../../components/AuricruxBrandMark";
import ProductAccessStatusPanel from "../../components/ProductAccessStatusPanel";
import AuricruxCommsPanel from "../../components/AuricruxCommsPanel";
import { academyCtaSets, executiveSignalCtaSets, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { academyContinuityMessaging } from "../../systemContinuity";
import { auricruxCommsChannels, auricruxRail, currentProject, portalFiles, portalTenant, projectAuditEvents, routeStateOverlays, workspaceContext } from "../../systemState";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { pageShellStyle } from "../../publicShellStyles";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
  border: "1px solid #dbe3ef",
};

const continuityCardStyle = {
  ...cardStyle,
  background: "linear-gradient(135deg, #fffaf0 0%, #ffffff 100%)",
  border: "1px solid #e5d3a1",
};

export default function AcademyHome() {
  const { session } = useCustomerSession();
  const { state } = useWorkspaceState();

  return (
    <div style={{ ...pageShellStyle, background: "#f8fafc", minHeight: "100vh" }}>
      <ShellHeader
        eyebrow={academyContinuityMessaging.header.eyebrow}
        title={academyContinuityMessaging.header.title}
        subtitle={academyContinuityMessaging.header.subtitle}
        primaryHref={shellHeaderCtaSets.academy.primaryHref}
        primaryLabel={shellHeaderCtaSets.academy.primaryLabel}
        secondaryHref={shellHeaderCtaSets.academy.secondaryHref}
        secondaryLabel={shellHeaderCtaSets.academy.secondaryLabel}
        journey={shellJourney}
        currentJourney="academy"
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 18,
          padding: "14px 16px",
          border: "1px solid #dbe3ef",
          borderRadius: 18,
          background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 100%)",
        }}
      >
        <FcaBrandMark compact />
        <AuricruxBrandMark compact />
      </div>

      <ProductAccessStatusPanel session={session} stateMeta={state.meta} />

      <ProjectSpineBar tenant={portalTenant} project={currentProject} />
      <WorkspaceContextBar tenant={portalTenant} project={currentProject} workspace={workspaceContext} />
      <AuricruxStatusRail project={currentProject} rail={auricruxRail} />
      <RouteStateOverlay overlay={routeStateOverlays.academy} />
      <ExecutiveSignalBar mode="academy" nextHref={executiveSignalCtaSets.academy.href} nextLabel={executiveSignalCtaSets.academy.label} />

      <div style={{ marginBottom: 24 }}>
        <AuricruxCommsPanel
          title="Academy is now connected to the full Auricrux communications stack"
          detail="Training, onboarding, safety refreshers, lecture delivery, conference reviews, and cross-team coaching now sit inside the same communications control plane as project, support, and customer follow-through."
          statusLabel="Training comms posture"
          statusValue="Rollout channels connected"
          items={auricruxCommsChannels}
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <BuildExpansionCommandDeck
          title={academyContinuityMessaging.expansion.title}
          detail={academyContinuityMessaging.expansion.detail}
          primaryHref="/portal/academy"
          primaryLabel="Open Academy"
          secondaryHref="/portal/messages"
          secondaryLabel="Carry continuity into comms"
        />
      </div>

      <div style={{ marginBottom: 24 }}>
        <PublicCtaRow actions={publicBodyCtaSets.academyEntry} />
      </div>

      <div style={{ ...actionCardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Academy continuity</div>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{academyContinuityMessaging.continuity.title}</h2>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            <FcaBrandMark compact />
            <AuricruxBrandMark compact />
          </div>
        </div>
        <p style={{ color: "#334155", lineHeight: 1.7, maxWidth: 860, marginBottom: 0 }}>
          {academyContinuityMessaging.continuity.detail}
        </p>
        <div style={{ marginTop: 14 }}>
          <PublicCtaRow actions={academyCtaSets.continuityActions} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }} />
        </div>
      </div>

      <div style={{ ...continuityCardStyle, marginBottom: 24 }}>
        <div style={{ color: "#8a6a14", fontWeight: 700, marginBottom: 8 }}>Operational continuity focus</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#1f2937", lineHeight: 1.7 }}>
          <div>
            <strong>Assignment need</strong>
            <div>Two learners are ready for onboarding assignment before mobilization.</div>
          </div>
          <div>
            <strong>Dependency</strong>
            <div>{routeStateOverlays.academy.dependencyDetail}</div>
          </div>
          <div>
            <strong>Commercial blocker</strong>
            <div>{auricruxRail.blockerImpact}</div>
          </div>
          <div>
            <strong>Coordinated next move</strong>
            <div>Assign learners here, then preserve follow-through in messages, billing, and field kickoff planning.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 28 }}>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Learners enrolled</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>24</div>
          <div>Across onboarding, safety, estimating, and field-readiness tracks</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Certifications in progress</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>9</div>
          <div>OSHA, field readiness, equipment awareness, and platform onboarding</div>
        </div>
        <div style={cardStyle}>
          <div style={{ color: "#6b7280" }}>Completion rate</div>
          <div style={{ fontSize: 28, fontWeight: 700, margin: "6px 0" }}>87%</div>
          <div>Workspace KPI for rollout confidence and job-start readiness</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Recommended learning path</h2>
          <ol style={{ paddingLeft: 20, lineHeight: 1.9 }}>
            <li>Welcome to FCA Workspace</li>
            <li>Customer Portal Navigation</li>
            <li>Bid Workflow Fundamentals</li>
            <li>Field Onboarding and Safety Readiness</li>
            <li>RFI, submittal, and document-control discipline</li>
            <li>Auricrux Guided Execution Overview</li>
          </ol>
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Auricrux coaching notes</h2>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            <div>• Two new learners are ready for onboarding assignment.</div>
            <div>• One certification expires in 14 days.</div>
            <div>• Field kickoff posture suggests scheduling a safety and document-control refresher before mobilization.</div>
          </div>
        </div>
      </div>

      <ProjectFileAuditPanel project={currentProject} files={portalFiles} auditEvents={projectAuditEvents} />

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Connected portal routes</h2>
          <PublicCtaRow actions={academyCtaSets.connectedPortalRoutes} style={{ display: "grid", gap: 12 }} />
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Production close</h2>
          <p style={{ lineHeight: 1.7, color: "#4b5563" }}>
            Use this screen to prove FCA is not just a bid tool. The same customer can move from sales and portal visibility into workforce enablement, safety readiness, compliance discipline, and long-term support.
          </p>
          <PublicCtaRow actions={academyCtaSets.productionClose} />
        </div>
      </div>

      <div style={{ marginTop: 24, ...cardStyle }}>
        <h2 style={{ marginTop: 0 }}>{academyContinuityMessaging.rollout.title}</h2>
        <p style={{ lineHeight: 1.7, marginBottom: 0 }}>
          {academyContinuityMessaging.rollout.detail}
        </p>
      </div>

      <ShellFooter />
    </div>
  );
}
