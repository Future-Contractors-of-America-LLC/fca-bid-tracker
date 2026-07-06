import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useWorkflowEvidence from "../../hooks/useWorkflowEvidence";
import useJobCost from "../../hooks/useJobCost";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import { fetchEstimates } from "../../api/commercialClient";
import {
  completeFieldScheduleEvent,
  createFieldScheduleEvent,
  fetchFieldSchedule,
  fetchFieldTasks,
} from "../../api/fieldOpsClient";
import { fetchProjectRfis } from "../../api/constructionClient";
import { sendPortalMessage } from "../../api/portalClient";
import { routeStateOverlays } from "../../systemState";

const card = { border: "1px solid #e5e7eb", borderRadius: 14, padding: 18, background: "#fff" };
const button = { border: "1px solid #cbd5e1", borderRadius: 8, background: "#fff", padding: "8px 12px", fontWeight: 700, cursor: "pointer" };
const input = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, padding: 9, boxSizing: "border-box", font: "inherit" };

const DAILY_LOGS_KEY = "fca_field_daily_logs_v1";
const PULL_PLAN_KEY = "fca_schedule_pull_plan_v2";
const BASELINE_KEY = "fca_schedule_baseline_snapshot_v1";
const MILESTONE_KEY = "fca_schedule_accountability_milestones_v1";
const LIVE_VIEW_KEY = "fca_schedule_live_views_v1";

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

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function datePart(value) {
  if (!value) return "";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "";
  return new Date(parsed).toISOString().slice(0, 10);
}

function plusDays(dateString, days) {
  const base = Date.parse(dateString || "");
  if (!Number.isFinite(base)) return "";
  return new Date(base + (days * 86400000)).toISOString().slice(0, 10);
}

function daysLate(targetDate) {
  const target = Date.parse(targetDate || "");
  if (!Number.isFinite(target)) return 0;
  return Math.max(0, Math.floor((Date.now() - target) / 86400000));
}

function parseMilestoneDocCheck(files, requiredDocToken) {
  const token = normalize(requiredDocToken);
  if (!token) return true;
  return (files || []).some((file) => {
    const hay = normalize(`${file.name || ""} ${file.category || ""} ${file.status || ""} ${file.evidenceStatus || ""}`);
    return hay.includes(token) && /(approved|ready|verified|uploaded|active)/.test(hay);
  });
}

function deriveDelayFromLogs(taskText, dailyLogs) {
  const text = normalize(taskText);
  const relevant = (dailyLogs || []).filter((log) => {
    const hay = normalize(`${log.notes || ""} ${Array.isArray(log.safety) ? log.safety.join(" ") : log.safety || ""} ${log.zone || ""}`);
    return text && (hay.includes(text.split(" ")[0] || "") || text.split(" ").some((token) => token.length > 4 && hay.includes(token)));
  });
  const blockers = relevant.filter((log) => /hold|unsafe|incident|delay|waiting|rfi|material/.test(normalize(`${log.notes || ""} ${log.safety || ""}`)));
  return Math.min(5, blockers.length);
}

function taskConstraintState(task, rfis, dailyLogs) {
  const taskText = normalize(`${task.title || task.task || ""} ${task.zone || ""}`);
  const openRfi = (rfis || []).find((rfi) => {
    if (String(rfi.recordStatus || rfi.status || "").toLowerCase().includes("answered")) return false;
    const rfiText = normalize(`${rfi.question || ""} ${rfi.zone || ""} ${rfi.drawingSheet || ""} ${rfi.bimObjectId || ""}`);
    return taskText && taskText.split(" ").some((token) => token.length > 4 && rfiText.includes(token));
  });
  const safetyHold = (dailyLogs || []).find((log) => {
    const hay = normalize(`${log.notes || ""} ${log.safety || ""} ${log.zone || ""}`);
    return /hold|stop work|unsafe|incident|near miss/.test(hay) && (!task.zone || hay.includes(normalize(task.zone)) || taskText.split(" ").some((token) => token.length > 4 && hay.includes(token)));
  });
  return {
    rfiClear: !openRfi,
    supervisionClear: !safetyHold,
    materialReady: Boolean(task.materialReady),
    blockers: [
      openRfi ? `Open RFI: ${openRfi.number || openRfi.rfiId || openRfi.id}` : "",
      safetyHold ? `Field supervision hold: ${safetyHold.notes || "safety event"}` : "",
      !task.materialReady ? "Material readiness not confirmed" : "",
    ].filter(Boolean),
  };
}

function buildMitigationScenarios(delayDays, estimateTotal, crew) {
  const overtimeRecover = Math.min(delayDays, 2);
  const secondShiftRecover = Math.min(delayDays, 3);
  const resequenceRecover = Math.min(delayDays, 1);
  const base = Math.max(2000, estimateTotal * 0.004);
  return [
    {
      id: "overtime",
      title: `Authorize 4h Saturday overtime for ${crew || "assigned crew"}`,
      recoverDays: overtimeRecover,
      cost: Math.round(base * 1.2),
    },
    {
      id: "second-shift",
      title: "Add second shift for two cycles",
      recoverDays: secondShiftRecover,
      cost: Math.round(base * 1.9),
    },
    {
      id: "resequence",
      title: "Resequence non-critical predecessor work",
      recoverDays: resequenceRecover,
      cost: Math.round(base * 0.6),
    },
  ].filter((scenario) => scenario.recoverDays > 0);
}

function readLiveMode() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("live") === "1";
}

export default function PortalScheduling() {
  const { projectId, hasProject } = usePortalProjectId();
  const { projects } = useProjectWorkspace();
  const { files } = useWorkflowEvidence(projectId);
  const jobCost = useJobCost(projectId);
  const [liveMode] = useState(() => readLiveMode());

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pullPlan, setPullPlan] = useState(() => readLocalJson(PULL_PLAN_KEY, {}));
  const [baseline, setBaseline] = useState(() => readLocalJson(BASELINE_KEY, {}));
  const [milestones, setMilestones] = useState(() => readLocalJson(MILESTONE_KEY, {}));
  const [liveViews, setLiveViews] = useState(() => readLocalJson(LIVE_VIEW_KEY, {}));
  const [newMilestone, setNewMilestone] = useState({ title: "", owner: "", requiredDocToken: "permit", dueDate: "" });
  const [pullDraft, setPullDraft] = useState({ taskId: "", date: "", owner: "", zone: "", materialReady: false, dependsOn: "" });

  const scheduleLoad = usePortalApiLoad(() => (hasProject ? fetchFieldSchedule({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const tasksLoad = usePortalApiLoad(() => (hasProject ? fetchFieldTasks({ projectId }) : Promise.resolve({ items: [] })), [projectId, hasProject]);
  const rfisLoad = usePortalApiLoad(() => (hasProject ? fetchProjectRfis(projectId) : Promise.resolve([])), [projectId, hasProject]);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);

  const [crossProjectSchedule, setCrossProjectSchedule] = useState([]);

  useEffect(() => {
    writeLocalJson(PULL_PLAN_KEY, pullPlan);
  }, [pullPlan]);

  useEffect(() => {
    writeLocalJson(BASELINE_KEY, baseline);
  }, [baseline]);

  useEffect(() => {
    writeLocalJson(MILESTONE_KEY, milestones);
  }, [milestones]);

  useEffect(() => {
    writeLocalJson(LIVE_VIEW_KEY, liveViews);
  }, [liveViews]);

  useEffect(() => {
    let active = true;
    async function loadAllProjects() {
      const ids = (projects || []).map((project) => project.id).filter(Boolean);
      if (!ids.length) {
        setCrossProjectSchedule([]);
        return;
      }
      const rows = await Promise.all(ids.map(async (id) => {
        try {
          const payload = await fetchFieldSchedule({ projectId: id });
          return (payload.items || []).map((item) => ({ ...item, projectId: id }));
        } catch {
          return [];
        }
      }));
      if (active) setCrossProjectSchedule(rows.flat());
    }
    loadAllProjects();
    return () => {
      active = false;
    };
  }, [projects]);

  const scheduleItems = scheduleLoad.data?.items || [];
  const fieldTasks = tasksLoad.data?.items || [];
  const rfis = rfisLoad.data || [];
  const estimates = estimatesLoad.data?.items || [];
  const dailyLogs = readLocalJson(DAILY_LOGS_KEY, []).filter((log) => log.projectId === projectId);

  const projectEstimate = useMemo(() => {
    const hayProject = normalize(projectId);
    const direct = estimates.find((estimate) => normalize(`${estimate.projectId || ""} ${estimate.id || ""}`).includes(hayProject));
    return direct || estimates[0] || null;
  }, [estimates, projectId]);

  useEffect(() => {
    if (!hasProject) return;
    const current = baseline[projectId] || {};
    const missing = (scheduleItems || []).filter((item) => !current[item.eventId || item.id]);
    if (!missing.length) return;
    const merged = { ...current };
    for (const item of missing) {
      merged[item.eventId || item.id] = datePart(item.date || item.dueDate || item.updatedAt) || "";
    }
    setBaseline((existing) => ({ ...existing, [projectId]: merged }));
  }, [baseline, hasProject, projectId, scheduleItems]);

  const pullPlanRows = pullPlan[projectId] || [];
  const milestoneRows = milestones[projectId] || [];
  const incompleteTasks = fieldTasks.filter((task) => !String(task.status || "").toLowerCase().includes("complete"));

  const pullPlanWithConstraints = useMemo(() => {
    return pullPlanRows.map((row) => {
      const task = incompleteTasks.find((item) => String(item.taskId || item.id) === String(row.taskId)) || row;
      const constraints = taskConstraintState({ ...task, ...row }, rfis, dailyLogs);
      return { ...row, task, constraints };
    });
  }, [dailyLogs, incompleteTasks, pullPlanRows, rfis]);

  const delayedImpactRows = useMemo(() => {
    const base = baseline[projectId] || {};
    return scheduleItems.map((item) => {
      const id = item.eventId || item.id;
      const baselineDate = base[id] || datePart(item.date || item.dueDate || item.updatedAt);
      const isComplete = String(item.status || "").toLowerCase().includes("complete");
      const baseSlip = isComplete ? 0 : daysLate(baselineDate);
      const logSlip = deriveDelayFromLogs(item.title || item.task || "", dailyLogs);
      const predictedSlip = baseSlip + logSlip;
      const predictedDate = plusDays(baselineDate, predictedSlip);
      return {
        id,
        title: item.title || item.task || id,
        baselineDate,
        predictedDate,
        predictedSlip,
        dependentImpact: pullPlanWithConstraints.filter((plan) => String(plan.dependsOn || "") === String(id)).length,
        crew: item.crew || item.owner || "Crew",
        status: item.status || "open",
      };
    }).sort((a, b) => b.predictedSlip - a.predictedSlip);
  }, [baseline, dailyLogs, projectId, pullPlanWithConstraints, scheduleItems]);

  const resourceConflicts = useMemo(() => {
    const byDateResource = {};
    for (const item of crossProjectSchedule) {
      const date = datePart(item.date || item.dueDate || item.updatedAt);
      const resource = normalize(item.crew || item.owner || item.title || "");
      if (!date || !resource) continue;
      const key = `${date}::${resource}`;
      byDateResource[key] = byDateResource[key] || [];
      byDateResource[key].push(item);
    }
    return Object.values(byDateResource)
      .filter((rows) => {
        const projectSet = new Set(rows.map((row) => row.projectId));
        return projectSet.size > 1;
      })
      .map((rows) => ({
        date: datePart(rows[0].date || rows[0].dueDate || rows[0].updatedAt),
        resource: rows[0].crew || rows[0].owner || rows[0].title,
        projects: rows.map((row) => row.projectId),
      }))
      .slice(0, 10);
  }, [crossProjectSchedule]);

  const evm = useMemo(() => {
    const total = Math.max(1, scheduleItems.length);
    const dueNow = scheduleItems.filter((item) => {
      const due = Date.parse(item.date || item.dueDate || "");
      return Number.isFinite(due) && due <= Date.now();
    }).length;
    const completed = scheduleItems.filter((item) => String(item.status || "").toLowerCase().includes("complete")).length;
    const plannedPct = dueNow / total;
    const earnedPct = completed / total;
    const contractValue = toNumber(jobCost.rollup?.contractValue || projectEstimate?.total || 0);
    const actualCost = toNumber(jobCost.rollup?.actualCost || 0);
    const pv = contractValue * plannedPct;
    const ev = contractValue * earnedPct;
    const ac = actualCost;
    const cpi = ac > 0 ? ev / ac : 0;
    const spi = pv > 0 ? ev / pv : 0;
    return {
      pv,
      ev,
      ac,
      cpi,
      spi,
      plannedPct: Math.round(plannedPct * 100),
      earnedPct: Math.round(earnedPct * 100),
    };
  }, [jobCost.rollup, projectEstimate?.total, scheduleItems]);

  const scheduleCrashingOptions = useMemo(() => {
    const total = toNumber(projectEstimate?.total || jobCost.rollup?.contractValue || 0);
    return delayedImpactRows
      .filter((row) => row.predictedSlip > 0)
      .slice(0, 8)
      .map((row) => {
        const estimateWeight = Math.max(1000, total * 0.006 + (row.dependentImpact * 750));
        const maxRecover = Math.min(4, row.predictedSlip);
        const costPerDay = Math.round(estimateWeight / Math.max(1, maxRecover));
        return {
          taskId: row.id,
          task: row.title,
          recoverDays: maxRecover,
          incrementalCost: Math.round(estimateWeight),
          costPerDay,
          recommendation: `Recover ${maxRecover} day(s) by accelerating ${row.title} at about $${costPerDay.toLocaleString()} per day.`,
        };
      })
      .sort((a, b) => a.costPerDay - b.costPerDay);
  }, [delayedImpactRows, jobCost.rollup?.contractValue, projectEstimate?.total]);

  const liveViewToken = liveViews[projectId] || "";
  const liveHref = hasProject && liveViewToken
    ? `${window.location.origin}/portal/scheduling?projectId=${encodeURIComponent(projectId)}&live=1&token=${encodeURIComponent(liveViewToken)}`
    : "";

  async function addPulledTask() {
    if (!pullDraft.taskId || !pullDraft.date) return;
    const task = incompleteTasks.find((item) => String(item.taskId || item.id) === String(pullDraft.taskId));
    if (!task) return;
    const next = {
      id: `pull-${Date.now()}`,
      taskId: String(task.taskId || task.id),
      title: task.task || task.title,
      date: pullDraft.date,
      owner: pullDraft.owner || task.assignee || "Superintendent",
      zone: pullDraft.zone || task.zone || "",
      materialReady: Boolean(pullDraft.materialReady),
      dependsOn: pullDraft.dependsOn,
      createdAt: new Date().toISOString(),
    };
    setPullPlan((current) => ({ ...current, [projectId]: [next, ...(current[projectId] || [])].slice(0, 240) }));
    setPullDraft({ taskId: "", date: "", owner: "", zone: "", materialReady: false, dependsOn: "" });
    setNotice("Task pulled into collaborative plan board.");
  }

  async function commitPulledTask(row) {
    const constraint = taskConstraintState(row, rfis, dailyLogs);
    if (!constraint.rfiClear || !constraint.supervisionClear || !constraint.materialReady) {
      setError(`Task blocked by constraint: ${constraint.blockers.join(" | ")}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await createFieldScheduleEvent({
        projectId,
        title: row.title,
        date: row.date,
        crew: row.owner,
        zone: row.zone,
        estimatedCost: row.estimatedCost || "0",
        sourceRoute: "/portal/scheduling",
      });
      setNotice("Pulled task committed to live schedule.");
      await scheduleLoad.reload();
    } catch (commitError) {
      setError(commitError.message || "Unable to commit pulled task.");
    } finally {
      setBusy(false);
    }
  }

  async function completeMilestone(item) {
    const milestone = milestoneRows.find((row) => row.eventId === (item.eventId || item.id));
    if (!milestone) {
      setError("Milestone accountability metadata is missing.");
      return;
    }
    if (!parseMilestoneDocCheck(files, milestone.requiredDocToken)) {
      setError(`Cannot close milestone until required documentation is uploaded: ${milestone.requiredDocToken}`);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await completeFieldScheduleEvent(item.eventId || item.id);
      setNotice("Milestone completed with accountability record.");
      await scheduleLoad.reload();
    } catch (completeError) {
      setError(completeError.message || "Unable to complete milestone.");
    } finally {
      setBusy(false);
    }
  }

  function addMilestoneMetadata() {
    if (!newMilestone.title.trim() || !newMilestone.owner.trim() || !newMilestone.requiredDocToken.trim()) {
      setError("Milestone title, owner, and required documentation token are required.");
      return;
    }
    const row = {
      id: `ms-${Date.now()}`,
      eventId: newMilestone.title.trim(),
      title: newMilestone.title.trim(),
      owner: newMilestone.owner.trim(),
      requiredDocToken: newMilestone.requiredDocToken.trim(),
      dueDate: newMilestone.dueDate || "",
      createdAt: new Date().toISOString(),
    };
    setMilestones((current) => ({ ...current, [projectId]: [row, ...(current[projectId] || [])].slice(0, 120) }));
    setNewMilestone({ title: "", owner: "", requiredDocToken: "permit", dueDate: "" });
    setNotice("Accountability-linked milestone registered.");
  }

  async function runMitigation(row) {
    const scenarios = buildMitigationScenarios(row.predictedSlip, toNumber(projectEstimate?.total || jobCost.rollup?.contractValue), row.crew);
    const best = scenarios.sort((a, b) => (b.recoverDays / Math.max(1, b.cost)) - (a.recoverDays / Math.max(1, a.cost)))[0];
    if (!best) return;
    await sendPortalMessage({
      channel: "teams",
      subject: `Auricrux mitigation scenario for ${projectId}`,
      message: `${row.title} is predicted to slip by ${row.predictedSlip} day(s). Recommended scenario: ${best.title}. Cost ~ $${best.cost.toLocaleString()} to recover ${best.recoverDays} day(s). Use /portal/job-cost to authorize.`,
    }).catch(() => null);
    setNotice("Auricrux mitigation scenario sent to PM/office with job cost authorization prompt.");
  }

  async function publishCheapestCrash(option) {
    await sendPortalMessage({
      channel: "teams",
      subject: `Automated schedule crashing recommendation for ${projectId}`,
      message: `${option.recommendation} This is currently the lowest-cost acceleration path based on estimate and dependency weight.`,
    }).catch(() => null);
    setNotice("Lowest-cost schedule crash scenario sent to leadership.");
  }

  function generateLiveLink() {
    if (!hasProject) return;
    const token = `live-${Math.random().toString(36).slice(2, 12)}-${Date.now().toString(36)}`;
    setLiveViews((current) => ({ ...current, [projectId]: token }));
    setNotice("Secure live schedule link generated.");
  }

  const openScheduleRows = scheduleItems.filter((item) => !String(item.status || "").toLowerCase().includes("complete"));

  return (
    <PortalShell
      title={liveMode ? "Live Schedule View" : "Scheduling Dynamic Flow Orchestration"}
      subtitle="Schedule orchestration across field constraints and client visibility."
      activeHref="/portal/scheduling"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref={hasProject ? `/portal/field-tasks?projectId=${encodeURIComponent(projectId)}` : "/portal/field-tasks"}
      primaryLabel="Open field tasks"
    >
      {!hasProject ? (
        <div style={card}>Select an active project from <a href="/portal/projects">Projects</a> to activate schedule orchestration.</div>
      ) : null}

      {hasProject ? (
        <>
          {!liveMode ? (
            <AuricruxInsightPanel
              title="Auricrux Scheduler in Chief"
              targetObjectId={projectId}
              sourceRoute="/portal/scheduling"
              rationale="Schedule is a living contract and must stay tied to constraints, field truth, and financial performance."
              nextAction="Pull ready tasks, clear hard constraints, and run mitigation on predicted delay nodes."
              actionHref={`/portal/field-supervision?projectId=${encodeURIComponent(projectId)}`}
              actionLabel="Open field supervision"
              tone="blue"
              liveRecommend
            />
          ) : null}

          <div style={{ ...card, marginTop: 14, marginBottom: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <div><strong>Planned value:</strong> ${Math.round(evm.pv).toLocaleString()}</div>
              <div><strong>Earned value:</strong> ${Math.round(evm.ev).toLocaleString()}</div>
              <div><strong>Actual cost:</strong> ${Math.round(evm.ac).toLocaleString()}</div>
              <div><strong>CPI:</strong> {evm.cpi ? evm.cpi.toFixed(2) : "n/a"}</div>
              <div><strong>SPI:</strong> {evm.spi ? evm.spi.toFixed(2) : "n/a"}</div>
              <div><strong>Completion:</strong> {evm.earnedPct}% earned / {evm.plannedPct}% planned</div>
            </div>
          </div>

          {!liveMode ? (
            <>
              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Collaborative Pull-Plan Whiteboard</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                  <select value={pullDraft.taskId} onChange={(event) => setPullDraft((current) => ({ ...current, taskId: event.target.value }))} style={input}>
                    <option value="">Select field task</option>
                    {incompleteTasks.map((task) => (
                      <option key={task.taskId || task.id} value={task.taskId || task.id}>{task.task || task.title}</option>
                    ))}
                  </select>
                  <input type="date" value={pullDraft.date} onChange={(event) => setPullDraft((current) => ({ ...current, date: event.target.value }))} style={input} />
                  <input value={pullDraft.owner} onChange={(event) => setPullDraft((current) => ({ ...current, owner: event.target.value }))} placeholder="Trade partner / superintendent" style={input} />
                  <input value={pullDraft.zone} onChange={(event) => setPullDraft((current) => ({ ...current, zone: event.target.value }))} placeholder="Zone" style={input} />
                  <input value={pullDraft.dependsOn} onChange={(event) => setPullDraft((current) => ({ ...current, dependsOn: event.target.value }))} placeholder="Depends on event id" style={input} />
                </div>
                <label style={{ display: "block", marginTop: 8, marginBottom: 8 }}>
                  <input type="checkbox" checked={pullDraft.materialReady} onChange={(event) => setPullDraft((current) => ({ ...current, materialReady: event.target.checked }))} /> Material ready
                </label>
                <button type="button" style={button} onClick={addPulledTask}>Pull task into board</button>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 8, marginTop: 10 }}>
                  {pullPlanWithConstraints.map((row) => {
                    const blocked = !(row.constraints.rfiClear && row.constraints.supervisionClear && row.constraints.materialReady);
                    return (
                      <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: blocked ? "#fff7ed" : "#f0fdf4" }}>
                        <div style={{ fontWeight: 700 }}>{row.title}</div>
                        <div style={{ color: "#475569", fontSize: 13 }}>Target {row.date} · Owner {row.owner}</div>
                        <div style={{ color: blocked ? "#9a3412" : "#166534", fontSize: 13, marginTop: 6 }}>
                          {blocked ? `Blocked: ${row.constraints.blockers.join(" | ")}` : "Ready to commit to live schedule"}
                        </div>
                        <button type="button" disabled={blocked || busy} style={{ ...button, marginTop: 8, opacity: blocked ? 0.5 : 1 }} onClick={() => commitPulledTask(row)}>
                          Commit to schedule
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Predictive delay and dependency impact</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {delayedImpactRows.slice(0, 8).map((row) => (
                    <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: row.predictedSlip > 0 ? "#fef2f2" : "#f8fafc" }}>
                      <div style={{ fontWeight: 700 }}>{row.title}</div>
                      <div style={{ color: "#475569", fontSize: 13 }}>
                        Baseline {row.baselineDate || "n/a"} {" -> "} Predicted {row.predictedDate || "n/a"} ({row.predictedSlip} day slip) · Dependent tasks impacted: {row.dependentImpact}
                      </div>
                      {row.predictedSlip > 0 ? (
                        <div style={{ marginTop: 8 }}>
                          <button type="button" style={button} onClick={() => runMitigation(row)}>Generate resolution scenario</button>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Automated schedule crashing (economical recovery)</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {scheduleCrashingOptions.slice(0, 5).map((option) => (
                    <div key={option.taskId} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                      <div style={{ fontWeight: 700 }}>{option.task}</div>
                      <div style={{ color: "#475569", fontSize: 13 }}>{option.recommendation}</div>
                      <div style={{ color: "#334155", fontSize: 13 }}>Incremental cost ${option.incrementalCost.toLocaleString()} · Cost/day ${option.costPerDay.toLocaleString()}</div>
                      <button type="button" style={{ ...button, marginTop: 8 }} onClick={() => publishCheapestCrash(option)}>Publish crashing recommendation</button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Accountability-linked milestones</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
                  <input value={newMilestone.title} onChange={(event) => setNewMilestone((current) => ({ ...current, title: event.target.value }))} placeholder="Milestone / Event ID" style={input} />
                  <input value={newMilestone.owner} onChange={(event) => setNewMilestone((current) => ({ ...current, owner: event.target.value }))} placeholder="Responsible stakeholder" style={input} />
                  <input value={newMilestone.requiredDocToken} onChange={(event) => setNewMilestone((current) => ({ ...current, requiredDocToken: event.target.value }))} placeholder="Required doc token" style={input} />
                  <input type="date" value={newMilestone.dueDate} onChange={(event) => setNewMilestone((current) => ({ ...current, dueDate: event.target.value }))} style={input} />
                </div>
                <button type="button" style={{ ...button, marginTop: 8 }} onClick={addMilestoneMetadata}>Add milestone accountability</button>

                <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                  {milestoneRows.slice(0, 10).map((row) => (
                    <div key={row.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#f8fafc" }}>
                      <div style={{ fontWeight: 700 }}>{row.title}</div>
                      <div style={{ color: "#475569", fontSize: 13 }}>Owner {row.owner} · Required doc {row.requiredDocToken}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...card, marginBottom: 12 }}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Global resource leveling across projects</div>
                {resourceConflicts.length ? (
                  <div style={{ display: "grid", gap: 8 }}>
                    {resourceConflicts.map((conflict) => (
                      <div key={`${conflict.date}-${conflict.resource}`} style={{ border: "1px solid #fecaca", borderRadius: 10, padding: 10, background: "#fef2f2", color: "#991b1b" }}>
                        {conflict.resource} is double-booked on {conflict.date} across {conflict.projects.join(", ")}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "#166534" }}>No cross-project crew/equipment conflicts detected.</div>
                )}
              </div>

              <div style={card}>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Owner/client live schedule channel</div>
                <button type="button" style={button} onClick={generateLiveLink}>Generate secure live link</button>
                {liveHref ? (
                  <div style={{ marginTop: 8, color: "#334155" }}>
                    Read-only URL: <a href={liveHref}>{liveHref}</a>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}

          <div style={{ ...card, marginTop: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>{liveMode ? "Live schedule feed" : "Live schedule execution register"}</div>
            <div style={{ display: "grid", gap: 8 }}>
              {openScheduleRows.slice(0, 20).map((item) => {
                const key = item.eventId || item.id;
                const milestone = milestoneRows.find((row) => row.eventId === key || row.title === key);
                const canComplete = milestone ? parseMilestoneDocCheck(files, milestone.requiredDocToken) : true;
                return (
                  <div key={key} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                    <div style={{ fontWeight: 700 }}>{item.title || item.task || key}</div>
                    <div style={{ color: "#475569", fontSize: 13 }}>Due {datePart(item.date || item.dueDate || item.updatedAt) || "n/a"} · Owner {item.crew || item.owner || "unassigned"}</div>
                    {milestone ? (
                      <div style={{ color: canComplete ? "#166534" : "#9a3412", fontSize: 13 }}>Milestone owner {milestone.owner} · Required evidence {milestone.requiredDocToken}</div>
                    ) : null}
                    {!liveMode && milestone ? (
                      <button type="button" style={{ ...button, marginTop: 8, opacity: canComplete ? 1 : 0.5 }} disabled={!canComplete || busy} onClick={() => completeMilestone(item)}>
                        Mark complete
                      </button>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {notice ? <div style={{ ...card, marginTop: 12, borderColor: "#86efac", background: "#ecfdf5", color: "#166534" }}>{notice}</div> : null}
          {error ? <div style={{ ...card, marginTop: 12, borderColor: "#fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div> : null}
        </>
      ) : null}
    </PortalShell>
  );
}
