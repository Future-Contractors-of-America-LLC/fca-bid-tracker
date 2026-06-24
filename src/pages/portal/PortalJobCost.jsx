import { useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useJobCost from "../../hooks/useJobCost";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { postJobCostActual } from "../../api/constructionClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const input = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #cbd5e1",
  marginTop: 6,
  marginBottom: 12,
  boxSizing: "border-box",
};
const button = {
  background: "#166534",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "10px 14px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function PortalJobCost() {
  const { projectId, hasProject } = usePortalProjectId();
  const jobCost = useJobCost(hasProject ? projectId : "");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({ amount: "", costCode: "FIELD-LABOR", description: "" });

  async function handlePostActual(event) {
    event.preventDefault();
    if (!hasProject || !draft.amount.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await postJobCostActual({
        projectId,
        amount: draft.amount.trim(),
        costCode: draft.costCode.trim() || "FIELD-LABOR",
        description: draft.description.trim() || "Job cost actual posted from portal.",
        sourceType: "portal_job_cost",
        sourceRoute: "/portal/job-cost",
      });
      setDraft({ amount: "", costCode: "FIELD-LABOR", description: "" });
      setNotice("Job cost actual posted.");
      await jobCost.refresh();
    } catch (err) {
      setError(err.message || "Unable to post job cost actual.");
    } finally {
      setBusy(false);
    }
  }

  const rollup = jobCost.rollup;
  const financeHref = hasProject
    ? `/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`
    : "/portal/finance";

  return (
    <PortalShell
      title="Job Cost"
      subtitle="Contract value, committed cost, actuals, and margin forecast for active projects."
      activeHref="/portal/job-cost"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={financeHref}
      primaryLabel="Open job billing"
    >
      <AuricruxInsightPanel
        title="Auricrux Job Cost Intelligence"
        targetObjectId={projectId}
        sourceRoute="/portal/job-cost"
        rationale="Field task completions and manual actuals should keep margin forecast current before pay applications."
        nextAction="Review SOV and pay app readiness after posting field or material actuals."
        actionHref={financeHref}
        actionLabel="Open SOV"
        tone="green"
        liveRecommend={hasProject}
      />

      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to review job cost.</div>
      ) : null}

      {hasProject ? (
        <>
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Cost rollup — {projectId}</div>
            {jobCost.loading ? <div style={{ color: "#64748b" }}>Loading job cost…</div> : null}
            {jobCost.error ? <div style={{ color: "#991b1b" }}>{jobCost.error}</div> : null}
            <div style={{ color: "#475569", lineHeight: 1.9 }}>
              <div>Contract: <strong>{rollup?.contractValue || "—"}</strong></div>
              <div>Actual cost: <strong>{rollup?.actualCost || "—"}</strong></div>
              <div>Committed: <strong>{rollup?.committedCost || "—"}</strong></div>
              <div>Margin forecast: <strong>{rollup?.grossMarginForecast || "—"}</strong></div>
            </div>
          </div>

          <form onSubmit={handlePostActual} style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Post cost actual</div>
            <label>
              Amount
              <input
                value={draft.amount}
                onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))}
                placeholder="1250 or $1,250"
                style={input}
                required
              />
            </label>
            <label>
              Cost code
              <input
                value={draft.costCode}
                onChange={(event) => setDraft((current) => ({ ...current, costCode: event.target.value }))}
                placeholder="FIELD-LABOR"
                style={input}
              />
            </label>
            <label>
              Description
              <input
                value={draft.description}
                onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                placeholder="Material delivery, labor, equipment"
                style={input}
              />
            </label>
            <button type="submit" disabled={busy || !draft.amount.trim()} style={button}>
              {busy ? "Posting…" : "Post actual"}
            </button>
          </form>
        </>
      ) : null}

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4" }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
    </PortalShell>
  );
}
