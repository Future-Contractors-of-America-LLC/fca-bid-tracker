import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import ProjectActionCenter from "../../components/ProjectActionCenter";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { routeStateOverlays } from "../../systemState";
import { adminGovernance } from "../../adminGovernance";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchWorkflowAudit, fetchWorkflowFiles } from "../../api/workflowClient";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchJobCosts, fetchChangeOrders, fetchProjectRfis } from "../../api/constructionClient";
import { fetchPortalInvoices, fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { fetchCommercialPipeline, pipelineItemsToMap } from "../../api/pipelineClient";
import { fetchEstimates } from "../../api/commercialClient";
import { publishProjectEvent } from "../../projectEventBus";
import { PROJECT_EVENT_TYPES } from "../../projectEventContracts";
import { startProjectFinanceContinuityListener } from "../../projectFinanceContinuityListener";
import {
  checkGateRequirement,
  findStageGate,
  formatUsd,
  inferProjectHealth,
  latestByDate,
  negativeMessageRisk,
  parseCurrency,
} from "../../projectsDomain";
import {
  PortalAlert,
  PortalEntityTable,
  PortalEmptyState,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalEyebrowStyle,
  portalInputStyle,
  portalTokens,
} from "../../portalDesignTokens";

const BRAND_STORAGE_KEY = "fca_customer_brand_skin_v1";
const PROJECT_COMMAND_KEY = "fca_customer_project_command_v1";
const PROJECT_ORCHESTRATION_KEY = "fca_project_orchestration_v1";

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

const defaultCommandDraft = {
  ownerNote: "",
  customerMilestone: "Kickoff scheduled",
};

export default function PortalProjects() {
  const { state, refreshSyncStamp, syncActiveProject } = useWorkspaceState();
  const { bids } = useBidWorkspace();
  const { projects, activeProject, meta, reloadProjects, selectActiveProject, advanceProjectStage, clearPermitBlocker, updateProjectCommandNotes } = useProjectWorkspace();
  const brandSkin = readLocalJson(BRAND_STORAGE_KEY, { companyName: "Customer Workspace", accent: "#1d4ed8", surface: "#eff6ff" });
  const [drafts, setDrafts] = useState(() => readLocalJson(PROJECT_COMMAND_KEY, {}));
  const [orchestrationState, setOrchestrationState] = useState(() => readLocalJson(PROJECT_ORCHESTRATION_KEY, {}));
  const [selectedProjectId, setSelectedProjectId] = useState(() => activeProject?.id || projects[0]?.id || "");
  const [notesStatus, setNotesStatus] = useState("");
  const [moduleNotice, setModuleNotice] = useState("");
  const [moduleError, setModuleError] = useState("");

  useEffect(() => {
    refreshSyncStamp("Project command active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(PROJECT_COMMAND_KEY, drafts);
  }, [drafts]);

  useEffect(() => {
    writeLocalJson(PROJECT_ORCHESTRATION_KEY, orchestrationState);
  }, [orchestrationState]);

  useEffect(() => {
    const stop = startProjectFinanceContinuityListener({
      onNotice: (message) => setModuleNotice(message),
      onError: (message) => setModuleError(message),
    });
    return () => stop();
  }, []);

  const visibleProject = projects.find((project) => project.id === selectedProjectId) || activeProject || state.project;
  const projectId = visibleProject?.id || "";

  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({ projectId }), [projectId]);
  const auditLoad = usePortalApiLoad(() => fetchWorkflowAudit({ projectId }), [projectId]);
  const scheduleLoad = usePortalApiLoad(() => fetchFieldSchedule({ projectId }), [projectId]);
  const tasksLoad = usePortalApiLoad(() => fetchFieldTasks({ projectId }), [projectId]);
  const jobCostLoad = usePortalApiLoad(() => fetchJobCosts(projectId), [projectId]);
  const changeOrdersLoad = usePortalApiLoad(() => fetchChangeOrders(projectId), [projectId]);
  const rfisLoad = usePortalApiLoad(() => fetchProjectRfis(projectId), [projectId]);
  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);
  const pipelineLoad = usePortalApiLoad(() => fetchCommercialPipeline(), []);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);

  const projectFiles = filesLoad.data?.items || [];
  const projectAudit = auditLoad.data?.items || [];
  const scheduleItems = scheduleLoad.data?.items || [];
  const fieldTasks = tasksLoad.data?.items || [];
  const jobCostRollup = jobCostLoad.data?.items?.[0] || null;
  const changeOrders = changeOrdersLoad.data?.items || [];
  const rfis = rfisLoad.data || [];
  const allInvoices = invoicesLoad.data?.items || [];
  const allMessages = messagesLoad.data?.items || [];
  const allEstimates = estimatesLoad.data?.items || [];
  const pipelineLinks = pipelineItemsToMap(pipelineLoad.data?.items || []);

  const apiBacked = meta.backingSource === "api-workflow-store";
  const loadStatus = meta.backingSource === "loading" ? "loading" : meta.backingSource === "api-error" ? "error" : "ready";

  const sourceBid = bids.find((bid) => bid.id === visibleProject?.sourceBidId) || null;
  const pipelineLink = sourceBid ? pipelineLinks[sourceBid.id] : null;
  const threadEstimate = allEstimates.find((estimate) => {
    const hay = `${estimate.projectId || ""} ${estimate.bidId || ""} ${estimate.opportunityId || ""}`.toLowerCase();
    return hay.includes(projectId.toLowerCase()) || (sourceBid?.id && hay.includes(sourceBid.id.toLowerCase()));
  }) || null;
  const threadInvoice = allInvoices.find((invoice) => invoice.id === pipelineLink?.invoiceId)
    || allInvoices.find((invoice) => `${invoice.note || ""} ${invoice.invoiceName || ""}`.toLowerCase().includes(projectId.toLowerCase()))
    || null;

  const schedulePastDue = scheduleItems.filter((item) => {
    const due = Date.parse(item.date || item.dueDate || item.updatedAt || "");
    const completed = String(item.status || "").toLowerCase().includes("complete");
    return Number.isFinite(due) && due < Date.now() && !completed;
  }).length;
  const scheduleVariance = scheduleItems.length ? Math.round((schedulePastDue / scheduleItems.length) * 100) : 0;

  const contractValue = parseCurrency(jobCostRollup?.contractValue || sourceBid?.value || 0);
  const actualCost = parseCurrency(jobCostRollup?.actualCost || 0);
  const committedCost = parseCurrency(jobCostRollup?.committedCost || 0);
  const estimateToComplete = Math.max(0, contractValue - actualCost);
  const forecastCostAtCompletion = actualCost + committedCost;
  const costVariance = contractValue > 0 ? Math.max(0, Math.round(((forecastCostAtCompletion - contractValue) / contractValue) * 100)) : 0;
  const riskExposure = negativeMessageRisk(allMessages, projectId);
  const health = inferProjectHealth({ scheduleVariance, costVariance, riskExposure });

  const corporateBacklog = projects.reduce((sum, project) => {
    const projectBid = bids.find((bid) => bid.id === project.sourceBidId);
    return sum + parseCurrency(projectBid?.value || 0);
  }, 0);
  const projectContribution = contractValue > 0 && corporateBacklog > 0 ? Math.round((contractValue / corporateBacklog) * 100) : 0;

  const resourceConflict = useMemo(() => {
    if (!projectId || !scheduleItems.length) return [];
    const crews = new Set(scheduleItems.map((item) => String(item.crew || "").trim()).filter(Boolean));
    if (!crews.size) return [];
    return projects
      .filter((project) => project.id !== projectId)
      .map((project) => {
        const projectTasks = fieldTasks.filter((task) => String(task.projectId || "") === project.id);
        const overlap = projectTasks.filter((task) => crews.has(String(task.crew || "").trim()));
        return { project, overlapCount: overlap.length };
      })
      .filter((entry) => entry.overlapCount > 0)
      .sort((a, b) => b.overlapCount - a.overlapCount)
      .slice(0, 5);
  }, [fieldTasks, projectId, projects, scheduleItems]);

  const stageGate = findStageGate(visibleProject?.stage, "Construction", adminGovernance);
  const stageGateChecks = (stageGate?.requirements || []).map((requirement) => checkGateRequirement(requirement, { project: visibleProject, projectFiles }));
  const stageGateBlocked = Boolean(stageGate) && stageGateChecks.some((check) => !check.pass);

  const latestAudit = latestByDate(projectAudit);
  const financialImplication = (() => {
    const text = `${latestAudit?.detail || ""} ${latestAudit?.reason || ""}`;
    const match = text.match(/\$\s?([\d,]+(?:\.\d+)?)/);
    return match ? `$${match[1]}` : "Not explicitly recorded";
  })();

  const tableRows = useMemo(
    () =>
      projects.map((project) => ({
        id: project.id,
        active: visibleProject?.id === project.id,
        project,
        name: `${project.id} · ${project.customer}`,
        stage: project.stage,
        owner: project.owner,
        due: project.due,
        nextAction: project.nextAction,
      })),
    [projects, visibleProject?.id],
  );

  function updateDraft(projectId, key, value) {
    setDrafts((current) => ({
      ...current,
      [projectId]: {
        ...(current[projectId] || defaultCommandDraft),
        [key]: value,
      },
    }));
  }

  async function persistCommandNotes(projectId) {
    const command = drafts[projectId] || defaultCommandDraft;
    const saved = await updateProjectCommandNotes(projectId, {
      ownerNote: command.ownerNote,
      customerMilestone: command.customerMilestone,
    });
    setNotesStatus(saved ? "Notes saved to project record." : "Unable to save notes — check workspace API connection.");
    setTimeout(() => setNotesStatus(""), 3000);
  }

  const draft = visibleProject ? (drafts[visibleProject.id] || defaultCommandDraft) : defaultCommandDraft;
  const project = visibleProject;

  async function sendDelayNotice() {
    if (!visibleProject?.id) return;
    const noticeBody = `Notice of Delay: ${visibleProject.id} is currently ${schedulePastDue} scheduled milestone(s) behind. Proposed mitigation: re-sequence crews, update critical path, and issue customer impact advisory.`;
    try {
      await sendPortalMessage({
        channel: "email",
        subject: `${visibleProject.id} Notice of Delay draft`,
        message: noticeBody,
      });
      await publishProjectEvent(PROJECT_EVENT_TYPES.DELAY_NOTICE_DRAFTED, {
        projectId: visibleProject.id,
        stage: visibleProject.stage,
        detail: `Delay notice drafted with ${schedulePastDue} overdue milestone(s).`,
        route: "/portal/projects",
        data: {
          overdueMilestones: schedulePastDue,
          source: "PortalProjects.sendDelayNotice",
        },
      });
      setModuleNotice("Delay notice draft sent to message queue for PM review.");
    } catch (error) {
      setModuleError(error.message || "Unable to send delay notice draft.");
    }
  }

  async function cascadeScheduleToBillingForecast() {
    if (!visibleProject?.id || !scheduleItems.length) return;
    const latestSchedule = latestByDate(scheduleItems, ["updatedAt", "date", "createdAt"]);
    if (!latestSchedule) return;
    const marker = `${latestSchedule.eventId || latestSchedule.id || "event"}-${latestSchedule.updatedAt || latestSchedule.date || ""}`;
    const existing = orchestrationState[visibleProject.id]?.lastScheduleForecastMarker;
    if (existing === marker) return;
    const amount = parseCurrency(latestSchedule.estimatedCost || contractValue * 0.08 || 0);
    if (amount <= 0) return;

    try {
      await publishProjectEvent(PROJECT_EVENT_TYPES.SCHEDULE_FORECAST_CASCADED, {
        projectId: visibleProject.id,
        stage: visibleProject.stage,
        detail: "Schedule milestone published for finance forecast cascade.",
        route: "/portal/projects",
        data: {
          marker,
          amount,
          source: "PortalProjects.cascadeScheduleToBillingForecast",
        },
      });
      setOrchestrationState((current) => ({
        ...current,
        [visibleProject.id]: {
          ...(current[visibleProject.id] || {}),
          lastScheduleForecastMarker: marker,
          lastForecastSyncAt: new Date().toISOString(),
        },
      }));
      setModuleNotice(`Financial forecast event published for ${visibleProject.id}.`);
      refreshSyncStamp(`Schedule-to-billing cascade executed for ${visibleProject.id}`);
    } catch (error) {
      setModuleError(error.message || "Unable to cascade scheduling update to billing forecast.");
    }
  }

  useEffect(() => {
    if (!visibleProject?.id || !scheduleItems.length) return;
    cascadeScheduleToBillingForecast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleProject?.id, scheduleItems.length]);

  return (
    <PortalShell
      title="Projects"
      subtitle="Select a job, track stage progression, and keep delivery actions in one place."
      activeHref="/portal/projects"
      currentJourney="job"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/files"
      primaryLabel="Open project files"
      workspaceState={state}
    >
      <PortalPageIntro
        eyebrow="Project command"
        title="Deliver active jobs with a clear stage model"
        detail="Pick one project at a time, set the owner note and customer milestone, then advance mobilization or closeout."
      />

      <PortalQuickStats
        items={[
          { label: "Active projects", value: projects.length, hint: "In this workspace" },
          { label: "Selected project", value: visibleProject?.id || "—", hint: visibleProject?.stage || "No stage" },
          { label: "Permit posture", value: visibleProject?.permitStatus || "—", hint: visibleProject?.siteStatus || "Site status" },
          { label: "Health index", value: `${health.level} (${health.score})`, hint: `Schedule ${scheduleVariance}% · Cost ${costVariance}% · Risk ${riskExposure}%` },
        ]}
      />

      {moduleNotice ? <PortalAlert tone="success">{moduleNotice}</PortalAlert> : null}
      {moduleError ? <PortalAlert tone="error">{moduleError}</PortalAlert> : null}

      {!apiBacked && loadStatus === "ready" ? (
        <PortalAlert tone="warning" title="Limited API sync">
          Project actions require a live connection to FCA Contractor Command.
        </PortalAlert>
      ) : null}

      <PortalApiStatusBanner
        status={loadStatus}
        error={meta.loadError}
        label="projects"
        onRetry={reloadProjects}
      />

      <div style={{ ...portalCardStyle, marginTop: 16, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Digital thread</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: "1.1rem" }}>Bid {" -> "} Estimate {" -> "} Field {" -> "} Invoice continuity</h2>
        {visibleProject ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Original bid</div>
              <div style={{ fontWeight: 800 }}>{sourceBid?.id || "Not linked"}</div>
              <div style={{ color: portalTokens.body, fontSize: 13 }}>{sourceBid?.package || "Link bid in pipeline"}</div>
              <a href="/portal/bids" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 8 }}>Open bids</a>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Estimate state</div>
              <div style={{ fontWeight: 800 }}>{threadEstimate?.estimateId || threadEstimate?.id || "Not linked"}</div>
              <div style={{ color: portalTokens.body, fontSize: 13 }}>{threadEstimate?.status || "Estimate link pending"}</div>
              <a href="/portal/estimates" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 8 }}>Open estimates</a>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Field execution</div>
              <div style={{ fontWeight: 800 }}>{fieldTasks.length} tasks</div>
              <div style={{ color: portalTokens.body, fontSize: 13 }}>{`${scheduleItems.length} schedule events`}</div>
              <a href="/portal/field-tasks" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 8 }}>Open field tasks</a>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Final invoice</div>
              <div style={{ fontWeight: 800 }}>{threadInvoice?.id || "Pending"}</div>
              <div style={{ color: portalTokens.body, fontSize: 13 }}>{threadInvoice?.status || "Invoice link pending"}</div>
              <a href="/portal/billing" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 8 }}>Open billing</a>
            </div>
          </div>
        ) : (
          <PortalEmptyState
            title="Select a project"
            detail="Choose a project to view its immutable digital thread."
            primaryHref="/portal/projects"
            primaryLabel="Open project list"
          />
        )}
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Live model state</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: "1.1rem" }}>RFI and Change Order BIM pinning</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>RFIs ({rfis.length})</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              {rfis.slice(0, 6).map((rfi) => (
                <li key={rfi.rfiId || rfi.id || rfi.number}>{`${rfi.number || rfi.rfiId || "RFI"}: pinned to ${rfi.redlineId || rfi.sheetId || rfi.detailRef || "unassigned BIM object"}`}</li>
              ))}
              {!rfis.length ? <li>No RFIs linked to this project yet.</li> : null}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Change orders ({changeOrders.length})</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              {changeOrders.slice(0, 6).map((co) => (
                <li key={co.changeOrderId || co.id}>{`${co.changeOrderId || co.id || "CO"}: pinned to ${co.redlineId || co.sheetId || co.scopeRef || "unassigned BIM object"}`}</li>
              ))}
              {!changeOrders.length ? <li>No change orders linked to this project yet.</li> : null}
            </ul>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <a href="/portal/design" style={portalButtonSecondary}>Open design workspace</a>
          <a href="/portal/plans" style={portalButtonSecondary}>Open plans</a>
          <a href="/portal/rfis" style={portalButtonSecondary}>Open RFIs</a>
          <a href="/portal/change-orders" style={portalButtonSecondary}>Open change orders</a>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Health interpretation</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: "1.1rem" }}>Automated project health index</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 10 }}>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Schedule variance</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{scheduleVariance}%</div>
            <div style={{ fontSize: 12, color: portalTokens.body }}>{`${schedulePastDue} overdue milestones`}</div>
          </div>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Cost variance</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{costVariance}%</div>
            <div style={{ fontSize: 12, color: portalTokens.body }}>{`ETC ${formatUsd(estimateToComplete)}`}</div>
          </div>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Risk exposure</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{riskExposure}%</div>
            <div style={{ fontSize: 12, color: portalTokens.body }}>Sentiment from project message threads</div>
          </div>
        </div>
        <PortalAlert tone={health.level === "Red" ? "error" : health.level === "Yellow" ? "warning" : "success"}>
          {`Health index ${health.level} (${health.score}) - Next-best action: ${schedulePastDue > 0 ? "Issue Notice of Delay and resequence schedule." : costVariance > 10 ? "Run cost containment and change-order review." : "Maintain execution pace and monitor risk signals."}`}
        </PortalAlert>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <button type="button" style={portalButtonSecondary} onClick={sendDelayNotice}>Draft notice of delay</button>
          <button type="button" style={portalButtonSecondary} onClick={cascadeScheduleToBillingForecast}>Cascade schedule to billing forecast</button>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Governance and authority</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: "1.1rem" }}>Workflow hard-gates and immutable auditability</h2>
        {stageGate ? (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700 }}>{`Gate: ${stageGate.fromStage} -> ${stageGate.toStage}`}</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              {stageGateChecks.map((check) => <li key={check.message}>{check.pass ? `PASS: ${check.message}` : `BLOCKED: ${check.message}`}</li>)}
            </ul>
          </div>
        ) : (
          <div style={{ color: portalTokens.body, marginBottom: 10 }}>No hard gate configured for current stage transition.</div>
        )}
        <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Last authority event</div>
          <div style={{ fontSize: 13, color: portalTokens.body, lineHeight: 1.7 }}>
            <div>{`Actor: ${latestAudit?.actorType || "Unknown"}`}</div>
            <div>{`When: ${latestAudit?.time || latestAudit?.at || "Not recorded"}`}</div>
            <div>{`Action: ${latestAudit?.action || "No event"}`}</div>
            <div>{`Financial implication: ${financialImplication}`}</div>
          </div>
          <a href="/portal/audit" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 8 }}>Open full audit trail</a>
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Command view integration</div>
        <h2 style={{ margin: "6px 0 10px", fontSize: "1.1rem" }}>Corporate backlog and resource conflict view</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 10 }}>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Corporate backlog</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{formatUsd(corporateBacklog)}</div>
            <div style={{ fontSize: 12, color: portalTokens.body }}>{`${projectContribution}% contribution by selected project`}</div>
          </div>
          <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: resourceConflict.length ? "#fff7ed" : "#f8fafc" }}>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Resource conflicts</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{resourceConflict.length}</div>
            <div style={{ fontSize: 12, color: portalTokens.body }}>{resourceConflict.length ? "Crew overlap detected with other projects" : "No conflict detected"}</div>
          </div>
        </div>
        {resourceConflict.length ? (
          <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
            {resourceConflict.map((entry) => (
              <li key={entry.project.id}>{`${entry.project.id} has ${entry.overlapCount} overlapping crew assignments`}</li>
            ))}
          </ul>
        ) : null}
        <a href="/portal/operations" style={{ ...portalButtonSecondary, display: "inline-block", marginTop: 10 }}>Open operations command view</a>
      </div>

      {visibleProject?.id ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux Project Intelligence"
            targetObjectType="Project"
            targetObjectId={visibleProject.id}
            sourceRoute="/portal/projects"
            rationale={visibleProject.nextAction || "Advance the active project with governed field, finance, and closeout continuity."}
            nextAction={visibleProject.nextAction || "Select the next governed project action."}
            actionHref={`/portal/projects/${encodeURIComponent(visibleProject.id)}`}
            actionLabel="Open project home"
            tone="blue"
            liveRecommend
            operateConfig={{
              capabilityId: "project-setup",
              targetObjectType: "Project",
              targetObjectId: visibleProject.id,
              sourceRoute: "/portal/projects",
            }}
          />
        </div>
      ) : null}

      <PortalEntityTable
        columns={[
          {
            key: "name",
            label: "Project",
            render: (row) => (
              <button
                type="button"
                onClick={() => setSelectedProjectId(row.id)}
                style={{ border: "none", background: "transparent", padding: 0, textAlign: "left", cursor: "pointer", font: "inherit", color: portalTokens.primaryInk, fontWeight: 700 }}
              >
                {row.name}
              </button>
            ),
          },
          {
            key: "stage",
            label: "Stage",
            render: (row) => <PortalStatusBadge status={row.stage} active={row.active} />,
          },
          { key: "owner", label: "Owner" },
          { key: "due", label: "Due" },
          { key: "nextAction", label: "Next action" },
        ]}
        rows={tableRows}
        emptyTitle="No active projects yet"
        emptyDetail="Award a qualified bid in the pipeline wizard to create your first live project."
        emptyPrimaryHref="/portal/pipeline"
        emptyPrimaryLabel="Open pipeline"
      />

      {visibleProject ? (
        <div style={{ ...portalCardStyle, marginTop: 16 }}>
          <div style={portalEyebrowStyle}>Selected project workspace</div>
          <h2 style={{ margin: "6px 0 12px", fontSize: "1.15rem" }}>{visibleProject.id} · {visibleProject.customer}</h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Owner note</div>
              <input
                value={draft.ownerNote}
                onChange={(event) => updateDraft(visibleProject.id, "ownerNote", event.target.value)}
                onBlur={() => persistCommandNotes(visibleProject.id)}
                style={portalInputStyle}
                placeholder="What the owner needs next"
              />
            </label>
            <label>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Customer milestone</div>
              <input
                value={draft.customerMilestone}
                onChange={(event) => updateDraft(visibleProject.id, "customerMilestone", event.target.value)}
                onBlur={() => persistCommandNotes(visibleProject.id)}
                style={portalInputStyle}
                placeholder="Kickoff scheduled"
              />
            </label>
          </div>
          {notesStatus ? <div style={{ color: "#166534", fontSize: 13, marginBottom: 12 }}>{notesStatus}</div> : null}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <button
              type="button"
              style={portalButtonPrimary}
              onClick={async () => {
                const selected = await selectActiveProject(visibleProject.id, `${visibleProject.id} selected as active project.`);
                syncActiveProject(selected || visibleProject, `Active project updated to ${visibleProject.id}`);
                refreshSyncStamp(`Project root synchronized to ${visibleProject.id}`);
              }}
            >
              Set as active project
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => advanceProjectStage(visibleProject.id, "Mobilization", `${draft.customerMilestone || "Mobilization"} confirmed.`)}>
              Advance to mobilization
            </button>
            <button
              type="button"
              style={portalButtonSecondary}
              onClick={async () => {
                if (stageGateBlocked) {
                  setModuleError("Stage gate blocked: complete required safety and bond evidence before moving into Construction.");
                  await publishProjectEvent(PROJECT_EVENT_TYPES.STAGE_GATE_BLOCKED, {
                    projectId: visibleProject.id,
                    stage: visibleProject.stage,
                    detail: "Construction transition blocked by governance stage gate.",
                    route: "/portal/projects",
                    severity: "E2",
                    data: {
                      checks: stageGateChecks,
                      source: "PortalProjects.advanceToConstruction",
                    },
                  });
                  return;
                }
                await advanceProjectStage(visibleProject.id, "Construction", `Construction stage authorized through governance hard-gate.`);
                setModuleNotice(`Project ${visibleProject.id} advanced to Construction with gate compliance.`);
              }}
            >
              Advance to construction
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => advanceProjectStage(visibleProject.id, "Closeout", `Closeout readiness confirmed.`)}>
              Advance to closeout
            </button>
            <button type="button" style={portalButtonSecondary} onClick={() => clearPermitBlocker(visibleProject.id, `Permit blocker cleared for ${visibleProject.id}.`)}>
              Clear permit blocker
            </button>
          </div>

          <ProjectActionCenter project={project}
            advanceProjectStage={advanceProjectStage}
            clearPermitBlocker={clearPermitBlocker}
          />
        </div>
      ) : null}
    </PortalShell>
  );
}
