import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchProjectRfis, createProjectRfi, respondProjectRfi } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  padding: 12,
  boxSizing: "border-box",
  font: "inherit",
};

export default function PortalRfis() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [responseDrafts, setResponseDrafts] = useState({});

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
    setNotice("");
    try {
      const created = await createProjectRfi(projectId, { question: question.trim() });
      setItems((current) => [created, ...current]);
      setQuestion("");
      setNotice("RFI created.");
    } catch (err) {
      setError(err.message || "Unable to create RFI.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRespond(rfi) {
    const response = (responseDrafts[rfi.id] || "").trim();
    if (!response) {
      setError("Enter a response before saving.");
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const updated = await respondProjectRfi(projectId, rfi.id, response);
      setItems((current) => current.map((item) => (item.id === rfi.id ? { ...item, ...updated } : item)));
      setNotice(`Response saved for ${rfi.number || rfi.id}.`);
    } catch (err) {
      setError(err.message || "Unable to save RFI response.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="RFI Register"
      subtitle="RFIs linked to sheets, markups, and field coordination."
      activeHref="/portal/rfis"
      currentJourney="job"
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
          <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={3} placeholder="Describe the coordination question…" style={inputStyle} />
          <button type="submit" disabled={busy || !question.trim()} style={{ marginTop: 10, border: "none", borderRadius: 8, padding: "10px 14px", background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {busy ? "Saving…" : "Create RFI"}
          </button>
        </form>
      ) : null}
      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4", marginBottom: 12 }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2", marginBottom: 12 }}>{error}</div> : null}
      {loading ? <div style={card}>Loading RFIs…</div> : null}
      <div style={{ display: "grid", gap: 12 }}>
        {items.map((rfi) => {
          const answered = rfi.recordStatus === "answered" || rfi.status === "answered" || Boolean(rfi.response);
          return (
            <div key={rfi.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{rfi.number || rfi.id}</div>
                <span style={{ color: answered ? "#166534" : "#b45309", fontWeight: 700, fontSize: 13 }}>{answered ? "Answered" : "Open"}</span>
              </div>
              <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{rfi.question}</div>
              {rfi.response ? (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", lineHeight: 1.6 }}>
                  <strong>Response:</strong> {rfi.response}
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Official response</label>
                  <textarea
                    rows={2}
                    value={responseDrafts[rfi.id] || ""}
                    onChange={(event) => setResponseDrafts((current) => ({ ...current, [rfi.id]: event.target.value }))}
                    placeholder="Document the answer for the project record…"
                    style={{ ...inputStyle, marginTop: 6 }}
                  />
                  <button type="button" onClick={() => handleRespond(rfi)} disabled={busy} style={{ marginTop: 8, border: "none", borderRadius: 8, padding: "8px 12px", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                    Save response
                  </button>
                </div>
              )}
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Project {rfi.projectId} · {rfi.recordStatus || rfi.status || "open"}</div>
            </div>
          );
        })}
        {!loading && !items.length && hasProject ? <div style={card}>No RFIs for {projectId} yet.</div> : null}
      </div>
    </PortalShell>
  );
}
