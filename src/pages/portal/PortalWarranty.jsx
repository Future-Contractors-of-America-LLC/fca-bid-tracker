import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { advanceWarrantyCase, createWarrantyCase, fetchWarrantyCases } from "../../api/constructionClient";
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
const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 12,
  boxSizing: "border-box",
};

export default function PortalWarranty() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [draft, setDraft] = useState({ title: "", description: "", severity: "standard" });

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchWarrantyCases(projectId);
      setItems(payload.items || []);
    } catch (err) {
      setError(err.message || "Unable to load warranty cases.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [projectId]);

  async function handleCreate(event) {
    event.preventDefault();
    if (!draft.title.trim()) return;
    setNotice("");
    setError("");
    try {
      await createWarrantyCase({
        projectId,
        title: draft.title.trim(),
        description: draft.description.trim() || "Warranty issue logged from portal.",
        severity: draft.severity,
      });
      setDraft({ title: "", description: "", severity: "standard" });
      setNotice("Warranty case created.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to create warranty case.");
    }
  }

  async function handleAdvance(warrantyCase) {
    setBusyId(warrantyCase.warrantyCaseId);
    setNotice("");
    setError("");
    try {
      await advanceWarrantyCase({
        warrantyCaseId: warrantyCase.warrantyCaseId,
        status: warrantyCase.status === "open" ? "in_progress" : "resolved",
        nextAction: warrantyCase.status === "open" ? "Dispatch service crew." : "Close case and archive turnover notes.",
      });
      setNotice(`Warranty case ${warrantyCase.warrantyCaseId} advanced.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to advance warranty case.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <PortalShell
      title="Warranty & Service Continuity"
      subtitle="Live warranty cases tied to closeout artifacts, support, and project context."
      activeHref="/portal/warranty"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={`/portal/closeout`}
      primaryLabel="Closeout packages"
    >
      <AuricruxInsightPanel
        title="Auricrux Warranty Intelligence"
        targetObjectId={projectId}
        nextAction="Resolve warranty cases only after closeout artifacts are complete and turnover walkthrough is scheduled."
        actionHref="/portal/closeout"
        actionLabel="Review closeout"
        tone="blue"
      />

      <form onSubmit={handleCreate} style={{ ...card, marginBottom: 16 }}>
        <h2 style={{ marginTop: 0, fontSize: 18 }}>Log warranty case</h2>
        <label style={{ fontWeight: 600, fontSize: 14 }}>Title</label>
        <input style={input} value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Lobby finish touch-up" />
        <label style={{ fontWeight: 600, fontSize: 14 }}>Description</label>
        <input style={input} value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="Customer-reported issue details" />
        <label style={{ fontWeight: 600, fontSize: 14 }}>Severity</label>
        <select style={input} value={draft.severity} onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}>
          <option value="standard">Standard</option>
          <option value="urgent">Urgent</option>
        </select>
        <button type="submit" style={button}>Create case</button>
      </form>

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4" }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
      {loading ? <div style={card}>Loading warranty cases…</div> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((item) => (
          <div key={item.warrantyCaseId} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <strong>{item.title || item.warrantyCaseId}</strong>
              <span style={{ color: "#64748b", fontSize: 13 }}>{item.status || "open"} · {item.severity || "standard"}</span>
            </div>
            <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{item.description}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>Project {item.projectId || projectId}</div>
            {item.status !== "resolved" ? (
              <button type="button" style={{ ...button, marginTop: 12 }} disabled={busyId === item.warrantyCaseId} onClick={() => handleAdvance(item)}>
                {busyId === item.warrantyCaseId ? "Updating…" : item.status === "open" ? "Start service" : "Resolve case"}
              </button>
            ) : null}
          </div>
        ))}
        {!loading && !items.length ? <div style={card}>No warranty cases for {projectId} yet.</div> : null}
      </div>
    </PortalShell>
  );
}
