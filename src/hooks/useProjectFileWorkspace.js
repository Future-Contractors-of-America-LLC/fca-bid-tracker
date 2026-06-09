import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { updateProjectWorkspace } from "../projectWorkspaceStore";
import { readProjectFileWorkspace, updateProjectFileWorkspace } from "../projectFileWorkspaceStore";
import { setActiveWorkspaceProject } from "../workspaceStateStore";

function stampNow() {
  return new Date().toISOString();
}

function formatWhen(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return "Now";
  }
}

function buildBriefingInput(projectId, blueprint = {}, fileId, version) {
  const discipline = blueprint.discipline || "General";
  const documentType = blueprint.category || "Document";
  const packageLabel = blueprint.packageLabel || `${discipline} ${documentType} package`;

  return {
    id: `BRF-${Date.now()}`,
    projectId,
    fileId,
    packageLabel,
    summary: `${packageLabel} is now linked to ${projectId} with ${discipline.toLowerCase()} context and ${documentType.toLowerCase()} workflow visibility.`,
    missingItems:
      documentType === "Permit"
        ? ["Final submission approval"]
        : documentType === "Coordination"
          ? ["Open coordination response"]
          : ["Customer acknowledgment"],
    revisionSignals: [`Version ${version}`, blueprint.revisionLabel || "Revision label pending"],
    recommendedNextActions: [
      blueprint.action || `Review ${documentType.toLowerCase()} package`,
      `Route follow-through into /portal/messages and /portal/projects`,
    ],
    createdAt: stampNow(),
  };
}

export default function useProjectFileWorkspace() {
  const [workspace, setWorkspace] = useState(() => readProjectFileWorkspace());

  useEffect(() => {
    setWorkspace(readProjectFileWorkspace());
  }, []);

  return useMemo(
    () => ({
      files: workspace.files,
      briefings: workspace.briefings,
      auditEvents: workspace.auditEvents,
      addFilePackage(projectId, blueprint = {}) {
        const saved = updateProjectFileWorkspace((current) => {
          const nextVersion = current.files.filter((file) => file.projectId === projectId).length + 1;
          const fileId = `FILE-${Date.now()}`;
          const createdAt = stampNow();
          const briefing = buildBriefingInput(projectId, blueprint, fileId, nextVersion);
          const nextFile = {
            id: fileId,
            projectId,
            packageLabel: blueprint.packageLabel || `${blueprint.discipline || "General"} package`,
            name: blueprint.name || `${blueprint.documentType || blueprint.category || "Document"}_${projectId}_v${nextVersion}.pdf`,
            category: blueprint.category || blueprint.documentType || "Document",
            updated: formatWhen(createdAt),
            action: blueprint.action || "Review package",
            discipline: blueprint.discipline || "General",
            status: blueprint.status || "Ready for review",
            owner: blueprint.owner || "Auricrux",
            note: blueprint.note || `${projectId} file package attached with audit continuity.`,
            revisionLabel: blueprint.revisionLabel || `Rev ${nextVersion}`,
            version: nextVersion,
            briefingId: briefing.id,
          };
          const nextAuditEvent = {
            id: `AUD-${Date.now()}`,
            projectId,
            time: formatWhen(createdAt),
            action: `File package added: ${nextFile.name}`,
            detail: `Auricrux attached ${nextFile.category.toLowerCase()} package ${nextFile.name} to ${projectId} and generated a briefing for the next action rail.`,
            discipline: nextFile.discipline,
            createdAt,
          };

          return {
            files: [nextFile, ...current.files].slice(0, 24),
            briefings: [briefing, ...current.briefings].slice(0, 16),
            auditEvents: [nextAuditEvent, ...current.auditEvents].slice(0, 24),
          };
        });

        setWorkspace(saved);

        const latestFile = saved.files[0];
        const latestBriefing = saved.briefings[0];
        updateProjectWorkspace((projects) =>
          projects.map((project) =>
            project.id !== projectId
              ? project
              : {
                  ...project,
                  fileCount: (project.fileCount || 0) + 1,
                  latestBriefingSummary: latestBriefing?.summary || project.latestBriefingSummary,
                  auditSummary: `Latest file action: ${latestFile?.name || "Document package"} attached with audit continuity.`,
                  nextAction: latestBriefing?.recommendedNextActions?.[0] || project.nextAction,
                  lastActionAt: stampNow(),
                  actionHistory: [
                    {
                      at: stampNow(),
                      label: "File package attached",
                      detail: `${latestFile?.name || "Document package"} was attached and routed into the project evidence spine.`,
                    },
                    ...(project.actionHistory || []),
                  ].slice(0, 12),
                }
          )
        );

        setActiveWorkspaceProject(projectId, `File package ${latestFile?.name || "document"} attached to active project spine.`);

        appendAutomationLog({
          type: "project-file-package",
          title: `${projectId} file package attached`,
          detail: `${latestFile?.name || "Document package"} was attached and a document briefing was generated.`,
          route: "/portal/files",
        });
        appendCommercialLog({
          type: "project-file-package",
          title: `${projectId} evidence spine advanced`,
          detail: `${latestFile?.name || "Document package"} now supports customer review, project continuity, and next-action clarity.`,
          route: "/portal/files",
        });

        return saved;
      },
    }),
    [workspace]
  );
}
