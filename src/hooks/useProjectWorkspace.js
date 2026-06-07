import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readProjectWorkspace, updateProjectWorkspace } from "../projectWorkspaceStore";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

export default function useProjectWorkspace() {
  const [projects, setProjects] = useState(() => readProjectWorkspace());

  useEffect(() => {
    setProjects(readProjectWorkspace());
  }, []);

  return useMemo(
    () => ({
      projects,
      advanceProjectStage(projectId, stage, detail) {
        const saved = updateProjectWorkspace((current) =>
          current.map((project) =>
            project.id !== projectId
              ? project
              : {
                  ...project,
                  stage,
                  nextAction: detail || project.nextAction,
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
    }),
    [projects]
  );
}
