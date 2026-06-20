import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchChangeOrders } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalChangeOrders() {
  const { state } = useWorkspaceState();
  const projectId = state?.project?.id || "A-117";
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchChangeOrders(projectId)
      .then((payload) => setItems(payload.items || []))
      .catch((err) => setError(err.message || "Unable to load change orders."))
      .finally(() => setLoading(false));
  }, [projectId]);

  return (
    <PortalShell
      title="Change Orders"
      subtitle="Contract adjustments with SOV, job cost, and billing continuity in FCA Books."
      activeHref="/portal/change-orders"
      currentJourney="project"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`}
      primaryLabel="Job billing"
    >
      <AuricruxInsightPanel
        title="Auricrux Commercial Intelligence"
        targetObjectId={projectId}
        nextAction="Approved change orders should refresh SOV contract value before the next pay application."
        actionHref={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`}
        actionLabel="Open SOV"
        tone="green"
      />
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
      {loading ? <div style={card}>Loading change orders…</div> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((co) => (
          <div key={co.changeOrderId || co.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <strong>{co.title || co.changeOrderId || co.id}</strong>
              <span style={{ fontWeight: 700 }}>{co.amount || co.total || "—"}</span>
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>{co.status || "Draft"} · Project {co.projectId || projectId}</div>
          </div>
        ))}
        {!loading && !items.length ? <div style={card}>No change orders recorded for {projectId}.</div> : null}
      </div>
    </PortalShell>
  );
}
