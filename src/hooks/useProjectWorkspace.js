import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import {
  readActiveProjectWorkspace,
  readProjectWorkspace,
  updateProjectWorkspace,
  writeActiveProjectId,
  writeProjectWorkspace,
} from "../projectWorkspaceStore";
import { fetchWorkflowProjects, mutateWorkflowProject } from "../api/workflowClient";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

export default function useProjectWorkspace() {
  const [projects, setProjects] = useState(() => readProjectWorkspace());
  const [activeProjectId, setActiveProjectId] = useState(() => readActiveProjectWorkspace()?.id || null);
  const [meta, setMeta] = useState({
    backingSource: "localStorage",
    persistenceState: "Local project continuity active",
    lastSyncedAt: null,
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await fetchWorkflowProjects();
        if (!active) return;
        const saved = writeProjectWorkspace(payload.items || []);
        setProjects(saved);
        setActiveProjectId((payload.items || []).find((project) => project.isActive)?.id || readActiveProjectWorkspace(saved)?.id || null);
        setMeta({
          backingSource: payload.backingSource || "api-workflow-store",
          persistenceState: "API project workflow spine active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        const nextProjects = readProjectWorkspace();
        setProjects(nextProjects);
        setActiveProjectId(readActiveProjectWorkspace(nextProjects)?.id || null);
        setMeta({
          backingSource: "localStorage",
          persistenceState: "Fallback project continuity active",
          lastSyncedAt: null,
        });
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    const activeProject = projects.find((project) => project.id === activeProjectId) || projects[0] || null;

    return {
      projects,
      activeProject,
      meta,
      async selectActiveProject(projectId, detail = "Active project context updated.") {
        try {
          const payload = await mutateWorkflowProject("select-active", { projectId, detail });
          const refreshed = await fetchWorkflowProjects();
          const saved = writeProjectWorkspace(refreshed.items || []);
          const nextId = (refreshed.items || []).find((project) => project.isActive)?.id || payload.activeProjectId || projectId;
          writeActiveProjectId(nextId, saved);
          setProjects(saved);
          setActiveProjectId(nextId);
          setMeta({ backingSource: refreshed.backingSource || payload.backingSource || "api-workflow-store", persistenceState: "API project context active", lastSyncedAt: new Date().toISOString() });
          const selected = saved.find((project) => project.id === nextId);
          if (selected) {
            appendAutomationLog({ type: "project-context", title: `${selected.id} set as active project`, detail, route: "/portal/projects" });
            appendCommercialLog({ type: "project-context", title: `${selected.id} selected as project root`, detail, route: "/portal/projects" });
          }
          return selected || null;
        } catch {
          const nextId = writeActiveProjectId(projectId, projects);
          setActiveProjectId(nextId);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback project context active", lastSyncedAt: new Date().toISOString() });
          return projects.find((project) => project.id === nextId) || null;
        }
      },
      async advanceProjectStage(projectId, stage, detail) {
        try {
          const payload = await mutateWorkflowProject("advance-stage", { projectId, stage, detail });
          const saved = updateProjectWorkspace((current) => current.map((project) => (project.id === projectId ? payload.project : project)));
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", lastSyncedAt: new Date().toISOString() });
          const updated = payload.project;
          appendAutomationLog({ type: "project-stage", title: `${updated.id} moved to ${stage}`, detail: detail || `Auricrux advanced ${updated.id} to ${stage}.`, route: "/portal/projects" });
          appendCommercialLog({ type: "project-stage", title: `${updated.id} execution posture advanced`, detail: detail || `Auricrux advanced ${updated.id} to ${stage} and preserved cross-lane delivery continuity.`, route: "/portal/projects" });
          return saved;
        } catch {
          const saved = updateProjectWorkspace((current) =>
            current.map((project) =>
              project.id !== projectId
                ? project
                : {
                    ...project,
                    stage,
                    nextAction: detail || project.nextAction,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [stampHistoryEntry(`Stage moved to ${stage}`, detail || `Auricrux moved ${project.id} into ${stage}.`), ...project.actionHistory].slice(0, 12),
                  }
            )
          );
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback project mutation active", lastSyncedAt: new Date().toISOString() });
          return saved;
        }
      },
      async clearPermitBlocker(projectId, detail = "Permit dependency cleared and project routed toward mobilization.") {
        try {
          const payload = await mutateWorkflowProject("clear-permit-blocker", { projectId, detail });
          const saved = updateProjectWorkspace((current) => current.map((project) => (project.id === projectId ? payload.project : project)));
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", lastSyncedAt: new Date().toISOString() });
          const updated = payload.project;
          appendAutomationLog({ type: "project-repair", title: `${updated.id} permit blocker cleared`, detail, route: "/portal/projects" });
          appendCommercialLog({ type: "project-repair", title: `${updated.id} mobilization path restored`, detail, route: "/portal/projects" });
          return saved;
        } catch {
          const saved = updateProjectWorkspace((current) =>
            current.map((project) =>
              project.id !== projectId
                ? project
                : {
                    ...project,
                    permitStatus: "Permit cleared for next move",
                    siteStatus: "Ready for mobilization planning",
                    nextAction: detail,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [stampHistoryEntry("Permit blocker cleared", detail), ...project.actionHistory].slice(0, 12),
                  }
            )
          );
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback project mutation active", lastSyncedAt: new Date().toISOString() });
          return saved;
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
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API project mutation active", lastSyncedAt: new Date().toISOString() });
          return payload.project;
        } catch {
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback project notes active", lastSyncedAt: new Date().toISOString() });
          return null;
        }
      },
    };
  }, [activeProjectId, meta, projects]);
}
