import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchProjectRfis } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalRfis() {
  const { state } = useWorkspaceState();
  const projectId = state?.project?.id || "A-117";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchProjectRfis(projectId)
      .then((rfis) => setItems(rfis || []))
      .catch((err) => setError(err.message || "Unable to load RFIs."))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <PortalShell
      title="RFI Register"
      subtitle="Design-linked requests for information tied to project sheets, markups, and field coordination."
      activeHref="/portal/rfis"
      currentJourney="project"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={`/portal/projects/${encodeURIComponent(projectId)}`}
      primaryLabel="Project home"
    >
      <AuricruxInsightPanel
        title="Auricrux Field Intelligence"
        targetObjectId={projectId}
        nextAction={items.length ? "Review open RFIs and link responses to design markups." : "Create RFIs from Design Workspace markups to keep precon continuity governed."}
        actionHref="/portal/design"
        actionLabel="Open Design Workspace"
        tone="blue"
      />
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
      {loading ? <div style={card}>Loading RFIs…</div> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((rfi) => (
          <div key={rfi.id} style={card}>
            <div style={{ fontWeight: 800 }}>{rfi.number || rfi.id}</div>
            <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{rfi.question}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Project {rfi.projectId} · {rfi.recordStatus || rfi.status || "open"}</div>
          </div>
        ))}
        {!loading && !items.length ? <div style={card}>No RFIs for {projectId} yet.</div> : null}
      </div>
    </PortalShell>
  );
}
