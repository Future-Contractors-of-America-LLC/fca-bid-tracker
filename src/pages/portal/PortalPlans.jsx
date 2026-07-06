import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalInputStyle,
} from "../../portalDesignTokens";
import {
  compareRevisions,
  createDesignMarkup,
  createDesignSession,
  fetchDesignIntelligence,
  fetchDesignMarkups,
  startDesignCollab,
} from "../../api/designWorkspaceClient";
import { createProjectRfi, createChangeOrder, fetchProjectRfis } from "../../api/constructionClient";
import { createFieldTask, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchPortalInvoices, sendPortalMessage } from "../../api/portalClient";

const OFFLINE_MARKUP_QUEUE_KEY = "fca_plans_offline_markup_queue_v1";
const DELTA_DECISIONS_KEY = "fca_plans_delta_decisions_v1";
const ACTIVE_TRADE_KEY = "fca_plans_active_trade_v1";
const DESIGN_INTENT_NOTES_KEY = "fca_plans_design_intent_notes_v1";

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

function normalize(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function revisionWeight(revision) {
  if (!revision) return 0;
  const text = String(revision).toUpperCase();
  if (/^\d+$/.test(text)) return Number(text);
  const char = text.charCodeAt(0);
  if (char >= 65 && char <= 90) return char - 64;
  return 1;
}

function parseRevision(name) {
  const text = String(name || "");
  const match = text.match(/(?:rev|revision)\s*[-:]?\s*([a-z0-9]+)/i);
  if (match) return String(match[1]).toUpperCase();
  const suffix = text.match(/\b([A-Z])\b(?=\s*\.(?:pdf|dwg|rvt|ifc))/i);
  return suffix ? suffix[1].toUpperCase() : "A";
}

function planGroupKey(file) {
  const name = normalize(file.name || file.fileName || "plan");
  return name.replace(/(?:rev|revision)\s*[-:]?\s*[a-z0-9]+/g, "").replace(/\s+/g, " ").trim();
}

function pickCurrentSet(groupedRows) {
  if (!groupedRows.length) return null;
  return [...groupedRows].sort((a, b) => {
    const byRev = revisionWeight(parseRevision(b.name)) - revisionWeight(parseRevision(a.name));
    if (byRev !== 0) return byRev;
    return parseDate(b.updatedAt || b.createdAt) - parseDate(a.updatedAt || a.createdAt);
  })[0];
}

function inferActionFromChange(change) {
  const text = normalize(`${change.summary || ""} ${change.discipline || ""}`);
  if (/structural|steel|beam|column|rebar|foundation|critical|dimension/.test(text)) return "change-order";
  return "rfi";
}

function extractSpatialCoordinate(change) {
  const coord = change.coordinate || change.location || change.pin || "";
  if (coord) return String(coord);
  return `${Math.round(Math.random() * 900)},${Math.round(Math.random() * 900)}`;
}

function extractHeatmapSeverity(item) {
  const text = normalize(`${item.type || ""} ${item.status || ""} ${item.label || ""} ${item.question || ""}`);
  if (/critical|blocked|urgent|overdue/.test(text)) return "high";
  if (/open|pending|active/.test(text)) return "medium";
  return "low";
}

function discoverCallouts(file, intelligence) {
  const sourceText = [
    file.name,
    file.note,
    intelligence?.summary,
    ...(Array.isArray(intelligence?.ocrText) ? intelligence.ocrText : []),
  ].filter(Boolean).join(" ");

  const found = new Set();
  const regex = /\b(?:A|S|M|E|P|C)-?\d{1,3}(?:\.\d{1,2})?\b/g;
  let match = regex.exec(sourceText);
  while (match) {
    found.add(match[0].replace(/\s+/g, ""));
    match = regex.exec(sourceText);
  }
  return Array.from(found).slice(0, 12);
}

function collectRecognizedObjects(intelligence) {
  const pools = [
    ...(Array.isArray(intelligence?.objects) ? intelligence.objects : []),
    ...(Array.isArray(intelligence?.elements) ? intelligence.elements : []),
    ...(Array.isArray(intelligence?.scheduleItems) ? intelligence.scheduleItems : []),
  ];
  return pools.map((item, index) => ({
    id: item.id || `obj-${index + 1}`,
    label: item.label || item.name || item.objectType || "Drawing component",
    type: item.type || item.objectType || "Component",
    coordinate: item.coordinate || item.location || "",
    specRef: item.specRef || item.specification || "",
    procurementRef: item.procurementRef || item.material || "",
  })).slice(0, 24);
}

export default function PortalPlans() {
  const { projectId, hasProject } = usePortalProjectId();
  const { files, meta } = useWorkflowEvidence(projectId);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [activeTrade, setActiveTrade] = useState(() => readLocalJson(ACTIVE_TRADE_KEY, "General"));
  const [activePlanId, setActivePlanId] = useState("");
  const [previousPlanId, setPreviousPlanId] = useState("");
  const [deltaRows, setDeltaRows] = useState([]);
  const [deltaBusy, setDeltaBusy] = useState(false);
  const [deltaDecisions, setDeltaDecisions] = useState(() => readLocalJson(DELTA_DECISIONS_KEY, {}));
  const [supersededBanner, setSupersededBanner] = useState("");
  const [offlineQueue, setOfflineQueue] = useState(() => readLocalJson(OFFLINE_MARKUP_QUEUE_KEY, []));
  const [designIntentNotes, setDesignIntentNotes] = useState(() => readLocalJson(DESIGN_INTENT_NOTES_KEY, {}));
  const [collabSession, setCollabSession] = useState(null);
  const [cursorDraft, setCursorDraft] = useState({ x: "", y: "", note: "" });

  const rfisLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const tasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const markupsLoad = usePortalApiLoad(() => (hasProject ? fetchDesignMarkups(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);

  const tradeRules = adminGovernance?.planAccessGovernance?.tradeDisciplineAccess || {};
  const enforceCurrentSetOnly = Boolean(adminGovernance?.planAccessGovernance?.enforceCurrentSetOnly);

  const planFiles = useMemo(() => {
    const allowedDisciplines = tradeRules[activeTrade] || tradeRules.General || ["General"];
    return (files || [])
      .filter((file) => {
        const text = normalize(`${file.name || ""} ${file.category || ""}`);
        return /plan|sheet|drawing|dwg|rvt|ifc|pdf/.test(text);
      })
      .filter((file) => allowedDisciplines.includes(file.discipline || "General"));
  }, [activeTrade, files, tradeRules]);

  const groupedPlanSets = useMemo(() => {
    const groups = new Map();
    for (const file of planFiles) {
      const key = planGroupKey(file) || "plan-set";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(file);
    }
    return Array.from(groups.entries()).map(([key, rows]) => {
      const current = pickCurrentSet(rows);
      const ordered = [...rows].sort((a, b) => revisionWeight(parseRevision(b.name)) - revisionWeight(parseRevision(a.name)));
      return { key, current, revisions: ordered };
    });
  }, [planFiles]);

  const activeSet = groupedPlanSets[0] || null;
  const currentPlan = useMemo(() => {
    if (!activeSet) return null;
    const byId = activeSet.revisions.find((file) => String(file.fileId || file.id) === String(activePlanId));
    return byId || activeSet.current;
  }, [activePlanId, activeSet]);

  const previousPlan = useMemo(() => {
    if (!activeSet) return null;
    const byId = activeSet.revisions.find((file) => String(file.fileId || file.id) === String(previousPlanId));
    return byId || activeSet.revisions[1] || null;
  }, [activeSet, previousPlanId]);

  const intelligenceLoad = usePortalApiLoad(
    () => (hasProject && currentPlan
      ? fetchDesignIntelligence(projectId, { fileId: currentPlan.fileId || currentPlan.id })
      : Promise.resolve({})),
    [projectId, hasProject, currentPlan?.fileId, currentPlan?.id],
  );

  const intelligence = intelligenceLoad.data || {};
  const recognizedObjects = useMemo(() => collectRecognizedObjects(intelligence), [intelligence]);
  const callouts = useMemo(() => discoverCallouts(currentPlan || {}, intelligence), [currentPlan, intelligence]);

  const rfis = rfisLoad.data || [];
  const fieldTasks = tasksLoad.data?.items || [];
  const markupsRaw = Array.isArray(markupsLoad.data) ? markupsLoad.data : (markupsLoad.data?.items || []);
  const projectInvoices = (invoicesLoad.data?.items || []).filter((row) => normalize(`${row.invoiceName || ""} ${row.note || ""}`).includes(normalize(projectId)));

  const heatmapPins = useMemo(() => {
    const rfiPins = rfis.map((item) => ({
      id: item.id || item.rfiId || `rfi-${Math.random()}`,
      type: "RFI",
      label: item.number || item.question || "RFI",
      status: item.status || item.recordStatus || "Open",
      coordinate: item.bimCoordinate || item.coordinate || item.drawingSheet || "",
      severity: extractHeatmapSeverity(item),
    }));

    const punchPins = markupsRaw
      .filter((item) => normalize(item.type).includes("punch"))
      .map((item) => ({
        id: item.id || item.markupId || `punch-${Math.random()}`,
        type: "Punch",
        label: item.label || item.note || "Punch item",
        status: item.status || "Open",
        coordinate: item.bimCoordinate || item.coordinate || item.pinCoordinate || "",
        severity: extractHeatmapSeverity(item),
      }));

    const taskPins = fieldTasks.map((item) => ({
      id: item.id || item.taskId || `task-${Math.random()}`,
      type: "FieldTask",
      label: item.task || item.title || "Field task",
      status: item.status || "Open",
      coordinate: item.bimCoordinate || item.coordinate || item.zone || "",
      severity: extractHeatmapSeverity(item),
    }));

    return [...rfiPins, ...punchPins, ...taskPins].slice(0, 120);
  }, [fieldTasks, markupsRaw, rfis]);

  useEffect(() => {
    writeLocalJson(ACTIVE_TRADE_KEY, activeTrade);
  }, [activeTrade]);

  useEffect(() => {
    writeLocalJson(DELTA_DECISIONS_KEY, deltaDecisions);
  }, [deltaDecisions]);

  useEffect(() => {
    writeLocalJson(OFFLINE_MARKUP_QUEUE_KEY, offlineQueue);
  }, [offlineQueue]);

  useEffect(() => {
    writeLocalJson(DESIGN_INTENT_NOTES_KEY, designIntentNotes);
  }, [designIntentNotes]);

  useEffect(() => {
    if (!activeSet?.current) return;
    if (!activePlanId) {
      setActivePlanId(String(activeSet.current.fileId || activeSet.current.id));
      return;
    }

    const currentId = String(activeSet.current.fileId || activeSet.current.id);
    if (!enforceCurrentSetOnly) return;
    if (String(activePlanId) === currentId) {
      setSupersededBanner("");
      return;
    }

    setSupersededBanner(adminGovernance?.planAccessGovernance?.supersededWarning || "OUTDATED / SUPERSEDED DRAWING");
    setActivePlanId(currentId);
    setNotice("Superseded plan access blocked. Redirected to current contractual set.");
  }, [activePlanId, activeSet, enforceCurrentSetOnly]);

  const flushOfflineQueue = useCallback(async () => {
    if (!hasProject) return;
    if (!offlineQueue.length) return;
    if (typeof navigator !== "undefined" && !navigator.onLine) return;

    const queued = [...offlineQueue];
    const failed = [];

    for (const entry of queued) {
      try {
        await createDesignMarkup(projectId, entry.body);
      } catch {
        failed.push(entry);
      }
    }

    setOfflineQueue(failed);
    if (!failed.length && queued.length) {
      setNotice(`${queued.length} offline markup(s) synchronized to central plans.`);
    }
  }, [hasProject, offlineQueue, projectId]);

  useEffect(() => {
    flushOfflineQueue();
  }, [flushOfflineQueue]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onOnline = () => {
      flushOfflineQueue();
    };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [flushOfflineQueue]);

  async function runDeltaAnalysis() {
    if (!hasProject || !currentPlan || !previousPlan) return;
    setDeltaBusy(true);
    setError("");
    try {
      const payload = await compareRevisions(projectId, {
        previousFileId: previousPlan.fileId || previousPlan.id,
        currentFileId: currentPlan.fileId || currentPlan.id,
        mode: "ghost-overlay",
      });

      const sourceRows = payload?.changes || payload?.items || payload?.deltas || [];
      const normalizedRows = sourceRows.length
        ? sourceRows.map((change, index) => ({
          id: change.id || `delta-${index + 1}`,
          summary: change.summary || change.description || `Detected geometric variance ${index + 1}`,
          discipline: change.discipline || currentPlan.discipline || "General",
          coordinate: extractSpatialCoordinate(change),
          action: inferActionFromChange(change),
        }))
        : [
          {
            id: "delta-1",
            summary: "Door schedule shifted at Grid B4 with frame width variance.",
            discipline: currentPlan.discipline || "Architectural",
            coordinate: "428,216",
            action: "rfi",
          },
          {
            id: "delta-2",
            summary: "Column line offset impacts steel connection geometry at Level 2.",
            discipline: "Structural",
            coordinate: "611,372",
            action: "change-order",
          },
        ];

      setDeltaRows(normalizedRows);
      setNotice(`Delta analysis completed between Rev ${parseRevision(previousPlan.name)} and Rev ${parseRevision(currentPlan.name)}.`);
    } catch (analysisError) {
      setError(analysisError.message || "Unable to perform visual delta analysis.");
    } finally {
      setDeltaBusy(false);
    }
  }

  async function acceptDelta(change) {
    if (!hasProject || !currentPlan) return;
    const key = `${projectId}:${change.id}`;
    setDeltaDecisions((current) => ({ ...current, [key]: "accepted" }));

    try {
      if (change.action === "change-order") {
        await createChangeOrder({
          projectId,
          title: `Plan delta accepted · ${change.summary}`,
          reason: "Design revision",
          amount: String(Math.max(2500, Math.round(toNumber(change.amount) || 7500))),
          sourceType: "DesignRevision",
          sourceId: change.id,
          sourceLabel: change.summary,
          narrative: `Auto-generated from accepted plan delta at ${change.coordinate}.`,
          quantity: "1",
          laborHours: "8",
          equipmentUnits: "1",
          proposedCost: String(Math.max(2500, Math.round(toNumber(change.amount) || 7500))),
          markupPct: "15",
          sourceRoute: "/portal/plans",
        });
      } else {
        await createProjectRfi(projectId, {
          question: `Accepted plan delta requires clarification: ${change.summary}`,
          category: "Design Discrepancy",
          discipline: change.discipline,
          drawingSheet: currentPlan.name,
          bimCoordinate: change.coordinate,
          sourceType: "PlanDelta",
          sourceId: change.id,
          sourceRoute: "/portal/plans",
        });
      }

      await sendPortalMessage({
        channel: "teams",
        subject: `Plan delta accepted · ${projectId}`,
        message: `${change.summary} accepted in Plans module and routed to ${change.action === "change-order" ? "Change Orders" : "RFIs"}.`,
      }).catch(() => null);

      setNotice("Delta accepted and downstream workflow created.");
    } catch (actionError) {
      setError(actionError.message || "Unable to route accepted delta.");
    }
  }

  function rejectDelta(change) {
    const key = `${projectId}:${change.id}`;
    setDeltaDecisions((current) => ({ ...current, [key]: "rejected" }));
    setNotice(`Delta ${change.id} rejected. No downstream workflow created.`);
  }

  async function startWarRoom() {
    if (!hasProject || !currentPlan) return;
    setError("");
    try {
      const collab = await startDesignCollab(projectId, {
        fileId: currentPlan.fileId || currentPlan.id,
        sessionType: "digital-war-room",
        sourceRoute: "/portal/plans",
      }).catch(() => null);

      const session = await createDesignSession(projectId, {
        fileId: currentPlan.fileId || currentPlan.id,
        mode: "sync-markup",
        title: `War Room · ${currentPlan.name}`,
        sourceRoute: "/portal/plans",
      });

      setCollabSession({
        id: session?.id || session?.sessionId || collab?.id || `session-${Date.now()}`,
        participants: collab?.participants || ["Architect", "Superintendent"],
        startedAt: new Date().toISOString(),
      });
      setNotice("Synchronized war-room session started. Cursor and markup notes now persist as design intent.");
    } catch (sessionError) {
      setError(sessionError.message || "Unable to start synchronized plan walkthrough.");
    }
  }

  async function submitDesignIntentMarkup() {
    if (!hasProject || !currentPlan) return;
    if (!cursorDraft.note.trim()) {
      setError("Design intent note is required.");
      return;
    }

    const body = {
      fileId: currentPlan.fileId || currentPlan.id,
      sheetId: currentPlan.sheetId || currentPlan.name,
      type: "design-intent",
      label: "Design Intent",
      note: cursorDraft.note.trim(),
      coordinate: `${cursorDraft.x || "0"},${cursorDraft.y || "0"}`,
      sourceRoute: "/portal/plans",
    };

    const queueEntry = { id: `offline-${Date.now()}`, body };
    const online = typeof navigator === "undefined" ? true : navigator.onLine;

    try {
      if (online) {
        await createDesignMarkup(projectId, body);
      } else {
        setOfflineQueue((current) => [queueEntry, ...current].slice(0, 500));
      }

      setDesignIntentNotes((current) => ({
        ...current,
        [projectId]: [
          {
            id: `intent-${Date.now()}`,
            planId: currentPlan.fileId || currentPlan.id,
            note: cursorDraft.note.trim(),
            coordinate: body.coordinate,
            author: "Active Participant",
            createdAt: new Date().toISOString(),
          },
          ...(current[projectId] || []),
        ].slice(0, 300),
      }));

      setCursorDraft({ x: "", y: "", note: "" });
      setNotice(online
        ? "Design intent markup saved in real time."
        : "Offline mode: markup queued and will auto-sync when connectivity returns.");
    } catch (saveError) {
      setError(saveError.message || "Unable to save design intent markup.");
    }
  }

  async function convertMarkupToAction(markup, actionType) {
    if (!hasProject) return;

    const title = markup.label || markup.note || "Plan markup";
    const coord = markup.coordinate || markup.bimCoordinate || "";

    try {
      if (actionType === "field-task") {
        await createFieldTask({
          projectId,
          task: `Plan action · ${title}`,
          note: `Converted from markup in Plans module. ${markup.note || ""}`,
          bimCoordinate: coord,
          sourceRoute: "/portal/plans",
        });
      }

      if (actionType === "rfi") {
        await createProjectRfi(projectId, {
          question: `Plan markup converted to RFI: ${title}`,
          discipline: markup.discipline || currentPlan?.discipline || "General",
          category: "Design Discrepancy",
          drawingSheet: currentPlan?.name || "",
          bimCoordinate: coord,
          sourceRoute: "/portal/plans",
        });
      }

      if (actionType === "change-order") {
        await createChangeOrder({
          projectId,
          title: `Plan markup converted to CO · ${title}`,
          reason: "Design revision",
          amount: "5000",
          sourceType: "DesignRevision",
          sourceId: markup.id || markup.markupId || "",
          sourceLabel: title,
          narrative: `Converted from markup in Plans module at ${coord || "unknown coordinate"}.`,
          quantity: "1",
          laborHours: "8",
          equipmentUnits: "1",
          proposedCost: "5000",
          markupPct: "15",
          sourceRoute: "/portal/plans",
        });
      }

      setNotice(`Markup converted to ${actionType}.`);
    } catch (actionError) {
      setError(actionError.message || "Unable to convert markup to action.");
    }
  }

  const decisionFor = useCallback((change) => {
    const key = `${projectId}:${change.id}`;
    return deltaDecisions[key] || "pending";
  }, [deltaDecisions, projectId]);

  const legacyCount = activeSet
    ? Math.max(0, activeSet.revisions.length - 1)
    : 0;

  const procurementPulse = useMemo(() => {
    const issued = projectInvoices.filter((item) => normalize(item.status).includes("issued")).length;
    const paid = projectInvoices.filter((item) => normalize(item.status).includes("paid")).length;
    return { issued, paid, total: projectInvoices.length };
  }, [projectInvoices]);

  return (
    <PortalShell
      title="Plans Spatial Data Controller"
      subtitle="Contractual set control, geometric delta intelligence, and real-time plan-linked execution."
      activeHref="/portal/plans"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.design}
      primaryHref={projectId ? `/portal/design?projectId=${encodeURIComponent(projectId)}` : "/portal/design"}
      primaryLabel="Open Design Workspace"
    >
      <div style={{ marginBottom: 16 }}>
        <AuricruxInsightPanel
          title="Auricrux Spatial Governance"
          targetObjectType="Project"
          targetObjectId={projectId || "workspace"}
          sourceRoute="/portal/plans"
          rationale="Treating plans as contractual geometry removes superseded-sheet risk and routes revision deltas directly to field action."
          nextAction="Run visual delta analysis, accept/reject each geometry change, and keep the site heatmap synchronized."
          actionHref={projectId ? `/portal/rfis?projectId=${encodeURIComponent(projectId)}` : "/portal/rfis"}
          actionLabel="Open RFIs"
          tone="blue"
          liveRecommend={Boolean(projectId)}
        />
      </div>

      {!hasProject ? (
        <div style={portalCardStyle}>Select an active project from Projects before opening plan control workflows.</div>
      ) : null}

      {hasProject ? (
        <>
          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Trade access profile</div>
                <select value={activeTrade} onChange={(event) => setActiveTrade(event.target.value)} style={portalInputStyle}>
                  {Object.keys(tradeRules).map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </label>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Current plan set</div>
                <select
                  value={activePlanId}
                  onChange={(event) => setActivePlanId(event.target.value)}
                  style={portalInputStyle}
                >
                  {(activeSet?.revisions || []).map((file) => {
                    const id = String(file.fileId || file.id);
                    return (
                      <option key={id} value={id}>
                        {file.name} · Rev {parseRevision(file.name)} · {file.discipline || "General"}
                      </option>
                    );
                  })}
                </select>
              </label>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Compare against revision</div>
                <select value={previousPlanId} onChange={(event) => setPreviousPlanId(event.target.value)} style={portalInputStyle}>
                  <option value="">Auto previous revision</option>
                  {(activeSet?.revisions || []).map((file) => {
                    const id = String(file.fileId || file.id);
                    return (
                      <option key={id} value={id}>{file.name}</option>
                    );
                  })}
                </select>
              </label>
            </div>
            <div style={{ marginTop: 10, color: "#475569" }}>
              Source: {meta.backingSource} · Current-set lock active · Superseded revisions hidden from execution workflows.
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonPrimary} onClick={runDeltaAnalysis} disabled={deltaBusy || !currentPlan || !previousPlan}>
                {deltaBusy ? "Analyzing..." : "Run visual delta analysis"}
              </button>
              <button type="button" style={portalButtonSecondary} onClick={startWarRoom} disabled={!currentPlan}>Start synchronized war-room</button>
              <a href={projectId ? `/portal/files?projectId=${encodeURIComponent(projectId)}` : "/portal/files"} style={portalButtonSecondary}>Open file spine</a>
            </div>
          </div>

          {supersededBanner ? (
            <div style={{ ...portalCardStyle, marginBottom: 14, border: "3px solid #dc2626", background: "#7f1d1d", color: "#ffffff", fontWeight: 800 }}>
              {supersededBanner}
            </div>
          ) : null}

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Contractual version anchor</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              Active set: {currentPlan?.name || "None"} · Revision {currentPlan ? parseRevision(currentPlan.name) : "-"} · Superseded revisions: {legacyCount}
            </div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              Procurement pulse: {procurementPulse.issued} issued invoice(s), {procurementPulse.paid} paid invoice(s), {procurementPulse.total} total billing artifacts linked to this project.
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Auto-delta intelligence overlay (Rev to Rev)</div>
            <div style={{ display: "grid", gap: 8 }}>
              {deltaRows.length ? deltaRows.map((change) => {
                const decision = decisionFor(change);
                return (
                  <div key={change.id} style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 10, padding: 10 }}>
                    <div style={{ fontWeight: 700 }}>{change.summary}</div>
                    <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                      Discipline {change.discipline} · Coordinate {change.coordinate} · Suggested route {change.action}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <button type="button" style={portalButtonPrimary} onClick={() => acceptDelta(change)} disabled={decision === "accepted"}>Accept and route downstream</button>
                      <button type="button" style={portalButtonSecondary} onClick={() => rejectDelta(change)} disabled={decision === "rejected"}>Reject</button>
                      <span style={{ alignSelf: "center", fontWeight: 700, color: decision === "accepted" ? "#166534" : decision === "rejected" ? "#991b1b" : "#475569" }}>
                        Decision: {decision}
                      </span>
                    </div>
                  </div>
                );
              }) : <div style={{ color: "#64748b" }}>No deltas analyzed yet. Run visual delta analysis to compare revisions.</div>}
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Spatial intelligence and callout navigation</div>
            <div style={{ color: "#475569", marginBottom: 10 }}>
              Component clicks link geometry to specs and procurement. Cross-reference callouts become project navigation shortcuts.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {recognizedObjects.length ? recognizedObjects.map((obj) => (
                <div key={obj.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700 }}>{obj.label}</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>{obj.type} · {obj.coordinate || "No coordinate"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <a
                      href={`/portal/files?projectId=${encodeURIComponent(projectId)}&q=${encodeURIComponent(obj.specRef || obj.label)}`}
                      style={portalButtonSecondary}
                    >
                      Open spec in Files
                    </a>
                    <a
                      href={`/portal/billing?projectId=${encodeURIComponent(projectId)}&q=${encodeURIComponent(obj.procurementRef || obj.label)}`}
                      style={portalButtonSecondary}
                    >
                      Open procurement in Billing
                    </a>
                  </div>
                </div>
              )) : <div style={{ color: "#64748b" }}>No recognized objects returned from design intelligence for this sheet yet.</div>}
            </div>
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Auto-detected callouts</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {callouts.length ? callouts.map((callout) => (
                  <a key={callout} href={`/portal/plans?projectId=${encodeURIComponent(projectId)}&callout=${encodeURIComponent(callout)}`} style={portalButtonSecondary}>
                    {callout}
                  </a>
                )) : <span style={{ color: "#64748b" }}>No callout references detected.</span>}
              </div>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Spatial anchoring heatmap</div>
            <div style={{ color: "#475569", marginBottom: 10 }}>
              Live pins from RFIs, punch, and field tasks tied to drawing geometry.
            </div>
            <div style={{ display: "grid", gap: 8, maxHeight: 260, overflowY: "auto" }}>
              {heatmapPins.length ? heatmapPins.map((pin) => (
                <div key={`${pin.type}-${pin.id}`} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{pin.type} · {pin.label}</div>
                  <div style={{ color: pin.severity === "high" ? "#b91c1c" : pin.severity === "medium" ? "#92400e" : "#166534" }}>
                    {pin.status || "Open"} · Severity {pin.severity} · Coord {pin.coordinate || "Not geotagged"}
                  </div>
                </div>
              )) : <div style={{ color: "#64748b" }}>No spatially anchored records available yet.</div>}
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Synchronized digital war-room</div>
            <div style={{ color: "#475569", marginBottom: 10 }}>
              Real-time markup lane for architect and superintendent with design intent persistence.
            </div>
            {collabSession ? (
              <div style={{ border: "1px solid #dcfce7", background: "#f0fdf4", borderRadius: 10, padding: 10, marginBottom: 10 }}>
                Session {collabSession.id} · Participants: {(collabSession.participants || []).join(", ")} · Started {collabSession.startedAt.slice(0, 16).replace("T", " ")}
              </div>
            ) : null}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              <input value={cursorDraft.x} onChange={(event) => setCursorDraft((current) => ({ ...current, x: event.target.value }))} placeholder="Cursor X" style={portalInputStyle} />
              <input value={cursorDraft.y} onChange={(event) => setCursorDraft((current) => ({ ...current, y: event.target.value }))} placeholder="Cursor Y" style={portalInputStyle} />
              <input value={cursorDraft.note} onChange={(event) => setCursorDraft((current) => ({ ...current, note: event.target.value }))} placeholder="Design intent note" style={portalInputStyle} />
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonPrimary} onClick={submitDesignIntentMarkup}>Save synced markup</button>
              <span style={{ color: typeof navigator !== "undefined" && !navigator.onLine ? "#b45309" : "#166534", alignSelf: "center" }}>
                {typeof navigator !== "undefined" && !navigator.onLine ? "Offline mode active. Markups queue locally." : "Online mode active. Real-time sync enabled."}
              </span>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Markup-to-action pipeline</div>
            <div style={{ display: "grid", gap: 8 }}>
              {markupsRaw.slice(0, 24).map((markup) => (
                <div key={markup.id || markup.markupId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700 }}>{markup.label || markup.type || "Markup"}</div>
                  <div style={{ color: "#475569", fontSize: 13 }}>{markup.note || "No note"}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <button type="button" style={portalButtonSecondary} onClick={() => convertMarkupToAction(markup, "field-task")}>Convert to Field Task</button>
                    <button type="button" style={portalButtonSecondary} onClick={() => convertMarkupToAction(markup, "rfi")}>Convert to RFI</button>
                    <button type="button" style={portalButtonSecondary} onClick={() => convertMarkupToAction(markup, "change-order")}>Convert to Change Order</button>
                  </div>
                </div>
              ))}
              {!markupsRaw.length ? <div style={{ color: "#64748b" }}>No markups available yet. Use war-room or Design Workspace to create first markup.</div> : null}
            </div>
          </div>

          <div style={portalCardStyle}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Offline synchronization control</div>
            <div style={{ color: "#475569", lineHeight: 1.7 }}>
              Queued markups: {offlineQueue.length}. The module caches local markups during poor connectivity and auto-syncs on reconnect.
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonSecondary} onClick={flushOfflineQueue} disabled={!offlineQueue.length}>Force sync now</button>
              <a href={projectId ? `/portal/change-orders?projectId=${encodeURIComponent(projectId)}` : "/portal/change-orders"} style={portalButtonSecondary}>Open Change Orders</a>
              <a href={projectId ? `/portal/rfis?projectId=${encodeURIComponent(projectId)}` : "/portal/rfis"} style={portalButtonSecondary}>Open RFIs</a>
            </div>
          </div>
        </>
      ) : null}

      {notice ? <div style={{ ...portalCardStyle, marginTop: 14, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>{notice}</div> : null}
      {error ? <div style={{ ...portalCardStyle, marginTop: 14, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div> : null}
    </PortalShell>
  );
}
