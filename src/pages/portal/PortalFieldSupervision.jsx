import { useMemo } from "react";
import PortalShell from "../../components/PortalShell";
import FieldPhotoOverlayPanel from "../../components/immersive/FieldPhotoOverlayPanel";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import {
  completeFieldTask,
  createFieldTask,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
};

function readProjectId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("projectId") || "";
}

export default function PortalFieldSupervision() {
  const { activeProject } = useProjectWorkspace();
  const { session } = useCustomerSession();
  const projectId = readProjectId() || activeProject?.id || "";
  const { files } = useWorkflowEvidence(projectId);
  const planFiles = useMemo(
    () => files.filter((file) => ["pdf", "dwg", "svg"].includes((file.format || "").toLowerCase())),
    [files],
  );

  return (
    <PortalShell
      title="Field Supervision"
      subtitle="Superintendent checklists, FCA field overlays, and daily production reviews."
      activeHref="/portal/field-supervision"
      journey="delivery"
      routeOverlay={routeStateOverlays.fieldSupervision || routeStateOverlays.immersive}
    >
      <div style={{ display: "grid", gap: 16 }}>
        <FieldPhotoOverlayPanel
          projectId={projectId}
          planFiles={planFiles}
          author={session?.email || session?.customerId || "portal-user"}
        />

        <div style={cardStyle}>
          <strong>Supervision logs</strong>
          <p style={{ color: "#64748b", lineHeight: 1.65 }}>
            Field task logging continues through the governed field spine. Use Field Tasks for detailed assignment tracking.
          </p>
          <a href={`/portal/field-tasks${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`} style={{ color: "#2563eb", fontWeight: 700 }}>
            Open field tasks
          </a>
        </div>
      </div>
    </PortalShell>
  );
}

export { completeFieldTask, createFieldTask, fetchFieldTasks };
