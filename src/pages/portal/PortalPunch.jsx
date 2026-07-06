import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchDesignMarkups, updateDesignMarkup, createDesignMarkup } from "../../api/designWorkspaceClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { compareFieldPhoto, fetchFieldPhotoFeedback } from "../../api/fieldPhotosClient";
import { createCloseoutPackage } from "../../api/constructionClient";
import { sendPortalMessage } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const button = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};
const input = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 9,
  boxSizing: "border-box",
  font: "inherit",
};

const OWNER_VIEW_KEY = "fca_punch_owner_view_tokens_v1";
const HOLDBACK_KEY = "fca_punch_holdback_notices_v1";
const CLOSEOUT_SYNC_KEY = "fca_punch_closeout_sync_v1";
const SELF_PUNCH_KEY = "fca_punch_self_internal_v1";

function readLocalJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best effort only
  }
}

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function dayDiff(from, to) {
  const a = parseDate(from);
  const b = parseDate(to);
  if (!a || !b) return 0;
  return Math.floor((b - a) / 86400000);
}

function readOwnerMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("owner") === "1";
}

function classifyImpact(item) {
  const hay = normalize(`${item.label || ""} ${item.note || ""} ${item.detail || ""}`);
  if (/door.*latch|egress|fire|alarm|life safety|code violation|security/.test(hay)) {
    return { level: "Critical", priority: 1, reason: "Safety/code or security exposure" };
  }
  if (/electrical outlet|panel|water leak|trip|hvac not working|structural/.test(hay)) {
    return { level: "High", priority: 2, reason: "Functional system risk" };
  }
  if (/paint|caulk|touch up|finish|cosmetic/.test(hay)) {
    return { level: "Low", priority: 4, reason: "Cosmetic deficiency" };
  }
  return { level: "Medium", priority: 3, reason: "Quality issue requiring correction" };
}

function matchResponsibleTrade(item, fieldTasks) {
  const issueText = normalize(`${item.label || ""} ${item.note || ""} ${item.zone || ""} ${item.bimObjectId || ""}`);
  let best = null;
  for (const task of fieldTasks || []) {
    const taskText = normalize(`${task.task || ""} ${task.zone || ""} ${task.assignee || ""}`);
    if (!taskText) continue;
    let score = 0;
    if (item.zone && normalize(task.zone).includes(normalize(item.zone))) score += 3;
    if (item.bimObjectId && taskText.includes(normalize(item.bimObjectId))) score += 4;
    if (issueText.split(" ").some((token) => token.length > 4 && taskText.includes(token))) score += 2;
    if (!best || score > best.score) {
      best = { score, trade: task.assignee || task.trade || "Assigned Trade", taskId: task.taskId || task.id || "" };
    }
  }
  return best && best.score > 0 ? best : { score: 0, trade: "Unassigned", taskId: "" };
}

function buildGeoLabel(item) {
  const pin = item.bimCoordinate || item.coordinate || item.pinCoordinate || "";
  const object = item.bimObjectId || item.objectId || "";
  const fileSheet = `${item.fileId || "—"}/${item.sheetId || "—"}`;
  return `Model object ${object || "—"} · Sheet ${fileSheet} · Coord ${pin || "—"}`;
}

function needsHoldback(item) {
  const status = String(item.status || "open").toLowerCase();
  if (status.includes("resolved") || status.includes("verified")) return false;
  const due = parseDate(item.dueDate || item.targetDate || item.updatedAt || item.createdAt);
  if (!due) return false;
  return Date.now() - due > 0;
}

function summarizeProgress(items) {
  const total = items.length;
  const resolved = items.filter((item) => /resolved|verified/i.test(String(item.status || ""))).length;
  const verified = items.filter((item) => /verified/i.test(String(item.status || ""))).length;
  return {
    total,
    resolved,
    verified,
    pct: total ? Math.round((verified / total) * 100) : 0,
  };
}

export async function resolvePunchMarkup(projectId, markupId) {
  return updateDesignMarkup(projectId, { markupId, status: "resolved" });
}

export default function PortalPunch() {
  const { projectId, hasProject } = usePortalProjectId();
  const ownerMode = useMemo(() => readOwnerMode(), []);
  const { files } = useWorkflowEvidence(projectId);

  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [ownerTokens, setOwnerTokens] = useState(() => readLocalJson(OWNER_VIEW_KEY, {}));
  const [holdbacks, setHoldbacks] = useState(() => readLocalJson(HOLDBACK_KEY, []));
  const [syncedCloseout, setSyncedCloseout] = useState(() => readLocalJson(CLOSEOUT_SYNC_KEY, {}));
  const [selfPunchRows, setSelfPunchRows] = useState(() => readLocalJson(SELF_PUNCH_KEY, {}));
  const [selfPunchDraft, setSelfPunchDraft] = useState({ label: "", zone: "", detail: "", fileId: "", sheetId: "", bimObjectId: "", bimCoordinate: "", subcontractor: "" });
  const [verificationDrafts, setVerificationDrafts] = useState({});

  const tasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);

  useEffect(() => {
    writeLocalJson(OWNER_VIEW_KEY, ownerTokens);
  }, [ownerTokens]);

  useEffect(() => {
    writeLocalJson(HOLDBACK_KEY, holdbacks);
  }, [holdbacks]);

  useEffect(() => {
    writeLocalJson(CLOSEOUT_SYNC_KEY, syncedCloseout);
  }, [syncedCloseout]);

  useEffect(() => {
    writeLocalJson(SELF_PUNCH_KEY, selfPunchRows);
  }, [selfPunchRows]);

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
      const punchItems = (Array.isArray(markups) ? markups : markups?.items || []).filter((item) => item.type === "punch");
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

  const fieldTasks = tasksLoad.data?.items || [];
  const mergedSelfPunch = selfPunchRows[projectId] || [];

  const decoratedItems = useMemo(() => {
    return items.map((item) => {
      const impact = classifyImpact(item);
      const routing = matchResponsibleTrade(item, fieldTasks);
      const geo = buildGeoLabel(item);
      return {
        ...item,
        impact,
        routing,
        geo,
      };
    }).sort((a, b) => a.impact.priority - b.impact.priority);
  }, [fieldTasks, items]);

  const allVisibleItems = useMemo(() => {
    const fromMarkup = decoratedItems.map((item) => ({ ...item, source: "official" }));
    const selfRows = mergedSelfPunch.map((row) => ({
      ...row,
      id: row.id,
      status: row.status || "self-open",
      label: row.label,
      source: "self-punch",
      impact: classifyImpact(row),
      routing: { trade: row.subcontractor || "Subcontractor", taskId: "", score: 0 },
      geo: buildGeoLabel(row),
    }));
    return [...fromMarkup, ...selfRows].sort((a, b) => a.impact.priority - b.impact.priority);
  }, [decoratedItems, mergedSelfPunch]);

  const openItems = allVisibleItems.filter((item) => !/resolved|verified/i.test(String(item.status || "")));
  const officialOpen = decoratedItems.filter((item) => !/resolved|verified/i.test(String(item.status || "")));
  const stats = summarizeProgress(allVisibleItems);

  useEffect(() => {
    if (!hasProject || ownerMode) return;
    const overdue = decoratedItems.filter((item) => needsHoldback(item));
    if (!overdue.length) return;

    const existing = new Set(holdbacks.filter((row) => row.projectId === projectId).map((row) => row.markupId));
    const due = overdue.filter((item) => !existing.has(item.id));
    if (!due.length) return;

    const notices = due.map((item) => ({
      id: `hold-${Date.now()}-${item.id}`,
      projectId,
      markupId: item.id,
      trade: item.routing.trade,
      createdAt: new Date().toISOString(),
      message: `Notice of Withheld Payment: retainage hold for ${item.routing.trade} due to open punch ${item.label || item.id}.`,
    }));

    setHoldbacks((current) => [...notices, ...current].slice(0, 400));

    notices.forEach((entry) => {
      sendPortalMessage({
        channel: "email",
        subject: `Withheld payment notice · ${projectId} · ${entry.trade}`,
        message: `${entry.message} Route to /portal/billing and /portal/finance for retainage enforcement.`,
      }).catch(() => null);
    });
  }, [decoratedItems, hasProject, holdbacks, ownerMode, projectId]);

  useEffect(() => {
    if (!hasProject || ownerMode) return;
    const eligible = decoratedItems.filter((item) => /verified/i.test(String(item.status || "")) && !syncedCloseout[item.id]);
    if (!eligible.length) return;

    eligible.forEach(async (item) => {
      try {
        await createCloseoutPackage({
          projectId,
          title: `Punch QA record · ${item.label || item.id}`,
          requiredArtifacts: [
            "Original issue evidence",
            "Repair evidence",
            "AI verification trace",
            "Trade closeout acceptance",
          ],
        });
        setSyncedCloseout((current) => ({ ...current, [item.id]: new Date().toISOString() }));
      } catch {
        // closeout API best effort
      }
    });
  }, [decoratedItems, hasProject, ownerMode, projectId, syncedCloseout]);

  async function routeToTrade(item) {
    const trade = item.routing.trade;
    await sendPortalMessage({
      channel: "teams",
      subject: `Punch assignment · ${projectId} · ${trade}`,
      message: `Assigned punch item ${item.label || item.id} to ${trade}. Impact ${item.impact.level}. Location ${item.geo}.`,
    }).catch(() => null);
    setNotice(`Punch item routed to ${trade}.`);
  }

  async function handleResolve(item) {
    setBusyId(item.id);
    setNotice("");
    setError("");
    try {
      await resolvePunchMarkup(projectId, item.id);
      setNotice(`Punch item "${item.label || item.id}" marked resolved.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to resolve punch item.");
    } finally {
      setBusyId("");
    }
  }

  async function handleVerify(item) {
    const draft = verificationDrafts[item.id] || {};
    if (!draft.beforePhotoId || !draft.afterPhotoId) {
      setError("Before and after photo IDs are required for AI verification.");
      return;
    }

    setBusyId(`verify-${item.id}`);
    setNotice("");
    setError("");
    try {
      await compareFieldPhoto(draft.afterPhotoId, {
        projectId,
        fileId: item.fileId,
        sheetId: item.sheetId,
      });
      const feedback = await fetchFieldPhotoFeedback(draft.afterPhotoId);
      const feedbackText = String(feedback?.feedback || "");
      const accepted = !/reject|redo|failed|mismatch|insufficient/i.test(normalize(feedbackText));

      await updateDesignMarkup(projectId, {
        markupId: item.id,
        status: accepted ? "verified" : "rejected",
        beforePhotoId: draft.beforePhotoId,
        afterPhotoId: draft.afterPhotoId,
        auricruxVerification: feedbackText || (accepted ? "AI validated repair against design intent." : "AI rejected repair; does not match design intent."),
        impactLevel: item.impact.level,
        assignedTrade: item.routing.trade,
      });

      setNotice(accepted
        ? `AI verification passed for ${item.label || item.id}.`
        : `AI verification rejected ${item.label || item.id}; rework required before PM review.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to run AI verification.");
    } finally {
      setBusyId("");
    }
  }

  function addSelfPunch() {
    if (!selfPunchDraft.label.trim() || !selfPunchDraft.subcontractor.trim()) {
      setError("Self-punch requires issue label and subcontractor.");
      return;
    }
    const row = {
      id: `self-${Date.now()}`,
      projectId,
      type: "punch",
      label: selfPunchDraft.label.trim(),
      detail: selfPunchDraft.detail.trim(),
      zone: selfPunchDraft.zone.trim(),
      fileId: selfPunchDraft.fileId.trim(),
      sheetId: selfPunchDraft.sheetId.trim(),
      bimObjectId: selfPunchDraft.bimObjectId.trim(),
      bimCoordinate: selfPunchDraft.bimCoordinate.trim(),
      subcontractor: selfPunchDraft.subcontractor.trim(),
      status: "self-open",
      createdAt: new Date().toISOString(),
    };

    setSelfPunchRows((current) => ({ ...current, [projectId]: [row, ...(current[projectId] || [])].slice(0, 300) }));
    setSelfPunchDraft({ label: "", zone: "", detail: "", fileId: "", sheetId: "", bimObjectId: "", bimCoordinate: "", subcontractor: "" });
    setNotice("Subcontractor self-punch item captured.");
  }

  async function publishSelfPunchToOfficial(row) {
    setBusyId(`self-publish-${row.id}`);
    try {
      await createDesignMarkup(projectId, {
        type: "punch",
        label: row.label,
        detail: row.detail,
        zone: row.zone,
        fileId: row.fileId,
        sheetId: row.sheetId,
        bimObjectId: row.bimObjectId,
        bimCoordinate: row.bimCoordinate,
        subcontractor: row.subcontractor,
        sourceRoute: "/portal/punch",
      });
      setSelfPunchRows((current) => ({
        ...current,
        [projectId]: (current[projectId] || []).map((item) => (item.id === row.id ? { ...item, status: "published-official" } : item)),
      }));
      setNotice("Self-punch promoted to official punch register.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to publish self-punch item.");
    } finally {
      setBusyId("");
    }
  }

  function generateOwnerView() {
    const token = `owner-${Math.random().toString(36).slice(2, 11)}-${Date.now().toString(36)}`;
    setOwnerTokens((current) => ({ ...current, [projectId]: token }));
    setNotice("Owner read-only punch dashboard link generated.");
  }

  const ownerToken = ownerTokens[projectId] || "";
  const ownerHref = hasProject && ownerToken && typeof window !== "undefined"
    ? `${window.location.origin}/portal/punch?projectId=${encodeURIComponent(projectId)}&owner=1&token=${encodeURIComponent(ownerToken)}`
    : "";

  const designHref = hasProject
    ? `/portal/design?projectId=${encodeURIComponent(projectId)}`
    : "/portal/design";

  return (
    <PortalShell
      title={ownerMode ? "Owner Punch Dashboard" : "Punch QA Evidence Archive"}
      subtitle="Punch quality execution and owner acceptance transparency."
      activeHref="/portal/punch"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={designHref}
      primaryLabel="Open Design Workspace"
    >
      {!ownerMode ? (
        <AuricruxInsightPanel
          title="Auricrux Punch Intelligence"
          targetObjectId={projectId}
          sourceRoute="/portal/punch"
          rationale="Punch is complete only when geospatial evidence, AI verification, and trade accountability all pass."
          nextAction="Route high-impact issues first and verify repairs against original evidence before closeout."
          actionHref={designHref}
          actionLabel="Open BIM source"
          tone="amber"
          liveRecommend={hasProject}
        />
      ) : null}

      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to review punch items.</div>
      ) : null}

      {hasProject ? (
        <>
          <div style={{ ...card, marginTop: 12, marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <div><strong>Total items:</strong> {stats.total}</div>
              <div><strong>Open:</strong> {openItems.length}</div>
              <div><strong>Verified:</strong> {stats.verified}</div>
              <div><strong>Owner progress:</strong> {stats.pct}%</div>
            </div>
          </div>

          {!ownerMode ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <a href={designHref} style={{ ...button, textDecoration: "none" }}>Open BIM/design source</a>
              <button type="button" style={button} onClick={reload}>Refresh</button>
              <button type="button" style={button} onClick={generateOwnerView}>Generate owner read-only link</button>
              <a href={`/portal/closeout?projectId=${encodeURIComponent(projectId)}`} style={{ ...button, textDecoration: "none" }}>Open closeout</a>
              <a href={`/portal/billing?projectId=${encodeURIComponent(projectId)}`} style={{ ...button, textDecoration: "none" }}>Open billing</a>
              <a href={`/portal/finance?view=construction&projectId=${encodeURIComponent(projectId)}`} style={{ ...button, textDecoration: "none" }}>Open finance</a>
            </div>
          ) : null}

          {ownerHref && !ownerMode ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#bfdbfe", background: "#eff6ff", color: "#1e3a8a" }}>
              Owner live link: <a href={ownerHref}>{ownerHref}</a>
            </div>
          ) : null}

          {!ownerMode ? (
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Subcontractor self-punching (pre-architect walk)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                <input value={selfPunchDraft.label} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, label: event.target.value }))} placeholder="Issue label" style={input} />
                <input value={selfPunchDraft.subcontractor} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, subcontractor: event.target.value }))} placeholder="Subcontractor" style={input} />
                <input value={selfPunchDraft.zone} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, zone: event.target.value }))} placeholder="Zone" style={input} />
                <input value={selfPunchDraft.fileId} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, fileId: event.target.value }))} placeholder="File ID" style={input} />
                <input value={selfPunchDraft.sheetId} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, sheetId: event.target.value }))} placeholder="Sheet ID" style={input} />
                <input value={selfPunchDraft.bimObjectId} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, bimObjectId: event.target.value }))} placeholder="BIM Object" style={input} />
                <input value={selfPunchDraft.bimCoordinate} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, bimCoordinate: event.target.value }))} placeholder="Model coordinate" style={input} />
              </div>
              <textarea value={selfPunchDraft.detail} onChange={(event) => setSelfPunchDraft((current) => ({ ...current, detail: event.target.value }))} placeholder="Internal deficiency detail" style={{ ...input, minHeight: 80, marginTop: 8 }} />
              <button type="button" style={{ ...button, marginTop: 8 }} onClick={addSelfPunch}>Add self-punch item</button>

              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {mergedSelfPunch.slice(0, 10).map((row) => (
                  <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                    <div style={{ fontWeight: 700 }}>{row.label}</div>
                    <div style={{ color: "#475569", fontSize: 13 }}>{row.subcontractor} · {buildGeoLabel(row)} · {row.status}</div>
                    <button type="button" style={{ ...button, marginTop: 8 }} disabled={busyId === `self-publish-${row.id}` || /published/i.test(String(row.status || ""))} onClick={() => publishSelfPunchToOfficial(row)}>
                      {/published/i.test(String(row.status || "")) ? "Published to official list" : "Promote to official punch"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {notice ? <div style={{ ...card, marginBottom: 12, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4" }}>{notice}</div> : null}
          {error ? <div style={{ ...card, marginBottom: 12, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
          {loading ? <div style={card}>Loading punch items...</div> : null}

          <div style={{ display: "grid", gap: 10 }}>
            {openItems.map((item) => (
              <div key={item.id} style={card}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong>{item.label || item.id}</strong>
                  <span style={{ color: "#64748b", fontSize: 13 }}>{item.status || "open"}</span>
                </div>
                <div style={{ marginTop: 8, color: "#334155", fontSize: 13 }}>
                  <div><strong>Impact:</strong> {item.impact.level} ({item.impact.reason})</div>
                  <div><strong>Route:</strong> {item.routing.trade} {item.routing.taskId ? `(task ${item.routing.taskId})` : ""}</div>
                  <div><strong>BIM/Geo:</strong> {item.geo}</div>
                </div>

                {!ownerMode && item.source !== "self-punch" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 10 }}>
                      <input value={verificationDrafts[item.id]?.beforePhotoId || ""} onChange={(event) => setVerificationDrafts((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), beforePhotoId: event.target.value } }))} placeholder="Before photo ID" style={input} />
                      <input value={verificationDrafts[item.id]?.afterPhotoId || ""} onChange={(event) => setVerificationDrafts((current) => ({ ...current, [item.id]: { ...(current[item.id] || {}), afterPhotoId: event.target.value } }))} placeholder="After photo ID" style={input} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                      <button type="button" style={button} onClick={() => routeToTrade(item)}>Route to trade</button>
                      <button type="button" style={button} disabled={busyId === item.id} onClick={() => handleResolve(item)}>
                        {busyId === item.id ? "Updating..." : "Mark resolved"}
                      </button>
                      <button type="button" style={button} disabled={busyId === `verify-${item.id}`} onClick={() => handleVerify(item)}>
                        {busyId === `verify-${item.id}` ? "Verifying..." : "AI verify before/after"}
                      </button>
                      <a href={`/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(item.fileId || "")}&sheetId=${encodeURIComponent(item.sheetId || "")}`} style={{ ...button, textDecoration: "none" }}>
                        Open model pin
                      </a>
                    </div>
                  </>
                ) : null}
              </div>
            ))}

            {!loading && hasProject && !openItems.length ? (
              <div style={card}>No open punch items for {projectId}. Quality archive is clear for final acceptance.</div>
            ) : null}
          </div>

          {!ownerMode && holdbacks.filter((row) => row.projectId === projectId).length ? (
            <div style={{ ...card, marginTop: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Financial holdback notices (retainage enforcement)</div>
              {holdbacks.filter((row) => row.projectId === projectId).slice(0, 8).map((row) => (
                <div key={row.id} style={{ marginBottom: 6 }}>{row.createdAt.slice(0, 10)} · {row.trade} · {row.message}</div>
              ))}
            </div>
          ) : null}

          {ownerMode ? (
            <div style={{ ...card, marginTop: 12, borderColor: "#bfdbfe", background: "#eff6ff", color: "#1e3a8a" }}>
              Owner read-only mode is active. This dashboard auto-refreshes from project punch status for transparency and acceptance tracking.
            </div>
          ) : null}
        </>
      ) : null}
    </PortalShell>
  );
}
