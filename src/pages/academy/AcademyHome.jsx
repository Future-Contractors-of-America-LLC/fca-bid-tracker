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
import CustomerCommsLaunchpad from "../../components/CustomerCommsLaunchpad";
import AcademyReadinessOverlay from "../../components/AcademyReadinessOverlay";
import ProtectedProductDataPanel from "../../components/ProtectedProductDataPanel";
import { academyCtaSets, executiveSignalCtaSets, publicBodyCtaSets, shellHeaderCtaSets, shellJourney } from "../../websiteShell";
import { academyContinuityMessaging } from "../../systemContinuity";
import { auricruxCommsChannels, auricruxRail, currentProject, portalFiles, portalTenant, projectAuditEvents, routeStateOverlays, workspaceContext } from "../../systemState";
import { academyClassrooms, saasOperationalPathways } from "../../productBlueprint";
import { academyCatalog } from "../../academyCatalog";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProtectedProductData from "../../hooks/useProtectedProductData";
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
  const { session, setProductAccess, setCommsAccess, applyPlanPreset } = useCustomerSession();
  const { state, refreshSyncStamp } = useWorkspaceState();
  const protectedAcademy = useProtectedProductData({
    endpoint: "/api/customer-academy-overview",
    session,
    productLabel: "Academy / LMS",
  });
  const liveTenant = state?.tenant || portalTenant;
  const liveProject = state?.project || currentProject;
  const liveWorkspace = state?.workspace || workspaceContext;
  const liveAuricrux = state?.auricrux || auricruxRail;
  const enabledComms = session?.enabledComms || { chat: true, sms: true, phone: true, email: true, teams: true, conference: true, lecture: true };
  const commItems = auricruxCommsChannels.map((item) => ({
    ...item,
    value: `${item.value}${enabledComms[item.label.toLowerCase()] === false ? " · Pending for this customer" : " · Enabled for this customer"}`,
    href: `/portal/messages#${item.label.toLowerCase()}`,
    ctaLabel: `Open ${item.label}`,
  }));
  const protectedItems = [
    {
      label: "Protected surface",
      value: protectedAcademy.data?.surface || "lms",
      detail: "This route now attempts to read entitlement-checked Academy data.",
    },
    {
      label: "Readiness status",
      value: protectedAcademy.data?.academy?.readinessStatus || "academy-shell-continuity",
      detail: "True auth activates the protected Academy summary endpoint.",
    },
    {
      label: "Learners ready",
      value: protectedAcademy.data?.academy?.learnersReadyForAssignment ?? 2,
      detail: protectedAcademy.data?.academy?.nextAction || "Assign learners and preserve continuity into project mobilization.",
    },
  ];
  const protectedPrograms = protectedAcademy.data?.academy?.activePrograms || ["onboarding", "safety-readiness", "estimating-basics", "field-document-control"];

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

      <ProtectedProductDataPanel
        title="Academy route is now bound to protected LMS overview data"
        detail="This page now distinguishes protected LMS backend truth from seeded continuity mode so Academy stops reading as a pure informational shell."
        state={protectedAcademy}
        session={session}
        items={protectedItems}
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
      <CustomerCommsLaunchpad session={session} title="Launch enabled training and customer communications lanes" />

      <ProjectSpineBar tenant={liveTenant} project={liveProject} />
      <WorkspaceContextBar tenant={liveTenant} project={liveProject} workspace={liveWorkspace} />
      <AuricruxStatusRail project={liveProject} rail={liveAuricrux} />
      <RouteStateOverlay overlay={routeStateOverlays.academy} />
      <ExecutiveSignalBar mode="academy" nextHref={executiveSignalCtaSets.academy.href} nextLabel={executiveSignalCtaSets.academy.label} />

      <AcademyReadinessOverlay
        session={session}
        setProductAccess={setProductAccess}
        setCommsAccess={setCommsAccess}
        applyPlanPreset={applyPlanPreset}
        refreshSyncStamp={refreshSyncStamp}
      />

      <div style={{ marginBottom: 24 }}>
        <AuricruxCommsPanel
          title="Academy is now connected to the full Auricrux communications stack"
          detail="Training, onboarding, safety refreshers, lecture delivery, conference reviews, and cross-team coaching now sit inside the same communications control plane as project, support, and customer follow-through."
          statusLabel="Training comms posture"
          statusValue="Rollout channels connected"
          items={commItems}
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
            <div>{protectedAcademy.data?.academy?.learnersReadyForAssignment ?? 2} learners are ready for onboarding assignment before mobilization for {liveProject.id}.</div>
          </div>
          <div>
            <strong>Dependency</strong>
            <div>{routeStateOverlays.academy.dependencyDetail}</div>
          </div>
          <div>
            <strong>Commercial blocker</strong>
            <div>{liveAuricrux.blockerImpact}</div>
          </div>
          <div>
            <strong>Coordinated next move</strong>
            <div>{protectedAcademy.data?.academy?.nextAction || `Assign learners here, then preserve follow-through in messages, billing, and field kickoff planning for ${liveTenant.name}.`}</div>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Protected Academy programs</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Academy now shows backend-entitled program lanes when true auth is active</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {protectedPrograms.map((program) => (
            <div key={program} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff", fontWeight: 700, color: "#1d4ed8" }}>
              {program}
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>Real LMS classrooms</div>
            <h2 style={{ marginTop: 0, marginBottom: 8 }}>FCA Academy now carries named classroom tracks tied to real workspace outcomes</h2>
          </div>
          <div style={{ color: "#475569", maxWidth: 320, lineHeight: 1.6 }}>
            Curriculum is attached directly to estimating, project controls, field readiness, and customer-delivery continuity.
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
          {academyClassrooms.map((classroom) => (
            <div key={classroom.title} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{classroom.credential}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{classroom.title}</h3>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 10 }}>
                <div><strong>Cadence:</strong> {classroom.cadence}</div>
                <div><strong>Delivery:</strong> {classroom.delivery}</div>
              </div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
                {classroom.modules.map((module) => (
                  <li key={module}>{module}</li>
                ))}
              </ul>
              <a href={classroom.linkedSurface} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{classroom.linkedLabel}</a>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Program catalog</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>Academy now presents a real catalog of programs, credentials, and rollout pathways</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16, marginBottom: 18 }}>
          {academyCatalog.programs.map((program) => (
            <div key={program.key} style={{ border: "1px solid #dbe3ef", borderRadius: 14, padding: 16, background: "#f8fbff" }}>
              <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{program.credential}</div>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{program.title}</h3>
              <div style={{ color: "#475569", lineHeight: 1.7, marginBottom: 8 }}>
                <div><strong>Audience:</strong> {program.audience}</div>
                <div><strong>Duration:</strong> {program.duration}</div>
                <div><strong>Format:</strong> {program.format}</div>
              </div>
              <p style={{ color: "#334155", lineHeight: 1.7 }}>{program.outcome}</p>
              <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 6 }}>Linked stack</div>
              <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
                {program.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Credential governance</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {academyCatalog.credentials.map((credential) => (
                <li key={credential.title}>
                  <strong>{credential.title}</strong> — {credential.renewal}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
            <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Curriculum-to-product pathways</div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.8, color: "#334155", marginTop: 0 }}>
              {academyCatalog.pathways.map((pathway) => (
                <li key={pathway.title}>
                  <a href={pathway.route} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{pathway.label}</a> — {pathway.description}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 24 }}>
        <div style={{ color: "#0f172a", fontWeight: 700, marginBottom: 8 }}>Academy tied to real SaaS pathways</div>
        <p style={{ color: "#475569", lineHeight: 1.7, marginTop: 0 }}>
          The classroom layer is no longer treated as a disconnected learning shell. Each training track reinforces a production pathway already present in FCA.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {saasOperationalPathways.map((pathway) => (
            <div key={pathway.title} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 8 }}>{pathway.title}</h3>
              <div style={{ color: "#334155", lineHeight: 1.7, marginBottom: 8 }}>
                <div><strong>Outcome:</strong> {pathway.outcome}</div>
              </div>
              <a href={pathway.href} style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>{pathway.ctaLabel}</a>
            </div>
          ))}
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
            <div>• {protectedAcademy.data?.academy?.learnersReadyForAssignment ?? 2} new learners are ready for onboarding assignment under {liveTenant.name}.</div>
            <div>• One certification expires in 14 days.</div>
            <div>• Field kickoff posture for {liveProject.id} suggests scheduling a safety and document-control refresher before mobilization.</div>
          </div>
        </div>
      </div>

      <ProjectFileAuditPanel project={liveProject} files={portalFiles} auditEvents={projectAuditEvents} />

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 16, marginTop: 24 }}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Connected portal routes</h2>
          <PublicCtaRow actions={academyCtaSets.connectedPortalRoutes} style={{ display: "grid", gap: 12 }} />
        </div>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Production close</h2>
          <p style={{ lineHeight: 1.7, color: "#4b5563" }}>
            Use this screen to prove FCA is not just a bid tool. The same customer can move from sales and portal visibility into workforce enablement, safety readiness, compliance discipline, and long-term support without breaking the shared system state.
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
