import { useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import PublicCtaRow from "../../components/PublicCtaRow";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useWorkflowAudit from "../../hooks/useWorkflowAudit";
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
  const { projects, activeProject, meta: projectMeta } = useProjectWorkspace();
  const { projectId, project, routeMatchedProject } = resolveProjectIdentity(requestedPath, routeParams, projects, activeProject || state.project);
  const { files, meta: evidenceMeta, summary: fileSummary } = useWorkflowEvidence(project?.id);
  const { auditEvents, meta: auditMeta, summary: auditSummary } = useWorkflowAudit(project?.id);

  const apiBackedProject = projectMeta.backingSource === "api-workflow-store";
  const apiBackedEvidence = evidenceMeta.backingSource === "api-workflow-store";
  const apiBackedAudit = auditMeta.backingSource === "api-workflow-store";
  const fullyApiBacked = apiBackedProject && apiBackedEvidence && apiBackedAudit;

  const recentAudit = useMemo(() => auditEvents.slice(0, 3), [auditEvents]);

  return (
    <PortalShell
      title="Project Workspace"
      subtitle="Project continuity home for route-bound project identity, file summary, audit summary, and Auricrux next-action posture without overstating backend completion."
      activeHref="/portal/projects"
      currentJourney="job"
      primaryHref="/portal/files"
      primaryLabel="Open Files"
      workspaceState={state}
    >
      <div style={{ marginBottom: 16 }}>
        <ExecutionTruthBanner
          title="Project continuity home is now live in router truth"
          status={fullyApiBacked ? "API-backed continuity posture" : "Shell continuity active"}
          source={`project=${projectMeta.backingSource} · files=${evidenceMeta.backingSource} · audit=${auditMeta.backingSource}`}
          tone={fullyApiBacked ? "info" : "warning"}
          whatIsLive={[
            "A dynamic routed project workspace now exists at /portal/projects/:projectId.",
            "Route-bound project identity, file summary, audit summary, and Auricrux next-action visibility are presented in one project home.",
            "This route gives the flagship spine a real project detail surface instead of forcing all continuity into the projects list route.",
          ]}
          whatIsNotLiveYet={[
            "This route still relies on current project, file, and audit shell stores when fully governed backend state is unavailable.",
            "Direct project-detail mutations and full route-specific backend contracts are not yet fully implemented here.",
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
          title="Project detail route now exists in live router truth"
          detail="This route establishes the flagship project continuity home and binds route-param identity to project, file, audit, and Auricrux summaries."
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
          <div><strong>Project workflow source:</strong> {projectMeta.backingSource}</div>
          <div><strong>File workflow source:</strong> {evidenceMeta.backingSource}</div>
          <div><strong>Audit workflow source:</strong> {auditMeta.backingSource}</div>
        </div>
      </div>

      {project ? (
        <>
          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>{project.name || project.id}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, color: "#334155", lineHeight: 1.8 }}>
              <div>
                <div><strong>Project ID:</strong> {project.id}</div>
                <div><strong>Customer:</strong> {project.customer || state.project.customer}</div>
                <div><strong>Owner:</strong> {project.owner || "Not yet assigned"}</div>
                <div><strong>Stage:</strong> {project.stage || state.project.stage}</div>
              </div>
              <div>
                <div><strong>Due:</strong> {project.due || "Not yet scheduled"}</div>
                <div><strong>Permit status:</strong> {project.permitStatus || "Not yet captured"}</div>
                <div><strong>Site status:</strong> {project.siteStatus || "Not yet captured"}</div>
                <div><strong>Source bid:</strong> {project.sourceBidId || "Not yet linked"}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible files</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{fileSummary.total}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Visible audit records</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{auditSummary.total}</div>
            </div>
            <div style={statCardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Auricrux next action</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 6 }}>{project.nextAction || state.workspace.currentNextAction}</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>File summary</h2>
            <div style={{ color: "#475569", lineHeight: 1.8 }}>
              <div><strong>Active file records:</strong> {fileSummary.total}</div>
              <div><strong>Top status groups:</strong> {Object.entries(fileSummary.byStatus).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No file summary available"}</div>
              <div><strong>Top categories:</strong> {Object.entries(fileSummary.byCategory).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No category summary available"}</div>
              <div><strong>Continuity note:</strong> This project home is using the current file spine route as the detailed execution surface until deeper file-native route families are introduced.</div>
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <h2 style={{ marginTop: 0, marginBottom: 10 }}>Audit summary</h2>
            <div style={{ color: "#475569", lineHeight: 1.8, marginBottom: 10 }}>
              <div><strong>Audit records in scope:</strong> {auditSummary.total}</div>
              <div><strong>Event families:</strong> {Object.entries(auditSummary.byEventType).slice(0, 3).map(([label, count]) => `${label} (${count})`).join(" · ") || "No audit summary available"}</div>
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {recentAudit.length ? recentAudit.map((event, index) => (
                <div key={`${event.createdAt || index}-${event.eventType || index}`} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12 }}>
                  <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{event.eventType || "workflow-event"}</div>
                  <div style={{ color: "#0f172a", fontWeight: 700, marginTop: 4 }}>{event.summary || event.action || "Audit event"}</div>
                  <div style={{ color: "#475569", lineHeight: 1.6, marginTop: 4 }}>{event.reason || event.detail || "No detailed reason captured in current shell state."}</div>
                </div>
              )) : (
                <div style={{ color: "#475569", lineHeight: 1.7 }}>No recent audit entries are available in the current project scope.</div>
              )}
            </div>
          </div>

          <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
            <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Missing-wiring guard</div>
            <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
              This route now acts as the flagship project continuity home, but it still depends on the current shell stores for parts of project, file, and audit truth when backend detail reads are unavailable.
              Direct route-specific project actions, deeper Auricrux action history, and fully governed correction workflows still need their own backend contracts before this route can be described as fully product-complete.
            </div>
          </div>
        </>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 16, background: "linear-gradient(135deg, #fffbeb 0%, #ffffff 100%)", border: "1px solid #fcd34d" }}>
          <div style={{ color: "#b45309", fontWeight: 800, marginBottom: 8 }}>Project not found in current shell continuity state</div>
          <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
            No project record matching <strong>{projectId || "the requested route"}</strong> was found in the current workspace shell.
            This route now exists, but it still depends on the current project continuity store until a dedicated route-specific project detail object spine is fully live.
          </div>
        </div>
      )}
    </PortalShell>
  );
}
