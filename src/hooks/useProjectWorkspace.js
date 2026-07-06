import { useCallback, useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import {
  readActiveProjectWorkspace,
  updateProjectWorkspace,
  writeActiveProjectId,
  writeProjectWorkspace,
} from "../projectWorkspaceStore";
import { fetchWorkflowProjects, mutateWorkflowProject } from "../api/workflowClient";
import { publishProjectEvent } from "../projectEventBus";
import { PROJECT_EVENT_TYPES } from "../projectEventContracts";

export default function useProjectWorkspace() {
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [meta, setMeta] = useState({
    backingSource: "loading",
    persistenceState: "Loading project workflow from FCA Contractor Command…",
    loadError: "",
    lastSyncedAt: null,
  });

  const reloadProjects = useCallback(async () => {
    setMeta((current) => ({
      ...current,
      backingSource: "loading",
      persistenceState: "Loading project workflow from FCA Contractor Command…",
      loadError: "",
    }));
    try {
      const payload = await fetchWorkflowProjects();
      const saved = writeProjectWorkspace(payload.items || []);
      setProjects(saved);
      setActiveProjectId(
        (payload.items || []).find((project) => project.isActive)?.id ||
          readActiveProjectWorkspace(saved)?.id ||
          null
      );
      setMeta({
        backingSource: payload.backingSource || "api-workflow-store",
        persistenceState: "API project workflow spine active",
        loadError: "",
        lastSyncedAt: new Date().toISOString(),
      });
      return saved;
    } catch (err) {
      setProjects([]);
      setActiveProjectId(null);
      setMeta({
        backingSource: "api-error",
        persistenceState: "Unable to load projects from FCA Contractor Command",
        loadError: err?.message || "Unable to load project workflow state.",
        lastSyncedAt: null,
      });
      return [];
    }
  }, []);

  useEffect(() => {
    reloadProjects();
  }, [reloadProjects]);

  return useMemo(() => {
    const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0] || null;

    return {
      projects,
      activeProject,
      meta,
      reloadProjects,
      async selectActiveProject(projectId, detail = "Active project context updated.") {
        try {
          const payload = await mutateWorkflowProject("select-active", { projectId, detail });
          const refreshed = await fetchWorkflowProjects();
          const saved = writeProjectWorkspace(refreshed.items || []);
          const nextId =
            (refreshed.items || []).find((project) => project.isActive)?.id ||
            payload.activeProjectId ||
            projectId;
          writeActiveProjectId(nextId, saved);
          setProjects(saved);
          setActiveProjectId(nextId);
          setMeta({
            backingSource: refreshed.backingSource || payload.backingSource || "api-workflow-store",
            persistenceState: "API project context active",
            loadError: "",
            lastSyncedAt: new Date().toISOString(),
          });
          const selected = saved.find((project) => project.id === nextId);
          if (selected) {
            appendAutomationLog({ type: "project-context", title: `${selected.id} set as active project`, detail, route: "/portal/projects" });
            appendCommercialLog({ type: "project-context", title: `${selected.id} selected as project root`, detail, route: "/portal/projects" });
            await publishProjectEvent(PROJECT_EVENT_TYPES.CONTEXT_SELECTED, {
              projectId: selected.id,
              stage: selected.stage,
              detail,
              route: "/portal/projects",
              data: {
                source: "useProjectWorkspace.selectActiveProject",
              },
            });
          }
          return selected || null;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to select active project.",
          }));
          throw err;
        }
      },
      async advanceProjectStage(projectId, stage, detail) {
        try {
          const payload = await mutateWorkflowProject("advance-stage", { projectId, stage, detail });
          if (payload?.pendingReview) {
            setMeta((current) => ({
              ...current,
              persistenceState: payload.message || "Safe-Mode active: action queued for instructor review.",
              loadError: "",
              lastSyncedAt: new Date().toISOString(),
            }));
            return projects;
          }

          const saved = updateProjectWorkspace((current) => current.map((project) => (project.id === projectId ? payload.project : project)));
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", loadError: "", lastSyncedAt: new Date().toISOString() });
          const updated = payload.project;
          appendAutomationLog({ type: "project-stage", title: `${updated.id} moved to ${stage}`, detail: detail || `Auricrux advanced ${updated.id} to ${stage}.`, route: "/portal/projects" });
          appendCommercialLog({ type: "project-stage", title: `${updated.id} execution posture advanced`, detail: detail || `Auricrux advanced ${updated.id} to ${stage} and preserved cross-lane delivery continuity.`, route: "/portal/projects" });
          await publishProjectEvent(PROJECT_EVENT_TYPES.STAGE_ADVANCED, {
            projectId,
            stage,
            detail: detail || `Auricrux advanced ${projectId} to ${stage}.`,
            route: "/portal/projects",
            data: {
              source: "useProjectWorkspace.advanceProjectStage",
            },
          });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to advance project stage.",
          }));
          throw err;
        }
      },
      async clearPermitBlocker(projectId, detail = "Permit dependency cleared and project routed toward mobilization.") {
        try {
          const payload = await mutateWorkflowProject("clear-permit-blocker", { projectId, detail });
          if (payload?.pendingReview) {
            setMeta((current) => ({
              ...current,
              persistenceState: payload.message || "Safe-Mode active: action queued for instructor review.",
              loadError: "",
              lastSyncedAt: new Date().toISOString(),
            }));
            return projects;
          }

          const saved = updateProjectWorkspace((current) => current.map((project) => (project.id === projectId ? payload.project : project)));
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", loadError: "", lastSyncedAt: new Date().toISOString() });
          const updated = payload.project;
          appendAutomationLog({ type: "project-repair", title: `${updated.id} permit blocker cleared`, detail, route: "/portal/projects" });
          appendCommercialLog({ type: "project-repair", title: `${updated.id} mobilization path restored`, detail, route: "/portal/projects" });
          await publishProjectEvent(PROJECT_EVENT_TYPES.PERMIT_BLOCKER_CLEARED, {
            projectId,
            stage: updated.stage,
            detail,
            route: "/portal/projects",
            data: {
              source: "useProjectWorkspace.clearPermitBlocker",
            },
          });
          return saved;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to clear permit blocker.",
          }));
          throw err;
        }
      },
      async updateProjectCommandNotes(projectId, { ownerNote = "", customerMilestone = "" }, detail = "Project command notes saved.") {
        try {
          const payload = await mutateWorkflowProject("update-command-notes", {
            projectId,
            ownerNote,
            customerMilestone,
            detail,
          });
          const saved = updateProjectWorkspace((current) => current.map((project) => (project.id === projectId ? payload.project : project)));
          setProjects(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", loadError: "", lastSyncedAt: new Date().toISOString() });
          await publishProjectEvent(PROJECT_EVENT_TYPES.COMMAND_NOTES_UPDATED, {
            projectId,
            stage: payload.project?.stage || "",
            detail,
            route: "/portal/projects",
            data: {
              ownerNote,
              customerMilestone,
              source: "useProjectWorkspace.updateProjectCommandNotes",
            },
          });
          return payload.project;
        } catch (err) {
          setMeta((current) => ({
            ...current,
            loadError: err?.message || "Unable to save project notes.",
          }));
          throw err;
        }
      },
    };
  }, [activeProjectId, meta, projects, reloadProjects]);
}
