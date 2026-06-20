import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { advanceChangeOrder, createChangeOrder, fetchChangeOrders } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalChangeOrders() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ title: "", amount: "", reason: "" });

  useEffect(() => {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchChangeOrders(projectId)
      .then((payload) => setItems(payload.items || []))
      .catch((err) => setError(err.message || "Unable to load change orders."))
      .finally(() => setLoading(false));
  }, [projectId, hasProject]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!hasProject || !draft.title.trim()) return;
    setBusy(true);
    setError("");
    try {
      const payload = await createChangeOrder({
        projectId,
        title: draft.title.trim(),
        amount: draft.amount || "$0",
        reason: draft.reason || "Change event recorded",
      });
      setItems((current) => [payload.changeOrder || payload.item || payload, ...current]);
      setDraft({ title: "", amount: "", reason: "" });
    } catch (err) {
      setError(err.message || "Unable to create change order.");
    } finally {
      setBusy(false);
    }
  }

  async function handleAdvance(changeOrderId) {
    setBusy(true);
    setError("");
    try {
      await advanceChangeOrder({ changeOrderId, projectId });
      const payload = await fetchChangeOrders(projectId);
      setItems(payload.items || []);
    } catch (err) {
      setError(err.message || "Unable to advance change order.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Change Orders"
      subtitle="Contract adjustments with SOV, job cost, and billing continuity in FCA Books."
      activeHref="/portal/change-orders"
      currentJourney="project"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Job billing"
    >
      <AuricruxInsightPanel
        title="Auricrux Commercial Intelligence"
        targetObjectId={projectId}
        sourceRoute="/portal/change-orders"
        rationale="Approved change orders should refresh SOV contract value before the next pay application."
        nextAction="Approved change orders should refresh SOV contract value before the next pay application."
        actionHref={hasProject ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}` : "/portal/projects"}
        actionLabel="Open SOV"
        tone="green"
        liveRecommend={hasProject}
      />
      {!hasProject ? <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to manage change orders.</div> : null}
      {hasProject ? (
        <form onSubmit={handleCreate} style={{ ...card, marginBottom: 16, display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 700 }}>Create change order</div>
          <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Title" style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          <input value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount" style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          <textarea value={draft.reason} onChange={(event) => setDraft((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason" rows={2} style={{ padding: 10, borderRadius: 8, border: "1px solid #cbd5e1" }} />
          <button type="submit" disabled={busy || !draft.title.trim()} style={{ justifySelf: "start", border: "none", borderRadius: 8, padding: "10px 14px", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {busy ? "Saving…" : "Create change order"}
          </button>
        </form>
      ) : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
      {loading ? <div style={card}>Loading change orders…</div> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((co) => (
          <div key={co.changeOrderId || co.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <div>
                <strong>{co.title || co.changeOrderId || co.id}</strong>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>{co.status || "Draft"} · Project {co.projectId || projectId}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontWeight: 700 }}>{co.amount || co.total || "—"}</span>
                {co.status === "Draft" ? (
                  <button type="button" disabled={busy} onClick={() => handleAdvance(co.changeOrderId || co.id)} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 12px", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    Advance
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
        {!loading && hasProject && !items.length ? <div style={card}>No change orders recorded for {projectId}.</div> : null}
      </div>
    </PortalShell>
  );
}
