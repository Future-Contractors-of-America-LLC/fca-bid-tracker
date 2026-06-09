import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readFileWorkspace, updateFileWorkspace } from "../fileWorkspaceStore";

function stampFileTime() {
  return new Date().toLocaleString();
}

export default function useFileWorkspace() {
  const [files, setFiles] = useState(() => readFileWorkspace());

  useEffect(() => {
    setFiles(readFileWorkspace());
  }, []);

  return useMemo(
    () => ({
      files,
      getFilesForProject(projectId) {
        return files.filter((file) => file.projectId === projectId);
      },
      attachEvidence(project) {
        const attachmentName = `${String(project.id).replace(/[^A-Za-z0-9]/g, "_")}_evidence_brief.txt`;
        const detail = `Auricrux attached ${attachmentName} to ${project.canonicalProjectId} so bid, project, and file continuity stay on one audit spine.`;

        const saved = updateFileWorkspace((current) => [
          {
            id: `FILE-${String(project.id).replace(/[^A-Za-z0-9]/g, "")}-AUTO-${current.length + 1}`,
            projectId: project.id,
            canonicalProjectId: project.canonicalProjectId,
            name: attachmentName,
            category: "Evidence",
            updated: stampFileTime(),
            action: "Review Auricrux brief",
            discipline: "Document Control",
            status: "Evidence attached",
            owner: "Auricrux",
            note: `Auto-generated evidence attachment for ${project.customer}.`,
            version: "v1",
            evidenceLinkType: "auricrux-evidence-brief",
            auditStatus: "Auto-linked",
            briefingStatus: "Briefing ready",
          },
          ...current,
        ]);

        setFiles(saved);
        appendAutomationLog({
          type: "file-attachment",
          title: `${project.canonicalProjectId} evidence attached`,
          detail,
          route: "/portal/files",
        });
        appendCommercialLog({
          type: "file-attachment",
          title: `${project.canonicalProjectId} file spine advanced`,
          detail,
          route: "/portal/files",
        });

        return saved;
      },
      generateBriefing(project) {
        const detail = `Auricrux generated a document briefing for ${project.canonicalProjectId}, summarizing linked files, next action, and evidence posture.`;

        const saved = updateFileWorkspace((current) =>
          current.map((file) =>
            file.projectId !== project.id
              ? file
              : {
                  ...file,
                  updated: stampFileTime(),
                  briefingStatus: `Briefed for ${project.nextAction}`,
                  auditStatus: "Briefing logged",
                }
          )
        );

        setFiles(saved);
        appendAutomationLog({
          type: "file-briefing",
          title: `${project.canonicalProjectId} document briefing refreshed`,
          detail,
          route: "/portal/files",
        });
        appendCommercialLog({
          type: "file-briefing",
          title: `${project.canonicalProjectId} evidence summary refreshed`,
          detail,
          route: "/portal/files",
        });

        return saved;
      },
    }),
    [files]
  );
}
