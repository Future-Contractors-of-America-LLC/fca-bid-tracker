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
import {
  fetchCanonicalProjects,
  fetchWorkflowProjects,
  mutateWorkflowProject,
  upsertCanonicalProject,
} from "../api/workflowClient";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

function normalizeCanonicalProjects(items = []) {
  return items.map((project) => ({
    ...project,
    customer: project.customer || project.customerName || "Unassigned customer",
    stage: project.stage || project.state || "Bid",
    nextAction: project.nextAction || "Advance project",
    owner: project.owner || "Unassigned",
    due: project.due || "TBD",
    superintendent: project.superintendent || "Pending assignment",
    permitStatus: project.permitStatus || "Permit status pending",
    siteStatus: project.siteStatus || "Site status pending",
    commercialFocus: project.commercialFocus || "Commercial focus pending",
    fileSetLabel: project.fileSetLabel || "Project file spine readiness pending",
    fileSpineStatus:
      project.fileSpineStatus ||
      "File, audit, and Auricrux continuity should attach to this same project root.",
    auditLabel: project.auditLabel || "Project continuity audit active",
    auditStatus:
      project.auditStatus ||
      "Recent project-stage changes, file linkage, and Auricrux actions should resolve into the same audit spine.",
    auricruxMode: project.auricruxMode || "Project-aware workspace guidance",
    auricruxSummary:
      project.auricruxSummary ||
      "Auricrux is reading this project as an active operating context inside the shared FCA workspace.",
    actionHistory: Array.isArray(project.actionHistory) ? project.actionHistory : [],
    lastActionAt: project.lastActionAt || null,
  }));
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
        const canonicalItems = normalizeCanonicalProjects(await fetchCanonicalProjects());
        if (!active) return;
        const saved = writeProjectWorkspace(canonicalItems);
        setProjects(saved);
        setActiveProjectId(readActiveProjectWorkspace(saved)?.id || canonicalItems[0]?.id || null);
        setMeta({
          backingSource: "canonical-phase-a-projects",
          persistenceState: "Canonical Phase A project spine active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
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
          const selected = projects.find((project) => project.id === projectId) || null;
          if (selected) {
            await upsertCanonicalProject({ ...selected, id: projectId });
          }
          const refreshed = normalizeCanonicalProjects(await fetchCanonicalProjects());
          const saved = writeProjectWorkspace(refreshed);
          const nextId = refreshed.find((project) => project.id === projectId)?.id || readActiveProjectWorkspace(saved)?.id || projectId;
          writeActiveProjectId(nextId, saved);
          setProjects(saved);
          setActiveProjectId(nextId);
          setMeta({ backingSource: "canonical-phase-a-projects", persistenceState: "Canonical project context active", lastSyncedAt: new Date().toISOString() });
          const nextSelected = saved.find((project) => project.id === nextId);
          if (nextSelected) {
            appendAutomationLog({ type: "project-context", title: `${nextSelected.id} set as active project`, detail, route: "/portal/projects" });
            appendCommercialLog({ type: "project-context", title: `${nextSelected.id} selected as project root`, detail, route: "/portal/projects" });
          }
          return nextSelected || null;
        } catch {
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
              appendCommercialLog({ type: "project-context", title: `${selected.id} selected as project root", detail, route: "/portal/projects" });
            }
            return selected || null;
          } catch {
            const nextId = writeActiveProjectId(projectId, projects);
            setActiveProjectId(nextId);
            setMeta({ backingSource: "localStorage", persistenceState: "Fallback project context active", lastSyncedAt: new Date().toISOString() });
            return projects.find((project) => project.id === nextId) || null;
          }
        }
      },
      async advanceProjectStage(projectId, stage, detail) {
        try {
          const project = projects.find((item) => item.id === projectId) || { id: projectId };
          await upsertCanonicalProject({ ...project, id: projectId, state: stage, stage, nextAction: detail || project.nextAction });
          const refreshed = normalizeCanonicalProjects(await fetchCanonicalProjects());
          const saved = writeProjectWorkspace(refreshed);
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: "canonical-phase-a-projects", persistenceState: "Canonical project mutation active", lastSyncedAt: new Date().toISOString() });
          const updated = saved.find((item) => item.id === projectId) || project;
          appendAutomationLog({ type: "project-stage", title: `${updated.id} moved to ${stage}`, detail: detail || `Auricrux advanced ${updated.id} to ${stage}.`, route: "/portal/projects" });
          appendCommercialLog({ type: "project-stage", title: `${updated.id} execution posture advanced`, detail: detail || `Auricrux advanced ${updated.id} to ${stage} and preserved cross-lane delivery continuity.`, route: "/portal/projects" });
          return saved;
        } catch {
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
        }
      },
      async clearPermitBlocker(projectId, detail = "Permit dependency cleared and project routed toward mobilization.") {
        try {
          const project = projects.find((item) => item.id === projectId) || { id: projectId };
          await upsertCanonicalProject({
            ...project,
            id: projectId,
            permitStatus: "Permit cleared for next move",
            siteStatus: "Ready for mobilization planning",
            nextAction: detail,
          });
          const refreshed = normalizeCanonicalProjects(await fetchCanonicalProjects());
          const saved = writeProjectWorkspace(refreshed);
          setProjects(saved);
          setActiveProjectId(readActiveProjectWorkspace(saved)?.id || null);
          setMeta({ backingSource: "canonical-phase-a-projects", persistenceState: "Canonical project mutation active", lastSyncedAt: new Date().toISOString() });
          const updated = saved.find((item) => item.id === projectId) || project;
          appendAutomationLog({ type: "project-repair", title: `${updated.id} permit blocker cleared`, detail, route: "/portal/projects" });
          appendCommercialLog({ type: "project-repair", title: `${updated.id} mobilization path restored`, detail, route: "/portal/projects" });
          return saved;
        } catch {
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
        }
      },
    };
  }, [activeProjectId, meta, projects]);
}
