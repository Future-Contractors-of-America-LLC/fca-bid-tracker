import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectActionCenter from "../../components/ProjectActionCenter";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { routeStateOverlays } from "../../systemState";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalInputStyle,
  portalTokens,
} from "../../portalDesignTokens";

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
  const { projects, activeProject, meta, selectActiveProject, advanceProjectStage, clearPermitBlocker, updateProjectCommandNotes } = useProjectWorkspace();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [drafts, setDrafts] = useState(() => readLocalJson(PROJECT_COMMAND_KEY, {}));
  const [selectedProjectId, setSelectedProjectId] = useState(() => activeProject?.id || projects[0]?.id || "");
  const [notesStatus, setNotesStatus] = useState("");

  useEffect(() => {
    refreshSyncStamp("Project command active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(PROJECT_COMMAND_KEY, drafts);
  }, [drafts]);

  const visibleProject = projects.find((project) => project.id === selectedProjectId) || activeProject || state.project;
  const apiBacked = meta.backingSource === "api-workflow-store";

  const tableRows = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        active: visibleProject?.id === project.id,
        project,
        name: `${project.id} · ${project.customer}`,
        stage: project.stage,
        owner: project.owner,
        due: project.due,
        nextAction: project.nextAction,
      })),
    [projects, visibleProject?.id],
  );

  function updateDraft(projectId, key, value) {
    setDrafts((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || defaultCommandDraft),
        [key]: value,
      },
    }));
  }

  async function persistCommandNotes(projectId) {
    const command = drafts[projectId] || defaultCommandDraft;
    const saved = await updateProjectCommandNotes(projectId, {
      ownerNote: command.ownerNote,
      customerMilestone: command.customerMilestone,
    });
    setNotesStatus(saved ? "Notes saved to project record." : "Notes saved on this device.");
    setTimeout(() => setNotesStatus(""), 3000);
  }

  const draft = visibleProject ? (drafts[visibleProject.id] || defaultCommandDraft) : defaultCommandDraft;

  return (
    <PortalShell
      title="Projects"
      subtitle="Select a job, track stage progression, and keep delivery actions in one place."
      activeHref="/portal/projects"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/files"
      primaryLabel="Open project files"
      workspaceState={state}
    >
      <PortalPageIntro
        eyebrow="Project command"
        title="Deliver active jobs with a clear stage model"
        detail="Pick one project at a time, set the owner note and customer milestone, then advance mobilization or closeout."
      />

      <PortalQuickStats
        items={[
          { label: "Active projects", value: projects.length, hint: "In this workspace" },
          { label: "Selected project", value: visibleProject?.id || "—", hint: visibleProject?.stage || "No stage" },
          { label: "Permit posture", value: visibleProject?.permitStatus || "—", hint: visibleProject?.siteStatus || "Site status" },
        ]}
      />

      {!apiBacked ? (
        <PortalAlert tone="warning" title="Limited API sync">
          Project actions may save locally until workflow API sync is fully available. Your selections still drive the workspace shell.
        </PortalAlert>
      ) : null}

      {visibleProject?.id ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux Project Intelligence"
            targetObjectId={visibleProject.id}
            sourceRoute="/portal/projects"
            rationale={visibleProject.nextAction || "Advance the active project with governed field, finance, and closeout continuity."}
            nextAction={visibleProject.nextAction || "Select the next governed project action."}
            actionHref={`/portal/projects/${encodeURIComponent(visibleProject.id)}`}
            actionLabel="Open project home"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

      <PortalEntityTable
        columns={[
          {
            key: "name",
            label: "Project",
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedProjectId(row.id)}
                style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit", color: portalTokens.primaryInk, fontWeight: 700 }}
              >
                {row.name}
              </button>
            ),
          },
          {
            key: "stage",
            label: "Stage",
            render: (row) => <PortalStatusBadge status={row.stage} active={row.active} />,
          },
          { key: "owner", label: "Owner" },
          { key: "due", label: "Due" },
          { key: "nextAction", label: "Next action" },
        ]}
        rows={tableRows}
        emptyTitle="No active projects yet"
        emptyDetail="Award a qualified bid in the pipeline wizard to create your first live project."
        emptyPrimaryHref="/portal/pipeline"
        emptyPrimaryLabel="Open pipeline"
      />

      {visibleProject ? (
        <div style={{ ...portalCardStyle, marginTop: 16 }}>
          <div style={portalEyebrowStyle}>Selected project workspace</div>
          <h2 style={{ margin: "6px 0 12px", fontSize: "1.15rem" }}>{visibleProject.id} · {visibleProject.customer}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Owner note</div>
              <input
                value={draft.ownerNote}
                onChange={(event) => updateDraft(visibleProject.id, "ownerNote", event.target.value)}
                onBlur={() => persistCommandNotes(visibleProject.id)}
                style={portalInputStyle}
                placeholder="What the owner needs next"
              />
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Customer milestone</div>
              <input
                value={draft.customerMilestone}
                onChange={(event) => updateDraft(visibleProject.id, "customerMilestone", event.target.value)}
                onBlur={() => persistCommandNotes(visibleProject.id)}
                style={portalInputStyle}
                placeholder="Kickoff scheduled"
              />
            </label>
          </div>
          {notesStatus ? <div style={{ color: "#166534", fontSize: 13, marginBottom: 12 }}>{notesStatus}</div> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <button
              type="button"
              style={portalButtonPrimary}
              onClick={async () => {
                const selected = await selectActiveProject(visibleProject.id, `${visibleProject.id} selected as active project.`);
                syncActiveProject(selected || visibleProject, `Active project updated to ${visibleProject.id}`);
                refreshSyncStamp(`Project root synchronized to ${visibleProject.id}`);
              }}
            >
              Set as active project
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => advanceProjectStage(visibleProject.id, "Mobilization", `${draft.customerMilestone || "Mobilization"} confirmed.`)}>
              Advance to mobilization
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => advanceProjectStage(visibleProject.id, "Closeout", `Closeout readiness confirmed.`)}>
              Advance to closeout
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => clearPermitBlocker(visibleProject.id, `Permit blocker cleared for ${visibleProject.id}.`)}>
              Clear permit blocker
            </button>
          </div>

          <ProjectActionCenter
            project={visibleProject}
            advanceProjectStage={advanceProjectStage}
            clearPermitBlocker={clearPermitBlocker}
          />
        </div>
      ) : null}
    </PortalShell>
  );
}
