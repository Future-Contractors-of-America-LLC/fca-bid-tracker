import { useEffect, useMemo, useRef, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useJobCost from "../../hooks/useJobCost";
import {
  completeFieldTask,
  createFieldTask,
  fetchFieldSchedule,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";
import {
  createCloseoutPackage,
  fetchProjectRfis,
} from "../../api/constructionClient";
import { fetchFieldPhotoFeedback, fetchFieldPhotos, compareFieldPhoto } from "../../api/fieldPhotosClient";
import { fetchWorkflowFiles } from "../../api/workflowClient";
import { fetchAcademyLms } from "../../api/academyClient";
import { routeStateOverlays } from "../../systemState";
import { registerFieldMilestoneCompletion } from "../../triadFlywheel";
import { isCteSafeModeEnabled, readCteSafeProfile } from "../../lib/cteSafeModeConfig";
import { enqueueInstructorReview } from "../../lib/instructorReviewQueue";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  padding: 10,
  boxSizing: "border-box",
  font: "inherit",
};
const button = {
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
};

const PRODUCTIVITY_KEY = "fca_field_crew_productivity_v1";
const ADMIN_POLICY_RUNTIME_KEY = "fca_admin_policy_runtime_v1";
const ADMIN_SUBCONTRACTOR_REGISTRY_KEY = "fca_subcontractor_registry_v1";
const CTE_SAFETY_CREDENTIALS_KEY = "fca_cte_vdoe_safety_credentials_v1";

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

function daysBetween(a, b) {
  const start = parseDate(a);
  const end = parseDate(b);
  if (!start || !end) return 0;
  return Math.max(0, Math.round((end - start) / 86400000));
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferDiscipline(text) {
  const q = normalize(text);
  if (/hvac|duct|air handler|mechanical/.test(q)) return "MEP";
  if (/conduit|panel|electrical|lighting/.test(q)) return "MEP";
  if (/plumb|pipe|sanitary/.test(q)) return "MEP";
  if (/steel|rebar|structural|column|beam/.test(q)) return "Structural";
  if (/paint|finish|drywall|door|ceiling|architect/.test(q)) return "Architectural";
  return "General";
}

function parseVoiceEntry(text) {
  const sentence = String(text || "").trim();
  const installed = /installed\s+(\d+(?:\.\d+)?)\s*(sf|lf|ea|cy|sqft)?\s+of\s+(.+?)\s+in\s+zone\s+([a-z0-9-]+)/i.exec(sentence);
  if (installed) {
    return {
      intent: "progress-update",
      quantity: Number(installed[1]),
      unit: (installed[2] || "ea").toLowerCase(),
      scope: installed[3],
      zone: installed[4].toUpperCase(),
      summary: `Installed ${installed[1]} ${installed[2] || "ea"} of ${installed[3]} in Zone ${installed[4].toUpperCase()}`,
    };
  }

  const incident = /(safety incident|incident|near miss|injury)/i.exec(sentence);
  if (incident) {
    return {
      intent: "safety-incident",
      summary: sentence,
      zone: (/zone\s+([a-z0-9-]+)/i.exec(sentence)?.[1] || "").toUpperCase(),
    };
  }

  const arrival = /(material|delivery).*(arrived|received)/i.exec(sentence);
  if (arrival) {
    return {
      intent: "material-arrival",
      summary: sentence,
      zone: (/zone\s+([a-z0-9-]+)/i.exec(sentence)?.[1] || "").toUpperCase(),
    };
  }

  return {
    intent: "note",
    summary: sentence,
    zone: (/zone\s+([a-z0-9-]+)/i.exec(sentence)?.[1] || "").toUpperCase(),
  };
}

function findOpenRfiConflict(task, rfis) {
  const open = (rfis || []).filter((rfi) => !(rfi.recordStatus === "answered" || rfi.status === "answered" || rfi.response));
  const taskText = normalize(`${task.task || ""} ${task.zone || ""} ${task.bimObjectId || ""} ${task.drawingSheet || ""}`);
  return open.find((rfi) => {
    const text = normalize(`${rfi.question || ""} ${rfi.zone || ""} ${rfi.bimObjectId || ""} ${rfi.drawingSheet || ""}`);
    return taskText && text && (text.includes(normalize(task.zone)) || text.includes(normalize(task.bimObjectId)) || text.includes(normalize(task.drawingSheet)) || taskText.split(" ").some((token) => token.length > 3 && text.includes(token)));
  }) || null;
}

function findSafetyConflict(task, photos) {
  const taskText = normalize(`${task.task || ""} ${task.zone || ""}`);
  return (photos || []).find((photo) => {
    const hay = normalize(`${photo.notes || ""} ${photo.auricruxFeedback || ""} ${photo.compareStatus || ""}`);
    const incidentLike = /incident|unsafe|near miss|stop work|safety/i.test(hay);
    if (!incidentLike) return false;
    if (!taskText) return true;
    return hay.includes(normalize(task.zone)) || taskText.split(" ").some((token) => token.length > 3 && hay.includes(token));
  }) || null;
}

function findCertificationRecords(academyPayload) {
  const records = [];
  const candidates = [
    ...(academyPayload?.learners || []),
    ...(academyPayload?.items || []),
    ...(academyPayload?.summary?.learners || []),
  ];
  for (const row of candidates) {
    const assignee = row.email || row.name || row.learnerId || row.id;
    const certs = row.certifications || row.credentials || row.badges || [];
    if (!assignee) continue;
    records.push({ assignee: String(assignee), certs: Array.isArray(certs) ? certs : [certs] });
  }
  return records;
}

function hasCertification(academyPayload, assignee, requiredCert) {
  if (!requiredCert) return true;
  const records = findCertificationRecords(academyPayload);
  const who = normalize(assignee);
  const need = normalize(requiredCert);
  const match = records.find((record) => normalize(record.assignee).includes(who) || who.includes(normalize(record.assignee)));
  if (!match) return false;
  return match.certs.some((cert) => normalize(String(cert)).includes(need));
}

function buildCrewProductivity(tasks) {
  const rows = {};
  for (const task of tasks || []) {
    if (!(task.status || "").toLowerCase().includes("complete")) continue;
    const crew = task.assignee || "Unknown Crew";
    const discipline = inferDiscipline(task.task || "");
    const key = `${crew}::${discipline}`;
    const created = task.createdAt || task.created_at || task.updatedAt;
    const completed = task.completedAt || task.closedAt || task.updatedAt;
    const cycleDays = Math.max(1, daysBetween(created, completed));
    const current = rows[key] || { crew, discipline, count: 0, cycleDays: 0 };
    current.count += 1;
    current.cycleDays += cycleDays;
    rows[key] = current;
  }

  return Object.values(rows).map((row) => {
    const avgDays = row.count ? row.cycleDays / row.count : 99;
    const score = row.count / Math.max(avgDays, 0.5);
    return { ...row, avgDays: Number(avgDays.toFixed(2)), score: Number(score.toFixed(2)) };
  });
}

function chooseCrewForTask(task, productivityRows) {
  const discipline = inferDiscipline(task.task || "");
  const matches = (productivityRows || []).filter((row) => row.discipline === discipline);
  if (!matches.length) return null;
  return matches.sort((a, b) => b.score - a.score)[0];
}

function findSubcontractorByAssignee(assignee, registry) {
  const who = normalize(assignee);
  if (!who) return null;
  return (registry || []).find((row) => {
    const company = normalize(row.name || "");
    return company && (who.includes(company) || company.includes(who));
  }) || null;
}

function hasSafetyCredentialForTask(task) {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(CTE_SAFETY_CREDENTIALS_KEY);
    const rows = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(rows)) return false;
    const category = /electrical|panel|conduit/i.test(String(task.task || ""))
      ? "LivePanels"
      : /saw|cut|framing|carpentry/i.test(String(task.task || ""))
        ? "TableSaw"
        : "GeneralLab";
    return rows.some((row) => row?.equipmentOrCategory === category && row?.achievedPerfectScore === true);
  } catch {
    return false;
  }
}

export default function PortalFieldTasks() {
  const { projectId, hasProject } = usePortalProjectId();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceListening, setVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [completionEvidence, setCompletionEvidence] = useState({});
  const [productivityRows, setProductivityRows] = useState(() => readLocalJson(PRODUCTIVITY_KEY, []));
  const recognitionRef = useRef(null);

  const [draft, setDraft] = useState({
    task: "",
    assignee: "",
    dueDate: "",
    priority: "Normal",
    estimatedCost: "",
    zone: "",
    requiredCertification: "",
    dependsOnTaskId: "",
    planFileId: "",
    drawingSheet: "",
    bimObjectId: "",
    bimCoordinate: "",
    submittalReference: "",
  });

  const filesLoad = usePortalApiLoad(() => (hasProject ? fetchWorkflowFiles({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const rfisLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const scheduleLoad = usePortalApiLoad(() => (hasProject ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const photosLoad = usePortalApiLoad(() => (hasProject ? fetchFieldPhotos(projectId) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const academyLoad = usePortalApiLoad(() => fetchAcademyLms({ view: "summary" }), []);
  const jobCost = useJobCost(projectId);

  const files = filesLoad.data?.items || [];
  const rfis = rfisLoad.data || [];
  const scheduleItems = scheduleLoad.data?.items || [];
  const fieldPhotos = photosLoad.data?.items || [];

  useEffect(() => {
    writeLocalJson(PRODUCTIVITY_KEY, productivityRows);
  }, [productivityRows]);

  useEffect(() => {
    if (!hasProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    fetchFieldTasks({ projectId })
      .then((payload) => setItems(payload.items || []))
      .catch((fetchError) => setError(fetchError.message || "Unable to load field tasks."))
      .finally(() => setLoading(false));
  }, [projectId, hasProject]);

  useEffect(() => {
    const rows = buildCrewProductivity(items);
    if (rows.length) setProductivityRows(rows);
  }, [items]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const supported = Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
    setVoiceSupported(supported);
  }, []);

  const voiceStructured = useMemo(() => parseVoiceEntry(voiceTranscript), [voiceTranscript]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = normalize(search);
    return items.filter((task) => normalize(`${task.task || ""} ${task.assignee || ""} ${task.zone || ""} ${task.status || ""}`).includes(q));
  }, [items, search]);

  const weatherDelayedTasks = useMemo(() => (
    (items || []).filter((task) => /rain|weather|storm/i.test(`${task.note || ""} ${task.reason || ""} ${task.task || ""}`) && !(task.status || "").toLowerCase().includes("complete"))
  ), [items]);

  const sortedTasks = useMemo(() => {
    const delayedIds = new Set(weatherDelayedTasks.map((task) => task.id || task.taskId));
    const rank = (task) => {
      const complete = (task.status || "").toLowerCase().includes("complete") ? 100 : 0;
      const priority = task.priority === "Urgent" ? -30 : task.priority === "High" ? -20 : -5;
      const due = parseDate(task.dueDate) || Number.MAX_SAFE_INTEGER;
      const dependsOn = task.dependsOnTaskId && delayedIds.has(task.dependsOnTaskId) ? 50 : 0;
      const sameZoneDelay = weatherDelayedTasks.some((delayed) => normalize(delayed.zone) && normalize(delayed.zone) === normalize(task.zone)) ? 15 : 0;
      const resequenceBoost = weatherDelayedTasks.length && !dependsOn && !sameZoneDelay ? -10 : 0;
      return complete + priority + dependsOn + sameZoneDelay + resequenceBoost + Math.round(due / 86400000);
    };
    return [...filteredItems].sort((a, b) => rank(a) - rank(b));
  }, [filteredItems, weatherDelayedTasks]);

  const unresolvedHardStops = useMemo(() => {
    const blockers = [];
    for (const task of sortedTasks) {
      if ((task.status || "").toLowerCase().includes("complete")) continue;
      const rfiConflict = findOpenRfiConflict(task, rfis);
      const safetyConflict = findSafetyConflict(task, fieldPhotos);
      if (rfiConflict || safetyConflict) {
        blockers.push({ task, rfiConflict, safetyConflict });
      }
    }
    return blockers;
  }, [fieldPhotos, rfis, sortedTasks]);

  const bottleneckWarnings = useMemo(() => {
    const rollup = jobCost.rollup || {};
    const budget = toNumber(rollup.budgetHours || rollup.estimatedHours || rollup.budgetCost);
    const actual = toNumber(rollup.actualHours || rollup.actualCost || rollup.currentCost);
    if (!budget || !actual) return [];
    const burn = actual / Math.max(budget, 1);
    if (burn < 0.85) return [];
    return sortedTasks
      .filter((task) => !(task.status || "").toLowerCase().includes("complete"))
      .slice(0, 5)
      .map((task) => ({
        taskId: task.id || task.taskId,
        label: task.task,
        burnRatio: Number((burn * 100).toFixed(1)),
      }));
  }, [jobCost.rollup, sortedTasks]);

  function updateDraft(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applyVoiceToDraft() {
    if (!voiceStructured?.summary) return;
    setDraft((current) => ({
      ...current,
      task: voiceStructured.summary,
      zone: voiceStructured.zone || current.zone,
    }));
    setNotice("Voice transcript parsed into structured task draft.");
  }

  function startVoiceCapture() {
    if (typeof window === "undefined") return;
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechClass) {
      setError("Voice capture is not supported in this browser.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      const recognition = new SpeechClass();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();
        setVoiceTranscript(transcript);
      };
      recognition.onerror = () => {
        setVoiceListening(false);
      };
      recognition.onend = () => {
        setVoiceListening(false);
      };
      recognitionRef.current = recognition;
      setVoiceListening(true);
      recognition.start();
    } catch {
      setVoiceListening(false);
      setError("Unable to initialize voice capture.");
    }
  }

  function stopVoiceCapture() {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    setVoiceListening(false);
  }

  async function reloadTasks() {
    if (!hasProject) return;
    const payload = await fetchFieldTasks({ projectId });
    setItems(payload.items || []);
  }

  async function addTask() {
    if (!hasProject || !draft.task.trim() || !draft.assignee.trim()) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (isCteSafeModeEnabled()) {
        const profile = readCteSafeProfile();
        const reviewItem = await enqueueInstructorReview({
          actionType: "create-field-task",
          sourceRoute: "/portal/field-tasks",
          targetObjectType: "FieldTask",
          targetObjectId: draft.task.trim(),
          summary: `New competency task queued for instructor approval: ${draft.task.trim()}`,
          payload: {
            ...draft,
            projectId,
            courseCode: profile.courseCode,
          },
        });
        setNotice(`Safe-Mode active: task submitted to Instructor Review Queue (${reviewItem.id}).`);
        return;
      }

      const runtimePolicy = readLocalJson(ADMIN_POLICY_RUNTIME_KEY, {});
      const subcontractorRegistry = readLocalJson(ADMIN_SUBCONTRACTOR_REGISTRY_KEY, []);
      const warningDays = toNumber(runtimePolicy.fieldTaskCredentialWarningDays || 30);
      const contractor = findSubcontractorByAssignee(draft.assignee, subcontractorRegistry);
      if (contractor) {
        const insuranceDays = daysBetween(new Date().toISOString(), contractor.insuranceExpiry || "");
        const licenseDays = daysBetween(new Date().toISOString(), contractor.licenseExpiry || "");
        const expiringSoon = insuranceDays <= warningDays || licenseDays <= warningDays;
        const expired = normalize(contractor.credentialStatus).includes("expired") || insuranceDays <= 0 || licenseDays <= 0;
        if (expiringSoon || expired) {
          setError(`Policy enforcement blocked: ${contractor.name} credentials are expiring/expired and cannot be assigned to new field tasks.`);
          return;
        }
      }

      const linkedRfi = findOpenRfiConflict(draft, rfis);
      await createFieldTask({
        ...draft,
        projectId,
        status: "Open",
        linkedRfiId: linkedRfi?.id || "",
      });
      await reloadTasks();
      setDraft({
        task: "",
        assignee: "",
        dueDate: "",
        priority: "Normal",
        estimatedCost: "",
        zone: "",
        requiredCertification: "",
        dependsOnTaskId: "",
        planFileId: "",
        drawingSheet: "",
        bimObjectId: "",
        bimCoordinate: "",
        submittalReference: "",
      });
      setVoiceTranscript("");
      setNotice("Field task created with design/plan context metadata.");
    } catch (createError) {
      setError(createError.message || "Unable to create field task.");
    } finally {
      setBusy(false);
    }
  }

  async function completeTask(task) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (isCteSafeModeEnabled()) {
        if (!hasSafetyCredentialForTask(task)) {
          setError("Access Locked: VDOE safety policy requires a verified 100 percent equipment safety score before field task completion.");
          return;
        }

        const profile = readCteSafeProfile();
          const reviewItem = await enqueueInstructorReview({
          actionType: "complete-field-task",
          sourceRoute: "/portal/field-tasks",
          targetObjectType: "FieldTask",
          targetObjectId: String(task.id || task.taskId || ""),
          summary: `Completion submitted for instructor sign-off: ${task.task}`,
          payload: {
            taskId: task.id || task.taskId,
            task: task.task,
            projectId,
            courseCode: profile.courseCode,
            evidencePhotoId: completionEvidence[task.id || task.taskId]?.photoId || "",
          },
        });
        setNotice(`Safe-Mode active: completion queued as Pending Review (${reviewItem.id}).`);
        return;
      }

      const rfiConflict = findOpenRfiConflict(task, rfis);
      if (rfiConflict) {
        setError(`Hard stop: ${task.task} is blocked by open RFI ${rfiConflict.number || rfiConflict.id}. Resolve in RFI module first.`);
        return;
      }

      const safetyConflict = findSafetyConflict(task, fieldPhotos);
      if (safetyConflict) {
        setError(`Hard stop: unresolved safety signal detected for ${task.task}. Resolve in Field Supervision before continuing.`);
        return;
      }

      if (task.requiredCertification && !hasCertification(academyLoad.data, task.assignee, task.requiredCertification)) {
        setError(`Credential gate blocked: ${task.assignee} does not have required ${task.requiredCertification} certification.`);
        return;
      }

      const photoId = completionEvidence[task.id || task.taskId]?.photoId;
      if (!photoId) {
        setError("Visual verification gate blocked: attach a field photo before task close.");
        return;
      }

      await compareFieldPhoto(photoId, {
        projectId,
        fileId: task.planFileId || "",
        sheetId: task.drawingSheet || "",
      }).catch(() => null);

      const feedback = await fetchFieldPhotoFeedback(photoId).catch(() => null);
      const visualResult = normalize(feedback?.feedback || "");
      if (visualResult.includes("mismatch") || visualResult.includes("non-compliant") || visualResult.includes("does not match")) {
        setError("Visual verification failed: installation does not match governed spec. Task remains open.");
        return;
      }

      await completeFieldTask(task.id || task.taskId);

      await createCloseoutPackage({
        projectId,
        title: `As-Built entry from ${task.task}`,
        requiredArtifacts: ["As-Built Task Record", "Field Photo Evidence", "Verification Note"],
        sourceRoute: "/portal/field-tasks",
      }).catch(() => null);

      await reloadTasks();
      await photosLoad.reload();

      const loggedHours = toNumber(task.actualHours || task.loggedHours || task.hours || task.progressHours || task.estimatedHours || 0);
      const budgetHours = Math.max(1, toNumber(task.budgetHours || task.estimatedHours || 8));
      const digitalSignature = `${task.assignee || "crew"}:${photoId}:${new Date().toISOString()}`;
      const triadResult = registerFieldMilestoneCompletion({
        projectId,
        taskId: task.id || task.taskId,
        taskName: task.task,
        loggedHours,
        budgetHours,
        amountUsd: toNumber(task.estimatedCost || task.cost || 0),
        photoVerified: Boolean(photoId),
        digitalSignature,
      });

      if (triadResult.projectPaused) {
        setNotice("Task closed, but Auricrux guardrail paused project flow: budget hours exceeded 10%. PM alerted and scope clarification memo drafted.");
      } else if (triadResult.verification?.digitalSignature && triadResult.verification?.photoVerified) {
        setNotice("Task closed with visual verification. Milestone handoff triggered: Billing Engine drafted Pay-App through the triad state-bus.");
      } else {
        setNotice("Task closed, but billing handoff is blocked until proof-of-work gates are complete.");
      }
    } catch (completeError) {
      setError(completeError.message || "Unable to complete field task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PortalShell
      title="Field Tasks Action Center"
      subtitle="Execution intelligence: resource commitments, conflict hard stops, and verified closeout-ready completion."
      activeHref="/portal/field-tasks"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/projects/${encodeURIComponent(projectId)}` : "/portal/projects"}
      primaryLabel="Back to projects"
    >
      <AuricruxInsightPanel
        title="Auricrux Field Execution"
        targetObjectId={projectId || "field-tasks"}
        sourceRoute="/portal/field-tasks"
        rationale="Field tasks are resource commitments tied to BIM intent, safety compliance, and commercial outcomes."
        nextAction="Resolve hard-stop conflicts first, then execute highest-impact unblocked work package."
        actionHref={hasProject ? `/portal/rfis?projectId=${encodeURIComponent(projectId)}` : "/portal/rfis"}
        actionLabel="Open RFIs"
        tone="amber"
        liveRecommend
      />

      {!hasProject ? <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to manage field execution.</div> : null}

      {hasProject ? (
        <>
          <div style={{ ...card, marginBottom: 12, borderColor: unresolvedHardStops.length ? "#fecaca" : "#dbeafe", background: unresolvedHardStops.length ? "#fef2f2" : "#eff6ff" }}>
            <div style={{ fontWeight: 800, marginBottom: 8, color: unresolvedHardStops.length ? "#991b1b" : "#1d4ed8" }}>Auricrux Action Center</div>
            <div style={{ color: "#334155", lineHeight: 1.7 }}>
              <div><strong>Open tasks:</strong> {items.filter((task) => !(task.status || "").toLowerCase().includes("complete")).length}</div>
              <div><strong>Hard-stop conflicts:</strong> {unresolvedHardStops.length}</div>
              <div><strong>Weather delays:</strong> {weatherDelayedTasks.length} (auto re-sequencing active)</div>
              <div><strong>Bottleneck warnings:</strong> {bottleneckWarnings.length}</div>
            </div>
          </div>

          {bottleneckWarnings.length ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#fde68a", background: "#fffbeb", color: "#92400e" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Bottleneck prediction</div>
              {bottleneckWarnings.map((warning) => (
                <div key={warning.taskId} style={{ marginBottom: 6 }}>
                  {warning.label} is trending at {warning.burnRatio}% burn rate. Reassign crew before budget erosion.
                </div>
              ))}
              <a href={hasProject ? `/portal/job-cost?projectId=${encodeURIComponent(projectId)}` : "/portal/job-cost"} style={{ color: "#92400e", fontWeight: 700 }}>
                Open job cost
              </a>
            </div>
          ) : null}

          {unresolvedHardStops.length ? (
            <div style={{ ...card, marginBottom: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Hard-stop alerts</div>
              {unresolvedHardStops.slice(0, 6).map((row) => (
                <div key={row.task.id || row.task.taskId} style={{ marginBottom: 8 }}>
                  <strong>{row.task.task}</strong>: {row.rfiConflict ? `Open RFI ${row.rfiConflict.number || row.rfiConflict.id}` : ""}{row.rfiConflict && row.safetyConflict ? " and " : ""}{row.safetyConflict ? "active safety signal" : ""}
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={hasProject ? `/portal/rfis?projectId=${encodeURIComponent(projectId)}` : "/portal/rfis"} style={{ color: "#991b1b", fontWeight: 700 }}>Resolve RFIs</a>
                <a href={hasProject ? `/portal/field-supervision?projectId=${encodeURIComponent(projectId)}` : "/portal/field-supervision"} style={{ color: "#991b1b", fontWeight: 700 }}>Resolve safety issues</a>
              </div>
            </div>
          ) : null}

          <div style={{ ...card, marginBottom: 14 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Create field task (resource commitment)</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <input value={draft.task} onChange={(event) => updateDraft("task", event.target.value)} placeholder="Task description" style={inputStyle} />
              <input value={draft.assignee} onChange={(event) => updateDraft("assignee", event.target.value)} placeholder="Assignee / crew" style={inputStyle} />
              <input value={draft.dueDate} onChange={(event) => updateDraft("dueDate", event.target.value)} placeholder="Due date YYYY-MM-DD" style={inputStyle} />
              <select value={draft.priority} onChange={(event) => updateDraft("priority", event.target.value)} style={inputStyle}>
                <option>Normal</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
              <input value={draft.estimatedCost} onChange={(event) => updateDraft("estimatedCost", event.target.value)} placeholder="Estimated cost" style={inputStyle} />
              <input value={draft.zone} onChange={(event) => updateDraft("zone", event.target.value)} placeholder="Work zone" style={inputStyle} />
              <input value={draft.requiredCertification} onChange={(event) => updateDraft("requiredCertification", event.target.value)} placeholder="Required certification (e.g. Confined Space)" style={inputStyle} />
              <select value={draft.dependsOnTaskId} onChange={(event) => updateDraft("dependsOnTaskId", event.target.value)} style={inputStyle}>
                <option value="">No dependency</option>
                {items.filter((task) => !(task.status || "").toLowerCase().includes("complete")).map((task) => (
                  <option key={task.id || task.taskId} value={task.id || task.taskId}>{task.task}</option>
                ))}
              </select>
              <select value={draft.planFileId} onChange={(event) => updateDraft("planFileId", event.target.value)} style={inputStyle}>
                <option value="">Plan file</option>
                {files.map((file) => (
                  <option key={file.fileId || file.id} value={file.fileId || file.id}>{file.name || file.fileId || file.id}</option>
                ))}
              </select>
              <input value={draft.drawingSheet} onChange={(event) => updateDraft("drawingSheet", event.target.value)} placeholder="Drawing sheet" style={inputStyle} />
              <input value={draft.bimObjectId} onChange={(event) => updateDraft("bimObjectId", event.target.value)} placeholder="BIM object ID" style={inputStyle} />
              <input value={draft.bimCoordinate} onChange={(event) => updateDraft("bimCoordinate", event.target.value)} placeholder="BIM coordinate" style={inputStyle} />
              <input value={draft.submittalReference} onChange={(event) => updateDraft("submittalReference", event.target.value)} placeholder="Submittal reference" style={inputStyle} />
            </div>

            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" style={{ ...button, borderColor: "#1d4ed8", background: "#eff6ff", color: "#1d4ed8" }} onClick={addTask} disabled={busy || !draft.task.trim() || !draft.assignee.trim()}>
                {busy ? "Saving..." : "Create task"}
              </button>
              {voiceSupported ? (
                <>
                  <button type="button" style={button} onClick={voiceListening ? stopVoiceCapture : startVoiceCapture}>
                    {voiceListening ? "Stop voice capture" : "Start voice capture"}
                  </button>
                  <button type="button" style={button} onClick={applyVoiceToDraft} disabled={!voiceTranscript.trim()}>
                    Apply voice to draft
                  </button>
                </>
              ) : null}
            </div>
            {voiceTranscript ? (
              <div style={{ marginTop: 10, border: "1px solid #dbeafe", borderRadius: 10, background: "#eff6ff", padding: 10, color: "#1e3a8a" }}>
                <div><strong>Voice transcript:</strong> {voiceTranscript}</div>
                <div style={{ marginTop: 4 }}><strong>Parsed:</strong> {voiceStructured.summary || "No structure recognized"}</div>
              </div>
            ) : null}
          </div>

          <div style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Dynamic crew assignment recommendations</div>
            <div style={{ display: "grid", gap: 8 }}>
              {sortedTasks.filter((task) => !(task.status || "").toLowerCase().includes("complete")).slice(0, 6).map((task) => {
                const bestCrew = chooseCrewForTask(task, productivityRows);
                return (
                  <div key={`crew-${task.id || task.taskId}`} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                    <strong>{task.task}</strong>
                    <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                      {bestCrew
                        ? `Recommended: ${bestCrew.crew} (${bestCrew.discipline}) score ${bestCrew.score}, avg ${bestCrew.avgDays} days`
                        : "Not enough historical productivity data to recommend crew yet."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...card, marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Search execution board</div>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by task, crew, zone, status" style={inputStyle} />
          </div>

          {notice ? <div style={{ ...card, marginBottom: 12, borderColor: "#bbf7d0", background: "#f0fdf4", color: "#166534" }}>{notice}</div> : null}
          {error ? <div style={{ ...card, marginBottom: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div> : null}
          {loading ? <div style={card}>Loading field tasks...</div> : null}

          <div style={{ display: "grid", gap: 12 }}>
            {sortedTasks.map((task) => {
              const taskId = task.id || task.taskId;
              const complete = (task.status || "").toLowerCase().includes("complete");
              const intentFile = files.find((file) => (file.fileId || file.id) === task.planFileId) || null;
              const submittal = files.find((file) => normalize(`${file.name || ""} ${file.fileId || file.id || ""}`).includes(normalize(task.submittalReference || ""))) || null;
              const linkedRfi = findOpenRfiConflict(task, rfis);
              const linkedSchedule = scheduleItems.find((row) => normalize(`${row.title || ""} ${row.project || ""}`).includes(normalize(task.task || ""))) || null;
              const safetyConflict = findSafetyConflict(task, fieldPhotos);
              const selectedPhotoId = completionEvidence[taskId]?.photoId || "";

              return (
                <div key={taskId} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ color: complete ? "#166534" : "#1d4ed8", fontWeight: 700, fontSize: 13 }}>{complete ? "Complete" : (task.status || "Open")}</div>
                      <strong>{task.task}</strong>
                    </div>
                    {!complete ? (
                      <button type="button" style={{ ...button, borderColor: "#166534", background: "#f0fdf4", color: "#166534" }} onClick={() => completeTask(task)} disabled={busy}>
                        Mark complete
                      </button>
                    ) : null}
                  </div>

                  <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.7 }}>
                    <div><strong>Crew:</strong> {task.assignee || "Unassigned"}</div>
                    <div><strong>Due:</strong> {task.dueDate || "Not set"} · <strong>Priority:</strong> {task.priority || "Normal"}</div>
                    <div><strong>Zone:</strong> {task.zone || "Not set"} · <strong>Dependency:</strong> {task.dependsOnTaskId || "None"}</div>
                    <div><strong>BIM object:</strong> {task.bimObjectId || "Not set"} · <strong>Coordinate:</strong> {task.bimCoordinate || "Not set"}</div>
                    <div><strong>Drawing sheet:</strong> {task.drawingSheet || "Not set"}</div>
                    <div><strong>Required cert:</strong> {task.requiredCertification || "None"}</div>
                  </div>

                  <div style={{ marginTop: 10, border: "1px solid #dbeafe", borderRadius: 10, background: "#eff6ff", padding: 10, color: "#1e3a8a" }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Office intent linkage</div>
                    <div><strong>Design intent file:</strong> {intentFile?.name || "Not linked"}</div>
                    <div><strong>Submittal approval:</strong> {submittal ? `${submittal.name} (${submittal.status || "Registered"})` : "Not linked"}</div>
                    <div><strong>RFI status:</strong> {linkedRfi ? `Blocked by ${linkedRfi.number || linkedRfi.id}` : "No open RFI blocker"}</div>
                    <div><strong>Schedule baseline:</strong> {linkedSchedule?.date || "No baseline match"}</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                      <a href={task.planFileId ? `/portal/design?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(task.planFileId)}&sheetId=${encodeURIComponent(task.drawingSheet || "")}` : `/portal/design?projectId=${encodeURIComponent(projectId)}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>Open BIM/design</a>
                      <a href={task.planFileId ? `/portal/plans?projectId=${encodeURIComponent(projectId)}&fileId=${encodeURIComponent(task.planFileId)}` : `/portal/plans?projectId=${encodeURIComponent(projectId)}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>Open plans</a>
                      <a href={`/portal/rfis?projectId=${encodeURIComponent(projectId)}`} style={{ color: "#1d4ed8", fontWeight: 700 }}>Open RFIs</a>
                    </div>
                  </div>

                  {!complete ? (
                    <div style={{ marginTop: 10, border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>Visual verification gate</div>
                      <select
                        value={selectedPhotoId}
                        onChange={(event) => setCompletionEvidence((current) => ({ ...current, [taskId]: { ...(current[taskId] || {}), photoId: event.target.value } }))}
                        style={inputStyle}
                      >
                        <option value="">Attach completion photo from Field Supervision</option>
                        {fieldPhotos.map((photo) => (
                          <option key={photo.id} value={photo.id}>{photo.notes || photo.id}</option>
                        ))}
                      </select>
                      <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>
                        Task closure requires a photo. Auricrux compares installation to governed plan/spec before close.
                      </div>
                    </div>
                  ) : null}

                  {linkedRfi || safetyConflict ? (
                    <div style={{ marginTop: 10, border: "1px solid #fecaca", borderRadius: 10, background: "#fef2f2", color: "#991b1b", padding: 10 }}>
                      <strong>Hard stop active:</strong> {linkedRfi ? `Open RFI ${linkedRfi.number || linkedRfi.id}. ` : ""}{safetyConflict ? "Safety incident conflict detected." : ""}
                    </div>
                  ) : null}
                </div>
              );
            })}
            {!loading && !sortedTasks.length ? <div style={card}>No field tasks for {projectId} yet.</div> : null}
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
