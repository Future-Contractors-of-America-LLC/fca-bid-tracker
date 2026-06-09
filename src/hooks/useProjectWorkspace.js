import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import {
  readActiveProjectContext,
  readActiveProjectId,
  readProjectWorkspace,
  selectActiveProject,
  updateProjectWorkspace,
} from "../projectWorkspaceStore";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

export default function useProjectWorkspace() {
  const [projects, setProjects] = useState(() => readProjectWorkspace());
  const [activeProjectId, setActiveProjectId] = useState(() => readActiveProjectId(readProjectWorkspace()));

  useEffect(() => {
    const loadedProjects = readProjectWorkspace();
    setProjects(loadedProjects);
    setActiveProjectId(readActiveProjectId(loadedProjects));
  }, []);

  return useMemo(() => {
    const activeProject = projects.find((project) => project.id === activeProjectId) || readActiveProjectContext(projects);

    return {
      projects,
      activeProjectId,
      activeProject,
      setActiveProject(projectId, detail = "Active project context selected for workspace continuity.") {
        const selected = selectActiveProject(projectId, projects);
        setActiveProjectId(selected.id);
        appendAutomationLog({
          type: "project-context",
          title: `${selected.id} set as active project context`,
          detail,
          route: "/portal/projects",
        });
        appendCommercialLog({
          type: "project-context",
          title: `${selected.id} is now the project spine root`,
          detail,
          route: "/portal/projects",
        });
        return selected;
      },
      advanceProjectStage(projectId, stage, detail) {
        const saved = updateProjectWorkspace((current) =>
          current.map((project) =>
            project.id !== projectId
              ? project
              : {
                  ...project,
                  stage,
                  nextAction: detail || project.nextAction,
                  projectHealth: stage.toLowerCase().includes("closeout")
                    ? "Closeout watch"
                    : stage.toLowerCase().includes("execution")
                      ? "Field active"
                      : "Preconstruction active",
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry(`Stage moved to ${stage}`, detail || `Auricrux moved ${project.id} into ${stage}.`),
                    ...project.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setProjects(saved);
        const updated = saved.find((project) => project.id === projectId);
        if (updated) {
          appendAutomationLog({
            type: "project-stage",
            title: `${updated.id} moved to ${stage}`,
            detail: detail || `Auricrux advanced ${updated.id} to ${stage}.`,
            route: "/portal/projects",
          });
          appendCommercialLog({
            type: "project-stage",
            title: `${updated.id} execution posture advanced`,
            detail: detail || `Auricrux advanced ${updated.id} to ${stage} and preserved cross-lane delivery continuity.`,
            route: "/portal/projects",
          });
        }

        return saved;
      },
      clearPermitBlocker(projectId, detail = "Permit dependency cleared and project routed toward mobilization.") {
        const saved = updateProjectWorkspace((current) =>
          current.map((project) =>
            project.id !== projectId
              ? project
              : {
                  ...project,
                  permitStatus: "Permit cleared for next move",
                  siteStatus: "Ready for mobilization planning",
                  nextAction: detail,
                  continuityAlerts: project.continuityAlerts?.filter((item) => item !== project.permitStatus) || [],
                  lastActionAt: new Date().toISOString(),
                  actionHistory: [
                    stampHistoryEntry("Permit blocker cleared", detail),
                    ...project.actionHistory,
                  ].slice(0, 12),
                }
          )
        );

        setProjects(saved);
        const updated = saved.find((project) => project.id === projectId);
        if (updated) {
          appendAutomationLog({
            type: "project-repair",
            title: `${updated.id} permit blocker cleared`,
            detail,
            route: "/portal/projects",
          });
          appendCommercialLog({
            type: "project-repair",
            title: `${updated.id} mobilization path restored`,
            detail,
            route: "/portal/projects",
          });
        }

        return saved;
      },
    };
  }, [activeProjectId, projects]);
}
