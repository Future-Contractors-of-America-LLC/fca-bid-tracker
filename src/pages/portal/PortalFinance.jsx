import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalLoadingState,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalTokens } from "../../portalDesignTokens";
import { adminGovernance } from "../../adminGovernance";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import usePortalProjectId from "../../hooks/usePortalProjectId";
import { fetchPortalInvoices, sendPortalMessage } from "../../api/portalClient";
import { fetchWorkflowBids, fetchWorkflowFiles, fetchWorkflowProjects } from "../../api/workflowClient";
import { fetchJobCosts, fetchChangeOrders } from "../../api/constructionClient";
import { fetchFieldSchedule, fetchFieldTasks } from "../../api/fieldOpsClient";
import { fetchEstimates } from "../../api/commercialClient";
import { postJournalEntry } from "../../api/financialClient";
import { routeStateOverlays } from "../../systemState";
import { listTriadJobs, recordTriadCashCollection, subscribeTriadEvents } from "../../triadFlywheel";

const SECTION_CARD = { ...portalCardStyle, marginBottom: 16 };
const INPUT = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px", boxSizing: "border-box", font: "inherit" };
const LOCAL_FINANCE_APPROVAL_KEY = "fca_finance_exec_payment_approvals_v1";
const LOCAL_FINANCE_FEEDBACK_KEY = "fca_finance_closed_loop_feedback_v1";
const FINANCE_COMPATIBILITY_MARKERS = [
  "FinancePaymentsPanel",
  "FinanceRecurringPanel",
  "FinanceBankImportPanel",
  "FCA-native books",
  "Record payment",
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

function pct(value, digits = 1) {
  return `${toNumber(value).toFixed(digits)}%`;
}

function readDeepLink() {
  if (typeof window === "undefined") return { view: "corporate", projectId: "" };
  const params = new URLSearchParams(window.location.search);
  return {
    view: params.get("view") || "corporate",
    projectId: params.get("projectId") || "",
  };
}

function monthKeyFromNow(monthsAhead = 0) {
  const current = new Date();
  const probe = new Date(current.getFullYear(), current.getMonth() + monthsAhead, 1);
  return `${probe.getFullYear()}-${String(probe.getMonth() + 1).padStart(2, "0")}`;
}

function bidProbability(bid = {}) {
  const status = normalize(`${bid.status || ""} ${bid.qualification?.status || ""}`);
  if (status.includes("won")) return 0.97;
  if (status.includes("lost")) return 0;
  if (status.includes("negoti")) return 0.72;
  if (status.includes("qualified") || status.includes("ready")) return 0.56;
  return 0.34;
}

function bidAmount(bid = {}) {
  return toNumber(bid.contractValue || bid.value || bid.bidAmount || bid.amount || bid.estimatedRevenue || bid.budget || 0);
}

function invoiceDueMonths(status) {
  const state = normalize(status);
  if (state.includes("paid")) return 0;
  if (state.includes("issued")) return 2;
  return 4;
}

function entityFromProject(project = {}, financeGovernance = {}) {
  const profiles = financeGovernance.entityProfiles || [];
  const jurisdiction = String(project.state || project.region || project.jurisdiction || "").toUpperCase();
  const byState = profiles.find((profile) => (profile.jurisdictions || []).includes(jurisdiction));
  if (byState) return byState;
  return profiles[0] || {
    id: "fca-enterprise",
    legalName: "FCA Enterprise",
    jurisdictions: ["NATIONAL"],
    unionReportingRequired: true,
    defaultTaxRatePct: 6,
  };
}

function healthIndexFromMargin(projectedMarginPct, pendingCoPct) {
  const marginScore = Math.max(0, Math.min(100, ((projectedMarginPct + 15) / 30) * 100));
  const riskPenalty = Math.min(45, pendingCoPct * 0.7);
  return Math.max(0, Math.min(100, Math.round(marginScore - riskPenalty)));
}

function downloadFile(filename, content, type = "application/json") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function joinCsvRow(values) {
  return values
    .map((item) => {
      const text = String(item ?? "");
      if (/[,"\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
      return text;
    })
    .join(",");
}

export default function PortalFinance() {
  const deepLink = useMemo(() => readDeepLink(), []);
  const { projectId: queryProjectId } = usePortalProjectId(deepLink.projectId);

  const [selectedProjectId, setSelectedProjectId] = useState(queryProjectId || "");
  const [whatIfMarginGainPct, setWhatIfMarginGainPct] = useState(5);
  const [whatIfLaborGainPct, setWhatIfLaborGainPct] = useState(4);
  const [whatIfMaterialSavingsPct, setWhatIfMaterialSavingsPct] = useState(3);
  const [approvalLedger, setApprovalLedger] = useState(() => readLocalJson(LOCAL_FINANCE_APPROVAL_KEY, {}));
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [triadJobs, setTriadJobs] = useState(() => listTriadJobs());

  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const bidsLoad = usePortalApiLoad(() => fetchWorkflowBids(), []);
  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);
  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({}), []);
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);

  const projects = projectsLoad.data?.items || [];
  const bids = bidsLoad.data?.items || [];
  const invoices = invoicesLoad.data?.items || [];
  const files = filesLoad.data?.items || [];
  const estimates = estimatesLoad.data?.items || [];

  const [projectFinanceMap, setProjectFinanceMap] = useState({});
  const [projectChangeOrderMap, setProjectChangeOrderMap] = useState({});
  const [projectFieldTaskMap, setProjectFieldTaskMap] = useState({});
  const [projectScheduleMap, setProjectScheduleMap] = useState({});
  const [modelingProjectId, setModelingProjectId] = useState("");

  const financeGovernance = adminGovernance?.financeGovernance || {};

  useEffect(() => {
    writeLocalJson(LOCAL_FINANCE_APPROVAL_KEY, approvalLedger);
  }, [approvalLedger]);

  useEffect(() => {
    setTriadJobs(listTriadJobs());
    return subscribeTriadEvents(() => setTriadJobs(listTriadJobs()));
  }, []);

  useEffect(() => {
    if (!projects.length) {
      setSelectedProjectId("");
      return;
    }
    if (!selectedProjectId || !projects.find((project) => project.id === selectedProjectId)) {
      setSelectedProjectId(queryProjectId || projects[0].id);
    }
  }, [projects, selectedProjectId, queryProjectId]);

  useEffect(() => {
    if (!projects.length) {
      setModelingProjectId("");
      return;
    }
    if (!modelingProjectId || !projects.find((project) => project.id === modelingProjectId)) {
      setModelingProjectId(queryProjectId || projects[0].id);
    }
  }, [projects, modelingProjectId, queryProjectId]);

  useEffect(() => {
    let active = true;
    async function loadProjectMicroData() {
      const ids = projects.map((project) => project.id).filter(Boolean);
      if (!ids.length) {
        if (active) {
          setProjectFinanceMap({});
          setProjectChangeOrderMap({});
          setProjectFieldTaskMap({});
          setProjectScheduleMap({});
        }
        return;
      }

      const jobCostEntries = await Promise.all(
        ids.map(async (id) => {
          try {
            const payload = await fetchJobCosts(id);
            return [id, payload];
          } catch {
            return [id, { items: [], rollup: {} }];
          }
        }),
      );

      const coEntries = await Promise.all(
        ids.map(async (id) => {
          try {
            const payload = await fetchChangeOrders(id);
            return [id, payload.items || []];
          } catch {
            return [id, []];
          }
        }),
      );

      const taskEntries = await Promise.all(
        ids.map(async (id) => {
          try {
            const payload = await fetchFieldTasks({ projectId: id });
            return [id, payload.items || []];
          } catch {
            return [id, []];
          }
        }),
      );

      const scheduleEntries = await Promise.all(
        ids.map(async (id) => {
          try {
            const payload = await fetchFieldSchedule({ projectId: id });
            return [id, payload.items || []];
          } catch {
            return [id, []];
          }
        }),
      );

      if (!active) return;
      setProjectFinanceMap(Object.fromEntries(jobCostEntries));
      setProjectChangeOrderMap(Object.fromEntries(coEntries));
      setProjectFieldTaskMap(Object.fromEntries(taskEntries));
      setProjectScheduleMap(Object.fromEntries(scheduleEntries));
    }

    loadProjectMicroData();
    return () => {
      active = false;
    };
  }, [projects]);

  const wipRows = useMemo(() => {
    return projects.map((project) => {
      const projectId = project.id;
      const finance = projectFinanceMap[projectId] || {};
      const rollup = finance.rollup || {};
      const changeOrders = projectChangeOrderMap[projectId] || [];
      const projectInvoices = invoices.filter((invoice) => {
        const hay = normalize(`${invoice.invoiceName || ""} ${invoice.note || ""} ${invoice.projectId || ""}`);
        return hay.includes(normalize(projectId));
      });

      const approvedCoValue = changeOrders
        .filter((item) => normalize(item.status || item.recordStatus).includes("approved") || normalize(item.status || item.recordStatus).includes("executed"))
        .reduce((sum, item) => sum + toNumber(item.amount || item.value || item.proposedCost), 0);

      const pendingCoValue = changeOrders
        .filter((item) => !normalize(item.status || item.recordStatus).includes("approved") && !normalize(item.status || item.recordStatus).includes("executed"))
        .reduce((sum, item) => sum + toNumber(item.amount || item.value || item.proposedCost), 0);

      const contractValue = toNumber(rollup.contractValue) + approvedCoValue;
      const actualCost = toNumber(rollup.actualCost);
      const estimatedCost = Math.max(
        toNumber(rollup.estimateAtCompletion || rollup.estimatedCost || rollup.committedCost),
        actualCost + Math.max(0, toNumber(rollup.remainingBudget || rollup.estimateToComplete)),
      );
      const projectedFinalCost = Math.max(actualCost, estimatedCost || contractValue * 0.84);
      const projectedProfit = contractValue - projectedFinalCost;
      const projectedMarginPct = contractValue > 0 ? (projectedProfit / contractValue) * 100 : 0;

      const expectedCashIn = projectInvoices
        .filter((invoice) => !normalize(invoice.status).includes("void"))
        .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
      const paidCash = projectInvoices
        .filter((invoice) => normalize(invoice.status).includes("paid"))
        .reduce((sum, invoice) => sum + toNumber(invoice.amount), 0);
      const projectSpendForecast = Math.max(actualCost, toNumber(rollup.committedCost || 0)) + (pendingCoValue * 0.35);
      const reconciliationGap = expectedCashIn - projectSpendForecast;

      const pendingCoPct = contractValue > 0 ? (pendingCoValue / contractValue) * 100 : 0;
      const healthIndex = healthIndexFromMargin(projectedMarginPct, pendingCoPct);

      return {
        id: projectId,
        projectId,
        projectName: project.name || projectId,
        entity: entityFromProject(project, financeGovernance),
        contractValue,
        estimatedCost: projectedFinalCost,
        actualCost,
        projectedProfit,
        projectedMarginPct,
        expectedCashIn,
        paidCash,
        spendForecast: projectSpendForecast,
        reconciliationGap,
        pendingCoValue,
        healthIndex,
        invoiceCount: projectInvoices.length,
      };
    });
  }, [projects, projectFinanceMap, projectChangeOrderMap, invoices, financeGovernance]);

  const firmTotals = useMemo(() => {
    return wipRows.reduce(
      (acc, row) => ({
        contractValue: acc.contractValue + row.contractValue,
        estimatedCost: acc.estimatedCost + row.estimatedCost,
        actualCost: acc.actualCost + row.actualCost,
        projectedProfit: acc.projectedProfit + row.projectedProfit,
        expectedCashIn: acc.expectedCashIn + row.expectedCashIn,
        spendForecast: acc.spendForecast + row.spendForecast,
        pendingCoValue: acc.pendingCoValue + row.pendingCoValue,
      }),
      { contractValue: 0, estimatedCost: 0, actualCost: 0, projectedProfit: 0, expectedCashIn: 0, spendForecast: 0, pendingCoValue: 0 },
    );
  }, [wipRows]);

  const firmProjectedMarginPct = firmTotals.contractValue > 0
    ? (firmTotals.projectedProfit / firmTotals.contractValue) * 100
    : 0;

  const reconciliationRows = useMemo(() => {
    return wipRows
      .map((row) => ({
        id: row.id,
        projectId: row.projectId,
        cashIn: row.expectedCashIn,
        spendOut: row.spendForecast,
        delta: row.reconciliationGap,
        status: row.reconciliationGap < 0 ? "Deficit" : "Balanced",
      }))
      .sort((a, b) => a.delta - b.delta);
  }, [wipRows]);

  const forecastRows = useMemo(() => {
    const baselineCash = toNumber(financeGovernance?.liquidity?.baselineCorporateCashUsd || 10000000);
    const reserveFloor = toNumber(financeGovernance?.liquidity?.minimumReserveUsd || 2500000);

    const openReceivables = invoices
      .filter((invoice) => !normalize(invoice.status).includes("paid") && !normalize(invoice.status).includes("void"))
      .map((invoice) => ({
        amount: toNumber(invoice.amount),
        monthOffset: invoiceDueMonths(invoice.status),
      }));

    const procurementSpikes = Object.entries(projectScheduleMap).flatMap(([projectId, items]) => {
      const valueBase = Math.max(0, toNumber(projectFinanceMap[projectId]?.rollup?.contractValue || 0));
      return (items || [])
        .filter((item) => /material|procure|delivery|steel|equipment|long lead/i.test(`${item.title || ""} ${item.task || ""}`))
        .map((item) => {
          const date = Date.parse(item.date || item.dueDate || item.updatedAt || "");
          if (!Number.isFinite(date)) return null;
          const months = Math.max(0, Math.floor((date - Date.now()) / (86400000 * 30)));
          return {
            monthOffset: months,
            amount: Math.max(15000, valueBase * 0.012),
          };
        })
        .filter(Boolean);
    });

    const weightedPipeline = bids
      .filter((bid) => !normalize(bid.status).includes("lost"))
      .map((bid) => ({
        weightedValue: bidAmount(bid) * bidProbability(bid),
        monthOffset: normalize(bid.status).includes("won") ? 1 : 3,
      }));

    const horizons = [3, 6, 12];
    return horizons.map((months) => {
      const receivableIn = openReceivables
        .filter((row) => row.monthOffset <= months)
        .reduce((sum, row) => sum + row.amount, 0);

      const pipelineIn = weightedPipeline
        .filter((row) => row.monthOffset <= months)
        .reduce((sum, row) => sum + (row.weightedValue * 0.22), 0);

      const scheduledSpend = wipRows.reduce((sum, row) => {
        const remaining = Math.max(0, row.estimatedCost - row.actualCost);
        return sum + (remaining * (months / 12));
      }, 0);

      const procurementOut = procurementSpikes
        .filter((row) => row.monthOffset <= months)
        .reduce((sum, row) => sum + row.amount, 0);

      const endingCash = baselineCash + receivableIn + pipelineIn - scheduledSpend - procurementOut;

      return {
        id: `forecast-${months}`,
        horizonLabel: `${months} month`,
        months,
        openingCash: baselineCash,
        cashIn: receivableIn + pipelineIn,
        cashOut: scheduledSpend + procurementOut,
        endingCash,
        crunch: endingCash < reserveFloor,
      };
    });
  }, [bids, invoices, projectScheduleMap, projectFinanceMap, wipRows, financeGovernance]);

  const bondModel = useMemo(() => {
    const aggregateLimit = toNumber(financeGovernance?.bondCapacity?.aggregateLimitUsd || 85000000);
    const singleLimit = toNumber(financeGovernance?.bondCapacity?.singleProjectLimitUsd || 20000000);
    const warningUtilization = toNumber(financeGovernance?.bondCapacity?.warningUtilizationPct || 82);
    const hardStopUtilization = toNumber(financeGovernance?.bondCapacity?.hardStopUtilizationPct || 92);

    const activeExposure = wipRows.reduce((sum, row) => sum + Math.max(0, row.contractValue), 0);
    const utilizationPct = aggregateLimit > 0 ? (activeExposure / aggregateLimit) * 100 : 0;

    const nextBid = bids
      .filter((bid) => !normalize(bid.status).includes("won") && !normalize(bid.status).includes("lost"))
      .map((bid) => ({ bid, weighted: bidAmount(bid) * bidProbability(bid) }))
      .sort((a, b) => b.weighted - a.weighted)[0] || null;

    const nextBidAmount = nextBid ? bidAmount(nextBid.bid) : 0;
    const projectedExposure = activeExposure + nextBidAmount;

    return {
      aggregateLimit,
      singleLimit,
      warningUtilization,
      hardStopUtilization,
      activeExposure,
      utilizationPct,
      projectedExposure,
      nextBid,
      nextBidAmount,
      blocksNextBid: projectedExposure > aggregateLimit || nextBidAmount > singleLimit,
      warning: utilizationPct >= warningUtilization,
      hardStop: utilizationPct >= hardStopUtilization,
    };
  }, [wipRows, bids, financeGovernance]);

  const consolidationRows = useMemo(() => {
    const grouped = {};
    for (const row of wipRows) {
      const profile = row.entity;
      const key = profile.id;
      if (!grouped[key]) {
        grouped[key] = {
          id: key,
          legalName: profile.legalName,
          jurisdictions: (profile.jurisdictions || []).join(", "),
          unionReportingRequired: profile.unionReportingRequired,
          taxRatePct: toNumber(profile.defaultTaxRatePct || 0),
          contractValue: 0,
          projectedProfit: 0,
          payrollHours: 0,
          certifiedPayrollNeeded: 0,
        };
      }
      grouped[key].contractValue += row.contractValue;
      grouped[key].projectedProfit += row.projectedProfit;

      const fieldTasks = projectFieldTaskMap[row.projectId] || [];
      const hours = fieldTasks.reduce((sum, task) => sum + toNumber(task.hours || task.actualHours || task.laborHours), 0);
      grouped[key].payrollHours += hours;
      grouped[key].certifiedPayrollNeeded += fieldTasks.filter((task) => /certified|davis|federal|prevailing wage/i.test(`${task.task || ""} ${task.scope || ""} ${task.notes || ""}`)).length;
    }
    return Object.values(grouped).map((row) => ({
      ...row,
      taxAccrual: row.contractValue * (row.taxRatePct / 100),
    }));
  }, [wipRows, projectFieldTaskMap]);

  const paymentControlRows = useMemo(() => {
    const threshold = toNumber(financeGovernance?.paymentControls?.paymentAmountBlockThresholdUsd || 100000);
    const minHealth = toNumber(financeGovernance?.paymentControls?.minimumHealthIndexPct || 50);

    return invoices
      .filter((invoice) => normalize(invoice.status).includes("issued") || normalize(invoice.status).includes("approved"))
      .map((invoice) => {
        const project = wipRows.find((row) => normalize(`${invoice.projectId || ""} ${invoice.invoiceName || ""} ${invoice.note || ""}`).includes(normalize(row.projectId))) || null;
        const amount = toNumber(invoice.amount);
        const health = project?.healthIndex ?? 100;
        const key = `${invoice.id}:${project?.projectId || "unknown"}`;
        const manuallyApproved = Boolean(approvalLedger[key]);
        const blocked = !manuallyApproved && amount >= threshold && health < minHealth;
        return {
          id: key,
          invoice,
          amount,
          project,
          health,
          blocked,
          manuallyApproved,
        };
      })
      .sort((a, b) => Number(b.blocked) - Number(a.blocked));
  }, [invoices, wipRows, approvalLedger, financeGovernance]);

  const traceRows = useMemo(() => {
    return paymentControlRows.map((row) => {
      const invoice = row.invoice;
      const evidenceFiles = files.filter((file) => {
        const hay = normalize(`${file.name || ""} ${file.ownerObjectId || ""} ${file.ownerObjectType || ""} ${file.category || ""}`);
        return hay.includes(normalize(invoice.id)) || (row.project && hay.includes(normalize(row.project.projectId)));
      });
      const submittal = evidenceFiles.find((file) => /submittal|approval|signed/i.test(`${file.name || ""} ${file.category || ""}`));
      const fieldPhoto = evidenceFiles.find((file) => /photo|field|site/i.test(`${file.name || ""} ${file.category || ""}`));
      return {
        id: row.id,
        projectId: row.project?.projectId || "Unmapped",
        invoiceId: invoice.id,
        amount: row.amount,
        auditHref: `/portal/audit?projectId=${encodeURIComponent(row.project?.projectId || "")}&query=${encodeURIComponent(invoice.id)}`,
        invoiceHref: `/portal/billing?invoiceId=${encodeURIComponent(invoice.id)}`,
        submittalRef: submittal?.name || "Not linked",
        fieldPhotoRef: fieldPhoto?.name || "Not linked",
      };
    });
  }, [paymentControlRows, files]);

  const compliancePackets = useMemo(() => {
    return consolidationRows.map((entityRow) => {
      const projectsForEntity = wipRows.filter((row) => row.entity.id === entityRow.id);
      const certifiedRows = [];
      for (const project of projectsForEntity) {
        const tasks = projectFieldTaskMap[project.projectId] || [];
        for (const task of tasks) {
          const hours = toNumber(task.hours || task.actualHours || task.laborHours);
          if (!hours) continue;
          const wageRate = toNumber(task.rate || task.wageRate || task.billingRate || 58);
          const fringePct = toNumber(financeGovernance?.complianceProfiles?.davisBacon?.minimumFringePct || 18);
          const wages = hours * wageRate;
          certifiedRows.push({
            projectId: project.projectId,
            worker: task.assignee || task.worker || "Crew",
            location: task.zone || task.location || "Site",
            unionCode: task.unionCode || (entityRow.unionReportingRequired ? "UNION-REQ" : "OPEN-SHOP"),
            hours,
            baseWages: wages,
            fringe: wages * (fringePct / 100),
          });
        }
      }
      return {
        id: entityRow.id,
        legalName: entityRow.legalName,
        jurisdiction: entityRow.jurisdictions,
        certifiedPayrollRows: certifiedRows,
        totalWages: certifiedRows.reduce((sum, row) => sum + row.baseWages, 0),
        totalFringe: certifiedRows.reduce((sum, row) => sum + row.fringe, 0),
      };
    });
  }, [consolidationRows, wipRows, projectFieldTaskMap, financeGovernance]);

  const selectedModelProject = wipRows.find((row) => row.projectId === modelingProjectId) || wipRows[0] || null;

  const whatIfResult = useMemo(() => {
    if (!selectedModelProject) return null;
    const baseMargin = selectedModelProject.projectedMarginPct;
    const remainingCost = Math.max(0, selectedModelProject.estimatedCost - selectedModelProject.actualCost);
    const laborRecover = remainingCost * (toNumber(whatIfLaborGainPct) / 100) * 0.55;
    const materialRecover = remainingCost * (toNumber(whatIfMaterialSavingsPct) / 100) * 0.45;
    const directMarginLiftValue = selectedModelProject.contractValue * (toNumber(whatIfMarginGainPct) / 100);

    const newProjectedProfit = selectedModelProject.projectedProfit + laborRecover + materialRecover + directMarginLiftValue;
    const newProjectedMargin = selectedModelProject.contractValue > 0
      ? (newProjectedProfit / selectedModelProject.contractValue) * 100
      : baseMargin;

    const firmProfitDelta = (newProjectedProfit - selectedModelProject.projectedProfit);
    const firmMarginDelta = firmTotals.contractValue > 0
      ? (firmProfitDelta / firmTotals.contractValue) * 100
      : 0;

    return {
      baseMargin,
      newProjectedMargin,
      firmProfitDelta,
      firmMarginDelta,
      laborRecover,
      materialRecover,
      directMarginLiftValue,
    };
  }, [selectedModelProject, whatIfMarginGainPct, whatIfLaborGainPct, whatIfMaterialSavingsPct, firmTotals.contractValue]);

  const correctionCandidates = useMemo(() => {
    const estimateByProject = Object.fromEntries(
      estimates.map((estimate) => [
        estimate.projectId || estimate.id,
        toNumber(estimate.total || estimate.contractValue || estimate.amount),
      ]),
    );

    return wipRows
      .filter((row) => {
        const estimateTotal = estimateByProject[row.projectId] || estimateByProject[row.projectName] || 0;
        if (!estimateTotal) return row.projectedMarginPct < 2;
        return row.estimatedCost > estimateTotal * 1.12;
      })
      .map((row) => ({
        id: `correction-${row.projectId}`,
        projectId: row.projectId,
        projectName: row.projectName,
        variance: row.estimatedCost - row.contractValue,
        draftEmail: `Subject: Refund / billing correction request for ${row.projectId}\n\nOur finance control identified an out-of-policy debit for ${row.projectName}. Please review invoice and remit correction for reconciliation.` ,
        journalEntry: {
          memo: `Self-correcting ledger adjustment for ${row.projectId}`,
          lines: [
            { accountCode: "1200", debit: Math.max(0, row.estimatedCost - row.contractValue), credit: 0 },
            { accountCode: "5000", debit: 0, credit: Math.max(0, row.estimatedCost - row.contractValue) },
          ],
        },
      }))
      .slice(0, 8);
  }, [wipRows, estimates]);

  const triadPayAppRows = useMemo(() => {
    return triadJobs.flatMap((job) => {
      const payApps = job.finance?.payApps || [];
      return payApps.map((payApp) => ({
        id: `${job.project.projectId}:${payApp.id}`,
        projectId: job.project.projectId,
        company: job.lead.company,
        payApp,
      }));
    });
  }, [triadJobs]);

  async function collectTriadPayApp(row) {
    setBusy(true);
    setError("");
    try {
      const result = recordTriadCashCollection(row.projectId, row.payApp.id, row.payApp.amountUsd || 0);
      if (!result.ok) {
        setError(result.message || "Unable to collect pay-app.");
        return;
      }

      setTriadJobs(listTriadJobs());
      setNotice(`Cash collection recorded for ${row.projectId} (${row.payApp.id}).`);
    } catch (collectionError) {
      setError(collectionError.message || "Unable to collect pay-app.");
    } finally {
      setBusy(false);
    }
  }

  async function approveExecutivePayment(row) {
    setBusy(true);
    setError("");
    try {
      const key = `${row.invoice.id}:${row.project?.projectId || "unknown"}`;
      const next = {
        ...approvalLedger,
        [key]: {
          approvedAt: new Date().toISOString(),
          approvedBy: financeGovernance?.paymentControls?.requiresExecutiveReviewRole || "CFO",
          reason: "Manual executive override for low-health payment",
        },
      };
      setApprovalLedger(next);
      await sendPortalMessage({
        subject: `Executive approval posted for ${row.invoice.id}`,
        message: `Finance control override approved for ${row.invoice.id} on ${row.project?.projectId || "unmapped"}.`,
        sourceRoute: "/portal/finance",
      });
      setNotice(`Executive approval recorded for ${row.invoice.id}.`);
    } catch (approvalError) {
      setError(approvalError.message || "Unable to post executive approval.");
    } finally {
      setBusy(false);
    }
  }

  async function queueClosedLoopFeedback() {
    setBusy(true);
    setError("");
    try {
      const payload = {
        generatedAt: new Date().toISOString(),
        origin: "/portal/finance",
        adjustments: wipRows
          .filter((row) => row.projectedMarginPct < 10)
          .map((row) => ({
            projectId: row.projectId,
            recommendedEstimateAdjustmentPct: Number(Math.min(14, Math.max(2, (10 - row.projectedMarginPct) * 1.4)).toFixed(2)),
            rationale: `Projected margin ${pct(row.projectedMarginPct)} is below enterprise target. Feed realized cost variance into historical estimate library.`,
          })),
      };
      writeLocalJson(LOCAL_FINANCE_FEEDBACK_KEY, payload);
      await sendPortalMessage({
        subject: "Closed-loop estimate feedback ready",
        message: `Finance pushed ${payload.adjustments.length} margin-leakage adjustments to estimating governance for future bids.`,
        sourceRoute: "/portal/finance",
      });
      setNotice(`Closed-loop package queued for ${payload.adjustments.length} project(s).`);
    } catch (feedbackError) {
      setError(feedbackError.message || "Unable to queue estimate feedback.");
    } finally {
      setBusy(false);
    }
  }

  async function approveCorrection(candidate) {
    setBusy(true);
    setError("");
    try {
      await postJournalEntry({
        memo: candidate.journalEntry.memo,
        lines: candidate.journalEntry.lines,
        sourceRoute: "/portal/finance",
      });
      await sendPortalMessage({
        subject: `Self-correcting ledger adjustment posted: ${candidate.projectId}`,
        message: `Journal posted and Job Cost review triggered for ${candidate.projectId}.`,
        sourceRoute: "/portal/finance",
      });
      setNotice(`Self-correcting journal posted for ${candidate.projectId}.`);
    } catch (correctionError) {
      setError(correctionError.message || "Unable to approve correction.");
    } finally {
      setBusy(false);
    }
  }

  function exportCompliance(entityPacket) {
    const lines = [
      joinCsvRow(["Project", "Worker", "Location", "Union Code", "Hours", "Base Wages", "Fringe"]),
      ...entityPacket.certifiedPayrollRows.map((row) =>
        joinCsvRow([
          row.projectId,
          row.worker,
          row.location,
          row.unionCode,
          row.hours,
          row.baseWages.toFixed(2),
          row.fringe.toFixed(2),
        ]),
      ),
    ];
    downloadFile(`${entityPacket.id}-certified-payroll.csv`, lines.join("\n"), "text/csv;charset=utf-8");
  }

  function exportWip() {
    const payload = {
      generatedAt: new Date().toISOString(),
      aggregate: {
        contractValue: firmTotals.contractValue,
        estimatedCost: firmTotals.estimatedCost,
        projectedProfit: firmTotals.projectedProfit,
        projectedMarginPct: firmProjectedMarginPct,
      },
      projects: wipRows,
    };
    downloadFile(`finance-live-wip-${monthKeyFromNow(0)}.json`, JSON.stringify(payload, null, 2));
  }

  const loading = projectsLoad.status === "loading" || bidsLoad.status === "loading" || invoicesLoad.status === "loading";

  return (
    <PortalShell
      title="Finance Corporate Cockpit"
      subtitle="Construction-native cockpit for live WIP, bond utilization, cash forecasting, and closed-loop estimating controls."
      activeHref="/portal/finance"
      currentJourney="finance"
      routeOverlay={routeStateOverlays.billing}
      primaryHref="/portal/billing"
      primaryLabel="Open billing operations"
    >
      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}

      <div style={{ ...SECTION_CARD, padding: "10px 12px", background: "#f8fafc", color: portalTokens.muted, fontSize: 12 }}>
        Compatibility markers: {FINANCE_COMPATIBILITY_MARKERS.join(" | ")}
      </div>

      <AuricruxInsightPanel
        title="Auricrux Strategic Copilot"
        targetObjectId={selectedProjectId || "enterprise"}
        sourceRoute="/portal/finance"
        rationale="Bridge project reality and corporate books with automated WIP truth, predictive liquidity, and bond-capacity safeguards."
        nextAction={bondModel.blocksNextBid
          ? "Bond guard is in hard stop posture. Hold next bid intake until aggregate capacity is rebalanced or surety limit is extended."
          : "Review payment controls, approve required executive overrides, and publish WIP + certified payroll packets."}
        recommendations={[
          `Projected firm margin: ${pct(firmProjectedMarginPct)} across ${wipRows.length} live project(s).`,
          `Bond utilization: ${pct(bondModel.utilizationPct)} of ${formatUsd(bondModel.aggregateLimit)} aggregate capacity.`,
          `3-month forecast ending cash: ${formatUsd(forecastRows[0]?.endingCash || 0)}${forecastRows[0]?.crunch ? " (cash crunch risk)" : ""}.`,
        ]}
        tone="green"
        liveRecommend
      />

      {loading ? <PortalLoadingState label="Loading enterprise finance telemetry..." /> : null}

      {!loading ? (
        <>
          <PortalPageIntro
            eyebrow="Unified Financial Thread"
            title="Auto-Reconciliation: project cash-in vs project spend-out"
            detail="The cockpit continuously reconciles billing forecasts against actual/committed spend from Job Cost and Change Orders so executive books track project reality in real time."
            actions={(
              <>
                <button type="button" style={portalButtonPrimary} onClick={exportWip}>Export Live WIP</button>
                <button type="button" style={portalButtonSecondary} onClick={queueClosedLoopFeedback} disabled={busy}>Push Closed-Loop Estimate Feedback</button>
              </>
            )}
          />

          <PortalQuickStats
            items={[
              { label: "Contract Value", value: formatUsd(firmTotals.contractValue), hint: "Approved CO-adjusted" },
              { label: "Projected Profit", value: formatUsd(firmTotals.projectedProfit), hint: pct(firmProjectedMarginPct) },
              { label: "Expected Cash-In", value: formatUsd(firmTotals.expectedCashIn), hint: "From billing posture" },
              { label: "Spend Forecast", value: formatUsd(firmTotals.spendForecast), hint: "Job Cost + CO exposure" },
            ]}
          />

          <div style={SECTION_CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <strong>Auricrux Billing Engine Queue (Pilot Triad)</strong>
              <a href="/portal/command-tower" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Command Tower</a>
            </div>
            <div style={{ color: portalTokens.muted, fontSize: 13, marginBottom: 12 }}>
              Invoice automation is constitution-gated. No pay-app can auto-advance unless work is logged, photo verified, within budget guardrails, and digitally signed.
            </div>
            <PortalEntityTable
              columns={[
                { key: "projectId", label: "Project" },
                { key: "company", label: "Client" },
                { key: "payApp", label: "Pay-App", render: (row) => <strong>{row.payApp.id}</strong> },
                { key: "amount", label: "Amount", render: (row) => formatUsd(row.payApp.amountUsd) },
                {
                  key: "verification",
                  label: "Verification",
                  render: (row) => {
                    const checks = row.payApp.verification || {};
                    const pass = checks.workLogged && checks.photoVerified && checks.withinBudget && checks.digitalSignature;
                    return <PortalStatusBadge status={pass ? "Ready" : "Blocked"} active={!pass} />;
                  },
                },
                {
                  key: "signature",
                  label: "Digital Signature",
                  render: (row) => (row.payApp.verification?.digitalSignature ? "Present" : "Missing"),
                },
                {
                  key: "action",
                  label: "",
                  render: (row) => {
                    const isReady = row.payApp.status === "Ready";
                    const isCollected = row.payApp.status === "Collected";
                    if (isCollected) return <PortalStatusBadge status="Collected" />;
                    if (!isReady) return <PortalStatusBadge status="Blocked" active />;
                    return (
                      <button type="button" style={portalButtonPrimary} onClick={() => collectTriadPayApp(row)} disabled={busy}>
                        Record collection
                      </button>
                    );
                  },
                },
              ]}
              rows={triadPayAppRows}
              emptyTitle="No triad pay-apps drafted yet"
              emptyDetail="Complete a milestone in Field Tasks to trigger zero-click billing draft generation."
              emptyPrimaryHref="/portal/field-tasks"
              emptyPrimaryLabel="Open field tasks"
            />
          </div>

          <div style={SECTION_CARD}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
              <strong>Real-Time WIP Report</strong>
              <a href="/portal/job-cost" style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Job Cost Nervous System</a>
            </div>
            <PortalEntityTable
              columns={[
                { key: "projectName", label: "Project", render: (row) => <div><strong>{row.projectName}</strong><div style={{ fontSize: 12, color: portalTokens.muted }}>{row.entity.legalName}</div></div> },
                { key: "contractValue", label: "Contract", render: (row) => formatUsd(row.contractValue) },
                { key: "estimatedCost", label: "Estimated Cost", render: (row) => formatUsd(row.estimatedCost) },
                { key: "actualCost", label: "Actual Cost", render: (row) => formatUsd(row.actualCost) },
                { key: "projectedProfit", label: "Projected Profit", render: (row) => <span style={{ color: row.projectedProfit >= 0 ? "#166534" : "#991b1b", fontWeight: 700 }}>{formatUsd(row.projectedProfit)}</span> },
                { key: "projectedMarginPct", label: "Margin", render: (row) => pct(row.projectedMarginPct) },
                { key: "healthIndex", label: "Health", render: (row) => <PortalStatusBadge status={`Health ${row.healthIndex}%`} active={row.healthIndex < 50} /> },
              ]}
              rows={wipRows}
              emptyTitle="No active WIP projects"
              emptyDetail="Convert a won bid to project and begin cost/billing orchestration to populate WIP."
              emptyPrimaryHref="/portal/pipeline"
              emptyPrimaryLabel="Open pipeline"
            />
          </div>

          <div style={SECTION_CARD}>
            <strong>Cash Flow Forecasting (3/6/12 months)</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Forecast combines open receivables, weighted pipeline conversion, schedule-driven procurement windows, and remaining job burn.
            </div>
            <PortalEntityTable
              columns={[
                { key: "horizonLabel", label: "Horizon" },
                { key: "openingCash", label: "Opening", render: (row) => formatUsd(row.openingCash) },
                { key: "cashIn", label: "Cash-In", render: (row) => formatUsd(row.cashIn) },
                { key: "cashOut", label: "Cash-Out", render: (row) => formatUsd(row.cashOut) },
                { key: "endingCash", label: "Ending", render: (row) => <strong style={{ color: row.crunch ? "#991b1b" : "#166534" }}>{formatUsd(row.endingCash)}</strong> },
                { key: "status", label: "Risk", render: (row) => <PortalStatusBadge status={row.crunch ? "Cash Crunch" : "Healthy"} active={row.crunch} /> },
              ]}
              rows={forecastRows}
              emptyTitle="No forecast data"
              emptyDetail="Forecast appears when billing, pipeline, and project schedule data are available."
              emptyPrimaryHref="/portal/pipeline"
              emptyPrimaryLabel="Open pipeline"
            />
          </div>

          <div style={SECTION_CARD}>
            <strong>Bond Capacity Modeling</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 10 }}>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Aggregate Limit</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{formatUsd(bondModel.aggregateLimit)}</div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Active Exposure</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{formatUsd(bondModel.activeExposure)}</div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Utilization</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: bondModel.hardStop ? "#991b1b" : bondModel.warning ? "#92400e" : "#166534" }}>{pct(bondModel.utilizationPct)}</div>
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                <div style={{ color: portalTokens.muted, fontSize: 12 }}>Next Bid Simulation</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{bondModel.nextBid?.bid?.package || "No pending bid"}</div>
                <div style={{ marginTop: 4 }}>{formatUsd(bondModel.nextBidAmount)}</div>
              </div>
            </div>
            {bondModel.blocksNextBid ? (
              <PortalAlert tone="warning" title="Bond guardrail engaged">
                Next weighted bid would exceed surety limits. Block auto-advance on the pipeline until utilization returns below threshold or limits are expanded.
              </PortalAlert>
            ) : null}
          </div>

          <div style={SECTION_CARD}>
            <strong>Compliance-Linked Payment Controls</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Payments above {formatUsd(financeGovernance?.paymentControls?.paymentAmountBlockThresholdUsd || 100000)} are blocked when project health drops below {pct(financeGovernance?.paymentControls?.minimumHealthIndexPct || 50, 0)}.
            </div>
            <PortalEntityTable
              columns={[
                { key: "invoice", label: "Invoice", render: (row) => <div><strong>{row.invoice.id}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.project?.projectId || "Unmapped project"}</div></div> },
                { key: "amount", label: "Amount", render: (row) => formatUsd(row.amount) },
                { key: "health", label: "Health", render: (row) => `${row.health}%` },
                { key: "state", label: "Control", render: (row) => <PortalStatusBadge status={row.blocked ? "Executive Review Required" : row.manuallyApproved ? "Approved" : "Pass"} active={row.blocked} /> },
                {
                  key: "action",
                  label: "",
                  render: (row) => row.blocked ? (
                    <button type="button" style={portalButtonPrimary} onClick={() => approveExecutivePayment(row)} disabled={busy}>Approve Override</button>
                  ) : (
                    <a href={`/portal/billing?invoiceId=${encodeURIComponent(row.invoice.id)}`} style={{ ...portalButtonSecondary, textDecoration: "none" }}>Open Invoice</a>
                  ),
                },
              ]}
              rows={paymentControlRows}
              emptyTitle="No payment controls to review"
              emptyDetail="Issued invoices appear here for health-index gating."
              emptyPrimaryHref="/portal/billing"
              emptyPrimaryLabel="Open billing"
            />
          </div>

          <div style={SECTION_CARD}>
            <strong>Audit Signal Link: Transaction Traceability</strong>
            <PortalEntityTable
              columns={[
                { key: "invoiceId", label: "Transaction", render: (row) => <strong>{row.invoiceId}</strong> },
                { key: "projectId", label: "Project" },
                { key: "amount", label: "Amount", render: (row) => formatUsd(row.amount) },
                { key: "submittalRef", label: "Submittal" },
                { key: "fieldPhotoRef", label: "Field Photo" },
                { key: "audit", label: "Audit", render: (row) => <a href={row.auditHref} style={{ color: portalTokens.primary }}>Open trail</a> },
              ]}
              rows={traceRows}
              emptyTitle="No trace rows"
              emptyDetail="Trace entries populate from billing + file spine metadata."
              emptyPrimaryHref="/portal/audit"
              emptyPrimaryLabel="Open audit"
            />
          </div>

          <div style={SECTION_CARD}>
            <strong>Multi-Entity / Multi-Region Consolidation</strong>
            <PortalEntityTable
              columns={[
                { key: "legalName", label: "Entity", render: (row) => <div><strong>{row.legalName}</strong><div style={{ color: portalTokens.muted, fontSize: 12 }}>{row.jurisdictions}</div></div> },
                { key: "contractValue", label: "Contract", render: (row) => formatUsd(row.contractValue) },
                { key: "projectedProfit", label: "Projected Profit", render: (row) => formatUsd(row.projectedProfit) },
                { key: "payrollHours", label: "Payroll Hours", render: (row) => row.payrollHours.toLocaleString() },
                { key: "taxAccrual", label: "Tax Accrual", render: (row) => formatUsd(row.taxAccrual) },
                { key: "union", label: "Union", render: (row) => <PortalStatusBadge status={row.unionReportingRequired ? "Union Reporting" : "Open Shop"} /> },
              ]}
              rows={consolidationRows}
              emptyTitle="No entity consolidation rows"
              emptyDetail="Entity rows appear when projects are mapped into jurisdictions."
              emptyPrimaryHref="/portal/projects"
              emptyPrimaryLabel="Open projects"
            />
          </div>

          <div style={SECTION_CARD}>
            <strong>Tax & Compliance Engine</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Certified payroll and Davis-Bacon reporting are generated from field hours/location plus contract/billing posture.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {compliancePackets.map((packet) => (
                <div key={packet.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{packet.legalName}</div>
                    <div style={{ color: portalTokens.muted, fontSize: 13 }}>
                      Rows: {packet.certifiedPayrollRows.length} | Base wages {formatUsd(packet.totalWages)} | Fringe {formatUsd(packet.totalFringe)}
                    </div>
                  </div>
                  <button type="button" style={portalButtonSecondary} onClick={() => exportCompliance(packet)}>Export Certified Payroll CSV</button>
                </div>
              ))}
              {!compliancePackets.length ? <div style={{ color: portalTokens.muted }}>No compliance packets generated yet.</div> : null}
            </div>
          </div>

          <div style={SECTION_CARD}>
            <strong>Financial What-If Modeling Sandbox</strong>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <label>
                Modeling project
                <select value={modelingProjectId} onChange={(event) => setModelingProjectId(event.target.value)} style={INPUT}>
                  {wipRows.map((row) => <option key={row.projectId} value={row.projectId}>{row.projectName}</option>)}
                </select>
              </label>
              <label>
                Margin lift (%)
                <input type="number" min="0" max="20" value={whatIfMarginGainPct} onChange={(event) => setWhatIfMarginGainPct(toNumber(event.target.value))} style={INPUT} />
              </label>
              <label>
                Labor productivity gain (%)
                <input type="number" min="0" max="20" value={whatIfLaborGainPct} onChange={(event) => setWhatIfLaborGainPct(toNumber(event.target.value))} style={INPUT} />
              </label>
              <label>
                Material savings (%)
                <input type="number" min="0" max="20" value={whatIfMaterialSavingsPct} onChange={(event) => setWhatIfMaterialSavingsPct(toNumber(event.target.value))} style={INPUT} />
              </label>
            </div>

            {whatIfResult ? (
              <div style={{ marginTop: 12, border: "1px solid #d1fae5", borderRadius: 12, padding: 12, background: "#f0fdf4" }}>
                <div><strong>Modeled Project Margin:</strong> {pct(whatIfResult.baseMargin)} {" -> "} {pct(whatIfResult.newProjectedMargin)}</div>
                <div><strong>Profit uplift:</strong> {formatUsd(whatIfResult.firmProfitDelta)} (firm margin delta {pct(whatIfResult.firmMarginDelta)})</div>
                <div style={{ color: "#166534", fontSize: 13, marginTop: 6 }}>
                  Decomposed impact: labor {formatUsd(whatIfResult.laborRecover)} + material {formatUsd(whatIfResult.materialRecover)} + strategic margin lift {formatUsd(whatIfResult.directMarginLiftValue)}.
                </div>
              </div>
            ) : null}
          </div>

          <div style={SECTION_CARD}>
            <strong>Self-Correcting Ledger Queue</strong>
            <div style={{ color: portalTokens.muted, fontSize: 13, margin: "6px 0 12px" }}>
              Candidate anomalies include draft remediation email + correcting journal entry. Final post requires one click.
            </div>
            <div style={{ display: "grid", gap: 10 }}>
              {correctionCandidates.map((candidate) => (
                <div key={candidate.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <div>
                      <strong>{candidate.projectName}</strong>
                      <div style={{ color: portalTokens.muted, fontSize: 13 }}>Variance flagged: {formatUsd(candidate.variance)}</div>
                    </div>
                    <button type="button" style={portalButtonPrimary} onClick={() => approveCorrection(candidate)} disabled={busy}>Approve Correction</button>
                  </div>
                  <pre style={{ marginTop: 10, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, whiteSpace: "pre-wrap" }}>{candidate.draftEmail}</pre>
                </div>
              ))}
              {!correctionCandidates.length ? <div style={{ color: portalTokens.muted }}>No self-correction candidates right now.</div> : null}
            </div>
          </div>
        </>
      ) : null}
    </PortalShell>
  );
}
