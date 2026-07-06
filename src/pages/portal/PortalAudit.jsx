import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import PortalSliceAuricrux from "../../components/portal/PortalSliceAuricrux";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowAudit from "../../hooks/useWorkflowAudit";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import { routeStateOverlays } from "../../systemState";
import { adminGovernance } from "../../adminGovernance";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalInputStyle } from "../../portalDesignTokens";
import { fetchChangeOrders, fetchProjectRfis } from "../../api/constructionClient";
import { fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchPortalInvoices, sendPortalMessage } from "../../api/portalClient";
import { listTriadEvents, subscribeTriadEvents } from "../../triadFlywheel";
import { PortalAlert } from "../../components/portal/PortalPrimitives";

const FORENSIC_EVENTS_KEY = "fca_audit_forensic_events_v1";
const AUDIT_ALERT_ACK_KEY = "fca_audit_alert_ack_v1";
const DEVICE_ID_KEY = "fca_audit_device_id_v1";

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

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function isoNow() {
  return new Date().toISOString();
}

function quarterOf(dateValue) {
  const date = new Date(dateValue || Date.now());
  return Math.floor(date.getMonth() / 3) + 1;
}

function yearOf(dateValue) {
  const date = new Date(dateValue || Date.now());
  return date.getFullYear();
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","));
  return [headers.join(","), ...body].join("\n");
}

function downloadFile(fileName, content, mimeType = "application/json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(href);
}

function simpleHashHex(input) {
  let hash = 2166136261;
  const text = String(input || "");
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

async function sha256Hex(input) {
  const text = String(input || "");
  if (typeof window !== "undefined" && window.crypto?.subtle) {
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return simpleHashHex(text);
}

function getDeviceId() {
  if (typeof window === "undefined") return "device-server";
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = `fca-device-${Math.random().toString(16).slice(2, 12)}`;
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function normalizeWorkflowEvent(event, index) {
  const ts = event.createdAt || event.timestamp || event.time || isoNow();
  return {
    id: event.id || event.eventId || `workflow-${index + 1}`,
    eventType: event.eventType || "workflow-event",
    action: event.action || event.detail || "Workflow state changed",
    reason: event.reason || "",
    priorState: event.priorState || event.before || "",
    newState: event.newState || event.after || event.detail || "",
    actorId: event.actorId || event.actor || event.actorType || "unknown",
    actorType: event.actorType || "system",
    userId: event.userId || event.actorId || event.actor || "unknown",
    timestamp: ts,
    ipAddress: event.ipAddress || "gateway-captured",
    deviceId: event.deviceId || "not-provided",
    source: "workflow-audit",
    immutable: false,
  };
}

function normalizeForensicEvent(event) {
  return {
    ...event,
    source: "forensic-spine",
    immutable: true,
  };
}

function buildSemanticResult(event, why, score) {
  return {
    id: event.id,
    score,
    why,
    eventType: event.eventType,
    action: event.action,
    actor: event.userId || event.actorId || "unknown",
    timestamp: event.timestamp,
    priorState: event.priorState,
    newState: event.newState,
  };
}

function matchesAny(text, terms) {
  const hay = normalize(text);
  return terms.some((term) => hay.includes(normalize(term)));
}

export default function PortalAudit() {
  const { projectId, hasProject } = usePortalProjectId();
  const { state } = useWorkspaceState();
  const { files } = useWorkflowEvidence(projectId);
  const { auditEvents, meta, filters, setFilters, refreshAudit } = useWorkflowAudit(projectId);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [semanticQuery, setSemanticQuery] = useState("");
  const [semanticResults, setSemanticResults] = useState([]);
  const [lastReport, setLastReport] = useState("");
  const [gateResult, setGateResult] = useState(null);
  const [forensicEvents, setForensicEvents] = useState(() => readLocalJson(FORENSIC_EVENTS_KEY, []));
  const [alertAck, setAlertAck] = useState(() => readLocalJson(AUDIT_ALERT_ACK_KEY, {}));
  const [hashChain, setHashChain] = useState([]);
  const [triadEvents, setTriadEvents] = useState(() => listTriadEvents(120));

  const changeOrdersLoad = usePortalApiLoad(() => (hasProject ? fetchChangeOrders(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const rfisLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const fieldTasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);

  const changeOrders = changeOrdersLoad.data?.items || [];
  const rfis = rfisLoad.data || [];
  const fieldTasks = fieldTasksLoad.data?.items || [];
  const invoices = (invoicesLoad.data?.items || []).filter((row) => normalize(`${row.invoiceName || ""} ${row.note || ""}`).includes(normalize(projectId)));

  const actorId = state?.tenant?.name || state?.profile?.email || "fca-user";
  const deviceId = getDeviceId();

  useEffect(() => {
    writeLocalJson(FORENSIC_EVENTS_KEY, forensicEvents);
  }, [forensicEvents]);

  useEffect(() => {
    writeLocalJson(AUDIT_ALERT_ACK_KEY, alertAck);
  }, [alertAck]);

  useEffect(() => {
    setTriadEvents(listTriadEvents(120));
    return subscribeTriadEvents(() => setTriadEvents(listTriadEvents(120)));
  }, []);

  const appendForensicEvent = useCallback(async ({ eventType, action, reason = "", priorState = "", newState = "", metadata = {} }) => {
    const timestamp = isoNow();
    const previous = forensicEvents[forensicEvents.length - 1];
    const previousHash = previous?.chainHash || "GENESIS";

    const payload = {
      eventType,
      action,
      reason,
      priorState,
      newState,
      metadata,
      projectId,
      userId: actorId,
      actorType: "user",
      timestamp,
      ipAddress: "gateway-captured",
      deviceId,
    };

    const chainHash = await sha256Hex(`${previousHash}|${JSON.stringify(payload)}`);
    const nextEvent = {
      id: `forensic-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      ...payload,
      previousHash,
      chainHash,
      immutable: true,
    };

    setForensicEvents((current) => [...current, nextEvent].slice(-5000));
  }, [actorId, deviceId, forensicEvents, projectId]);

  useEffect(() => {
    if (!hasProject) return;
    appendForensicEvent({
      eventType: "audit-module-view",
      action: `Opened proactive audit console for ${projectId}`,
      reason: "Audit access",
      priorState: "Audit module closed",
      newState: "Audit module active",
    }).catch(() => null);
    // intentionally single-run when project switches
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, hasProject]);

  const unifiedEvents = useMemo(() => {
    const workflowRows = (auditEvents || []).map((event, index) => normalizeWorkflowEvent(event, index));
    const forensicRows = (forensicEvents || []).map((event) => normalizeForensicEvent(event));

    const fileRows = (files || []).slice(0, 200).map((file, index) => ({
      id: `file-register-${index + 1}`,
      eventType: "file-register",
      action: `File registered: ${file.name || file.fileId || "document"}`,
      reason: file.note || "Document continuity",
      priorState: "",
      newState: file.status || "Registered",
      actorId: file.owner || "document-control",
      actorType: "workflow",
      userId: file.owner || "document-control",
      timestamp: file.updatedAt || file.updated || isoNow(),
      ipAddress: "gateway-captured",
      deviceId: "workflow-service",
      source: "file-spine",
      immutable: false,
    }));

    const triadRows = (triadEvents || []).map((event, index) => ({
      id: event.id || `triad-${index + 1}`,
      eventType: event.type || "triad-event",
      action: event.payload?.reason || event.payload?.action || event.payload?.note || "Triad orchestration event",
      reason: event.payload?.title || event.payload?.message || "Cross-persona handoff",
      priorState: "",
      newState: event.payload?.projectId || event.payload?.payAppId || "",
      actorId: "auricrux",
      actorType: "ai",
      userId: "auricrux",
      timestamp: event.timestamp || isoNow(),
      ipAddress: "gateway-captured",
      deviceId: "triad-state-bus",
      source: "triad-blackbox",
      immutable: true,
    }));

    return [...workflowRows, ...forensicRows, ...fileRows, ...triadRows].sort((a, b) => parseDate(b.timestamp) - parseDate(a.timestamp));
  }, [auditEvents, files, forensicEvents, triadEvents]);

  useEffect(() => {
    let active = true;
    async function computeChain() {
      const rows = [...unifiedEvents].sort((a, b) => parseDate(a.timestamp) - parseDate(b.timestamp));
      const chainRows = [];
      let previousHash = "GENESIS";
      for (const event of rows) {
        const serialized = JSON.stringify({
          id: event.id,
          eventType: event.eventType,
          action: event.action,
          userId: event.userId,
          timestamp: event.timestamp,
          priorState: event.priorState,
          newState: event.newState,
          previousHash,
        });
        const computedHash = await sha256Hex(serialized);
        const persistedHash = event.chainHash || "";
        const tamperState = persistedHash ? (persistedHash === computedHash ? "verified" : "mismatch") : "enveloped";
        chainRows.push({
          id: event.id,
          eventType: event.eventType,
          action: event.action,
          userId: event.userId,
          timestamp: event.timestamp,
          source: event.source,
          previousHash,
          computedHash,
          persistedHash,
          tamperState,
        });
        previousHash = persistedHash || computedHash;
      }
      if (active) setHashChain(chainRows.reverse());
    }
    computeChain();
    return () => {
      active = false;
    };
  }, [unifiedEvents]);

  const anomalyThresholds = adminGovernance?.auditGovernance?.anomalyThresholds || {};

  const anomalies = useMemo(() => {
    const rows = [];

    const overnightDownloads = unifiedEvents.filter((event) => {
      const hour = new Date(event.timestamp || Date.now()).getHours();
      return /download/.test(normalize(`${event.eventType} ${event.action}`)) && hour >= 2 && hour <= 4;
    });

    if (overnightDownloads.length >= (anomalyThresholds.overnightDownloadVolume || 500)) {
      rows.push({
        id: "overnight-download-spike",
        severity: "critical",
        title: "Overnight document extraction anomaly",
        detail: `${overnightDownloads.length} download-like events between 02:00-04:00 detected.`,
        route: "/portal/admin",
      });
    }

    const approvedCos = changeOrders.filter((row) => /approved|signed/i.test(String(row.status || "")));
    const avg = approvedCos.length
      ? approvedCos.reduce((sum, row) => sum + toNumber(row.amount || row.total), 0) / approvedCos.length
      : 0;
    const highPct = (anomalyThresholds.changeOrderOutlierPct || 30) / 100;

    const outliers = approvedCos.filter((row) => {
      const amount = toNumber(row.amount || row.total);
      return avg > 0 && amount >= avg * (1 + highPct);
    });

    if (outliers.length) {
      rows.push({
        id: "co-approval-outlier",
        severity: "high",
        title: "Change order approval outlier",
        detail: `${outliers.length} approved CO(s) are >= ${anomalyThresholds.changeOrderOutlierPct || 30}% above project average (${formatUsd(avg)}).`,
        route: "/portal/admin",
      });
    }

    return rows;
  }, [anomalyThresholds.changeOrderOutlierPct, anomalyThresholds.overnightDownloadVolume, changeOrders, unifiedEvents]);

  const frictionSignals = useMemo(() => {
    const rejected = rfis.filter((rfi) => /reject|returned|denied/i.test(String(rfi.status || rfi.recordStatus || ""))).length;
    const total = Math.max(1, rfis.length);
    const ratio = (rejected / total) * 100;
    const threshold = anomalyThresholds.rfiRejectionBottleneckPct || 60;

    if (ratio >= threshold) {
      return {
        isBottleneck: true,
        ratio,
        detail: `RFI rejection/return ratio is ${ratio.toFixed(1)}%. This indicates process friction in operations and training alignment.`,
      };
    }

    return {
      isBottleneck: false,
      ratio,
      detail: `RFI rejection/return ratio is ${ratio.toFixed(1)}%.`,
    };
  }, [anomalyThresholds.rfiRejectionBottleneckPct, rfis]);

  const safetyBypass = useMemo(() => {
    const bypassRows = fieldTasks.filter((task) => {
      const completed = /complete|closed|done/i.test(String(task.status || ""));
      const checklistComplete = task.safetyChecklistComplete === true || /complete|passed/i.test(String(task.safetyChecklistStatus || ""));
      return completed && !checklistComplete;
    });
    return {
      count: bypassRows.length,
      rows: bypassRows,
    };
  }, [fieldTasks]);

  async function routeGovernanceAlert(alert, reasonTag) {
    const key = `${alert.id}:${reasonTag}`;
    if (alertAck[key]) return;

    await sendPortalMessage({
      channel: "teams",
      subject: `Governance Alert · ${projectId}`,
      message: `${alert.title}. ${alert.detail} Route: ${alert.route}.`,
    }).catch(() => null);

    setAlertAck((current) => ({ ...current, [key]: isoNow() }));
  }

  useEffect(() => {
    for (const alert of anomalies) {
      routeGovernanceAlert(alert, "anomaly").catch(() => null);
    }
  }, [anomalies]);

  useEffect(() => {
    if (!frictionSignals.isBottleneck) return;
    const alert = {
      id: "rfi-friction-bottleneck",
      title: "RFI bottleneck detected",
      detail: `${frictionSignals.detail} Recommend process update in PortalOperations and Academy reinforcement module.`,
      route: "/portal/operations",
    };
    routeGovernanceAlert(alert, "friction").catch(() => null);
  }, [frictionSignals]);

  useEffect(() => {
    if (!safetyBypass.count) return;
    const alert = {
      id: "safety-checklist-bypass",
      title: "Mandatory safety checklist bypass",
      detail: `${safetyBypass.count} completed task(s) missing safety checklist closure. Notify Safety Officer immediately.`,
      route: "/portal/operations",
    };
    routeGovernanceAlert(alert, "safety").catch(() => null);
  }, [safetyBypass.count]);

  async function generateReport(reportId, format) {
    setError("");
    setNotice("");

    const now = Date.now();
    const currentYear = yearOf(now);

    if (reportId === "co-over-50k-q2") {
      const rows = changeOrders
        .filter((co) => {
          const amount = toNumber(co.amount || co.total);
          const stamp = parseDate(co.createdAt || co.updatedAt || now);
          return amount >= 50000 && yearOf(stamp) === currentYear && quarterOf(stamp) === 2;
        })
        .map((co) => ({
          projectId,
          changeOrderId: co.id || co.changeOrderId || "",
          amount: toNumber(co.amount || co.total),
          approvedBy: co.approver || co.approvedBy || co.owner || "unknown",
          linkedRfi: co.sourceId || co.rfiId || "",
          status: co.status || "",
          approvedAt: co.approvedAt || co.updatedAt || co.createdAt || "",
        }));

      const payload = {
        profile: "Change Orders over $50k in Q2",
        generatedAt: isoNow(),
        projectId,
        rowCount: rows.length,
        rows,
      };

      const fileName = `${projectId || "workspace"}-co-over-50k-q2.${format}`;
      if (format === "csv") {
        downloadFile(fileName, toCsv(rows), "text/csv");
      } else {
        downloadFile(fileName, JSON.stringify(payload, null, 2), "application/json");
      }
      setLastReport(fileName);
      await appendForensicEvent({
        eventType: "compliance-report-generated",
        action: `Generated report ${fileName}`,
        reason: "External audit evidence prep",
        priorState: "No report generated",
        newState: fileName,
      });
      setNotice(`Compliance report ready: ${fileName}`);
      return;
    }

    if (reportId === "safety-bypass") {
      const rows = safetyBypass.rows.map((task) => ({
        projectId,
        taskId: task.id || task.taskId || "",
        task: task.task || task.title || "",
        assignee: task.assignee || "",
        status: task.status || "",
        safetyChecklistStatus: task.safetyChecklistStatus || "missing",
      }));
      const fileName = `${projectId || "workspace"}-safety-checklist-bypass.${format}`;
      if (format === "csv") {
        downloadFile(fileName, toCsv(rows), "text/csv");
      } else {
        downloadFile(fileName, JSON.stringify({ generatedAt: isoNow(), projectId, rowCount: rows.length, rows }, null, 2), "application/json");
      }
      setLastReport(fileName);
      await appendForensicEvent({
        eventType: "governance-signal-report",
        action: `Generated safety bypass report ${fileName}`,
        reason: "Safety officer notification evidence",
        priorState: "No safety report generated",
        newState: fileName,
      });
      setNotice(`Governance report ready: ${fileName}`);
      return;
    }

    if (reportId === "budget-without-co") {
      const rows = unifiedEvents
        .filter((event) => matchesAny(`${event.eventType} ${event.action} ${event.reason}`, ["budget", "estimate", "line item", "cost"]))
        .filter((event) => !matchesAny(`${event.eventType} ${event.action} ${event.reason}`, ["change order", "co-", "change-order"]))
        .map((event) => ({
          eventId: event.id,
          timestamp: event.timestamp,
          actor: event.userId,
          action: event.action,
          priorState: event.priorState,
          newState: event.newState,
          source: event.source,
        }));

      const fileName = `${projectId || "workspace"}-budget-without-co.${format}`;
      if (format === "csv") {
        downloadFile(fileName, toCsv(rows), "text/csv");
      } else {
        downloadFile(fileName, JSON.stringify({ generatedAt: isoNow(), projectId, rowCount: rows.length, rows }, null, 2), "application/json");
      }
      setLastReport(fileName);
      await appendForensicEvent({
        eventType: "compliance-report-generated",
        action: `Generated budget-without-CO report ${fileName}`,
        reason: "Executive governance query",
        priorState: "No budget governance report",
        newState: fileName,
      });
      setNotice(`Compliance report ready: ${fileName}`);
    }
  }

  function runSemanticQuery() {
    const q = normalize(semanticQuery);
    if (!q) {
      setSemanticResults([]);
      return;
    }

    const results = [];
    for (const event of unifiedEvents) {
      const hay = normalize(`${event.eventType} ${event.action} ${event.reason} ${event.priorState} ${event.newState}`);
      let score = 0;
      if (hay.includes(q)) score += 10;

      const qTokens = q.split(" ").filter((token) => token.length > 2);
      for (const token of qTokens) {
        if (hay.includes(token)) score += 2;
      }

      if (q.includes("budget") && q.includes("without") && q.includes("change order")) {
        const budgetLike = matchesAny(hay, ["budget", "estimate", "line item", "cost"]);
        const hasCo = matchesAny(hay, ["change order", "co-"]); 
        if (budgetLike && !hasCo) score += 8;
      }

      if (q.includes("lien waiver")) {
        if (matchesAny(hay, ["lien waiver", "waiver signed", "waiver uploaded"])) score += 6;
      }

      if (q.includes("safety") && q.includes("bypass")) {
        if (matchesAny(hay, ["safety", "checklist", "bypass"])) score += 6;
      }

      if (score > 0) {
        results.push(buildSemanticResult(event, "Semantic similarity", score));
      }
    }

    setSemanticResults(results.sort((a, b) => b.score - a.score).slice(0, 20));
    appendForensicEvent({
      eventType: "semantic-query",
      action: `Executed semantic query: ${semanticQuery}`,
      reason: "Executive audit search",
      priorState: "No query",
      newState: semanticQuery,
    }).catch(() => null);
  }

  async function attemptFinalPaymentRelease() {
    const hasLienWaiver = unifiedEvents.some((event) => matchesAny(`${event.eventType} ${event.action} ${event.reason} ${event.newState}`, ["lien waiver", "waiver signed", "lien release"]))
      || (files || []).some((file) => matchesAny(`${file.name} ${file.note} ${file.category}`, ["lien waiver", "lien release"]));

    const hasSafetyBypass = safetyBypass.count > 0;
    const blocked = !hasLienWaiver || hasSafetyBypass;

    const result = {
      blocked,
      hasLienWaiver,
      hasSafetyBypass,
      reason: blocked
        ? `Blocked: ${!hasLienWaiver ? "Missing lien waiver evidence. " : ""}${hasSafetyBypass ? "Safety checklist bypass unresolved." : ""}`
        : "Approved: audit gate requirements satisfied.",
      checkedAt: isoNow(),
      invoiceCount: invoices.length,
    };

    setGateResult(result);

    await appendForensicEvent({
      eventType: "payment-gate-check",
      action: blocked ? "Final payment release blocked" : "Final payment release approved",
      reason: result.reason,
      priorState: "Payment pending",
      newState: blocked ? "Blocked" : "Released",
      metadata: {
        hasLienWaiver,
        hasSafetyBypass,
      },
    });

    if (blocked) {
      await sendPortalMessage({
        channel: "teams",
        subject: `Payment Gate Blocked · ${projectId}`,
        message: result.reason,
      }).catch(() => null);
      setError(result.reason);
      setNotice("");
      return;
    }

    setNotice("Final payment gate approved by Audit module.");
    setError("");
  }

  async function refreshAll() {
    await Promise.allSettled([
      refreshAudit(),
      changeOrdersLoad.reload(),
      rfisLoad.reload(),
      fieldTasksLoad.reload(),
      invoicesLoad.reload(),
    ]);
    setNotice("Audit intelligence refreshed.");
  }

  const hashIntegrity = useMemo(() => {
    const mismatches = hashChain.filter((row) => row.tamperState === "mismatch").length;
    return {
      total: hashChain.length,
      mismatches,
      verified: hashChain.filter((row) => row.tamperState === "verified").length,
    };
  }, [hashChain]);

  const eventTypeOptions = useMemo(() => ["All", ...Object.keys((auditEvents || []).reduce((acc, event) => {
    const key = event.eventType || "workflow-event";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort()], [auditEvents]);

  const actorTypeOptions = useMemo(() => ["All", ...Object.keys((auditEvents || []).reduce((acc, event) => {
    const key = event.actorType || "system";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {})).sort()], [auditEvents]);

  return (
    <PortalShell
      title="Audit Black Box"
      subtitle="Proactive forensic governance, anomaly intelligence, and compliance-by-design gatekeeping."
      activeHref="/portal/audit"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/portal/admin"
      primaryLabel="Open Admin Governance"
    >
      <PortalSliceAuricrux
        title="Auricrux Audit Chain"
        targetObjectType="Project"
        targetObjectId={projectId || "workspace"}
        sourceRoute="/portal/audit"
        rationale="Forensic governance requires immutable context, explainable traceability, and proactive anomaly review."
        nextAction="Run forensic exports for high-risk events and close open payment governance gaps."
        actionHref="/portal/admin"
        actionLabel="Open governance controls"
        tone="green"
        liveRecommend={Boolean(projectId)}
      />

      <div style={{ marginBottom: 16 }}>
        <AuricruxInsightPanel
          title="Auricrux Forensic Intelligence"
          targetObjectType="Project"
          targetObjectId={projectId || "workspace"}
          sourceRoute="/portal/audit"
          rationale="Audit is the legal chain of custody and the process-improvement signal lane for the FCA operating system."
          nextAction="Review anomalies, run one-click compliance reports, and enforce payment gate requirements before release."
          actionHref="/portal/operations"
          actionLabel="Open Operations"
          tone="green"
          liveRecommend={Boolean(projectId)}
        />
      </div>

      {!hasProject ? (
        <div style={portalCardStyle}>Select an active project from Projects to run forensic audit governance.</div>
      ) : null}

      {hasProject ? (
        <>
          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Immutable forensic spine</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              Unified events: {unifiedEvents.length} · Forensic-origin events: {forensicEvents.length} · Hash chain records: {hashIntegrity.total}
            </div>
            <div style={{ color: hashIntegrity.mismatches ? "#991b1b" : "#166534", marginTop: 6, fontWeight: 700 }}>
              {hashIntegrity.mismatches ? `${hashIntegrity.mismatches} hash mismatch(es) detected.` : "Chain of custody verified for immutable records."}
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonSecondary} onClick={refreshAll}>Refresh forensic inputs</button>
              <a href="/portal/admin" style={portalButtonSecondary}>Governance alerts</a>
              <a href="/portal/operations" style={portalButtonSecondary}>Operations bottlenecks</a>
              <a href="/academy" style={portalButtonSecondary}>Open Academy</a>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Workflow audit filters</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Search</div>
                <input
                  value={filters.q}
                  onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                  style={portalInputStyle}
                  placeholder="Search action, reason, state"
                />
              </label>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Event type</div>
                <select
                  value={filters.eventType}
                  onChange={(event) => setFilters((current) => ({ ...current, eventType: event.target.value }))}
                  style={portalInputStyle}
                >
                  {eventTypeOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Actor type</div>
                <select
                  value={filters.actorType}
                  onChange={(event) => setFilters((current) => ({ ...current, actorType: event.target.value }))}
                  style={portalInputStyle}
                >
                  {actorTypeOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <div style={{ color: "#64748b", marginTop: 8 }}>Source state: {meta.backingSource} · {meta.persistenceState}</div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Auricrux anomaly detection</div>
            <div style={{ display: "grid", gap: 8 }}>
              {anomalies.length ? anomalies.map((alert) => (
                <div key={alert.id} style={{ border: "1px solid #fecaca", borderRadius: 10, padding: 10, background: "#fef2f2" }}>
                  <div style={{ fontWeight: 700, color: "#991b1b" }}>{alert.title}</div>
                  <div style={{ color: "#7f1d1d", marginTop: 4 }}>{alert.detail}</div>
                  <div style={{ marginTop: 8 }}><a href={alert.route} style={portalButtonSecondary}>Open target lane</a></div>
                </div>
              )) : <div style={{ color: "#166534" }}>No high-risk anomalies detected with current thresholds.</div>}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e2e8f0" }}>
              <div style={{ fontWeight: 700 }}>Pattern-of-failure analysis</div>
              <div style={{ color: frictionSignals.isBottleneck ? "#b45309" : "#166534", marginTop: 4 }}>{frictionSignals.detail}</div>
              {frictionSignals.isBottleneck ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                  <a href="/portal/operations" style={portalButtonSecondary}>Open Operations lane</a>
                  <a href="/academy" style={portalButtonSecondary}>Open Academy remediation</a>
                </div>
              ) : null}
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>One-click compliance reporting</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonPrimary} onClick={() => generateReport("co-over-50k-q2", "json")}>CO over $50k in Q2 (JSON)</button>
              <button type="button" style={portalButtonSecondary} onClick={() => generateReport("co-over-50k-q2", "csv")}>CO over $50k in Q2 (CSV)</button>
              <button type="button" style={portalButtonSecondary} onClick={() => generateReport("safety-bypass", "json")}>Safety bypass report</button>
              <button type="button" style={portalButtonSecondary} onClick={() => generateReport("budget-without-co", "json")}>Budget changes without CO</button>
            </div>
            {lastReport ? <div style={{ color: "#166534", marginTop: 8 }}>Last generated report: {lastReport}</div> : null}
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Semantic executive query (who/what/when/why)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}>
              <input
                value={semanticQuery}
                onChange={(event) => setSemanticQuery(event.target.value)}
                style={portalInputStyle}
                placeholder="Find all instances where the project budget was modified without a linked Change Order"
              />
              <button type="button" style={portalButtonPrimary} onClick={runSemanticQuery}>Run query</button>
            </div>
            <div style={{ display: "grid", gap: 8, marginTop: 10, maxHeight: 240, overflowY: "auto" }}>
              {semanticResults.map((result) => (
                <div key={result.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                  <div style={{ fontWeight: 700 }}>{result.eventType} · score {result.score}</div>
                  <div style={{ color: "#334155", marginTop: 4 }}>{result.action}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                    Actor {result.actor} · {result.timestamp} · Prior {result.priorState || "-"} · New {result.newState || "-"}
                  </div>
                </div>
              ))}
              {!semanticResults.length ? <div style={{ color: "#64748b" }}>No semantic results yet.</div> : null}
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 14 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Active gatekeeper: compliance by design</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              Final payment requirements: lien waiver evidence + no unresolved safety checklist bypass events.
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={portalButtonPrimary} onClick={attemptFinalPaymentRelease}>Attempt final payment release</button>
              <a href="/portal/billing" style={portalButtonSecondary}>Open Billing</a>
            </div>
            {gateResult ? (
              <div style={{ marginTop: 10, border: gateResult.blocked ? "1px solid #fecaca" : "1px solid #bbf7d0", background: gateResult.blocked ? "#fef2f2" : "#f0fdf4", borderRadius: 10, padding: 10 }}>
                <div style={{ fontWeight: 700, color: gateResult.blocked ? "#991b1b" : "#166534" }}>
                  {gateResult.blocked ? "Payment blocked" : "Payment approved"}
                </div>
                <div style={{ color: gateResult.blocked ? "#7f1d1d" : "#14532d", marginTop: 4 }}>{gateResult.reason}</div>
              </div>
            ) : null}
          </div>

          <div style={portalCardStyle}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Unified event bus timeline</div>
            <div style={{ display: "grid", gap: 8, maxHeight: 320, overflowY: "auto" }}>
              {hashChain.slice(0, 80).map((row) => (
                <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ fontWeight: 700 }}>{row.eventType} · {row.userId || "unknown"}</div>
                  <div style={{ color: "#334155", marginTop: 4 }}>{row.action}</div>
                  <div style={{ color: row.tamperState === "mismatch" ? "#b91c1c" : "#64748b", fontSize: 12, marginTop: 6 }}>
                    {row.timestamp} · {row.source} · Hash {row.computedHash.slice(0, 16)}... · {row.tamperState}
                  </div>
                </div>
              ))}
              {!hashChain.length ? <div style={{ color: "#64748b" }}>No events available.</div> : null}
            </div>
          </div>
        </>
      ) : null}

      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}
    </PortalShell>
  );
}
