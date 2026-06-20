import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchProjectRfis, createProjectRfi } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };

export default function PortalRfis() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProjectRfis(projectId)
      .then((rfis) => setItems(rfis || []))
      .catch((err) => setError(err.message || "Unable to load RFIs."))
      .finally(() => setLoading(false));
  }, [projectId, hasProject]);

  async function handleCreateRfi(event) {
    event.preventDefault();
    if (!question.trim() || !hasProject) return;
    setBusy(true);
    setError("");
    try {
      const created = await createProjectRfi(projectId, { question: question.trim() });
      setItems((current) => [created, ...current]);
      setQuestion("");
    } catch (err) {
      setError(err.message || "Unable to create RFI.");
    } finally {
      setBusy(false);
    }
  }

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
      {!hasProject ? <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to manage RFIs.</div> : null}
      {hasProject ? (
        <form onSubmit={handleCreateRfi} style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Create RFI</div>
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} placeholder="Describe the coordination question…" style={{ width: "100%", borderRadius: 10, border: "1px solid #cbd5e1", padding: 12, boxSizing: "border-box" }} />
          <button type="submit" disabled={busy || !question.trim()} style={{ marginTop: 10, border: "none", borderRadius: 8, padding: "10px 14px", background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {busy ? "Creating…" : "Create RFI"}
          </button>
        </form>
      ) : null}
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
