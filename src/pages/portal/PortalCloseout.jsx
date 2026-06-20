import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { advanceCloseoutPackage, createCloseoutPackage, fetchCloseoutPackages } from "../../api/constructionClient";
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

export default function PortalCloseout() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  async function reload() {
    setLoading(true);
    setError("");
    try {
      const payload = await fetchCloseoutPackages(projectId);
      setItems(payload.items || []);
    } catch (err) {
      setError(err.message || "Unable to load closeout packages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [projectId]);

  async function handleCreate() {
    setNotice("");
    setError("");
    try {
      await createCloseoutPackage({
        projectId,
        title: `Closeout binder for ${projectId}`,
        requiredArtifacts: ["O&M Manuals", "As-Builts", "Warranty Matrix", "Punch Completion Letter"],
      });
      setNotice("Closeout package created.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to create closeout package.");
    }
  }

  async function handleAdvance(pkg) {
    const required = pkg.requiredArtifacts || [];
    const completed = pkg.completedArtifacts || [];
    const nextArtifact = required.find((artifact) => !completed.includes(artifact));
    if (!nextArtifact) {
      setNotice("All required artifacts are already marked complete.");
      return;
    }
    setBusyId(pkg.closeoutPackageId);
    setNotice("");
    setError("");
    try {
      await advanceCloseoutPackage({
        closeoutPackageId: pkg.closeoutPackageId,
        completedArtifacts: [...completed, nextArtifact],
        status: completed.length + 1 >= required.length - 1 ? "ready_for_turnover" : "in_progress",
        nextAction: nextArtifact === required[required.length - 1]
          ? "Schedule turnover walkthrough."
          : `Collect ${required.find((artifact) => ![...completed, nextArtifact].includes(artifact)) || "remaining artifacts"}.`,
      });
      setNotice(`Marked "${nextArtifact}" complete.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to advance closeout package.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <PortalShell
      title="Closeout Packages"
      subtitle="Turnover binders, artifact tracking, and warranty handoff for active projects."
      activeHref="/portal/closeout"
      currentJourney="project"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={`/portal/projects/${encodeURIComponent(projectId)}`}
      primaryLabel="Project detail"
    >
      <AuricruxInsightPanel
        title="Auricrux Closeout Intelligence"
        targetObjectId={projectId}
        nextAction="Closeout artifacts should be complete before final retainage release and warranty activation."
        actionHref="/portal/warranty"
        actionLabel="Open warranty"
        tone="blue"
      />

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button type="button" style={button} onClick={handleCreate}>Create closeout package</button>
        <button type="button" style={{ ...button, background: "#e2e8f0", color: "#0f172a" }} onClick={reload}>Refresh</button>
      </div>

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4" }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
      {loading ? <div style={card}>Loading closeout packages…</div> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((pkg) => {
          const required = pkg.requiredArtifacts || [];
          const completed = pkg.completedArtifacts || [];
          return (
            <div key={pkg.closeoutPackageId} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <strong>{pkg.title || pkg.closeoutPackageId}</strong>
                <span style={{ color: "#64748b", fontSize: 13 }}>{pkg.status || "draft"}</span>
              </div>
              <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
                Project {pkg.projectId || projectId} · {completed.length}/{required.length} artifacts complete
              </div>
              <div style={{ marginTop: 12, display: "grid", gap: 6 }}>
                {required.map((artifact) => (
                  <div key={artifact} style={{ fontSize: 14, color: completed.includes(artifact) ? "#166534" : "#475569" }}>
                    {completed.includes(artifact) ? "✓" : "○"} {artifact}
                  </div>
                ))}
              </div>
              <div style={{ color: "#334155", marginTop: 12 }}>{pkg.nextAction || "Advance artifact collection."}</div>
              <button
                type="button"
                style={{ ...button, marginTop: 12 }}
                disabled={busyId === pkg.closeoutPackageId}
                onClick={() => handleAdvance(pkg)}
              >
                {busyId === pkg.closeoutPackageId ? "Updating…" : "Mark next artifact complete"}
              </button>
            </div>
          );
        })}
        {!loading && !items.length ? <div style={card}>No closeout packages for {projectId} yet.</div> : null}
      </div>
    </PortalShell>
  );
}
