import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import { PortalAlert } from "../../components/portal/PortalPrimitives";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useProjectWorkspaceDetail from "../../hooks/useProjectWorkspaceDetail";
import FinanceConstructionPanel from "../../components/finance/FinanceConstructionPanel";
import useFinancialWorkspace from "../../hooks/useFinancialWorkspace";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchProjectRfis } from "../../api/constructionClient";

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
  const jobBilling = useFinancialWorkspace("construction", projectId || "");
  const jobCost = useJobCost(projectId || "");
  const [rfis, setRfis] = useState([]);

  useEffect(() => {
    if (!projectId) return;
    fetchProjectRfis(projectId).then((items) => setRfis(items || [])).catch(() => setRfis([]));
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return undefined;
    const refreshJobCost = () => jobCost.refresh();
    window.addEventListener("focus", refreshJobCost);
    return () => window.removeEventListener("focus", refreshJobCost);
  }, [projectId, jobCost.refresh]);

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
        auricruxSummary: {
          nextAction: project.nextAction || state.workspace.currentNextAction,
        },
      }
    : null);

  const fullyApiBacked = meta.projectSource === "api-workflow-store" && meta.fileSource === "api-workflow-store" && meta.auditSource === "api-workflow-store";
  const recentAudit = useMemo(() => visible?.auditSummary?.mostRecent || [], [visible]);

  return (
    <PortalShell
      title="Project"
      subtitle="Project hub for files, audit trail, and next actions."
      activeHref="/portal/projects"
      currentJourney="job"
      primaryHref="/portal/files"
      primaryLabel="Open Files"
      workspaceState={state}
    >
      {!fullyApiBacked ? (
        <div style={{ marginBottom: 16 }}>
          <PortalAlert tone="warning" title="Limited project sync">
            Showing workspace continuity for this project. Full file, audit, and correction workflows sync when the API is connected.
          </PortalAlert>
        </div>
      ) : null}

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
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <AuricruxInsightPanel
              title="Auricrux Project Intelligence"
              targetObjectId={projectId}
              nextAction={visible.auricruxSummary?.nextAction || state.workspace.currentNextAction}
              metrics={[
                { label: "Stage", value: visible.stage || "—" },
                { label: "Open RFIs", value: rfis.length },
                { label: "Contract", value: jobBilling.data?.package?.metrics?.contractValue || jobCost.rollup?.contractValue || "—" },
              ]}
              recommendations={[
                { summary: "Advance job billing and SOV from priced estimate lines.", href: `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}` },
                { summary: "Coordinate field tasks against schedule and job cost.", href: `/portal/field-tasks?projectId=${encodeURIComponent(projectId)}` },
              ]}
              tone="blue"
            />
          </div>

          <div style={{ ...cardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>Job billing & SOV</h2>
              <a href={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`} style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>
                Open in Finance
              </a>
            </div>
            <FinanceConstructionPanel
              packageData={jobBilling.data?.package}
              projectId={projectId}
              onCreatePayApp={() => jobBilling.createPayAppFromSov(projectId)}
              onAdvancePayApp={(payAppId, status) => jobBilling.advancePayApp(payAppId, status)}
              onUpdateSovLine={(body) => jobBilling.upsertSovLine({ ...body, projectId })}
              onGeneratePayAppDoc={(pid, payAppId) => jobBilling.generatePayAppDocument(pid, payAppId)}
              busy={jobBilling.loading}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Job cost rollup</h2>
              {jobCost.loading ? <div style={{ color: "#64748b" }}>Loading job cost…</div> : null}
              <div style={{ color: "#475569", lineHeight: 1.9 }}>
                <div>Contract: <strong>{jobCost.rollup?.contractValue || jobBilling.data?.package?.metrics?.contractValue || "—"}</strong></div>
                <div>Actual cost: <strong>{jobCost.rollup?.actualCost || jobBilling.data?.package?.jobCost?.actualCost || "—"}</strong></div>
                <div>Committed: <strong>{jobCost.rollup?.committedCost || jobBilling.data?.package?.jobCost?.committedCost || "—"}</strong></div>
                <div>Margin forecast: <strong>{jobCost.rollup?.grossMarginForecast || jobBilling.data?.package?.jobCost?.grossMarginForecast || "—"}</strong></div>
                <a href="/portal/field-tasks" style={{ color: "#2563eb", fontWeight: 700, textDecoration: "none" }}>Field tasks post actuals on completion</a>
              </div>
              <a href={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`} style={{ display: "inline-block", marginTop: 12, fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>Open job billing</a>
            </div>
            <div style={cardStyle}>
              <h2 style={{ marginTop: 0 }}>Field coordination</h2>
              <div style={{ color: "#475569", lineHeight: 1.9, marginBottom: 12 }}>
                <div><strong>Open RFIs:</strong> {rfis.length}</div>
                <div><strong>Field tasks:</strong> governed in Field Ops</div>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href={`/portal/rfis?projectId=${encodeURIComponent(projectId)}`} style={{ fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>RFI register</a>
                <a href={`/portal/field-tasks?projectId=${encodeURIComponent(projectId)}`} style={{ fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>Field tasks</a>
                <a href={`/portal/change-orders?projectId=${encodeURIComponent(projectId)}`} style={{ fontWeight: 700, color: "#2563eb", textDecoration: "none" }}>Change orders</a>
              </div>
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
