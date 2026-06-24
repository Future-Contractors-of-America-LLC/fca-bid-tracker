import { useCallback, useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchDesignMarkups, updateDesignMarkup } from "../../api/designWorkspaceClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const button = {
  background: "#1d4ed8",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

export async function resolvePunchMarkup(projectId, markupId) {
  return updateDesignMarkup(projectId, { markupId, status: "resolved" });
}

export default function PortalPunch() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  const reload = useCallback(async () => {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const markups = await fetchDesignMarkups(projectId);
      const punchItems = (Array.isArray(markups) ? markups : markups?.items || []).filter(
        (item) => item.type === "punch",
      );
      setItems(punchItems);
    } catch (err) {
      setError(err.message || "Unable to load punch items.");
    } finally {
      setLoading(false);
    }
  }, [hasProject, projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function handleResolve(markup) {
    setBusyId(markup.id);
    setNotice("");
    setError("");
    try {
      await resolvePunchMarkup(projectId, markup.id);
      setNotice(`Punch item "${markup.label || markup.id}" marked resolved.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to resolve punch item.");
    } finally {
      setBusyId("");
    }
  }

  const openItems = items.filter((item) => item.status !== "resolved");
  const designHref = hasProject
    ? `/portal/design?projectId=${encodeURIComponent(projectId)}`
    : "/portal/design";

  return (
    <PortalShell
      title="Punch List"
      subtitle="Open punch items from the design workspace, linked to RFIs and closeout evidence."
      activeHref="/portal/punch"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={designHref}
      primaryLabel="Open Design Workspace"
    >
      <AuricruxInsightPanel
        title="Auricrux QC Intelligence"
        targetObjectId={projectId}
        sourceRoute="/portal/punch"
        rationale="Punch items should be resolved before closeout turnover and warranty activation."
        nextAction="Create punch markups in Design Workspace, then resolve them here or link to RFIs."
        actionHref={designHref}
        actionLabel="Add punch markup"
        tone="amber"
        liveRecommend={hasProject}
      />

      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to review punch items.</div>
      ) : null}

      {hasProject ? (
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <a href={designHref} style={{ ...button, textDecoration: "none" }}>Open Design Workspace</a>
          <button type="button" style={{ ...button, background: "#e2e8f0", color: "#0f172a" }} onClick={reload}>Refresh</button>
        </div>
      ) : null}

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4", marginBottom: 16 }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2", marginBottom: 16 }}>{error}</div> : null}
      {loading ? <div style={card}>Loading punch items…</div> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {openItems.map((item) => (
          <div key={item.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{item.label || item.id}</strong>
              <span style={{ color: "#64748b", fontSize: 13 }}>{item.status || "open"}</span>
            </div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
              Sheet {item.sheetId || "—"} · Layer {item.layerId || "punch"}
            </div>
            <button
              type="button"
              style={{ ...button, marginTop: 12 }}
              disabled={busyId === item.id}
              onClick={() => handleResolve(item)}
            >
              {busyId === item.id ? "Updating…" : "Mark resolved"}
            </button>
          </div>
        ))}
        {!loading && hasProject && !openItems.length ? (
          <div style={card}>No open punch items for {projectId}. Add punch markups in Design Workspace.</div>
        ) : null}
      </div>
    </PortalShell>
  );
}
