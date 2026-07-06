import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import PortalWorkspaceGuide from "../../components/PortalWorkspaceGuide";
import {
  PortalAlert,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useCustomerSession from "../../hooks/useCustomerSession";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { fetchPortalMessages } from "../../api/portalClient";
import { fetchWorkflowAudit, fetchWorkflowBids, fetchWorkflowFiles, fetchWorkflowProjects } from "../../api/workflowClient";
import { fetchJobCosts, fetchProjectRfis } from "../../api/constructionClient";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { openAuricruxAssistant } from "../../auricruxAssistant";
import { routeStateOverlays } from "../../systemState";
import { adminGovernance } from "../../adminGovernance";

const DASHBOARD_ROLE_KEY = "fca_platform_dashboard_role_v1";
const DASHBOARD_PINS_KEY = "fca_platform_dashboard_pins_v1";
const DASHBOARD_NAV_EVENTS_KEY = "fca_platform_dashboard_nav_events_v1";

const ROLE_OPTIONS = ["owner", "pm", "superintendent"];

const AVAILABLE_PINS = [
  { id: "pipeline", label: "Pipeline", href: "/portal/pipeline", kind: "module" },
  { id: "projects", label: "Projects", href: "/portal/projects", kind: "module" },
  { id: "rfis", label: "RFIs", href: "/portal/rfis", kind: "module" },
  { id: "files", label: "Drawings", href: "/portal/files", kind: "module" },
  { id: "job-cost", label: "Job Cost", href: "/portal/job-cost", kind: "module" },
  { id: "finance", label: "Finance", href: "/portal/finance", kind: "module" },
  { id: "health-chart", label: "Health Pulse Chart", href: "#pulse", kind: "chart" },
  { id: "budget-chart", label: "Budget vs Actual Chart", href: "#budget-chart", kind: "chart" },
  { id: "schedule-chart", label: "Schedule Chart", href: "#schedule-chart", kind: "chart" },
];

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

function normalize(text) {
  return String(text || "").toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function parseDate(value) {
  const parsed = Date.parse(value || "");
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveRoleFromSession(role = "") {
  const normalized = normalize(role);
  if (normalized.includes("superintendent") || normalized.includes("field")) return "superintendent";
  if (normalized.includes("project coordinator") || normalized.includes("project manager") || normalized === "pm") return "pm";
  return "owner";
}

function defaultPinsForRole(role) {
  if (role === "superintendent") return ["projects", "files", "rfis", "schedule-chart"];
  if (role === "pm") return ["projects", "rfis", "job-cost", "budget-chart"];
  return ["projects", "finance", "files", "health-chart"];
}

function computeHealthIndex({ projectedMarginPct, taskCompletionPct, scheduleCompletionPct, rfiBacklog, scheduleSlip, auditRiskEvents }) {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        (projectedMarginPct + 15) * 2.4
          + (taskCompletionPct * 0.25)
          + (scheduleCompletionPct * 0.2)
          - (rfiBacklog * 1.6)
          - (auditRiskEvents * 4)
          - (scheduleSlip * 2.1),
      ),
    ),
  );
}

function healthLight(healthIndex) {
  if (healthIndex >= 78) return { label: "Healthy", tone: "green", color: "#16a34a" };
  if (healthIndex >= 62) return { label: "Watch", tone: "yellow", color: "#ca8a04" };
  return { label: "At Risk", tone: "red", color: "#dc2626" };
}

function SparklineCard({ id, title, subtitle, series = [], compareSeries = [], formatter = (value) => value }) {
  const [hoverIndex, setHoverIndex] = useState(-1);

  const max = Math.max(1, ...series, ...compareSeries);
  const min = Math.min(0, ...series, ...compareSeries);
  const spread = Math.max(1, max - min);

  function toPoints(values) {
    if (!values.length) return "";
    return values
      .map((value, index) => {
        const x = (index / Math.max(1, values.length - 1)) * 100;
        const y = 100 - (((value - min) / spread) * 100);
        return `${x},${y}`;
      })
      .join(" ");
  }

  function handleMove(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const index = Math.round(ratio * Math.max(0, series.length - 1));
    setHoverIndex(index);
  }

  const safeIndex = hoverIndex >= 0 ? hoverIndex : series.length - 1;

  return (
    <div id={id} style={{ ...portalCardStyle, padding: 14 }}>
      <div style={portalEyebrowStyle}>{title}</div>
      <div style={{ color: portalTokens.body, fontSize: 13, marginBottom: 8 }}>{subtitle}</div>
      <div
        role="img"
        aria-label={`${title} sparkline chart`}
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(-1)}
        style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 8, background: "#fff" }}
      >
        <svg viewBox="0 0 100 100" style={{ width: "100%", height: 84 }}>
          <polyline fill="none" stroke="#1d4ed8" strokeWidth="2.2" points={toPoints(compareSeries)} />
          <polyline fill="none" stroke="#0f766e" strokeWidth="2.6" points={toPoints(series)} />
          {safeIndex >= 0 && safeIndex < series.length ? (
            <circle
              cx={(safeIndex / Math.max(1, series.length - 1)) * 100}
              cy={100 - (((series[safeIndex] - min) / spread) * 100)}
              r="2.7"
              fill="#0f766e"
            />
          ) : null}
        </svg>
      </div>
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 10, fontSize: 12, color: portalTokens.muted }}>
        <span>Planned: {formatter(compareSeries[safeIndex] ?? compareSeries[compareSeries.length - 1] ?? 0)}</span>
        <span>Actual: {formatter(series[safeIndex] ?? series[series.length - 1] ?? 0)}</span>
      </div>
    </div>
  );
}

function HealthGauge({ value }) {
  const angle = Math.max(0, Math.min(180, (toNumber(value) / 100) * 180));
  const indicatorX = 50 + 38 * Math.cos(Math.PI - (angle * Math.PI / 180));
  const indicatorY = 52 - 38 * Math.sin(Math.PI - (angle * Math.PI / 180));
  const status = healthLight(value);

  return (
    <div id="pulse" style={{ ...portalCardStyle, padding: 18 }}>
      <div style={portalEyebrowStyle}>The Pulse</div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(200px, 1fr) minmax(220px, 1.4fr)", gap: 14, alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 40, fontWeight: 800, lineHeight: 1 }}>{value}%</div>
          <div style={{ marginTop: 4 }}>
            <PortalStatusBadge status={status.label} active={status.label !== "Healthy"} />
          </div>
          <div style={{ fontSize: 13, color: portalTokens.body, marginTop: 10, lineHeight: 1.55 }}>
            Portfolio health combines margin trajectory, schedule completion, open RFI pressure, and audit risk events.
          </div>
        </div>
        <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, background: "#fff", padding: 12 }}>
          <svg viewBox="0 0 100 60" style={{ width: "100%", height: 90 }}>
            <path d="M8 52 A42 42 0 0 1 92 52" stroke="#dc2626" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M8 52 A42 42 0 0 1 70 18" stroke="#ca8a04" strokeWidth="7" fill="none" strokeLinecap="round" />
            <path d="M8 52 A42 42 0 0 1 54 10" stroke="#16a34a" strokeWidth="7" fill="none" strokeLinecap="round" />
            <circle cx={indicatorX} cy={indicatorY} r="3.5" fill={status.color} />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: portalTokens.muted }}>
            <span>At Risk</span>
            <span>Watch</span>
            <span>Healthy</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlatformDashboard() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();

  const roleFromSession = resolveRoleFromSession(session?.role || state?.meta?.customerRole || "");
  const [dashboardRole, setDashboardRole] = useState(() => {
    const persisted = readLocalJson(DASHBOARD_ROLE_KEY, null);
    return ROLE_OPTIONS.includes(persisted) ? persisted : roleFromSession;
  });
  const [pinnedItems, setPinnedItems] = useState(() => readLocalJson(DASHBOARD_PINS_KEY, defaultPinsForRole(roleFromSession)));
  const [navEvents, setNavEvents] = useState(() => readLocalJson(DASHBOARD_NAV_EVENTS_KEY, []));
  const [chatDockOpen, setChatDockOpen] = useState(false);

  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const bidsLoad = usePortalApiLoad(() => fetchWorkflowBids(), []);
  const auditLoad = usePortalApiLoad(() => fetchWorkflowAudit({}), []);
  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({}), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);
  const financeLoad = usePortalApiLoad(() => fetchFinancialWorkspace("dashboard"), []);

  const projects = projectsLoad.data?.items || [];
  const bids = bidsLoad.data?.items || [];
  const auditItems = auditLoad.data?.items || [];
  const fileItems = filesLoad.data?.items || [];
  const messageItems = messagesLoad.data?.items || [];

  const [projectSignals, setProjectSignals] = useState({});

  useEffect(() => {
    refreshSyncStamp("Adaptive launch surface active");
  }, [refreshSyncStamp]);

  useEffect(() => {
    writeLocalJson(DASHBOARD_ROLE_KEY, dashboardRole);
  }, [dashboardRole]);

  useEffect(() => {
    writeLocalJson(DASHBOARD_PINS_KEY, pinnedItems);
  }, [pinnedItems]);

  useEffect(() => {
    writeLocalJson(DASHBOARD_NAV_EVENTS_KEY, navEvents.slice(0, 80));
  }, [navEvents]);

  useEffect(() => {
    let active = true;
    async function hydrateSignals() {
      const ids = projects.map((item) => item.id).filter(Boolean).slice(0, 8);
      if (!ids.length) {
        if (active) setProjectSignals({});
        return;
      }

      const rows = await Promise.all(
        ids.map(async (projectId) => {
          const [jobCost, rfis, tasks, schedule, finance] = await Promise.all([
            fetchJobCosts(projectId).catch(() => ({ items: [], rollup: {} })),
            fetchProjectRfis(projectId).catch(() => []),
            fetchFieldTasks({ projectId }).catch(() => ({ items: [] })),
            fetchFieldSchedule({ projectId }).catch(() => ({ items: [] })),
            fetchFinancialWorkspace("construction", { projectId }).catch(() => ({ package: {} })),
          ]);

          return [
            projectId,
            {
              jobCost: jobCost.rollup || jobCost.items?.[0] || {},
              rfis,
              tasks: tasks.items || [],
              schedule: schedule.items || [],
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

  const thresholds = adminGovernance.operationsGovernance?.interventionThresholds || {};

  const projectRows = useMemo(() => {
    return projects.map((project) => {
      const signal = projectSignals[project.id] || { jobCost: {}, rfis: [], tasks: [], schedule: [] };
      const tasks = signal.tasks || [];
      const schedule = signal.schedule || [];
      const rfis = signal.rfis || [];

      const completedTasks = tasks.filter((item) => /complete|done|closed/i.test(`${item.status || ""}`)).length;
      const completedSchedule = schedule.filter((item) => /complete|done|closed/i.test(`${item.status || ""}`)).length;
      const dueNow = schedule.filter((item) => {
        const due = parseDate(item.date || item.dueDate || item.updatedAt);
        return due && due <= Date.now();
      }).length;

      const taskCompletionPct = tasks.length ? (completedTasks / tasks.length) * 100 : 100;
      const scheduleCompletionPct = schedule.length ? (completedSchedule / schedule.length) * 100 : 100;
      const scheduleSlip = Math.max(0, dueNow - completedSchedule);

      const openRfis = rfis.filter((item) => !/answered|closed|resolved/i.test(`${item.status || item.recordStatus || ""}`)).length;

      const contractValue = toNumber(signal.jobCost.contractValue || signal.finance.metrics?.contractValue || 0);
      const actualCost = toNumber(signal.jobCost.actualCost || 0);
      const projectedCost = Math.max(actualCost, toNumber(signal.jobCost.estimateAtCompletion || signal.jobCost.committedCost || actualCost));
      const projectedMarginPct = contractValue > 0 ? ((contractValue - projectedCost) / contractValue) * 100 : 0;

      const auditRiskEvents = auditItems.filter((event) => {
        const hay = normalize(`${event.summary || ""} ${event.detail || ""} ${event.reason || ""} ${event.targetObjectId || ""}`);
        return hay.includes(normalize(project.id)) && /(critical|safety|bypass|incident|hold|high)/.test(hay);
      }).length;

      const healthIndex = computeHealthIndex({
        projectedMarginPct,
        taskCompletionPct,
        scheduleCompletionPct,
        rfiBacklog: openRfis,
        scheduleSlip,
        auditRiskEvents,
      });

      return {
        id: project.id,
        name: project.name || project.id,
        taskCompletionPct,
        scheduleCompletionPct,
        scheduleSlip,
        openRfis,
        contractValue,
        projectedMarginPct,
        auditRiskEvents,
        healthIndex,
      };
    });
  }, [projects, projectSignals, auditItems]);

  const enterpriseHealthIndex = useMemo(() => {
    if (!projectRows.length) return 74;
    return Math.round(projectRows.reduce((sum, item) => sum + item.healthIndex, 0) / projectRows.length);
  }, [projectRows]);

  const focusRecommendations = useMemo(() => {
    const recommended = [];

    const topRiskProject = [...projectRows].sort((a, b) => a.healthIndex - b.healthIndex)[0];
    if (topRiskProject && topRiskProject.healthIndex < toNumber(thresholds.minHealthIndexPct || 62)) {
      recommended.push({
        id: `risk-${topRiskProject.id}`,
        summary: `${topRiskProject.name} is at risk (${topRiskProject.healthIndex}%). Prioritize critical-path recovery today.`,
        detail: `${topRiskProject.openRfis} open RFIs and ${topRiskProject.scheduleSlip} schedule-slip day(s) need direct intervention.`,
        href: `/portal/projects/${encodeURIComponent(topRiskProject.id)}`,
        label: "Open project",
      });
    }

    const staleNegotiationBid = bids
      .map((bid) => ({
        ...bid,
        ageDays: Math.max(0, Math.floor((Date.now() - parseDate(bid.lastActionAt || bid.updatedAt || bid.createdAt)) / 86400000)),
      }))
      .filter((bid) => normalize(`${bid.status || ""} ${bid.qualification?.status || ""}`).includes("negoti") && bid.ageDays >= 5)
      .sort((a, b) => b.ageDays - a.ageDays)[0];

    if (staleNegotiationBid) {
      recommended.push({
        id: `bid-${staleNegotiationBid.id || staleNegotiationBid.opportunityId || "x"}`,
        summary: `Commercial decision is aging in negotiation (${staleNegotiationBid.ageDays} days).`,
        detail: `Escalate award path now to prevent conversion drag and downstream crew idling.`,
        href: "/portal/pipeline",
        label: "Open pipeline",
      });
    }

    const mezzanineLikeRisk = projectRows.find((item) => item.openRfis >= 10 && item.scheduleSlip >= 2);
    if (mezzanineLikeRisk) {
      recommended.push({
        id: `coord-${mezzanineLikeRisk.id}`,
        summary: `${mezzanineLikeRisk.name}: near-term field activity is exposed by unresolved RFIs.`,
        detail: `Recommended intervention: clear embed/submittal decisions before next execution window.`,
        href: `/portal/rfis?projectId=${encodeURIComponent(mezzanineLikeRisk.id)}`,
        label: "Prioritize RFIs",
      });
    }

    return recommended.slice(0, 3);
  }, [projectRows, bids, thresholds]);

  const budgetSeries = useMemo(() => {
    const rows = projectRows.slice(0, 7);
    if (!rows.length) return { planned: [0, 0, 0, 0], actual: [0, 0, 0, 0] };

    const planned = [];
    const actual = [];
    let pSum = 0;
    let aSum = 0;

    for (const row of rows) {
      pSum += Math.max(10000, row.contractValue * 0.18);
      aSum += Math.max(8000, row.contractValue * (0.16 + (row.scheduleSlip > 0 ? 0.03 : 0)));
      planned.push(Math.round(pSum));
      actual.push(Math.round(aSum));
    }

    return { planned, actual };
  }, [projectRows]);

  const scheduleSeries = useMemo(() => {
    const rows = projectRows.slice(0, 7);
    if (!rows.length) return { planned: [35, 45, 55, 66], actual: [30, 41, 49, 58] };
    return {
      planned: rows.map((_, index) => Math.min(100, 35 + index * 9)),
      actual: rows.map((row, index) => Math.max(0, Math.min(100, 30 + index * 8 + (row.scheduleCompletionPct - 60) * 0.2))),
    };
  }, [projectRows]);

  const continuityFeed = useMemo(() => {
    const auditRows = auditItems.slice(0, 5).map((item) => ({
      id: `audit-${item.id || item.createdAt || Math.random()}`,
      type: "Governance",
      title: item.summary || "Audit event recorded",
      detail: item.detail || item.reason || "Workflow state updated.",
      at: item.createdAt || item.updatedAt || new Date().toISOString(),
      href: "/portal/audit",
    }));

    const messageRows = messageItems.slice(0, 4).map((item) => ({
      id: `msg-${item.id || item.createdAt || Math.random()}`,
      type: item.channel || "Message",
      title: item.subject || "Workspace update",
      detail: item.preview || item.body || "New communication logged.",
      at: item.createdAt || item.updatedAt || new Date().toISOString(),
      href: "/portal/messages",
    }));

    return [...auditRows, ...messageRows]
      .sort((a, b) => parseDate(b.at) - parseDate(a.at))
      .slice(0, 8);
  }, [auditItems, messageItems]);

  const complianceAlerts = useMemo(() => {
    const alerts = [];

    const hasApprovedSubmittal = fileItems.some((item) => {
      const hay = normalize(`${item.category || ""} ${item.name || ""} ${item.description || ""}`);
      return hay.includes("submittal") && /approved|accepted|complete/i.test(`${item.status || ""}`);
    });
    if (!hasApprovedSubmittal) {
      alerts.push({
        id: "missing-submittal",
        tone: "warning",
        title: "Compliance Alert: Missing approved submittal",
        detail: "Submittal approval evidence is not present in the current file spine. Keep this visible until cleared.",
        href: "/portal/files",
        label: "Review drawings",
      });
    }

    const hasInsuranceCertificate = fileItems.some((item) => {
      const hay = normalize(`${item.category || ""} ${item.name || ""} ${item.description || ""}`);
      return hay.includes("insurance") && /approved|active|verified/i.test(`${item.status || ""}`);
    });
    if (!hasInsuranceCertificate) {
      alerts.push({
        id: "insurance-overdue",
        tone: "error",
        title: "Compliance Alert: Insurance certificate overdue",
        detail: "A verified insurance certificate is missing or stale for active delivery scope.",
        href: "/portal/files",
        label: "Open file controls",
      });
    }

    const riskProject = projectRows.find((item) => item.openRfis > toNumber(thresholds.maxRfisPerProject || 18));
    if (riskProject) {
      alerts.push({
        id: `rfi-cap-${riskProject.id}`,
        tone: "warning",
        title: "Compliance Alert: RFI congestion beyond governance threshold",
        detail: `${riskProject.name} has ${riskProject.openRfis} unresolved RFIs exceeding governed threshold ${toNumber(thresholds.maxRfisPerProject || 18)}.`,
        href: `/portal/rfis?projectId=${encodeURIComponent(riskProject.id)}`,
        label: "Open RFI lane",
      });
    }

    return alerts;
  }, [fileItems, projectRows, thresholds]);

  const engagementPrompts = useMemo(() => {
    const prompts = [];
    const weekAgo = Date.now() - (7 * 86400000);
    const drawingsOpen = navEvents.find((item) => item.href === "/portal/files" && parseDate(item.at) >= weekAgo);

    if (!drawingsOpen) {
      prompts.push({
        id: "drawings-review",
        detail: "You have not reviewed the latest design updates in over a week.",
        href: "/portal/files",
        label: "See what changed",
      });
    }

    const grouped = navEvents.reduce((acc, event) => {
      acc[event.href] = (acc[event.href] || 0) + 1;
      return acc;
    }, {});

    const preferred = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0];
    if (preferred) {
      prompts.push({
        id: "module-pattern",
        detail: `Your most-used launch in this workspace is ${preferred[0]}. Pin it to keep your front porch personalized.`,
        href: preferred[0],
        label: "Open preferred module",
      });
    }

    return prompts.slice(0, 2);
  }, [navEvents]);

  const roleFocus = useMemo(() => {
    if (dashboardRole === "superintendent") {
      const openTasks = projectRows.reduce((sum, row) => sum + Math.max(0, Math.round((100 - row.taskCompletionPct) / 10)), 0);
      return {
        title: "Superintendent View",
        cards: [
          { label: "Daily Logs", value: Math.max(1, projects.length), hint: "Field accountability cadence" },
          { label: "Field Completion", value: `${Math.round(projectRows.reduce((sum, row) => sum + row.taskCompletionPct, 0) / Math.max(1, projectRows.length))}%`, hint: "Task completion posture" },
          { label: "Material Deliveries", value: Math.max(0, openTasks), hint: "Needs delivery confirmation" },
        ],
      };
    }

    if (dashboardRole === "pm") {
      const budgetVariance = projectRows.reduce((sum, row) => sum + Math.max(0, -row.projectedMarginPct), 0);
      return {
        title: "Project Manager View",
        cards: [
          { label: "Critical Path Tasks", value: Math.max(0, projectRows.reduce((sum, row) => sum + row.scheduleSlip, 0)), hint: "Total slip pressure" },
          { label: "RFI Bottlenecks", value: projectRows.reduce((sum, row) => sum + row.openRfis, 0), hint: "Open RFIs across portfolio" },
          { label: "Budget Variance", value: formatUsd(budgetVariance * 100000), hint: "At-risk projected margin" },
        ],
      };
    }

    const financePackage = financeLoad.data?.package || {};
    const fundingMilestone = toNumber(financePackage.metrics?.cashProjection || financePackage.metrics?.cashOnHand || 0);
    const avgPunch = Math.max(0, 100 - Math.round(projectRows.reduce((sum, row) => sum + row.openRfis, 0) / Math.max(1, projectRows.length)));

    return {
      title: "Owner View",
      cards: [
        { label: "Project Health Index", value: `${enterpriseHealthIndex}%`, hint: "Executive portfolio signal" },
        { label: "Funding Milestones", value: formatUsd(fundingMilestone), hint: "Cash / funding posture" },
        { label: "Punch Progress", value: `${avgPunch}%`, hint: "Closeout readiness indicator" },
      ],
    };
  }, [dashboardRole, projectRows, projects.length, financeLoad.data, enterpriseHealthIndex]);

  function trackLaunch(href, label) {
    setNavEvents((current) => [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        at: new Date().toISOString(),
        href,
        label,
      },
      ...current,
    ].slice(0, 100));
  }

  function togglePin(pinId) {
    setPinnedItems((current) => {
      if (current.includes(pinId)) return current.filter((item) => item !== pinId);
      return [...current, pinId].slice(0, 8);
    });
  }

  const pinnedDefinitions = pinnedItems
    .map((pinId) => AVAILABLE_PINS.find((item) => item.id === pinId))
    .filter(Boolean);

  const loading = projectsLoad.status === "loading" || bidsLoad.status === "loading";

  return (
    <PortalShell
      title="Platform Dashboard"
      subtitle="Adaptive launch surface for executive clarity, action recommendations, and role-aware navigation."
      activeHref="/portal/platform"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.platform}
      primaryHref="/portal/auricrux"
      primaryLabel="Ask Auricrux"
      navDensity="full"
      showRouteOverlay={false}
    >
      {complianceAlerts.map((alert) => (
        <PortalAlert key={alert.id} tone={alert.tone} title={alert.title}>
          {alert.detail} <a href={alert.href} onClick={() => trackLaunch(alert.href, alert.label)} style={{ color: portalTokens.primary, fontWeight: 700 }}>{alert.label}</a>
        </PortalAlert>
      ))}

      <AuricruxInsightPanel
        title="Auricrux Front Porch Intelligence"
        targetObjectId={state?.project?.id || session?.email || "WORKSPACE"}
        sourceRoute="/portal/platform"
        rationale="Prioritize next-best actions for the active role and route each decision to a single-click workflow."
        nextAction={focusRecommendations[0]?.summary || state.workspace?.currentNextAction || "No critical blockers detected. Continue normal execution cadence."}
        recommendations={focusRecommendations.map((item) => ({ summary: item.detail, href: item.href, action: item.label }))}
        tone="blue"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Executive Clarity"
        title="See risk, decide fast, and launch directly into the right workflow"
        detail="The dashboard adapts by role, surfaces the three most important actions, and keeps governance and momentum visible without report-heavy clutter."
        actions={(
          <>
            <button type="button" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }} onClick={() => openAuricruxAssistant()}>Open Auricrux Chat</button>
            <a href="/portal/operations" style={portalButtonSecondary} onClick={() => trackLaunch("/portal/operations", "Open operations")}>Open Control Tower</a>
          </>
        )}
      />

      <PortalWorkspaceGuide compact />

      {loading ? <PortalAlert tone="info">Loading dashboard telemetry...</PortalAlert> : null}

      {!loading ? (
        <>
          <HealthGauge value={enterpriseHealthIndex} />

          <div style={{ ...portalCardStyle, marginTop: 12, marginBottom: 16 }}>
            <div style={{ ...portalEyebrowStyle, marginBottom: 8 }}>Today&apos;s Focus</div>
            <div style={{ display: "grid", gap: 10 }}>
              {focusRecommendations.map((item, index) => (
                <div key={item.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#fff" }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{index + 1}. {item.summary}</div>
                  <div style={{ color: portalTokens.body, fontSize: 13, marginBottom: 8 }}>{item.detail}</div>
                  <a href={item.href} style={portalButtonSecondary} onClick={() => trackLaunch(item.href, item.label)}>{item.label}</a>
                </div>
              ))}
              {!focusRecommendations.length ? <div style={{ color: portalTokens.muted }}>No urgent interventions detected.</div> : null}
            </div>
          </div>

          <PortalQuickStats items={roleFocus.cards} />

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={portalEyebrowStyle}>Role-Based View</div>
                <strong>{roleFocus.title}</strong>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setDashboardRole(role);
                      setPinnedItems(defaultPinsForRole(role));
                    }}
                    style={{
                      border: role === dashboardRole ? `1px solid ${portalTokens.primary}` : "1px solid #cbd5e1",
                      background: role === dashboardRole ? portalTokens.primarySoft : "#fff",
                      borderRadius: 999,
                      padding: "6px 10px",
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ color: portalTokens.body, fontSize: 13 }}>
              Personalized by responsibility: owners see health/funding, PMs see critical path and budget variance, superintendents see field execution cadence.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, marginBottom: 16 }}>
            <SparklineCard
              id="budget-chart"
              title="Budget vs Actual"
              subtitle="Macro-mini chart for cost trajectory"
              series={budgetSeries.actual}
              compareSeries={budgetSeries.planned}
              formatter={(value) => formatUsd(value)}
            />
            <SparklineCard
              id="schedule-chart"
              title="Schedule Progress"
              subtitle="Planned vs actual completion trend"
              series={scheduleSeries.actual}
              compareSeries={scheduleSeries.planned}
              formatter={(value) => `${Math.round(value)}%`}
            />
          </div>

          <div style={{ ...portalCardStyle, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={portalEyebrowStyle}>Personalization</div>
                <strong>Pin your launch modules and charts</strong>
              </div>
              <PortalStatusBadge status={`${pinnedDefinitions.length} pinned`} active={pinnedDefinitions.length > 0} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginBottom: 12 }}>
              {AVAILABLE_PINS.map((pin) => {
                const active = pinnedItems.includes(pin.id);
                return (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => togglePin(pin.id)}
                    style={{
                      border: active ? `1px solid ${portalTokens.primary}` : "1px solid #cbd5e1",
                      borderRadius: 10,
                      background: active ? portalTokens.primarySoft : "#fff",
                      padding: "9px 10px",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{pin.label}</div>
                    <div style={{ fontSize: 11, color: portalTokens.muted, marginTop: 3, textTransform: "uppercase" }}>{pin.kind}</div>
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {pinnedDefinitions.map((pin) => (
                <a
                  key={pin.id}
                  href={pin.href}
                  onClick={() => trackLaunch(pin.href, pin.label)}
                  style={{ ...portalButtonSecondary, textDecoration: "none" }}
                >
                  {pin.label}
                </a>
              ))}
              {!pinnedDefinitions.length ? <span style={{ color: portalTokens.muted }}>Choose at least one pinned launch card.</span> : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 1fr) minmax(280px, 1.2fr)", gap: 12, marginBottom: 16 }}>
            <div style={portalCardStyle}>
              <div style={portalEyebrowStyle}>Quick Actions</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {[
                  { href: "/portal/revenue-engine", label: "Open Revenue Engine" },
                  { href: "/portal/hiring", label: "Open Hiring Pipeline" },
                  { href: "/portal/communications", label: "Open Communications Neural" },
                  { href: "/portal/rfis", label: "Create RFI" },
                  { href: "/portal/files", label: "View Drawings" },
                  { href: "/portal/finance", label: "Approve Invoice" },
                  { href: "/portal/field-tasks", label: "Open Field Tasks" },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={() => trackLaunch(item.href, item.label)}
                    style={{ ...portalButtonPrimary, textAlign: "center", textDecoration: "none" }}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div style={portalCardStyle}>
              <div style={portalEyebrowStyle}>Project Momentum</div>
              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {continuityFeed.map((entry) => (
                  <a
                    key={entry.id}
                    href={entry.href}
                    onClick={() => trackLaunch(entry.href, entry.type)}
                    style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, textDecoration: "none", color: portalTokens.ink, background: "#fff" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                      <strong style={{ fontSize: 13 }}>{entry.type}</strong>
                      <span style={{ color: portalTokens.muted, fontSize: 11 }}>{new Date(entry.at).toLocaleString()}</span>
                    </div>
                    <div style={{ fontWeight: 700, marginTop: 4, fontSize: 13 }}>{entry.title}</div>
                    <div style={{ color: portalTokens.body, fontSize: 12, marginTop: 3 }}>{entry.detail}</div>
                  </a>
                ))}
                {!continuityFeed.length ? <div style={{ color: portalTokens.muted }}>No continuity events yet.</div> : null}
              </div>
            </div>
          </div>

          {engagementPrompts.map((prompt) => (
            <PortalAlert key={prompt.id} tone="info" title="Engagement Insight">
              {prompt.detail} <a href={prompt.href} onClick={() => trackLaunch(prompt.href, prompt.label)} style={{ color: portalTokens.primary, fontWeight: 700 }}>{prompt.label}</a>
            </PortalAlert>
          ))}
        </>
      ) : null}

      <div style={{ position: "fixed", right: 18, bottom: 20, zIndex: 20, display: "grid", gap: 8, justifyItems: "end" }}>
        {chatDockOpen ? (
          <div style={{ width: "min(320px, calc(100vw - 32px))", background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, boxShadow: "0 14px 40px rgba(15, 23, 42, 0.18)", padding: 12 }}>
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Ask Auricrux</div>
            <div style={{ fontSize: 12, color: portalTokens.body, marginBottom: 8 }}>Try one of these:</div>
            <div style={{ display: "grid", gap: 6 }}>
              {["What is the status of HVAC submittals?", "How much contingency do we have left?", "What needs intervention today?"].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => {
                    openAuricruxAssistant();
                    trackLaunch("/portal/auricrux", "Ask Auricrux");
                  }}
                  style={{ border: "1px solid #cbd5e1", background: "#fff", borderRadius: 8, padding: "8px 10px", textAlign: "left", cursor: "pointer", fontSize: 12 }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setChatDockOpen((value) => !value);
            if (!chatDockOpen) openAuricruxAssistant();
          }}
          style={{
            border: "none",
            borderRadius: 999,
            padding: "12px 16px",
            background: "linear-gradient(135deg, #0f766e 0%, #1d4ed8 100%)",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
            boxShadow: "0 12px 24px rgba(15, 23, 42, 0.22)",
          }}
        >
          Auricrux Chat
        </button>
      </div>
    </PortalShell>
  );
}
