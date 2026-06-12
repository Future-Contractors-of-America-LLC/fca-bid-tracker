import { useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import PublicCtaRow from "../../components/PublicCtaRow";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useProjectWorkspaceDetail from "../../hooks/useProjectWorkspaceDetail";
import { publicBodyCtaSets } from "../../websiteShell";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const statCardStyle = {
  border: "1px solid #dbe3ef",
  borderRadius: 12,
  padding: 14,
  background: "#f8fbff",
};

function resolveProjectIdentity(requestedPath, routeParams, projects, fallbackProject) {
  const fromParam = routeParams?.projectId;
  const fromPath = requestedPath?.split("/").filter(Boolean).pop();
  const projectId = fromParam || fromPath || fallbackProject?.id || "";
  const project = projects.find((item) => item.id === projectId) || null;
  return {
    projectId,
    project: project || fallbackProject || null,
    routeMatchedProject: Boolean(project),
  };
}

export default function PortalProjectDetail({ requestedPath, routeParams = {} }) {
  const { state } = useWorkspaceState();
  const { projects, activeProject, meta: projectListMeta } = useProjectWorkspace();
  const { projectId, project, routeMatchedProject } = resolveProjectIdentity(requestedPath, routeParams, projects, activeProject || state.project);
  const { item, meta } = useProjectWorkspaceDetail(projectId, project);

  const visible = item || (project
    ? {
        projectId: project.id,
        projectName: project.name || project.id,
        projectNumber: project.id,
        stage: project.stage || state.project.stage,
        owner: project.owner || "Unassigned",
        permitStatus: project.permitStatus || "Not yet captured",
        siteStatus: project.siteStatus || "Not yet captured",
        sourceOpportunityId: project.sourceBidId || null,
        fileSummary: {
          total: 0,
          briefingsReady: 0,
          byStatus: {},
          byCategory: {},
        },
        auditSummary: {
          total: 0,
          byEventType: {},
          byActorType: {},
          mostRecent: [],
        },
        academyReadiness: null,
        auricruxSummary: {
          nextAction: project.nextAction || state.workspace.currentNextAction,
        },
      }
    : null);

  const fullyApiBacked = meta.projectSource === "api-unified-project-spine" && meta.fileSource === "api-workflow-store" && meta.auditSource === "api-workflow-store";
  const recentAudit = useMemo(() => visible?.auditSummary?.mostRecent || [], [visible]);

  return (
    <PortalShell
      title="Project Workspace"
      subtitle="Project continuity home for route-bound project identity, file summary, audit summary, Academy readiness, and Auricrux next-action posture without overstating backend completion."
      activeHref="/portal/projects"
      currentJourney="job"
      primaryHref="/portal/files"
      primaryLabel="Open Files"
      workspaceState={state}
    >
      <div style={{ marginBottom: 16 }}>
        <ExecutionTruthBanner
          title="Project continuity home is now live in router truth"
          status={fullyApiBacked ? "Unified API-backed workspace reads" : "Fallback shell continuity active"}
          source={`project=${meta.projectSource} · files=${meta.fileSource} · audit=${meta.auditSource}`}
          tone={fullyApiBacked ? "info" : "warning"}
          whatIsLive={[
            "A dynamic routed project workspace exists at /portal/projects/:projectId.",
            "The route now prefers canonical backend reads for project workspace, file summary, audit summary, and Academy readiness.",
            "File summary, audit summary, Academy readiness, and Auricrux next-action visibility are grouped into one project home.",
          ]}
          whatIsNotLiveYet={[
            "When backend truth is unavailable, the route still falls back to shell continuity state.",
            "Direct route-specific project mutations and deeper correction workflows are not yet fully implemented here.",
            "This route should not be treated as proof that all file, audit, and correction flows are production-complete end to end.",
          ]}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={project || state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Project detail route now prefers canonical workspace reads"
          detail="This route now attempts to resolve project detail, file summary, audit summary, and Academy readiness from backend read models before falling back to shell continuity state."
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PublicCtaRow actions={publicBodyCtaSets.portalCoordination} style={{ display: "flex", flexWrap: "wrap", gap: 12 }} />
      </div>

      <CommercialContinuityFeed title="Project continuity feed" detail="Recent project-stage changes, file-state changes, and commercial continuity movement remain visible here so the project home stays tied to execution reality." />
      <AutomationRecoveryFeed title="Project automation feed" detail="Recent Auricrux project-state repairs and continuity adjustments remain visible across the project workspace shell." />

      <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)", border: "1px solid #dbe3ef" }}>
        <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 8 }}>Resolved project identity</div>
        <div style={{ color: "#334155", lineHeight: 1.8 }}>
          <div><strong>Route pattern:</strong> /portal/projects/:projectId</div>
          <div><strong>Requested project ID:</strong> {projectId || "None provided"}</div>
          <div><strong>Matched route project:</strong> {routeMatchedProject ? "Yes" : "No — using workspace fallback"}</div>
          <div><strong>Workspace list source:</strong> {projectListMeta.backingSource}</div>
          <div><strong>Project workspace source:</strong> {meta.projectSource}</div>
          <div><strong>File summary source:</strong> {meta.fileSource}</div>
          <div><strong>Audit summary source:</strong> {meta.auditSource}</div>
        </div>
      </div>

      {visible ? (
        <>
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{visible.projectName || visible.projectId}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.8 }}>
              <div>
                <div><strong>Project ID:</strong> {visible.projectId}</div>
                <div><strong>Project number:</strong> {visible.projectNumber || visible.projectId}</div>
                <div><strong>Owner:</strong> {visible.owner || "Unassigned"}</div>
                <div><strong>Stage:</strong> {visible.stage || state.project.stage}</div>
              </div>
              <div>
                <div><strong>Permit status:</strong> {visible.permitStatus || "Not yet captured"}</div>
                <div><strong>Site status:</strong> {visible.siteStatus || "Not yet captured"}</div>
                <div><strong>Source opportunity:</strong> {visible.sourceOpportunityId || "Not yet linked"}</div>
                <div><strong>Auricrux next action:</strong> {visible.auricruxSummary?.nextAction || state.workspace.currentNextAction}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible files</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.fileSummary?.total ?? 0}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Briefings ready</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.fileSummary?.briefingsReady ?? 0}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Audit records</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.auditSummary?.total ?? 0}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Academy readiness</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{visible.academyReadiness?.readinessStatus || "unknown"}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Academy readiness</h2>
            <div style={{ color: "#475569", lineHeight: 1.8 }}>
              <div><strong>Assignments in scope:</strong> {visible.academyReadiness?.assignmentCount ?? 0}</div>
              <div><strong>Completed assignments:</strong> {visible.academyReadiness?.completedCount ?? 0}</div>
              <div><strong>Average completion:</strong> {visible.academyReadiness?.averageCompletionPercent ?? 0}%</div>
              <div><strong>Feature gate effect:</strong> {visible.academyReadiness?.featureGateEffect || "No effect reported"}</div>
              <div><strong>Blocking reason:</strong> {visible.academyReadiness?.blockingReason || "No academy blocker"}</div>
              <div><strong>Next academy action:</strong> {visible.academyReadiness?.nextAcademyAction || "No academy next action"}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>File summary</h2>
            <div style={{ color: "#475569", lineHeight: 1.8 }}>
              <div><strong>Active file records:</strong> {visible.fileSummary?.total ?? 0}</div>
              <div><strong>Briefings ready:</strong> {visible.fileSummary?.briefingsReady ?? 0}</div>
              <div><strong>Top status groups:</strong> {Object.entries(visible.fileSummary?.byStatus || {}).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No file summary available"}</div>
              <div><strong>Top categories:</strong> {Object.entries(visible.fileSummary?.byCategory || {}).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No category summary available"}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Audit summary</h2>
            <div style={{ color: "#475569", lineHeight: 1.8, marginBottom: 10 }}>
              <div><strong>Audit records in scope:</strong> {visible.auditSummary?.total ?? 0}</div>
              <div><strong>Event families:</strong> {Object.entries(visible.auditSummary?.byEventType || {}).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No audit summary available"}</div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {recentAudit.length ? recentAudit.map((event, index) => (
                <div key={`${event.createdAt || index}-${event.eventType || index}`} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{event.eventType || "workflow-event"}</div>
                  <div style={{ color: "#0f172a", fontWeight: 700, marginTop: 4 }}>{event.summary || "Audit event"}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{event.createdAt || "No timestamp available"}</div>
                </div>
              )) : (
                <div style={{ color: "#475569", lineHeight: 1.7 }}>No recent audit entries are available in the current project scope.</div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
          <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Project not found in current continuity state</div>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            No project record matching <strong>{projectId || "the requested route"}</strong> was found through the current backend or shell continuity sources.
          </div>
        </div>
      )}
    </PortalShell>
  );
}
