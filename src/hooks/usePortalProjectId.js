import useProjectWorkspace from "./useProjectWorkspace";
import useWorkspaceState from "./useWorkspaceState";

export default function usePortalProjectId(deepLinkProjectId = "") {
  const { activeProject } = useProjectWorkspace();
  const { state } = useWorkspaceState();
  const projectId = deepLinkProjectId || activeProject?.id || state?.project?.id || "";
  return {
    projectId,
    hasProject: Boolean(projectId),
    activeProject,
  };
}
