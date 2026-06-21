import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import SystemStateSummary from "../../components/SystemStateSummary";
import ProjectActionCenter from "../../components/ProjectActionCenter";
import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";
import ExecutionTruthBanner from "../../components/ExecutionTruthBanner";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionButtonStyle = {
  border: "1px solid #2563eb",
  background: "#eff6ff",
  color: "#1d4ed8",
  borderRadius: 10,
  padding: "10px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const PROJECT_COMMAND_KEY = "fca_customer_project_command_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

const defaultCommandDraft = {
  ownerNote: "",
  customerMilestone: "Kickoff scheduled",
};

export default function PortalProjects() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { projects, activeProject, meta, selectActiveProject, advanceProjectStage, clearPermitBlocker } = useProjectWorkspace();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [drafts, setDrafts] = useState(() => readLocalJson(PROJECT_COMMAND_KEY, {}));

  useEffect(() => {
    refreshSyncStamp("Persisted project flow state active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(PROJECT_COMMAND_KEY, drafts);
  }, [drafts]);

  const visibleProject = activeProject || state.project;
  const apiBacked = meta.backingSource === "api-workflow-store";
  const companyName = state?.tenant?.name || brandSkin.companyName || "Customer Workspace";
  const brandedNarrative = useMemo(() => `${companyName} Project Command keeps awarded work moving from kickoff through mobilization, customer milestones, permit recovery, and closeout readiness without losing branded continuity.`, [companyName]);

  function updateDraft(projectId, key, value) {
    setDrafts((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || defaultCommandDraft),
        [key]: value,
      },
    }));
  }

  return (
    <PortalShell
      title={`${companyName} Project Command Board`}
      subtitle="Track stages, mobilization, and delivery for every active job."
      activeHref="/portal/projects"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/files"
      primaryLabel="Open Files"
      workspaceState={state}
    >
      {visibleProject?.id ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux Project Intelligence"
            targetObjectId={visibleProject.id}
            sourceRoute="/portal/projects"
            rationale={visibleProject.nextAction || "Advance the active project with governed field, finance, and closeout continuity."}
            nextAction={visibleProject.nextAction || "Select the next governed project action and preserve cross-lane continuity."}
            actionHref={`/portal/projects/${encodeURIComponent(visibleProject.id)}`}
            actionLabel="Open project home"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

      {!apiBacked ? (
        <div style={{ marginBottom: 16 }}>
          <ExecutionTruthBanner
            title="Project continuity shell is active"
            status="Workspace active"
            source={meta.backingSource}
            tone="warning"
            whatIsLive={[
              "Active project selection inside the shared workspace shell.",
              "Project continuity presentation tied to the current workspace context.",
              "Project-to-files and project-to-audit routing posture.",
            ]}
            whatIsNotLiveYet={[
              "This route is not currently using fully verified API-backed project workflow state for all actions.",
              "Mutations can fall back to local continuity state when backend workflow calls are unavailable.",
              "The governed project detail home at /portal/projects/:projectId is not live yet.",
            ]}
          />
        </div>
      ) : null}

      <div style={{ marginBottom: 16 }}>
        <SystemStateSummary
          tenant={state.tenant}
          project={state.project}
          workspace={state.workspace}
          auricrux={state.auricrux}
          title="Project route is anchored to the live workspace state"
          detail="Project execution visibility now reads from the same tenant, project, next-action, and blocker source as the rest of the FCA shell."
        />
      </div>

      <div style={{ ...cardStyle, marginBottom: 16, background: brandSkin.surface || "#eff6ff", border: `1px solid ${brandSkin.accent || "#1d4ed8"}` }}>
        <div style={{ color: brandSkin.accent || "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Customer-branded project command</div>
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>{companyName}</h2>
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: 12 }}>{brandedNarrative}</p>
        <div style={{ color: "#475569", lineHeight: 1.8 }}>
          <div><strong>Workspace state source:</strong> {state.meta.backingSource}</div>
          <div><strong>Project workflow source:</strong> {meta.backingSource}</div>
          <div><strong>Project workflow status:</strong> {meta.persistenceState}</div>
          <div><strong>Auricrux posture:</strong> explain, recommend, execute</div>
        </div>
      </div>

      <CommercialContinuityFeed title="Project commercial continuity feed" detail="Recent project-stage changes, permit-path repairs, and execution-to-closeout mutations remain visible here so delivery actions stay tied to revenue and rollout continuity." />
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0 }}>Functional product: Project stage and milestone control</h2>
        <div style={{ color: "#4b5563", lineHeight: 1.8 }}>
          <div><strong>Active project root:</strong> {visibleProject?.id || state.project.id}</div>
          <div><strong>Current stage:</strong> {visibleProject?.stage || state.project.stage}</div>
          <div><strong>Commercial focus:</strong> {visibleProject?.commercialFocus}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {projects.map((project) => {
          const isActive = visibleProject?.id === project.id;
          const draft = drafts[project.id] || defaultCommandDraft;
          return (
            <div key={project.id} style={{ ...cardStyle, border: isActive ? `1px solid ${brandSkin.accent || "#2563eb"}` : cardStyle.border, background: isActive ? brandSkin.surface || "#f8fbff" : cardStyle.background }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <h3 style={{ margin: "0 0 6px 0" }}>{project.id} · {project.customer}</h3>
                  <div style={{ color: "#4b5563", lineHeight: 1.6 }}>
                    Current stage: <strong>{project.stage}</strong><br />
                    Next action: {project.nextAction}<br />
                    Site status: {project.siteStatus}
                  </div>
                </div>
                <div style={{ minWidth: 220, color: "#0f172a", lineHeight: 1.7 }}>
                  <div><strong>Owner:</strong> {project.owner}</div>
                  <div><strong>Due:</strong> {project.due}</div>
                  <div><strong>Superintendent:</strong> {project.superintendent}</div>
                  <div><strong>Permit status:</strong> {project.permitStatus}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Owner note</div>
                  <input value={draft.ownerNote} onChange={(event) => updateDraft(project.id, "ownerNote", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Add the next branded owner note" />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Customer milestone</div>
                  <input value={draft.customerMilestone} onChange={(event) => updateDraft(project.id, "customerMilestone", event.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1", boxSizing: "border-box" }} placeholder="Kickoff scheduled" />
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                <div style={{ color: isActive ? brandSkin.accent || "#1d4ed8" : "#64748b", fontWeight: 700 }}>
                  {isActive ? "Active workspace project" : "Available project root"}
                </div>
                <button
                  type="button"
                  style={actionButtonStyle}
                  onClick={async () => {
                    const selected = await selectActiveProject(project.id, `${project.id} selected as the active project root.`);
                    syncActiveProject(selected || project, `Active project root updated to ${project.id}`);
                    refreshSyncStamp(`Project root synchronized to ${project.id}`);
                  }}
                >
                  {isActive ? "Active project selected" : "Set as active project"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
                <button type="button" style={actionButtonStyle} onClick={() => advanceProjectStage(project.id, "Mobilization", `${draft.customerMilestone || "Mobilization milestone"} confirmed for ${project.id}. ${draft.ownerNote || "Auricrux advanced the project stage."}`)}>Advance to Mobilization</button>
                <button type="button" style={actionButtonStyle} onClick={() => advanceProjectStage(project.id, "Closeout", `Closeout readiness confirmed for ${project.id}. ${draft.ownerNote || "Auricrux advanced the project to closeout planning."}`)}>Advance to Closeout</button>
                <button type="button" style={actionButtonStyle} onClick={() => clearPermitBlocker(project.id, `${draft.customerMilestone || "Customer milestone"} active and permit blocker cleared for ${project.id}.`)}>Clear Permit Blocker</button>
              </div>

              <ProjectActionCenter project={project} advanceProjectStage={advanceProjectStage} clearPermitBlocker={clearPermitBlocker} />
            </div>
          );
        })}
      </div>

      <div style={{ ...cardStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Auricrux confirmed in Project Command</h2>
        <ul style={{ paddingLeft: 20, lineHeight: 1.9, color: "#334155", marginBottom: 0 }}>
          <li>Explains active stage, blocker posture, and milestone readiness</li>
          <li>Recommends next delivery and customer-communication actions</li>
          <li>Executes project selection, stage advancement, and permit-path recovery</li>
        </ul>
      </div>
    </PortalShell>
  );
}
