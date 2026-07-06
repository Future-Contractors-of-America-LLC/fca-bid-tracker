import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import FieldPhotoCapture from "../../components/field/FieldPhotoCapture";
import FieldPhotoAnnotator from "../../components/field/FieldPhotoAnnotator";
import PlanComparePanel from "../../components/field/PlanComparePanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useJobCost from "../../hooks/useJobCost";
import {
  autoRedlineFromPhoto,
  compareFieldPhoto,
  fetchFieldPhotoFeedback,
  fetchFieldPhotos,
  fieldPhotoStreamUrl,
  updateFieldPhoto,
  uploadFieldPhoto,
} from "../../api/fieldPhotosClient";
import { createProjectRfi, fetchProjectRfis } from "../../api/constructionClient";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { createDesignMarkup } from "../../api/designWorkspaceClient";
import { fetchAcademyLms } from "../../api/academyClient";
import { routeStateOverlays } from "../../systemState";
import {
  FCA_MINIMUM_OUTPUT_FORMAT_OPTIONS,
  buildStructuredExport,
  isConstructionDesignFile,
  normalizeFormat,
} from "../../constructionFormats";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const actionBtn = { border: "1px solid #cbd5e1", background: "#fff", borderRadius: 8, padding: "8px 12px", fontWeight: 700, cursor: "pointer" };
const inputStyle = {
  width: "100%",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  padding: 10,
  boxSizing: "border-box",
  font: "inherit",
};

const DAILY_LOGS_KEY = "fca_field_daily_logs_v1";
const BADGE_LOG_KEY = "fca_field_badge_log_v1";
const LESSONS_KEY = "fca_field_lessons_learned_feed_v1";

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

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readProjectIdFromLocation() {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("projectId") || "";
}

function dateLabel(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function buildWeatherSummary(payload) {
  const current = payload?.current_weather;
  if (!current) return "Weather service unavailable";
  return `Temp ${current.temperature}C, wind ${current.windspeed} km/h, code ${current.weathercode}`;
}

async function fetchWeatherSnapshot() {
  const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=39.7684&longitude=-86.1581&current_weather=true", {
    method: "GET",
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error("Unable to load weather snapshot.");
  }
  return payload;
}

function deriveActionItems(voiceNote) {
  const lines = String(voiceNote || "").split(/[\n.]+/).map((line) => line.trim()).filter(Boolean);
  const items = [];
  for (const line of lines) {
    const text = normalize(line);
    if (!text) continue;
    if (/pm|project manager|schedule|owner/.test(text)) {
      items.push({ queue: "messages", audience: "PM", detail: line });
    }
    if (/engineer|design|rfi|clarify|detail/.test(text)) {
      items.push({ queue: "rfi", audience: "Engineer", detail: line });
    }
    if (/sub|subcontractor|crew|foreman/.test(text)) {
      items.push({ queue: "messages", audience: "Subcontractor", detail: line });
    }
  }
  return items;
}

function certificationRows(payload) {
  const rows = [
    ...(payload?.learners || []),
    ...(payload?.items || []),
    ...(payload?.summary?.learners || []),
  ];
  return rows.map((row) => ({
    worker: String(row.email || row.name || row.learnerId || row.id || "").trim(),
    certs: Array.isArray(row.certifications)
      ? row.certifications
      : Array.isArray(row.credentials)
      ? row.credentials
      : row.badges
      ? (Array.isArray(row.badges) ? row.badges : [row.badges])
      : [],
  })).filter((row) => row.worker);
}

function workerAuthorized(payload, worker, requiredCert) {
  if (!requiredCert) return true;
  const workerNorm = normalize(worker);
  const requiredNorm = normalize(requiredCert);
  const match = certificationRows(payload).find((row) => {
    const rowNorm = normalize(row.worker);
    return rowNorm.includes(workerNorm) || workerNorm.includes(rowNorm);
  });
  if (!match) return false;
  return match.certs.some((cert) => normalize(String(cert)).includes(requiredNorm));
}

function inferRoleForTask(task) {
  const text = normalize(task.task || "");
  if (/ladder|heights|scaffold/.test(text)) return "Working at Heights";
  if (/confined|vault|tank/.test(text)) return "Confined Space";
  if (/electrical|panel|conduit/.test(text)) return "Electrical Safety";
  return "General Site Safety";
}

function detectNearMisses(logs) {
  const incidents = logs.filter((log) => /incident|near miss|unsafe|ladder/i.test(`${log.safety || ""} ${log.notes || ""}`));
  const ladderZoneCounts = {};
  for (const entry of incidents) {
    if (!/ladder/i.test(`${entry.safety || ""} ${entry.notes || ""}`)) continue;
    const zone = String(entry.zone || "Unknown");
    ladderZoneCounts[zone] = (ladderZoneCounts[zone] || 0) + 1;
  }
  const spikes = Object.entries(ladderZoneCounts)
    .filter(([, count]) => count >= 3)
    .map(([zone, count]) => ({ zone, count }));
  return { incidents, spikes };
}

function buildDailyLogPrefill({
  projectId,
  weatherSummary,
  fieldTasks,
  scheduleItems,
  operationsFeed,
}) {
  const completedTasks = (fieldTasks || []).filter((task) => (task.status || "").toLowerCase().includes("complete"));
  const activeSubs = (scheduleItems || []).slice(0, 6).map((row) => row.crew || row.title || row.project || "Scheduled crew");
  const safetyEvents = (operationsFeed || []).filter((message) => /safety|incident|near miss|hazard/i.test(`${message.subject || ""} ${message.message || ""}`));

  return {
    id: `${projectId}-${Date.now()}`,
    projectId,
    date: dateLabel(),
    weather: weatherSummary,
    progress: completedTasks.map((task) => task.task).slice(0, 12),
    subcontractorWork: activeSubs,
    safety: safetyEvents.map((event) => event.subject || event.message).slice(0, 8),
    notes: "",
    zone: "",
    signedOffBy: "",
    signedOffAt: "",
  };
}

function downloadBlob(name, content, type = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

export default function PortalFieldSupervision() {
  const deepLinkProjectId = useMemo(() => readProjectIdFromLocation(), []);
  const { projectId, hasProject } = usePortalProjectId(deepLinkProjectId);
  const { activeProject } = useProjectWorkspace();
  const { session } = useCustomerSession();
  const { files } = useWorkflowEvidence(projectId);
  const jobCost = useJobCost(projectId);

  const [photos, setPhotos] = useState([]);
  const [redlines, setRedlines] = useState([]);
  const [selectedPhotoId, setSelectedPhotoId] = useState("");
  const [fileId, setFileId] = useState("");
  const [sheetId, setSheetId] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [previewMap, setPreviewMap] = useState({});
  const [exportFormat, setExportFormat] = useState("cobie");
  const [voiceNote, setVoiceNote] = useState("");
  const [dailyLogs, setDailyLogs] = useState(() => readLocalJson(DAILY_LOGS_KEY, []));
  const [logDraft, setLogDraft] = useState(null);
  const [weatherSummary, setWeatherSummary] = useState("Loading weather...");
  const [digitalPin, setDigitalPin] = useState({ zone: "", detail: "", pinType: "RFI" });
  const [badgeScan, setBadgeScan] = useState({ worker: "", taskLabel: "", requiredCertification: "" });
  const [badgeLog, setBadgeLog] = useState(() => readLocalJson(BADGE_LOG_KEY, []));

  const fieldTasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const scheduleLoad = usePortalApiLoad(() => (hasProject ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const portalMessagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);
  const rfiLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const academyLoad = usePortalApiLoad(() => fetchAcademyLms({ view: "summary" }), []);

  const selectedPhoto = photos.find((item) => item.id === selectedPhotoId) || photos[0] || null;
  const planFiles = (files || []).filter((file) => isConstructionDesignFile(file));
  const fieldTasks = fieldTasksLoad.data?.items || [];
  const scheduleItems = scheduleLoad.data?.items || [];
  const portalMessages = portalMessagesLoad.data?.items || portalMessagesLoad.data?.drafts?.sent || [];

  const nearMissSummary = useMemo(() => detectNearMisses(dailyLogs.filter((log) => log.projectId === projectId)), [dailyLogs, projectId]);
  const actionItems = useMemo(() => deriveActionItems(voiceNote), [voiceNote]);
  const productivitySignal = useMemo(() => {
    const rollup = jobCost.rollup || {};
    const budget = toNumber(rollup.budgetHours || rollup.estimatedHours || rollup.contractValue);
    const actual = toNumber(rollup.actualHours || rollup.actualCost);
    if (!budget || !actual) return { status: "unknown", ratio: 0 };
    const ratio = actual / Math.max(budget, 1);
    return {
      status: ratio > 1 ? "overrun" : ratio > 0.85 ? "risk" : "healthy",
      ratio: Number((ratio * 100).toFixed(1)),
    };
  }, [jobCost.rollup]);

  useEffect(() => {
    writeLocalJson(DAILY_LOGS_KEY, dailyLogs);
  }, [dailyLogs]);

  useEffect(() => {
    writeLocalJson(BADGE_LOG_KEY, badgeLog);
  }, [badgeLog]);

  useEffect(() => {
    fetchWeatherSnapshot()
      .then((payload) => setWeatherSummary(buildWeatherSummary(payload)))
      .catch(() => setWeatherSummary("Weather service unavailable"));
  }, [projectId]);

  const reload = useCallback(async () => {
    if (!hasProject) {
      setPhotos([]);
      setRedlines([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload = await fetchFieldPhotos(projectId);
      setPhotos(payload.items || []);
      setRedlines(payload.redlines || []);
      if (!selectedPhotoId && payload.items?.[0]?.id) setSelectedPhotoId(payload.items[0].id);
    } catch (err) {
      setError(err.message || "Unable to load field photos.");
    } finally {
      setLoading(false);
    }
  }, [hasProject, projectId, selectedPhotoId]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (selectedPhoto?.fileId) setFileId(selectedPhoto.fileId);
    if (selectedPhoto?.sheetId) setSheetId(selectedPhoto.sheetId);
  }, [selectedPhoto?.id, selectedPhoto?.fileId, selectedPhoto?.sheetId]);

  useEffect(() => {
    if (!hasProject) {
      setLogDraft(null);
      return;
    }
    const draft = buildDailyLogPrefill({
      projectId,
      weatherSummary,
      fieldTasks,
      scheduleItems,
      operationsFeed: portalMessages,
    });
    setLogDraft(draft);
  }, [fieldTasks, hasProject, portalMessages, projectId, scheduleItems, weatherSummary]);

  async function handleCapture(capture) {
    if (!hasProject) return;
    setBusy(true);
    setError("");
    try {
      const payload = await uploadFieldPhoto({
        projectId,
        contentBase64: capture.contentBase64,
        mimeType: capture.mimeType,
        notes: capture.notes,
        capturedBy: capture.capturedBy || session?.email || "field-supervisor",
        fileId,
        sheetId,
      });
      const item = payload.item;
      if (capture.previewUrl) {
        setPreviewMap((current) => ({ ...current, [item.id]: capture.previewUrl }));
      }
      setSelectedPhotoId(item.id);
      setNotice("Field photo uploaded to governed spine.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to upload photo.");
    } finally {
      setBusy(false);
    }
  }

  async function saveAnnotations(annotations) {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      await updateFieldPhoto(selectedPhoto.id, { annotations, notes: selectedPhoto.notes });
      setNotice("Annotations saved.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to save annotations.");
    } finally {
      setBusy(false);
    }
  }

  async function runCompare() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      await compareFieldPhoto(selectedPhoto.id, { fileId, sheetId, projectId });
      setNotice("Plan compare complete.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to compare photo to plan.");
    } finally {
      setBusy(false);
    }
  }

  async function runAutoRedline() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      const payload = await autoRedlineFromPhoto(selectedPhoto.id, { fileId, sheetId, projectId });
      setNotice(`Generated ${payload.count || 0} redline(s) on governing plan.`);
      await reload();
    } catch (err) {
      setError(err.message || "Unable to generate redlines.");
    } finally {
      setBusy(false);
    }
  }

  async function runAuricruxFeedback() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      const payload = await fetchFieldPhotoFeedback(selectedPhoto.id);
      setNotice(payload.feedback || "Auricrux feedback updated.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to load Auricrux feedback.");
    } finally {
      setBusy(false);
    }
  }

  async function markLoadedToAuricruxDb() {
    if (!selectedPhoto?.id) return;
    setBusy(true);
    try {
      await updateFieldPhoto(selectedPhoto.id, {
        annotations: selectedPhoto.annotations || [],
        notes: selectedPhoto.notes,
        auricruxDbLoadedAt: new Date().toISOString(),
        ingestionStatus: "loaded",
      });
      setNotice("Photo evidence loaded to Auricrux DB spine.");
      await reload();
    } catch (err) {
      setError(err.message || "Unable to mark Auricrux DB ingest status.");
    } finally {
      setBusy(false);
    }
  }

  function exportAsBuiltPackage() {
    if (!selectedPhoto) return;

    const payload = {
      projectId,
      photoId: selectedPhoto.id,
      fileId: selectedPhoto.fileId || fileId || "",
      sheetId: selectedPhoto.sheetId || sheetId || "",
      compareStatus: selectedPhoto.compareStatus || "pending",
      redlineCount: selectedPhoto.redlineIds?.length || 0,
      annotations: selectedPhoto.annotations || [],
      redlines,
      exportedAt: new Date().toISOString(),
    };
    const baseName = `${projectId}-${selectedPhoto.id}-as-built`.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();

    const output = buildStructuredExport({
      format: exportFormat,
      payload: {
        ...payload,
        packageName: "As-Built Redline Package",
        files: [
          {
            fileId: payload.fileId,
            name: `Field-${payload.photoId}`,
            category: "Field",
            discipline: "As-Built",
            status: payload.compareStatus,
          },
        ],
      },
      baseName,
    });
    downloadBlob(output.fileName, output.content, output.mimeType);
    setNotice(`As-built package exported (${normalizeFormat(exportFormat).toUpperCase()}).`);
  }

  function signOffDailyLog() {
    if (!logDraft) return;
    if (!logDraft.signedOffBy.trim()) {
      setError("Superintendent sign-off name is required.");
      return;
    }
    const signed = {
      ...logDraft,
      signedOffAt: new Date().toISOString(),
    };
    setDailyLogs((current) => [signed, ...current.filter((item) => !(item.projectId === projectId && item.date === signed.date))].slice(0, 120));
    setNotice("Daily log signed and stored as project legal record.");
  }

  async function launchDigitalPinAction() {
    if (!hasProject || !digitalPin.detail.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (digitalPin.pinType === "RFI") {
        await createProjectRfi(projectId, {
          number: `RFI-FIELD-${Date.now().toString().slice(-6)}`,
          question: digitalPin.detail.trim(),
          drawingSheet: sheetId,
          zone: digitalPin.zone,
          sourceRoute: "/portal/field-supervision",
        });
        setNotice("Digital pin created and routed to RFI queue.");
      } else {
        await createDesignMarkup(projectId, {
          fileId,
          sheetId,
          type: "punch",
          label: digitalPin.detail.trim(),
          zone: digitalPin.zone,
          sourceRoute: "/portal/field-supervision",
        });
        setNotice("Digital pin created and routed to Punch queue.");
      }
      setDigitalPin({ zone: "", detail: "", pinType: digitalPin.pinType });
      await rfiLoad.reload();
    } catch (pinError) {
      setError(pinError.message || "Unable to create digital pin action.");
    } finally {
      setBusy(false);
    }
  }

  async function pushActionItems() {
    if (!actionItems.length) {
      setNotice("No actionable items detected in voice note.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      for (const item of actionItems) {
        if (item.queue === "messages") {
          await sendPortalMessage({
            channel: "teams",
            subject: `Field supervision action for ${item.audience}`,
            message: `${item.detail} (project ${projectId})`,
          }).catch(() => null);
        }
        if (item.queue === "rfi") {
          await createProjectRfi(projectId, {
            number: `RFI-VOICE-${Date.now().toString().slice(-6)}`,
            question: item.detail,
            sourceRoute: "/portal/field-supervision",
          }).catch(() => null);
        }
      }
      setNotice("Auricrux routed voice-derived action items to Messages/RFI queues.");
      setVoiceNote("");
      await portalMessagesLoad.reload();
      await rfiLoad.reload();
    } catch (actionError) {
      setError(actionError.message || "Unable to route action items.");
    } finally {
      setBusy(false);
    }
  }

  function scanBadge() {
    if (!badgeScan.worker.trim()) {
      setError("Worker badge ID/name is required.");
      return;
    }
    const required = badgeScan.requiredCertification.trim() || inferRoleForTask({ task: badgeScan.taskLabel || "" });
    const ok = workerAuthorized(academyLoad.data, badgeScan.worker, required);
    const entry = {
      id: `badge-${Date.now()}`,
      projectId,
      worker: badgeScan.worker.trim(),
      taskLabel: badgeScan.taskLabel.trim(),
      requiredCertification: required,
      authorized: ok,
      scannedAt: new Date().toISOString(),
    };
    setBadgeLog((current) => [entry, ...current].slice(0, 240));
    setNotice(ok ? "Badge scan authorized for assigned work." : "Badge scan blocked: certification not found in Academy records.");
  }

  function publishLessonsLearned() {
    const message = `Field productivity signal ${productivitySignal.ratio}% on project ${projectId}. `
      + `Top near-miss incidents: ${nearMissSummary.incidents.length}. `
      + `Use this signal in future estimating assumptions.`;

    const record = {
      id: `lesson-${Date.now()}`,
      projectId,
      createdAt: new Date().toISOString(),
      summary: message,
      source: "/portal/field-supervision",
    };

    const current = readLocalJson(LESSONS_KEY, []);
    writeLocalJson(LESSONS_KEY, [record, ...current].slice(0, 120));

    sendPortalMessage({
      channel: "teams",
      subject: "Field-to-estimate lessons learned",
      message,
    }).catch(() => null);

    setNotice("Lessons learned published for estimating feedback loop.");
  }

  const imageUrl = selectedPhoto ? previewMap[selectedPhoto.id] || fieldPhotoStreamUrl(selectedPhoto.id) : "";

  return (
    <PortalShell
      title="Field Supervision Intelligence Hub"
      subtitle="Daily legal record, visual site intelligence, and proactive supervision orchestration."
      activeHref="/portal/field-supervision"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/design?projectId=${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Open Design Workspace"
    >
      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to begin field supervision.</div>
      ) : null}

      {hasProject ? (
        <>
          <AuricruxInsightPanel
            title="Auricrux Site Guardian"
            targetObjectId={projectId}
            sourceRoute="/portal/field-supervision"
            rationale="Field supervision is the legal and operational second brain for daily execution and safety risk control."
            nextAction="Review prefilled daily log, verify site evidence, and route action items in one supervision cycle."
            actionHref={`/portal/rfis?projectId=${encodeURIComponent(projectId)}`}
            actionLabel="Open RFI queue"
            tone="amber"
            liveRecommend
          />

          <div style={{ ...card, marginTop: 16, marginBottom: 12, borderColor: productivitySignal.status === "overrun" ? "#fecaca" : productivitySignal.status === "risk" ? "#fde68a" : "#bbf7d0", background: productivitySignal.status === "overrun" ? "#fef2f2" : productivitySignal.status === "risk" ? "#fffbeb" : "#f0fdf4" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Real-time productivity feed</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Budget vs actual signal:</strong> {productivitySignal.ratio ? `${productivitySignal.ratio}%` : "Unknown"}</div>
              <div><strong>Status:</strong> {productivitySignal.status === "overrun" ? "Labor overrun risk" : productivitySignal.status === "risk" ? "Approaching overrun" : productivitySignal.status === "healthy" ? "Within tolerance" : "Insufficient data"}</div>
              <div><strong>Near-miss incidents logged:</strong> {nearMissSummary.incidents.length}</div>
              <div><strong>Open RFIs affecting field:</strong> {(rfiLoad.data || []).filter((rfi) => !(rfi.recordStatus === "answered" || rfi.status === "answered" || rfi.response)).length}</div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
              <a href={`/portal/job-cost?projectId=${encodeURIComponent(projectId)}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>Open Job Cost</a>
              <a href={`/portal/estimates?projectId=${encodeURIComponent(projectId)}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>Open Estimates</a>
            </div>
          </div>

          {nearMissSummary.spikes.length ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Auricrux hazard prediction</div>
              {nearMissSummary.spikes.map((spike) => (
                <div key={spike.zone} style={{ marginBottom: 6 }}>
                  You logged {spike.count} ladder-related near-miss incidents in Zone {spike.zone}. Recommend safety stand-down tomorrow.
                </div>
              ))}
            </div>
          ) : null}

          {logDraft ? (
            <div style={{ ...card, marginBottom: 12 }}>
              <div style={{ fontWeight: 800, marginBottom: 8 }}>Single point of truth daily log (prefilled)</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Date</div>
                  <input value={logDraft.date} onChange={(event) => setLogDraft((current) => ({ ...current, date: event.target.value }))} style={inputStyle} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Weather</div>
                  <input value={logDraft.weather} onChange={(event) => setLogDraft((current) => ({ ...current, weather: event.target.value }))} style={inputStyle} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Zone focus</div>
                  <input value={logDraft.zone || ""} onChange={(event) => setLogDraft((current) => ({ ...current, zone: event.target.value }))} placeholder="Zone A" style={inputStyle} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Superintendent note</div>
                  <input value={logDraft.notes} onChange={(event) => setLogDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Sub A seemed short-handed today" style={inputStyle} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Safety / incidents</div>
                  <input value={(logDraft.safety || []).join(" | ")} onChange={(event) => setLogDraft((current) => ({ ...current, safety: event.target.value.split("|").map((v) => v.trim()).filter(Boolean) }))} style={inputStyle} />
                </label>
                <label>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>Sign-off by</div>
                  <input value={logDraft.signedOffBy || ""} onChange={(event) => setLogDraft((current) => ({ ...current, signedOffBy: event.target.value }))} placeholder="Superintendent name" style={inputStyle} />
                </label>
              </div>

              <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.6 }}>
                <div><strong>Prefilled progress:</strong> {(logDraft.progress || []).join("; ") || "No completed tasks yet."}</div>
                <div><strong>Prefilled subcontractor work:</strong> {(logDraft.subcontractorWork || []).join("; ") || "No active schedule entries."}</div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <button type="button" style={actionBtn} onClick={signOffDailyLog}>One-click review + sign-off</button>
                <button type="button" style={actionBtn} onClick={publishLessonsLearned}>Push lessons learned to estimating</button>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            <FieldPhotoCapture onCapture={handleCapture} busy={busy} author={session?.email || "field-supervisor"} />

            <div style={card}>
              <div style={{ fontWeight: 800, marginBottom: 10 }}>Visual mapping and digital pin actions</div>
              <label style={{ display: "block", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Plan file</div>
                <select value={fileId} onChange={(event) => setFileId(event.target.value)} style={inputStyle}>
                  <option value="">Select plan file</option>
                  {planFiles.map((file) => (
                    <option key={file.fileId || file.id} value={file.fileId || file.id}>{file.name}</option>
                  ))}
                </select>
              </label>
              <label style={{ display: "block", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Sheet ID</div>
                <input value={sheetId} onChange={(event) => setSheetId(event.target.value)} placeholder="SHT-001" style={inputStyle} />
              </label>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runCompare}>Visual progress compare</button>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runAutoRedline}>Auto redlines</button>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={runAuricruxFeedback}>Auricrux feedback</button>
                <button type="button" style={actionBtn} disabled={busy || !selectedPhoto} onClick={markLoadedToAuricruxDb}>Load to Auricrux DB</button>
              </div>

              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Instant RFI/Punch from digital pin</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                  <select value={digitalPin.pinType} onChange={(event) => setDigitalPin((current) => ({ ...current, pinType: event.target.value }))} style={inputStyle}>
                    <option value="RFI">RFI</option>
                    <option value="Punch">Punch</option>
                  </select>
                  <input value={digitalPin.zone} onChange={(event) => setDigitalPin((current) => ({ ...current, zone: event.target.value }))} placeholder="Zone" style={inputStyle} />
                  <input value={digitalPin.detail} onChange={(event) => setDigitalPin((current) => ({ ...current, detail: event.target.value }))} placeholder="Issue detail" style={inputStyle} />
                </div>
                <button type="button" style={{ ...actionBtn, marginTop: 8 }} onClick={launchDigitalPinAction} disabled={busy || !digitalPin.detail.trim()}>
                  Launch digital pin action
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <select
                  value={exportFormat}
                  onChange={(event) => setExportFormat(event.target.value)}
                  style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", fontWeight: 700 }}
                  aria-label="As-built export format"
                >
                  {FCA_MINIMUM_OUTPUT_FORMAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button type="button" style={actionBtn} disabled={!selectedPhoto} onClick={exportAsBuiltPackage}>Export as-built package</button>
              </div>
            </div>
          </div>

          <div style={{ ...card, marginTop: 12, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Safety and compliance monitoring (badge/NFC log)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              <input value={badgeScan.worker} onChange={(event) => setBadgeScan((current) => ({ ...current, worker: event.target.value }))} placeholder="Worker badge ID / email" style={inputStyle} />
              <input value={badgeScan.taskLabel} onChange={(event) => setBadgeScan((current) => ({ ...current, taskLabel: event.target.value }))} placeholder="Assigned work" style={inputStyle} />
              <input value={badgeScan.requiredCertification} onChange={(event) => setBadgeScan((current) => ({ ...current, requiredCertification: event.target.value }))} placeholder="Required cert (optional)" style={inputStyle} />
            </div>
            <button type="button" style={{ ...actionBtn, marginTop: 8 }} onClick={scanBadge}>Scan badge</button>
            <div style={{ display: "grid", gap: 6, marginTop: 10, maxHeight: 180, overflowY: "auto" }}>
              {badgeLog.filter((entry) => entry.projectId === projectId).slice(0, 8).map((entry) => (
                <div key={entry.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, background: entry.authorized ? "#f0fdf4" : "#fef2f2", color: entry.authorized ? "#166534" : "#991b1b" }}>
                  {entry.worker} · {entry.taskLabel || "task"} · {entry.requiredCertification} · {entry.authorized ? "Authorized" : "Blocked"}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Voice note communication orchestration</div>
            <textarea value={voiceNote} onChange={(event) => setVoiceNote(event.target.value)} rows={3} placeholder="Record superintendent note... e.g., PM should resequence concrete pour, engineer must clarify embed detail in Zone B." style={{ ...inputStyle, minHeight: 90 }} />
            <div style={{ marginTop: 8, color: "#475569" }}>
              <strong>Detected action items:</strong> {actionItems.length}
            </div>
            {actionItems.length ? (
              <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                {actionItems.map((item, index) => (
                  <div key={`${item.queue}-${index}`} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, background: "#f8fafc" }}>
                    {item.queue.toUpperCase()} → {item.audience}: {item.detail}
                  </div>
                ))}
              </div>
            ) : null}
            <button type="button" style={{ ...actionBtn, marginTop: 8 }} onClick={pushActionItems} disabled={busy || !actionItems.length}>Route action items</button>
          </div>

          {error ? <div style={{ ...card, marginTop: 16, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div> : null}
          {notice ? <div style={{ ...card, marginTop: 16, color: "#166534", borderColor: "#86efac", background: "#ecfdf5" }}>{notice}</div> : null}

          {selectedPhoto ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginTop: 16 }}>
              <div style={card}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>{selectedPhoto.notes || "Field photo"}</div>
                <FieldPhotoAnnotator imageUrl={imageUrl} annotations={selectedPhoto.annotations || []} onChange={saveAnnotations} />
                {selectedPhoto.auricruxFeedback ? (
                  <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", lineHeight: 1.7 }}>
                    <strong>Auricrux:</strong> {selectedPhoto.auricruxFeedback}
                  </div>
                ) : null}
              </div>
              <div style={{ display: "grid", gap: 16 }}>
                <PlanComparePanel photo={selectedPhoto} onOpenDesign={(photo) => {
                  window.location.href = `/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(photo.fileId)}&sheetId=${encodeURIComponent(photo.sheetId)}`;
                }} />
                <div style={card}>
                  <div style={{ fontWeight: 800, marginBottom: 8 }}>Photo register ({photos.length})</div>
                  {loading ? <div>Loading...</div> : null}
                  <div style={{ display: "grid", gap: 8, maxHeight: 280, overflowY: "auto" }}>
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        onClick={() => setSelectedPhotoId(photo.id)}
                        style={{
                          ...actionBtn,
                          textAlign: "left",
                          borderColor: photo.id === selectedPhotoId ? "#2563eb" : "#cbd5e1",
                          background: photo.id === selectedPhotoId ? "#eff6ff" : "#fff",
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{photo.notes || photo.id}</div>
                        <div style={{ fontSize: 12, color: "#64748b" }}>{photo.compareStatus || "pending"} · {photo.redlineIds?.length || 0} redline(s)</div>
                      </button>
                    ))}
                  </div>
                </div>
                {redlines.length ? (
                  <div style={card}>
                    <div style={{ fontWeight: 800, marginBottom: 8 }}>Redlines ({redlines.length})</div>
                    {redlines.slice(0, 6).map((redline) => (
                      <div key={redline.id} style={{ fontSize: 13, color: "#475569", marginBottom: 6 }}>{redline.label} · {redline.status}</div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </PortalShell>
  );
}
