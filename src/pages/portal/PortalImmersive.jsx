import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import { fetchImmersiveCatalog } from "../../api/immersiveClient";
import useImmersiveNextActions from "../../hooks/useImmersiveNextActions";
import AuricruxImmersiveHint from "../../components/immersive/AuricruxImmersiveHint";
import ImmersiveEcosystemHub from "../../components/immersive/ImmersiveEcosystemHub";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

function readProjectId() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("projectId") || "";
}

export default function PortalImmersive() {
  const { activeProject } = useProjectWorkspace();
  const { session } = useCustomerSession();
  const immersiveActions = useImmersiveNextActions();
  const projectId = readProjectId() || activeProject?.id || "";
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchImmersiveCatalog({
      projectId: projectId || undefined,
      userId: session?.email || session?.customerId,
    })
      .then(setCatalog)
      .catch((loadError) => setError(loadError.message || "Unable to load immersive catalog."));
  }, [projectId, session?.email, session?.customerId]);

  const experiences = catalog?.experiences || [];
  const sessions = catalog?.sessions || [];

  return (
    <PortalShell
      title="Immersive Experiences"
      subtitle="FCA-native 3D, simulations, and field overlays — no third-party runtime."
      activeHref="/portal/immersive"
      journey="delivery"
      routeOverlay={routeStateOverlays.immersive}
      auricruxSurfaceKey="immersive"
    >
      <div style={{ display: "grid", gap: 16 }}>
        {error ? <div style={{ ...cardStyle, border: "1px solid #fecaca", color: "#991b1b" }}>{error}</div> : null}

        <AuricruxImmersiveHint actions={immersiveActions.items} />

        <ImmersiveEcosystemHub projectId={projectId} immersiveActions={immersiveActions.items} />

        <div style={cardStyle}>
          <strong style={{ color: "#0f172a" }}>FCA experience catalog</strong>
          <p style={{ color: "#64748b", lineHeight: 1.65 }}>
            Every experience runs on FCA infrastructure. Open-source rendering libraries are bundled in the product — nothing calls external viewer platforms.
          </p>
          <div style={{ display: "grid", gap: 12 }}>
            {experiences.map((item) => (
              <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14 }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{item.description}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
                  Surface: {item.surface} · Engine: {item.engine}
                </div>
                {item.programKey ? (
                  <a
                    href={`/academy/programs/${item.programKey}/modules/${item.moduleNumber}`}
                    style={{ display: "inline-block", marginTop: 10, color: "#2563eb", fontWeight: 700 }}
                  >
                    Open in Academy
                  </a>
                ) : null}
                {item.surface === "design" ? (
                  <a href="/portal/design" style={{ display: "inline-block", marginTop: 10, marginLeft: 12, color: "#2563eb", fontWeight: 700 }}>
                    Open Design Workspace
                  </a>
                ) : null}
                {item.surface === "field" ? (
                  <a
                    href={`/portal/field-supervision${projectId ? `?projectId=${encodeURIComponent(projectId)}` : ""}`}
                    style={{ display: "inline-block", marginTop: 10, marginLeft: 12, color: "#2563eb", fontWeight: 700 }}
                  >
                    Open Field Supervision
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <strong style={{ color: "#0f172a" }}>Recent sessions</strong>
          {!sessions.length ? (
            <p style={{ color: "#64748b" }}>No immersive sessions recorded yet.</p>
          ) : (
            <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 1.8 }}>
              {sessions.slice(0, 8).map((item) => (
                <li key={item.id}>
                  {item.experienceTitle || item.experienceId} — {item.status}
                  {item.score !== null && item.score !== undefined ? ` (${item.score}%)` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
