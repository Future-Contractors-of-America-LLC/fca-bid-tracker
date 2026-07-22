import { useEffect, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import { fetchProjectRfis, createProjectRfi, respondProjectRfi } from "../../api/constructionClient";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalInputStyle, portalTokens } from "../../portalDesignTokens";

export default function PortalRfis() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [responseDrafts, setResponseDrafts] = useState({});

  async function reload() {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const rfis = await fetchProjectRfis(projectId);
      setItems(rfis || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load RFIs.");
      // Keep existing items so a create/respond success is not wiped by a flaky refetch.
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [projectId, hasProject]);

  async function handleCreateRfi(event) {
    event.preventDefault();
    if (!question.trim() || !hasProject) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const created = await createProjectRfi(projectId, { question: question.trim() });
      setItems((current) => [created, ...current.filter(Boolean)]);
      setQuestion("");
      setNotice("RFI created on the live project.");
      await reload();
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
      await respondProjectRfi(projectId, rfi.id, response);
      setNotice(`Response saved for ${rfi.number || rfi.id}.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to save RFI response.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="RFIs"
      subtitle={hasProject ? `Field questions for ${projectId}.` : "Bind a project to manage RFIs."}
      activeHref="/portal/rfis"
    >
      {!hasProject ? (
        <div style={portalCardStyle}>
          No active project. Bind <a href="/portal/proof">PRJ-BID-1 on Proof</a> or pick one in <a href="/portal/projects">Projects</a>.
        </div>
      ) : null}

      {hasProject ? (
        <form onSubmit={handleCreateRfi} style={{ ...portalCardStyle, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 8, color: portalTokens.ink }}>Create RFI</div>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            placeholder="Describe the coordination question…"
            style={portalInputStyle}
          />
          <button
            type="submit"
            disabled={busy || !question.trim()}
            style={{ ...portalButtonPrimary, marginTop: 10, border: "none", opacity: busy ? 0.7 : 1 }}
          >
            {busy ? "Saving…" : "Create RFI"}
          </button>
        </form>
      ) : null}

      {notice ? (
        <div style={{ ...portalCardStyle, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4", marginBottom: 12 }}>{notice}</div>
      ) : null}
      {error ? (
        <div style={{ ...portalCardStyle, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2", marginBottom: 12 }}>{error}</div>
      ) : null}
      {loading ? <div style={portalCardStyle}>Loading RFIs…</div> : null}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((rfi) => {
          const answered = rfi.recordStatus === "answered" || rfi.status === "answered" || Boolean(rfi.response);
          return (
            <div key={rfi.id || rfi.number} style={portalCardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{rfi.number || rfi.id}</div>
                <span style={{ color: answered ? "#166534" : "#b45309", fontWeight: 700, fontSize: 13 }}>
                  {answered ? "Answered" : "Open"}
                </span>
              </div>
              <div style={{ color: portalTokens.body, marginTop: 8, lineHeight: 1.7 }}>{rfi.question}</div>
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
                    placeholder="Document the answer…"
                    style={{ ...portalInputStyle, marginTop: 6 }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRespond(rfi)}
                    disabled={busy}
                    style={{ ...portalButtonSecondary, marginTop: 8, cursor: "pointer" }}
                  >
                    Save response
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {!loading && !items.length && hasProject && !error ? (
          <div style={portalCardStyle}>No RFIs for {projectId} yet. Create the first one above.</div>
        ) : null}
      </div>
    </PortalShell>
  );
}
