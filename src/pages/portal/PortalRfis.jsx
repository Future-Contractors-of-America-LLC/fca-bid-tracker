import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  createChangeOrder,
  createProjectRfi,
  fetchProjectRfis,
  respondProjectRfi,
} from "../../api/constructionClient";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { fetchWorkflowAudit, fetchWorkflowFiles } from "../../api/workflowClient";
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

const RFI_MODEL_PINS_KEY = "fca_model_integrated_rfi_pins_v1";
const RFI_ESCALATIONS_KEY = "fca_rfi_sla_escalations_v1";
const PLATFORM_ALERTS_KEY = "fca_platform_alerts_v1";
const DEFAULT_SLA_DAYS = 3;

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
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysBetween(startIso, endIso = new Date().toISOString()) {
  const start = parseDate(startIso);
  const end = parseDate(endIso);
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function scoreTextMatch(query, haystack) {
  const q = normalize(query);
  const h = normalize(haystack);
  if (!q || !h) return 0;
  const tokens = q.split(" ").filter((token) => token.length > 2);
  if (!tokens.length) return 0;
  return tokens.reduce((score, token) => score + (h.includes(token) ? 1 : 0), 0);
}

function inferCategory(question) {
  const q = normalize(question);
  if (/missing|not shown|detail missing|not indicated/.test(q)) return "Missing Information";
  if (/existing|field condition|as built|unknown condition/.test(q)) return "Field Condition";
  if (/conflict|discrepancy|coordination|clash|does not match/.test(q)) return "Design Discrepancy";
  return "General Coordination";
}

function inferDiscipline(question, files = []) {
  const q = normalize(question);
  if (/steel|structural|beam|column|connection|rebar/.test(q)) return "Structural";
  if (/paint|finish|architect|door|ceiling|interior/.test(q)) return "Architectural";
  if (/mep|mechanical|electrical|plumbing|hvac|duct|conduit/.test(q)) return "MEP";
  const fileMatch = (files || []).find((file) => {
    const discipline = normalize(file.discipline);
    return discipline && q.includes(discipline);
  });
  return fileMatch?.discipline || "General";
}

function routeAssignee(discipline) {
  if (discipline === "Structural") return "Structural Engineer";
  if (discipline === "Architectural") return "Architect";
  if (discipline === "MEP") return "MEP Engineer";
  return "Project Engineer";
}

function findBestTaskLink(question, tasks = []) {
  let best = null;
  let bestScore = 0;
  for (const task of tasks || []) {
    const score = scoreTextMatch(question, `${task.task || ""} ${task.note || ""} ${task.assignee || ""}`);
    if (score > bestScore) {
      best = task;
      bestScore = score;
    }
  }
  return best || tasks?.[0] || null;
}

function findBestPlanLink(sheet, files = []) {
  const planFiles = (files || []).filter((file) => {
    const text = normalize(`${file.category || ""} ${file.name || ""}`);
    return text.includes("drawing") || text.includes("sheet") || text.includes("plan");
  });
  if (!planFiles.length) return null;
  if (!sheet) return planFiles[0];
  return planFiles.find((file) => normalize(file.name).includes(normalize(sheet))) || planFiles[0];
}

function buildAIDraftResponse(rfi, specFiles = []) {
  const references = specFiles.slice(0, 3).map((file) => file.name || file.fileId || "specification").join(", ");
  return [
    `Reviewed ${rfi.number || rfi.id} for ${rfi.category || "coordination"}.`,
    "Design intent has been reconciled against the governing model and construction documents.",
    references ? `Reference set: ${references}.` : "Reference set: governing specification and code references.",
    "Proceed per attached clarification and update field sequencing if required.",
  ].join(" ");
}

function findDuplicateCandidates(question, rfis = [], auditEvents = [], files = []) {
  const suggestions = [];
  for (const rfi of rfis) {
    const score = scoreTextMatch(question, `${rfi.question || ""} ${rfi.response || ""}`);
    if (score >= 2) {
      suggestions.push({ type: "RFI", id: rfi.id, title: rfi.number || rfi.id, detail: rfi.response || rfi.question || "Potential duplicate", score });
    }
  }
  for (const event of auditEvents) {
    const score = scoreTextMatch(question, `${event.detail || ""} ${event.reason || ""} ${event.eventType || ""}`);
    if (score >= 2) {
      suggestions.push({ type: "Audit", id: event.id || event.eventId, title: event.eventType || "Audit event", detail: event.detail || event.reason || "Matching event", score });
    }
  }
  for (const file of files) {
    const score = scoreTextMatch(question, `${file.name || ""} ${file.note || ""} ${file.discipline || ""}`);
    if (score >= 2) {
      suggestions.push({ type: "Spec", id: file.fileId || file.id, title: file.name || "Spec", detail: file.note || file.discipline || "Matching specification", score });
    }
  }
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

function isAnswered(rfi) {
  return rfi.recordStatus === "answered" || rfi.status === "answered" || Boolean(rfi.response);
}

export default function PortalRfis() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState([]);
  const [responseDrafts, setResponseDrafts] = useState({});
  const [draft, setDraft] = useState({
    question: "",
    bimCoordinate: "",
    bimObjectId: "",
    drawingSheet: "",
    potentialCostImpact: "",
  });
  const [duplicateSuggestions, setDuplicateSuggestions] = useState([]);
  const [modelPins, setModelPins] = useState(() => readLocalJson(RFI_MODEL_PINS_KEY, []));
  const [slaEscalations, setSlaEscalations] = useState(() => readLocalJson(RFI_ESCALATIONS_KEY, {}));
  const [platformAlerts, setPlatformAlerts] = useState(() => readLocalJson(PLATFORM_ALERTS_KEY, []));

  const filesLoad = usePortalApiLoad(() => (hasProject ? fetchWorkflowFiles({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const auditLoad = usePortalApiLoad(() => (hasProject ? fetchWorkflowAudit({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const tasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const scheduleLoad = usePortalApiLoad(() => (hasProject ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  const files = filesLoad.data?.items || [];
  const auditEvents = auditLoad.data?.items || [];
  const fieldTasks = tasksLoad.data?.items || [];
  const scheduleItems = scheduleLoad.data?.items || [];
  const messages = messagesLoad.data?.items || messagesLoad.data?.drafts?.sent || [];

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = normalize(searchQuery);
    return items.filter((rfi) => normalize(`${rfi.number || ""} ${rfi.question || ""} ${rfi.response || ""} ${rfi.category || ""} ${rfi.discipline || ""}`).includes(q));
  }, [items, searchQuery]);

  const trendSummary = useMemo(() => {
    const byCategory = {};
    const byDiscipline = {};
    for (const rfi of items) {
      const category = rfi.category || inferCategory(rfi.question);
      const discipline = rfi.discipline || inferDiscipline(rfi.question, files);
      byCategory[category] = (byCategory[category] || 0) + 1;
      byDiscipline[discipline] = (byDiscipline[discipline] || 0) + 1;
    }
    return { byCategory, byDiscipline };
  }, [files, items]);

  const slaSummary = useMemo(() => {
    const breached = [];
    for (const rfi of items) {
      const createdAt = rfi.createdAt || rfi.created_at || rfi.updatedAt || new Date().toISOString();
      const responseAt = rfi.respondedAt || rfi.closedAt || rfi.updatedAt || new Date().toISOString();
      const responseDays = isAnswered(rfi) ? daysBetween(createdAt, responseAt) : daysBetween(createdAt, new Date().toISOString());
      if (responseDays > DEFAULT_SLA_DAYS) breached.push({ ...rfi, responseDays });
    }
    return {
      open: items.filter((rfi) => !isAnswered(rfi)).length,
      breached,
    };
  }, [items]);

  useEffect(() => {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchProjectRfis(projectId)
      .then((rfis) => {
        setItems((rfis || []).map((rfi) => ({
          ...rfi,
          category: rfi.category || inferCategory(rfi.question),
          discipline: rfi.discipline || inferDiscipline(rfi.question, files),
        })));
      })
      .catch((err) => setError(err.message || "Unable to load RFIs."))
      .finally(() => setLoading(false));
  }, [files, hasProject, projectId]);

  useEffect(() => {
    if (!draft.question.trim()) {
      setDuplicateSuggestions([]);
      return;
    }
    setDuplicateSuggestions(findDuplicateCandidates(draft.question, items, auditEvents, files));
  }, [auditEvents, draft.question, files, items]);

  useEffect(() => {
    writeLocalJson(RFI_MODEL_PINS_KEY, modelPins);
  }, [modelPins]);

  useEffect(() => {
    writeLocalJson(RFI_ESCALATIONS_KEY, slaEscalations);
  }, [slaEscalations]);

  useEffect(() => {
    writeLocalJson(PLATFORM_ALERTS_KEY, platformAlerts);
  }, [platformAlerts]);

  useEffect(() => {
    const mepCount = trendSummary.byDiscipline.MEP || 0;
    const total = items.length;
    if (!total) return;
    const ratio = mepCount / total;
    if (ratio < 0.4) return;
    const alert = {
      id: `mep-spike-${projectId}`,
      projectId,
      type: "RFI Trend",
      message: "Spike detected in MEP coordination RFIs. Schedule a proactive design review.",
      createdAt: new Date().toISOString(),
    };
    setPlatformAlerts((current) => {
      const filtered = current.filter((item) => item.id !== alert.id);
      return [alert, ...filtered].slice(0, 40);
    });
  }, [items.length, projectId, trendSummary.byDiscipline.MEP]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function computeImpactDays(rfi) {
    if (isAnswered(rfi)) return 0;
    const baseline = rfi.linkedTaskDueDate || rfi.linkedScheduleDate || rfi.createdAt || rfi.updatedAt;
    return daysBetween(baseline, new Date().toISOString());
  }

  async function escalateSla(rfi, reason) {
    const key = `${projectId}:${rfi.id}`;
    if (slaEscalations[key]) return;
    await sendPortalMessage({
      channel: "teams",
      subject: `RFI SLA Escalation ${rfi.number || rfi.id}`,
      message: `Project Director escalation. ${rfi.number || rfi.id} exceeded ${DEFAULT_SLA_DAYS}-day SLA. ${reason}`,
    }).catch(() => null);
    setSlaEscalations((current) => ({ ...current, [key]: new Date().toISOString() }));
  }

  async function handleCreateRfi(event) {
    event.preventDefault();
    if (!hasProject || !draft.question.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const discipline = inferDiscipline(draft.question, files);
      const category = inferCategory(draft.question);
      const assigneeRole = routeAssignee(discipline);
      const linkedTask = findBestTaskLink(draft.question, fieldTasks);
      const linkedSchedule = (scheduleItems || []).find((item) => scoreTextMatch(linkedTask?.task || "", `${item.title || ""} ${item.project || ""}`) > 0) || scheduleItems[0] || null;
      const linkedPlan = findBestPlanLink(draft.drawingSheet, files);

      const created = await createProjectRfi(projectId, {
        number: `RFI-${Date.now().toString().slice(-6)}`,
        question: draft.question.trim(),
        category,
        discipline,
        assigneeRole,
        bimCoordinate: draft.bimCoordinate,
        bimObjectId: draft.bimObjectId,
        drawingSheet: draft.drawingSheet,
        potentialCostImpact: draft.potentialCostImpact || "$0",
        linkedTaskId: linkedTask?.taskId || linkedTask?.id || "",
        linkedTaskDueDate: linkedTask?.dueDate || "",
        linkedScheduleDate: linkedSchedule?.date || "",
        linkedPlanFileId: linkedPlan?.fileId || linkedPlan?.id || "",
        linkedPlanName: linkedPlan?.name || "",
        sourceRoute: "/portal/rfis",
      });

      const modelPin = {
        id: `pin-${created.id || created.rfiId || Date.now()}`,
        projectId,
        rfiId: created.id || created.rfiId,
        rfiNumber: created.number || created.id || created.rfiId,
        coordinate: draft.bimCoordinate,
        objectId: draft.bimObjectId,
        sheetId: draft.drawingSheet,
        fileId: linkedPlan?.fileId || linkedPlan?.id || "",
        createdAt: new Date().toISOString(),
      };
      setModelPins((current) => [modelPin, ...current].slice(0, 400));

      setItems((current) => [{
        ...created,
        category,
        discipline,
        assigneeRole,
        bimCoordinate: draft.bimCoordinate,
        bimObjectId: draft.bimObjectId,
        drawingSheet: draft.drawingSheet,
        potentialCostImpact: draft.potentialCostImpact || "$0",
        linkedTaskId: linkedTask?.taskId || linkedTask?.id || "",
        linkedTaskDueDate: linkedTask?.dueDate || "",
        linkedScheduleDate: linkedSchedule?.date || "",
        linkedPlanFileId: linkedPlan?.fileId || linkedPlan?.id || "",
        linkedPlanName: linkedPlan?.name || "",
      }, ...current]);

      setDraft({ question: "", bimCoordinate: "", bimObjectId: "", drawingSheet: "", potentialCostImpact: "" });
      setNotice(`RFI created and auto-routed to ${assigneeRole}. Model pin, plan, and task links are active.`);
    } catch (err) {
      setError(err.message || "Unable to create RFI.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRespond(rfi) {
    const response = (responseDrafts[rfi.id]?.response || "").trim();
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

      const triggerCo = Boolean(responseDrafts[rfi.id]?.createChangeOrder);
      const impact = toNumber(rfi.potentialCostImpact || 0);
      if (triggerCo || impact > 0) {
        await createChangeOrder({
          projectId,
          title: `CO from ${rfi.number || rfi.id}`,
          amount: formatUsd(impact),
          reason: responseDrafts[rfi.id]?.changeReason || `RFI ${rfi.number || rfi.id} resolution impacted scope.`,
          linkedRfiId: rfi.id,
          sourceRoute: "/portal/rfis",
        }).catch(() => null);
      }

      const responseDays = daysBetween(rfi.createdAt || rfi.updatedAt || new Date().toISOString(), new Date().toISOString());
      if (responseDays > DEFAULT_SLA_DAYS) {
        await escalateSla(rfi, `Response time ${responseDays} days.`);
      }

      setNotice(`Response saved for ${rfi.number || rfi.id}.`);
    } catch (err) {
      setError(err.message || "Unable to save RFI response.");
    } finally {
      setBusy(false);
    }
  }

  function handleGenerateDraft(rfi) {
    const specFiles = files.filter((file) => normalize(`${file.category || ""} ${file.name || ""}`).includes("spec"));
    const suggestion = buildAIDraftResponse(rfi, specFiles);
    setResponseDrafts((current) => ({
      ...current,
      [rfi.id]: {
        ...(current[rfi.id] || {}),
        response: suggestion,
      },
    }));
    setNotice(`Auricrux drafted response for ${rfi.number || rfi.id}.`);
  }

  function runSemanticSearch() {
    const query = semanticQuery.trim();
    if (!query) {
      setSemanticResults([]);
      return;
    }
    const results = [];

    for (const rfi of items) {
      const score = scoreTextMatch(query, `${rfi.number || ""} ${rfi.question || ""} ${rfi.response || ""}`);
      if (score > 0) {
        results.push({
          type: "RFI",
          title: rfi.number || rfi.id,
          detail: rfi.question || "",
          score,
          href: `/portal/rfis?projectId=${encodeURIComponent(projectId)}&rfiId=${encodeURIComponent(rfi.id || "")}`,
        });
      }
    }

    for (const file of files) {
      const hay = `${file.name || ""} ${file.note || ""} ${file.category || ""}`;
      const score = scoreTextMatch(query, hay);
      const isFieldPhoto = normalize(hay).includes("photo") || normalize(hay).includes("field condition");
      if (score > 0 && isFieldPhoto) {
        results.push({
          type: "Field Photo",
          title: file.name || file.fileId || "Photo",
          detail: file.note || file.category || "",
          score,
          href: `/portal/files?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(file.fileId || file.id || "")}`,
        });
      }
    }

    for (const message of messages) {
      const score = scoreTextMatch(query, `${message.subject || ""} ${message.message || ""}`);
      if (score > 0) {
        results.push({
          type: "Message Thread",
          title: message.subject || "Message",
          detail: message.message || "",
          score,
          href: "/portal/messages",
        });
      }
    }

    setSemanticResults(results.sort((a, b) => b.score - a.score).slice(0, 8));
  }

  return (
    <PortalShell
      title="RFI Orchestration"
      subtitle="Model-integrated RFIs with SLA, impact, and commercial continuity controls."
      activeHref="/portal/rfis"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={`/portal/projects/${encodeURIComponent(projectId)}`}
      primaryLabel="Project home"
    >
      <AuricruxInsightPanel
        title="Auricrux RFI Copilot"
        targetObjectId={projectId}
        nextAction={items.length ? "Resolve highest impact/SLA risk RFIs and auto-route by discipline." : "Create model-integrated RFI with BIM pin and delay impact mapping."}
        actionHref="/portal/design"
        actionLabel="Open Design Workspace"
        tone="blue"
      />

      {platformAlerts.find((alert) => alert.projectId === projectId) ? (
        <div style={{ ...card, marginBottom: 12, borderColor: "#fcd34d", background: "#fffbeb", color: "#92400e" }}>
          <strong>Trend alert:</strong> {platformAlerts.find((alert) => alert.projectId === projectId)?.message}
          <div style={{ marginTop: 8 }}>
            <a href="/portal/platform" style={{ color: "#92400e", fontWeight: 700 }}>Open Platform Dashboard</a>
          </div>
        </div>
      ) : null}

      {!hasProject ? <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to manage RFIs.</div> : null}

      {hasProject ? (
        <div style={{ ...card, marginBottom: 12, borderColor: "#dbeafe", background: "#eff6ff" }}>
          <div style={{ fontWeight: 800, color: "#1d4ed8", marginBottom: 8 }}>Enterprise SLA + Delay Intelligence</div>
          <div style={{ color: "#334155", lineHeight: 1.7 }}>
            <div><strong>SLA target:</strong> {DEFAULT_SLA_DAYS} days</div>
            <div><strong>Open RFIs:</strong> {slaSummary.open}</div>
            <div><strong>SLA breaches:</strong> {slaSummary.breached.length}</div>
            <div><strong>Top categories:</strong> {Object.entries(trendSummary.byCategory).slice(0, 3).map(([key, value]) => `${key} (${value})`).join(" · ") || "None"}</div>
          </div>
        </div>
      ) : null}

      {hasProject ? (
        <form onSubmit={handleCreateRfi} style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Create model-integrated RFI</div>
          <textarea
            value={draft.question}
            onChange={(event) => updateDraft("question", event.target.value)}
            rows={3}
            placeholder="Describe the coordination question..."
            style={inputStyle}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
            <input value={draft.bimCoordinate} onChange={(event) => updateDraft("bimCoordinate", event.target.value)} placeholder="BIM coordinate (x,y,z)" style={inputStyle} />
            <input value={draft.bimObjectId} onChange={(event) => updateDraft("bimObjectId", event.target.value)} placeholder="Model object ID" style={inputStyle} />
            <input value={draft.drawingSheet} onChange={(event) => updateDraft("drawingSheet", event.target.value)} placeholder="Drawing sheet (A-201)" style={inputStyle} />
            <input value={draft.potentialCostImpact} onChange={(event) => updateDraft("potentialCostImpact", event.target.value)} placeholder="Potential cost impact ($)" style={inputStyle} />
          </div>

          {duplicateSuggestions.length ? (
            <div style={{ marginTop: 10, border: "1px solid #fed7aa", borderRadius: 10, padding: 10, background: "#fff7ed", color: "#9a3412" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Auricrux duplicate guard</div>
              <div style={{ display: "grid", gap: 6 }}>
                {duplicateSuggestions.map((item) => (
                  <div key={`${item.type}-${item.id}`} style={{ border: "1px solid #fdba74", borderRadius: 8, padding: 8, background: "#fff" }}>
                    <div style={{ fontWeight: 700 }}>{item.type}: {item.title}</div>
                    <div style={{ fontSize: 13 }}>{item.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <button type="submit" disabled={busy || !draft.question.trim()} style={{ marginTop: 10, border: "none", borderRadius: 8, padding: "10px 14px", background: "#1d4ed8", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            {busy ? "Saving..." : "Create RFI"}
          </button>
        </form>
      ) : null}

      {notice ? <div style={{ ...card, color: "#166534", borderColor: "#bbf7d0", background: "#f0fdf4", marginBottom: 12 }}>{notice}</div> : null}
      {error ? <div style={{ ...card, color: "#991b1b", borderColor: "#fecaca", background: "#fef2f2", marginBottom: 12 }}>{error}</div> : null}
      {loading ? <div style={card}>Loading RFIs...</div> : null}

      {hasProject ? (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Natural-language knowledge query</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              value={semanticQuery}
              onChange={(event) => setSemanticQuery(event.target.value)}
              placeholder="What was the resolution regarding the elevator shaft headroom?"
              style={{ ...inputStyle, flex: 1, minWidth: 280 }}
            />
            <button type="button" onClick={runSemanticSearch} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px", background: "#fff", fontWeight: 700, cursor: "pointer" }}>
              Search
            </button>
          </div>
          {semanticResults.length ? (
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {semanticResults.map((result) => (
                <a key={`${result.type}-${result.title}-${result.score}`} href={result.href} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, textDecoration: "none", color: "#334155", background: "#f8fafc" }}>
                  <div style={{ fontWeight: 700 }}>{result.type}: {result.title}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{result.detail}</div>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasProject ? (
        <div style={{ ...card, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Search RFI register</div>
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by number, question, response, category, discipline" style={inputStyle} />
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 12 }}>
        {filteredItems.map((rfi) => {
          const answered = isAnswered(rfi);
          const createdAt = rfi.createdAt || rfi.updatedAt || new Date().toISOString();
          const responseDays = answered
            ? daysBetween(createdAt, rfi.respondedAt || rfi.updatedAt || new Date().toISOString())
            : daysBetween(createdAt, new Date().toISOString());
          const slaBreached = responseDays > DEFAULT_SLA_DAYS;
          const impactDays = computeImpactDays(rfi);

          const modelPinHref = `/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(rfi.linkedPlanFileId || "")}&sheetId=${encodeURIComponent(rfi.drawingSheet || "")}`;
          const planHref = rfi.linkedPlanFileId
            ? `/portal/plans?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(rfi.linkedPlanFileId)}`
            : `/portal/plans?projectId=${encodeURIComponent(projectId)}`;
          const taskHref = rfi.linkedTaskId
            ? `/portal/field-tasks?projectId=${encodeURIComponent(projectId)}&taskId=${encodeURIComponent(rfi.linkedTaskId)}`
            : `/portal/field-tasks?projectId=${encodeURIComponent(projectId)}`;

          return (
            <div key={rfi.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 800 }}>{rfi.number || rfi.id}</div>
                <span style={{ color: answered ? "#166534" : "#b45309", fontWeight: 700, fontSize: 13 }}>{answered ? "Answered" : "Open"}</span>
              </div>

              <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
                {rfi.category || inferCategory(rfi.question)} · {rfi.discipline || inferDiscipline(rfi.question, files)} · Routed to {rfi.assigneeRole || routeAssignee(rfi.discipline || inferDiscipline(rfi.question, files))}
              </div>
              <div style={{ color: "#475569", marginTop: 8, lineHeight: 1.7 }}>{rfi.question}</div>

              <div style={{ marginTop: 10, border: "1px solid #dbeafe", background: "#eff6ff", borderRadius: 10, padding: 10, color: "#1e3a8a", lineHeight: 1.6 }}>
                <div><strong>BIM coordinate:</strong> {rfi.bimCoordinate || "Not captured"}</div>
                <div><strong>Object ID:</strong> {rfi.bimObjectId || "Not captured"}</div>
                <div><strong>Drawing sheet:</strong> {rfi.drawingSheet || "Not captured"}</div>
                <div><strong>Potential cost impact:</strong> {rfi.potentialCostImpact || "$0"}</div>
                <div><strong>Impact days:</strong> {impactDays}</div>
                <div><strong>Response time:</strong> {responseDays} day(s)</div>
                <div><strong>SLA status:</strong> {slaBreached ? "Breach" : "Within SLA"}</div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                <a href={modelPinHref} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>Open model pin</a>
                <a href={planHref} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>Open linked plan set</a>
                <a href={taskHref} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>Open delayed field task</a>
                <a href={`/portal/scheduling?projectId=${encodeURIComponent(projectId)}`} style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", textDecoration: "none", color: "#334155", fontWeight: 700 }}>Open schedule baseline</a>
              </div>

              {rfi.response ? (
                <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", lineHeight: 1.6 }}>
                  <strong>Response:</strong> {rfi.response}
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <label style={{ fontWeight: 600, fontSize: 14 }}>Official response</label>
                  <textarea
                    rows={2}
                    value={responseDrafts[rfi.id]?.response || ""}
                    onChange={(event) => setResponseDrafts((current) => ({ ...current, [rfi.id]: { ...(current[rfi.id] || {}), response: event.target.value } }))}
                    placeholder="Document the answer for the project record..."
                    style={{ ...inputStyle, marginTop: 6 }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8, marginTop: 8 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#334155" }}>
                      <input
                        type="checkbox"
                        checked={Boolean(responseDrafts[rfi.id]?.createChangeOrder)}
                        onChange={(event) => setResponseDrafts((current) => ({ ...current, [rfi.id]: { ...(current[rfi.id] || {}), createChangeOrder: event.target.checked } }))}
                      />
                      Trigger change order from this resolution
                    </label>
                    <input
                      value={responseDrafts[rfi.id]?.changeReason || ""}
                      onChange={(event) => setResponseDrafts((current) => ({ ...current, [rfi.id]: { ...(current[rfi.id] || {}), changeReason: event.target.value } }))}
                      placeholder="Change order reason"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    <button type="button" onClick={() => handleGenerateDraft(rfi)} disabled={busy} style={{ border: "1px solid #2563eb", borderRadius: 8, padding: "8px 12px", background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, cursor: "pointer" }}>
                      Auricrux draft response
                    </button>
                    <button type="button" onClick={() => handleRespond(rfi)} disabled={busy} style={{ border: "none", borderRadius: 8, padding: "8px 12px", background: "#166534", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                      Save response
                    </button>
                    {slaBreached ? (
                      <button
                        type="button"
                        onClick={() => escalateSla(rfi, `Open for ${responseDays} days.`)}
                        disabled={busy || Boolean(slaEscalations[`${projectId}:${rfi.id}`])}
                        style={{ border: "1px solid #b91c1c", borderRadius: 8, padding: "8px 12px", background: "#fef2f2", color: "#b91c1c", fontWeight: 700, cursor: "pointer" }}
                      >
                        {slaEscalations[`${projectId}:${rfi.id}`] ? "Escalated" : "Escalate to Project Director"}
                      </button>
                    ) : null}
                  </div>
                </div>
              )}

              <div style={{ color: "#64748b", fontSize: 13, marginTop: 8 }}>
                Project {rfi.projectId} · {rfi.recordStatus || rfi.status || "open"} · {rfi.assigneeRole || "Unassigned"}
              </div>
            </div>
          );
        })}

        {!loading && !filteredItems.length && hasProject ? <div style={card}>No RFIs for {projectId} yet.</div> : null}
      </div>
    </PortalShell>
  );
}
