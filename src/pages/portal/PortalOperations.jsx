import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalTokens } from "../../portalDesignTokens";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchWorkflowProjects, fetchWorkflowBids, fetchWorkflowAudit } from "../../api/workflowClient";
import { fetchFieldSchedule, fetchFieldTasks, createFieldTask } from "../../api/fieldOpsClient";
import { fetchJobCosts, fetchProjectRfis } from "../../api/constructionClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { sendPortalMessage } from "../../api/portalClient";
import { adminGovernance } from "../../adminGovernance";
import { routeStateOverlays } from "../../systemState";

const OPS_OVERRIDE_STATE_KEY = "fca_ops_resource_overrides_v1";
const OPS_ACTION_FEED_KEY = "fca_ops_action_feed_v1";
const OPS_BENCHMARKS_KEY = "fca_ops_standard_benchmarks_v1";
const OPS_FORECAST_BASE_CASH_KEY = "fca_ops_forecast_base_cash_v1";

const PIPELINE_STAGES = ["lead", "bid", "negotiation", "won"];

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

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function pct(value, digits = 1) {
  return `${toNumber(value).toFixed(digits)}%`;
}

function classifyPipelineStage(bid = {}) {
  const status = normalize(`${bid.status || ""} ${bid.qualification?.status || ""}`);
  if (status.includes("won")) return "won";
  if (status.includes("negoti")) return "negotiation";
  if (status.includes("qualif") || status.includes("ready") || status.includes("estimate")) return "bid";
  return "lead";
}

function calcBidProbability(bid = {}) {
  const stage = classifyPipelineStage(bid);
  if (stage === "won") return 0.97;
  if (stage === "negotiation") return 0.72;
  if (stage === "bid") return 0.52;
  return 0.28;
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function daysInStage(bid = {}) {
  const anchor = parseDate(bid.lastActionAt || bid.updatedAt || bid.createdAt);
  if (!anchor) return 0;
  return Math.max(0, Math.floor((Date.now() - anchor) / 86400000));
}

function deriveSystemicBottleneck(projectRows) {
  const stageRows = projectRows.reduce((acc, row) => {
    const lane = row.stageLane;
    acc[lane] = acc[lane] || [];
    acc[lane].push(row);
    return acc;
  }, {});
  return Object.entries(stageRows)
    .map(([lane, rows]) => {
      const stuckCount = rows.filter((row) => row.bottleneckRisk).length;
      const pctStuck = rows.length ? Math.round((stuckCount / rows.length) * 100) : 0;
      return { lane, count: rows.length, stuckCount, pctStuck, systemic: rows.length >= 3 && pctStuck >= 80 };
    })
    .sort((a, b) => b.pctStuck - a.pctStuck);
}

function inferStageLane(project = {}) {
  const stage = normalize(`${project.stage || ""} ${project.siteStatus || ""} ${project.nextAction || ""}`);
  if (/design|submittal|coordination/.test(stage)) return "Design Review";
  if (/mobilization|mobilize/.test(stage)) return "Mobilization";
  if (/construction|field/.test(stage)) return "Construction";
  if (/closeout|turnover/.test(stage)) return "Closeout";
  return "Project Controls";
}

function defaultBenchmarks() {
  const thresholds = adminGovernance.operationsGovernance?.interventionThresholds || {};
  return {
    maxRfisPerProject: toNumber(thresholds.maxRfisPerProject || 18),
    maxSubmittalCycleDays: 14,
    minHealthIndexPct: toNumber(thresholds.minHealthIndexPct || 62),
    maxScheduleSlipDays: toNumber(thresholds.maxScheduleSlipDays || 7),
  };
}

export default function PortalOperations() {
  const operationsGovernance = adminGovernance.operationsGovernance || {};
  const interventionThresholds = operationsGovernance.interventionThresholds || {};
  const forecastGuardrails = operationsGovernance.forecastGuardrails || {};
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedConflictId, setSelectedConflictId] = useState("");
  const [forecastBaseCash, setForecastBaseCash] = useState(() => toNumber(readLocalJson(OPS_FORECAST_BASE_CASH_KEY, 12000000)));
  const [overridesMap, setOverridesMap] = useState(() => readLocalJson(OPS_OVERRIDE_STATE_KEY, {}));
  const [actionFeed, setActionFeed] = useState(() => readLocalJson(OPS_ACTION_FEED_KEY, []));
  const [benchmarkState, setBenchmarkState] = useState(() => readLocalJson(OPS_BENCHMARKS_KEY, defaultBenchmarks()));

  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const bidsLoad = usePortalApiLoad(() => fetchWorkflowBids(), []);
  const auditLoad = usePortalApiLoad(() => fetchWorkflowAudit({}), []);

  const projects = projectsLoad.data?.items || [];
  const bids = bidsLoad.data?.items || [];
  const auditItems = auditLoad.data?.items || [];

  const [projectSignals, setProjectSignals] = useState({});

  useEffect(() => {
    writeLocalJson(OPS_OVERRIDE_STATE_KEY, overridesMap);
  }, [overridesMap]);

  useEffect(() => {
    writeLocalJson(OPS_ACTION_FEED_KEY, actionFeed.slice(0, 100));
  }, [actionFeed]);

  useEffect(() => {
    writeLocalJson(OPS_BENCHMARKS_KEY, benchmarkState);
  }, [benchmarkState]);

  useEffect(() => {
    writeLocalJson(OPS_FORECAST_BASE_CASH_KEY, forecastBaseCash);
  }, [forecastBaseCash]);

  useEffect(() => {
    let active = true;
    async function hydrateSignals() {
      const ids = projects.map((project) => project.id).filter(Boolean);
      if (!ids.length) {
        if (active) setProjectSignals({});
        return;
      }

      const rows = await Promise.all(
        ids.map(async (id) => {
          const [jobCost, tasks, schedule, rfis, finance] = await Promise.all([
            fetchJobCosts(id).catch(() => ({ items: [], rollup: {} })),
            fetchFieldTasks({ projectId: id }).catch(() => ({ items: [] })),
            fetchFieldSchedule({ projectId: id }).catch(() => ({ items: [] })),
            fetchProjectRfis(id).catch(() => []),
            fetchFinancialWorkspace("construction", { projectId: id }).catch(() => ({ package: {} })),
          ]);
          return [
            id,
            {
              jobCost: jobCost.rollup || jobCost.items?.[0] || {},
              tasks: tasks.items || [],
              schedule: schedule.items || [],
              rfis,
              finance: finance.package || {},
            },
          ];
        }),
      );

      if (!active) return;
      setProjectSignals(Object.fromEntries(rows));
    }
    hydrateSignals();
    return () => {
      active = false;
    };
  }, [projects]);

  const projectRows = useMemo(() => {
    return projects.map((project) => {
      const signals = projectSignals[project.id] || { jobCost: {}, tasks: [], schedule: [], rfis: [], finance: {} };
      const tasks = signals.tasks || [];
      const rfis = signals.rfis || [];
      const schedule = signals.schedule || [];
      const jobCost = signals.jobCost || {};

      const completedTasks = tasks.filter((task) => /complete|done|closed/i.test(`${task.status || ""}`)).length;
      const taskPct = tasks.length ? (completedTasks / tasks.length) * 100 : 100;
      const rfiBacklog = rfis.filter((rfi) => !/answered|closed|resolved/i.test(`${rfi.status || rfi.recordStatus || ""}`)).length;

      const dueNow = schedule.filter((item) => {
        const due = parseDate(item.date || item.dueDate || item.updatedAt);
        return due && due <= Date.now();
      }).length;
      const completedSchedule = schedule.filter((item) => /complete|done|closed/i.test(`${item.status || ""}`)).length;
      const schedulePct = schedule.length ? (completedSchedule / schedule.length) * 100 : 100;
      const scheduleSlip = Math.max(0, dueNow - completedSchedule);

      const contractValue = toNumber(jobCost.contractValue || signals.finance.metrics?.contractValue || 0);
      const actualCost = toNumber(jobCost.actualCost || 0);
      const projectedCost = Math.max(actualCost, toNumber(jobCost.estimateAtCompletion || jobCost.committedCost || actualCost));
      const projectedMarginPct = contractValue > 0 ? ((contractValue - projectedCost) / contractValue) * 100 : 0;

      const auditRiskEvents = auditItems.filter((item) => {
        const hay = normalize(`${item.summary || ""} ${item.detail || ""} ${item.reason || ""} ${item.targetObjectId || ""}`);
        return hay.includes(normalize(project.id)) && /(critical|safety|bypass|high|incident|hold)/.test(hay);
      }).length;

      const healthIndex = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            (projectedMarginPct + 15) * 2.4
            + (taskPct * 0.25)
            + (schedulePct * 0.2)
            - (rfiBacklog * 1.6)
            - (auditRiskEvents * 4)
            - (scheduleSlip * 2.1),
          ),
        ),
      );

      const stageLane = inferStageLane(project);
      const bottleneckRisk = stageLane === "Design Review" && rfiBacklog >= benchmarkState.maxRfisPerProject;

      return {
        id: project.id,
        projectId: project.id,
        projectName: project.name || project.id,
        stageLane,
        healthIndex,
        rfiBacklog,
        scheduleSlip,
        projectedMarginPct,
        contractValue,
        auditRiskEvents,
        bottleneckRisk,
      };
    });
  }, [projects, projectSignals, auditItems, benchmarkState]);

  const healthHeatmapRows = useMemo(() => {
    return projectRows
      .map((row) => ({
        ...row,
        heat: row.healthIndex >= 80 ? "Healthy" : row.healthIndex >= 62 ? "Watch" : "Intervene",
      }))
      .sort((a, b) => a.healthIndex - b.healthIndex);
  }, [projectRows]);

  const backlogVelocity = useMemo(() => {
    const weightedPipeline = bids
      .filter((bid) => !normalize(bid.status).includes("lost"))
      .reduce((sum, bid) => {
        const value = toNumber(bid.contractValue || bid.value || bid.amount || bid.bidAmount || 0);
        return sum + (value * calcBidProbability(bid));
      }, 0);

    const executedLoad = projectRows.reduce((sum, row) => sum + row.contractValue, 0);

    const activeCrewDemand = projectRows.reduce((sum, row) => sum + Math.max(1, Math.ceil(row.contractValue / 5000000)), 0);
    const availableCrewCapacity = Math.max(1, Math.ceil(projects.length * 1.8));
    const capacityGap = activeCrewDemand - availableCrewCapacity;

    return {
      weightedPipeline,
      executedLoad,
      ratio: executedLoad > 0 ? weightedPipeline / executedLoad : 0,
      activeCrewDemand,
      availableCrewCapacity,
      capacityGap,
    };
  }, [bids, projectRows, projects]);

  const bottleneckRows = useMemo(() => deriveSystemicBottleneck(projectRows), [projectRows]);

  const benchmarkDeviationRows = useMemo(() => {
    return projectRows
      .map((row) => {
        const issues = [];
        if (row.rfiBacklog > benchmarkState.maxRfisPerProject) issues.push(`RFI backlog ${row.rfiBacklog} > ${benchmarkState.maxRfisPerProject}`);
        if (row.scheduleSlip > benchmarkState.maxScheduleSlipDays) issues.push(`Schedule slip ${row.scheduleSlip}d > ${benchmarkState.maxScheduleSlipDays}d`);
        if (row.healthIndex < benchmarkState.minHealthIndexPct) issues.push(`Health ${row.healthIndex}% < ${benchmarkState.minHealthIndexPct}%`);
        return {
          ...row,
          issues,
          deviating: issues.length > 0,
        };
      })
      .filter((row) => row.deviating)
      .sort((a, b) => b.issues.length - a.issues.length || a.healthIndex - b.healthIndex);
  }, [projectRows, benchmarkState]);

  const executiveAlerts = useMemo(() => {
    const rows = [];
    for (const row of projectRows) {
      if (row.healthIndex < toNumber(interventionThresholds.criticalHealthIndexPct || 55)) {
        rows.push({
          id: `health-${row.projectId}`,
          severity: "High",
          title: `${row.projectName} health below intervention threshold`,
          rationale: `Health index ${row.healthIndex}% with margin ${pct(row.projectedMarginPct)} and ${row.rfiBacklog} open RFIs.`,
          actionHref: `/portal/projects/${encodeURIComponent(row.projectId)}`,
          actionLabel: "Open project",
        });
      }
      if (row.contractValue >= 50000000 && row.rfiBacklog >= Math.max(12, Math.round(toNumber(interventionThresholds.maxRfisPerProject || 18) * 0.66))) {
        rows.push({
          id: `rfi-${row.projectId}`,
          severity: "Critical",
          title: `${row.projectName} critical-path RFI congestion`,
          rationale: `${row.rfiBacklog} open RFIs on high-value project ${formatUsd(row.contractValue)}.`,
          actionHref: `/portal/rfis?projectId=${encodeURIComponent(row.projectId)}`,
          actionLabel: "Open RFIs",
        });
      }
    }
    if (backlogVelocity.capacityGap > toNumber(interventionThresholds.maxCapacityGapCrewUnits || 0)) {
      rows.push({
        id: "capacity-gap",
        severity: "High",
        title: "Enterprise resource gap detected",
        rationale: `Demand exceeds capacity by ${backlogVelocity.capacityGap} crew unit(s).`,
        actionHref: "/portal/field-tasks",
        actionLabel: "Open field tasks",
      });
    }
    return rows.sort((a, b) => ({ Critical: 0, High: 1, Medium: 2 }[a.severity] - ({ Critical: 0, High: 1, Medium: 2 }[b.severity])));
  }, [projectRows, backlogVelocity, interventionThresholds]);

  const conflictCandidates = useMemo(() => {
    const sortedByRfi = [...projectRows].sort((a, b) => b.rfiBacklog - a.rfiBacklog);
    const overloaded = sortedByRfi.find((row) => row.rfiBacklog >= 10 || row.scheduleSlip >= 8);
    const idle = [...projectRows]
      .filter((row) => row.projectId !== overloaded?.projectId)
      .sort((a, b) => a.rfiBacklog - b.rfiBacklog || b.healthIndex - a.healthIndex)[0];

    if (!overloaded || !idle) return [];

    const candidateId = `${overloaded.projectId}=>${idle.projectId}`;
    const fromCrew = `Crew-${overloaded.projectId.slice(-3)}`;
    const contractImpact = Math.round(Math.max(0, overloaded.contractValue * 0.0025));
    const financeImpact = Math.round(contractImpact * 0.4);

    return [{
      id: candidateId,
      fromProject: overloaded,
      toProject: idle,
      fromCrew,
      projectedScheduleRecoveryDays: Math.min(6, Math.max(2, overloaded.scheduleSlip)),
      sourceDelayRiskDays: Math.min(3, Math.max(1, Math.floor(idle.healthIndex < 70 ? 3 : 1))),
      contractualImpactUsd: contractImpact,
      profitabilityImpactUsd: financeImpact,
    }];
  }, [projectRows]);

  useEffect(() => {
    if (!selectedConflictId && conflictCandidates[0]) {
      setSelectedConflictId(conflictCandidates[0].id);
    }
  }, [conflictCandidates, selectedConflictId]);

  const selectedConflict = conflictCandidates.find((row) => row.id === selectedConflictId) || conflictCandidates[0] || null;

  const macroForecast = useMemo(() => {
    const quarterlyRevenue = projectRows.reduce((sum, row) => sum + (row.contractValue * 0.22), 0)
      + bids.reduce((sum, bid) => sum + ((toNumber(bid.contractValue || bid.value || bid.amount || 0) * calcBidProbability(bid)) * 0.18), 0);

    const enterpriseBurnRateMonthly = projectRows.reduce((sum, row) => {
      const signal = projectSignals[row.projectId] || {};
      const cost = toNumber(signal.jobCost?.actualCost || 0);
      return sum + Math.max(70000, cost * 0.08);
    }, 0);

    const legalExposure = projectRows.reduce((sum, row) => {
      const weight = row.auditRiskEvents * 125000 + row.rfiBacklog * 8500;
      return sum + weight;
    }, 0);

    const threeMonthCash = forecastBaseCash + (quarterlyRevenue * 0.75) - (enterpriseBurnRateMonthly * 3);

    return {
      quarterlyRevenue,
      enterpriseBurnRateMonthly,
      legalExposure,
      threeMonthCash,
    };
  }, [projectRows, bids, projectSignals, forecastBaseCash]);

  function pushActionFeed(type, summary, detail) {
    setActionFeed((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        at: new Date().toISOString(),
        type,
        summary,
        detail,
      },
      ...current,
    ].slice(0, 80));
  }

  async function executeInterventionOverride() {
    if (!selectedConflict) {
      setError("No resource conflict selected.");
      return;
    }

    setBusy(true);
    setError("");
    setNotice("");

    try {
      const override = {
        id: selectedConflict.id,
        createdAt: new Date().toISOString(),
        fromProjectId: selectedConflict.fromProject.projectId,
        toProjectId: selectedConflict.toProject.projectId,
        crew: selectedConflict.fromCrew,
        projectedScheduleRecoveryDays: selectedConflict.projectedScheduleRecoveryDays,
        sourceDelayRiskDays: selectedConflict.sourceDelayRiskDays,
        contractualImpactUsd: selectedConflict.contractualImpactUsd,
        profitabilityImpactUsd: selectedConflict.profitabilityImpactUsd,
      };

      setOverridesMap((current) => ({
        ...current,
        [override.id]: override,
      }));

      await Promise.all([
        createFieldTask({
          projectId: override.fromProjectId,
          task: `Operations override: deploy ${override.crew} support to ${override.toProjectId}`,
          assignee: "Ops Director",
          dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
          priority: "High",
          sourceRoute: "/portal/operations",
        }).catch(() => null),
        sendPortalMessage({
          subject: `Operations override issued: ${override.crew}`,
          message: `Crew reassignment ${override.fromProjectId} -> ${override.toProjectId}. Schedule recovery ${override.projectedScheduleRecoveryDays}d. Financial implication ${formatUsd(override.profitabilityImpactUsd)}.`,
          sourceRoute: "/portal/operations",
        }).catch(() => null),
      ]);

      pushActionFeed(
        "override",
        `Crew override executed (${override.crew})`,
        `From ${override.fromProjectId} to ${override.toProjectId}; projected recovery ${override.projectedScheduleRecoveryDays} day(s).`,
      );

      setNotice("Intervention override executed. Field assignment and finance-impact signal were published.");
    } catch (overrideError) {
      setError(overrideError.message || "Unable to execute intervention override.");
    } finally {
      setBusy(false);
    }
  }

  const loading = projectsLoad.status === "loading" || bidsLoad.status === "loading";

  return (
    <PortalShell
      title="Operations Control Tower"
      subtitle="Enterprise command surface for portfolio health, orchestration overrides, and macro risk forecasting."
      activeHref="/portal/operations"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.projects}
      primaryHref="/portal/pipeline"
      primaryLabel="Open pipeline"
      showRouteOverlay={false}
    >
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}

      <AuricruxInsightPanel
        title="Auricrux Enterprise Orchestration"
        targetObjectId="ENTERPRISE"
        sourceRoute="/portal/operations"
        rationale="Monitor portfolio pulse, detect systemic bottlenecks, and execute interventions that synchronize field execution and finance impact."
        nextAction={selectedConflict
          ? `Review and execute override: ${selectedConflict.fromProject.projectName} -> ${selectedConflict.toProject.projectName}.`
          : "No major cross-project conflict detected. Continue benchmark monitoring."}
        recommendations={[
          `${executiveAlerts.length} high-impact executive alert(s) currently prioritized.`,
          `Enterprise burn rate ${formatUsd(macroForecast.enterpriseBurnRateMonthly)}/month with projected quarterly revenue ${formatUsd(macroForecast.quarterlyRevenue)}.`,
          `${bottleneckRows.find((row) => row.systemic)?.lane || "No systemic"} bottleneck posture detected for lane governance review.`,
          `Cash guardrail ${formatUsd(forecastGuardrails.minimumThreeMonthCashUsd || 0)} and legal warning ${formatUsd(forecastGuardrails.legalExposureWarningUsd || 0)} monitored for intervention timing.`,
        ]}
        tone="green"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Single pane of glass"
        title="Enterprise visibility from company-wide down to project-specific"
        detail="Operations Directors can detect systemic risks, compare projects against standards, and push intervention overrides in one command center."
      />

      {loading ? <PortalAlert tone="info">Loading enterprise operations telemetry...</PortalAlert> : null}

      {!loading ? (
        <>
          <PortalQuickStats
            items={[
              { label: "Active Projects", value: projectRows.length, hint: "Portfolio in motion" },
              { label: "Portfolio Avg Health", value: `${Math.round(projectRows.reduce((sum, row) => sum + row.healthIndex, 0) / Math.max(1, projectRows.length))}%`, hint: "Composite operational index" },
              { label: "Backlog Velocity", value: `${backlogVelocity.ratio.toFixed(2)}x`, hint: `${formatUsd(backlogVelocity.weightedPipeline)} weighted pipeline` },
              { label: "Capacity Gap", value: backlogVelocity.capacityGap > 0 ? backlogVelocity.capacityGap : 0, hint: backlogVelocity.capacityGap > 0 ? "Intervention needed" : "Balanced" },
            ]}
          />

          <div style={{ ...portalCardStyle, marginBottom: 16, borderLeft: `4px solid ${portalTokens.primary}` }}>
            <strong>Growth and Delivery Synchronization</strong>
            <div style={{ color: portalTokens.body, marginTop: 8, lineHeight: 1.6 }}>
              Keep operational overrides aligned with revenue posture. Use the Sales and Marketing Engine to convert high-intent relationships, build branded proposal kits, and trigger retention playbooks from live delivery signals.
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
              <a href="/portal/revenue-engine" style={{ ...portalButtonPrimary, textDecoration: "none" }}>Open Revenue Engine</a>
              <a href="/portal/leads" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Leads Board</a>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
              <strong>Portfolio Health Heatmap</strong>
              <a href="/portal/projects" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open projects</a>
            </div>

            <PortalEntityTable
              columns={[
                { key: "projectName", label: "Project", render: (row) => <div><strong>{row.projectName}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.stageLane}</div></div> },
                { key: "healthIndex", label: "Health", render: (row) => <PortalStatusBadge status={`${row.healthIndex}%`} active={row.healthIndex < benchmarkState.minHealthIndexPct} /> },
                { key: "rfiBacklog", label: "Open RFIs" },
                { key: "scheduleSlip", label: "Slip (days)" },
                { key: "projectedMarginPct", label: "Proj. Margin", render: (row) => pct(row.projectedMarginPct) },
                { key: "heat", label: "Heat", render: (row) => <PortalStatusBadge status={row.heat} active={row.heat === "Intervene"} /> },
                { key: "actions", label: "", render: (row) => <a href={`/portal/projects/${encodeURIComponent(row.projectId)}`} style={{ color: portalTokens.primary }}>Zoom in</a> },
              ]}
              rows={healthHeatmapRows}
              emptyTitle="No active projects"
              emptyDetail="Project heatmap populates as live projects move through the enterprise lanes."
              emptyPrimaryHref="/portal/projects"
              emptyPrimaryLabel="Open projects"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Backlog Velocity and Resource Gap</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Weighted Pipeline</div>
                <strong>{formatUsd(backlogVelocity.weightedPipeline)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Executed Portfolio Load</div>
                <strong>{formatUsd(backlogVelocity.executedLoad)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Crew Demand vs Capacity</div>
                <strong>{backlogVelocity.activeCrewDemand} / {backlogVelocity.availableCrewCapacity}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Gap Signal</div>
                <PortalStatusBadge status={backlogVelocity.capacityGap > 0 ? "Resource Gap" : "Balanced"} active={backlogVelocity.capacityGap > 0} />
              </div>
            </div>
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Workflow Bottleneck Analytics</strong>
            <PortalEntityTable
              columns={[
                { key: "lane", label: "Lane" },
                { key: "count", label: "Projects" },
                { key: "stuckCount", label: "Stuck" },
                { key: "pctStuck", label: "Stuck %", render: (row) => `${row.pctStuck}%` },
                { key: "status", label: "Systemic", render: (row) => <PortalStatusBadge status={row.systemic ? "Systemic Bottleneck" : "Normal"} active={row.systemic} /> },
              ]}
              rows={bottleneckRows}
              emptyTitle="No bottleneck rows"
              emptyDetail="Bottleneck analytics update as projects move through stage lanes."
              emptyPrimaryHref="/portal/design-workspace"
              emptyPrimaryLabel="Open design workspace"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Benchmark Deviation Monitor</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 10px" }}>
              Company standards from governance compare each project against lane performance expectations.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 10 }}>
              <label>
                Max RFIs/project
                <input style={{ ...portalButtonSecondary, width: "100%", border: "1px solid #cbd5e1", padding: "8px 10px", borderRadius: 8 }} value={benchmarkState.maxRfisPerProject} onChange={(event) => setBenchmarkState((current) => ({ ...current, maxRfisPerProject: toNumber(event.target.value) || 0 }))} />
              </label>
              <label>
                Max slip (days)
                <input style={{ ...portalButtonSecondary, width: "100%", border: "1px solid #cbd5e1", padding: "8px 10px", borderRadius: 8 }} value={benchmarkState.maxScheduleSlipDays} onChange={(event) => setBenchmarkState((current) => ({ ...current, maxScheduleSlipDays: toNumber(event.target.value) || 0 }))} />
              </label>
              <label>
                Min health (%)
                <input style={{ ...portalButtonSecondary, width: "100%", border: "1px solid #cbd5e1", padding: "8px 10px", borderRadius: 8 }} value={benchmarkState.minHealthIndexPct} onChange={(event) => setBenchmarkState((current) => ({ ...current, minHealthIndexPct: toNumber(event.target.value) || 0 }))} />
              </label>
            </div>
            <PortalEntityTable
              columns={[
                { key: "projectName", label: "Project" },
                { key: "issues", label: "Deviation", render: (row) => row.issues.join(" | ") },
                { key: "healthIndex", label: "Health", render: (row) => `${row.healthIndex}%` },
              ]}
              rows={benchmarkDeviationRows}
              emptyTitle="No benchmark deviations"
              emptyDetail="All projects are currently operating within enterprise standards."
              emptyPrimaryHref="/portal/admin"
              emptyPrimaryLabel="Open admin"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Executive Action Center</strong>
            <PortalEntityTable
              columns={[
                { key: "severity", label: "Priority", render: (row) => <PortalStatusBadge status={row.severity} active={row.severity !== "Medium"} /> },
                { key: "title", label: "Issue", render: (row) => <strong>{row.title}</strong> },
                { key: "rationale", label: "Why it matters" },
                { key: "action", label: "", render: (row) => <a href={row.actionHref} style={{ color: portalTokens.primary }}>{row.actionLabel}</a> },
              ]}
              rows={executiveAlerts}
              emptyTitle="No executive alerts"
              emptyDetail="Auricrux is currently not seeing high-impact issues requiring leadership intervention."
              emptyPrimaryHref="/portal/audit"
              emptyPrimaryLabel="Open audit"
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Dynamic Resource Leveling (Intervention Engine)</strong>
            {selectedConflict ? (
              <>
                <div style={{ color: portalTokens.muted, margin: "8px 0 10px", lineHeight: 1.6 }}>
                  Candidate override: move {selectedConflict.fromCrew} from {selectedConflict.fromProject.projectName} to {selectedConflict.toProject.projectName}.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 10 }}>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                    <div style={{ color: portalTokens.muted, fontSize: 12 }}>Target Recovery</div>
                    <strong>{selectedConflict.projectedScheduleRecoveryDays} day(s)</strong>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                    <div style={{ color: portalTokens.muted, fontSize: 12 }}>Source Delay Risk</div>
                    <strong>{selectedConflict.sourceDelayRiskDays} day(s)</strong>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                    <div style={{ color: portalTokens.muted, fontSize: 12 }}>Contractual Impact</div>
                    <strong>{formatUsd(selectedConflict.contractualImpactUsd)}</strong>
                  </div>
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                    <div style={{ color: portalTokens.muted, fontSize: 12 }}>Finance Impact</div>
                    <strong>{formatUsd(selectedConflict.profitabilityImpactUsd)}</strong>
                  </div>
                </div>
                <button type="button" style={portalButtonPrimary} onClick={executeInterventionOverride} disabled={busy}>
                  {busy ? "Executing override..." : "Execute enterprise override"}
                </button>
              </>
            ) : (
              <div style={{ color: portalTokens.muted }}>No active cross-project conflict requiring immediate reallocation.</div>
            )}
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <strong>Predictive Macro Forecasting</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Quarterly Revenue (expected)</div>
                <strong>{formatUsd(macroForecast.quarterlyRevenue)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Enterprise Burn Rate / Month</div>
                <strong>{formatUsd(macroForecast.enterpriseBurnRateMonthly)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Potential Legal Exposure</div>
                <strong>{formatUsd(macroForecast.legalExposure)}</strong>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>3-Month Cash Projection</div>
                <strong>{formatUsd(macroForecast.threeMonthCash)}</strong>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <label>
                Base cash assumption
                <input
                  value={forecastBaseCash}
                  onChange={(event) => setForecastBaseCash(toNumber(event.target.value) || 0)}
                  style={{ width: "100%", maxWidth: 320, border: "1px solid #cbd5e1", borderRadius: 8, padding: "8px 10px", marginTop: 6 }}
                />
              </label>
            </div>
          </div>

          <div style={{ ...portalCardStyle }}>
            <strong>Operational Action Log</strong>
            <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
              {actionFeed.map((entry) => (
                <div key={entry.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <strong>{entry.summary}</strong>
                    <span style={{ color: portalTokens.muted, fontSize: 12 }}>{new Date(entry.at).toLocaleString()}</span>
                  </div>
                  <div style={{ color: portalTokens.body, marginTop: 4 }}>{entry.detail}</div>
                </div>
              ))}
              {!actionFeed.length ? <div style={{ color: portalTokens.muted }}>No intervention actions executed yet.</div> : null}
            </div>
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
