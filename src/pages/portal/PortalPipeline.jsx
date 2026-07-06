import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import {
  createPortalInvoice,
  fetchPortalInvoices,
  issuePortalInvoice,
  fetchPortalMessages,
  sendPortalMessage,
} from "../../api/portalClient";
import {
  fetchCommercialPipeline,
  migrateLocalPipelineToApi,
  pipelineItemsToMap,
  upsertPipelineLink,
} from "../../api/pipelineClient";
import { createInvoiceFromEstimate } from "../../api/financialClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { fetchFieldSchedule } from "../../api/fieldOpsClient";
import { fetchWorkflowFiles, mutateWorkflowFile } from "../../api/workflowClient";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { routeStateOverlays } from "../../systemState";
import useAcademyLms from "../../hooks/useAcademyLms";
import { publishPortalPageContext } from "../../portalPageContext";
import {
  PortalAlert,
  PortalEmptyState,
  PortalPageIntro,
  PortalQuickStats,
  PortalWorkflowStepper,
} from "../../components/portal/PortalPrimitives";
import {
  portalButtonPrimary,
  portalButtonSecondary,
  portalCardStyle,
  portalTokens,
} from "../../portalDesignTokens";
import { detectPipelineStagnation, scoreBidQualification } from "../../utils/goNoGoScoring";

const PIPELINE_KEY = "fca_commercial_pipeline_v1";
const PIPELINE_TARGET_REVENUE_KEY = "fca_pipeline_target_revenue_v1";
const PIPELINE_GOVERNANCE_KEY = "fca_pipeline_governance_v1";

const PIPELINE_STAGES = ["lead", "bid", "negotiation", "won"];
const STAGE_LABELS = {
  lead: "Lead",
  bid: "Bid Submitted",
  negotiation: "Final Negotiation",
  won: "Won",
  lost: "Lost",
};

const STEPS = [
  { key: "qualify", label: "Qualify bid", detail: "Score and qualify the opportunity." },
  { key: "project", label: "Award to project", detail: "Convert won work into a live project." },
  { key: "estimate", label: "Estimate (optional)", detail: "Route to estimate or skip." },
  { key: "invoice", label: "Issue invoice", detail: "Create and issue customer invoice." },
  { key: "payment", label: "Collect payment", detail: "Record payment in FCA Books and post to GL." },
];

function normalizeLink(link = {}) {
  return {
    bidId: link.bidId,
    projectId: link.projectId,
    invoiceId: link.invoiceId,
    estimateSkipped: Boolean(link.estimateSkipped),
    currentStep: link.currentStep,
    assignedProgramKey: link.assignedProgramKey || "",
    assignedProgramTitle: link.assignedProgramTitle || "",
    trainingAssignedAt: link.trainingAssignedAt || "",
  };
}

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
    // Best-effort browser persistence.
  }
}

function parseCurrency(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (!value) return 0;
  const numeric = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatUsd(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function deriveRevenueStage(bid = {}) {
  const status = String(bid.status || "").toLowerCase();
  const qualification = String(bid.qualification?.status || "").toLowerCase();
  if (status.includes("lost")) return "lost";
  if (status.includes("won")) return "won";
  if (status.includes("negoti") || qualification.includes("negoti")) return "negotiation";
  if (status.includes("qualif") || qualification.includes("ready") || qualification.includes("estimate")) return "bid";
  return "lead";
}

function stageIndex(stage) {
  return PIPELINE_STAGES.indexOf(stage);
}

function messageRiskPenalty(bid, messages = []) {
  const criticalTerms = /(delay|stalled|issue|concern|risk|price|budget cut|hold|re-scope|scope gap|incumbent)/i;
  const bidKey = `${bid.id || ""} ${bid.package || ""}`.toLowerCase();
  const related = messages.filter((item) => {
    const hay = `${item.subject || ""} ${item.message || ""} ${item.preview || ""}`.toLowerCase();
    return hay.includes(bid.id?.toLowerCase?.() || "") || hay.includes(bid.package?.toLowerCase?.() || "") || hay.includes(bidKey);
  });
  if (!related.length) return 0;
  const matches = related.filter((item) => criticalTerms.test(`${item.subject || ""} ${item.message || ""} ${item.preview || ""}`)).length;
  return clamp(matches * 0.06, 0, 0.25);
}

function computeBidProbability(bid, stagnationAlert, messages = []) {
  const stage = deriveRevenueStage(bid);
  if (stage === "won") return 0.99;
  if (stage === "lost") return 0;
  const go = scoreBidQualification(bid);
  const stageWeight = { lead: 0.2, bid: 0.45, negotiation: 0.72, won: 0.99 }[stage] || 0.2;
  const stagnationPenalty = stagnationAlert ? 0.08 : 0;
  const sentimentPenalty = messageRiskPenalty(bid, messages);
  return clamp((go.numericScore / 100) * 0.55 + stageWeight * 0.45 - stagnationPenalty - sentimentPenalty, 0.02, 0.99);
}

function conversionBetween(stagedRows, fromStage, toStage) {
  const fromIdx = stageIndex(fromStage);
  const toIdx = stageIndex(toStage);
  if (fromIdx < 0 || toIdx < 0 || toIdx <= fromIdx) {
    return { fromStage, toStage, entered: 0, progressed: 0, rate: 0, systemicIssue: false };
  }
  const entered = stagedRows.filter((item) => item.stage !== "lost" && stageIndex(item.stage) >= fromIdx).length;
  const progressed = stagedRows.filter((item) => item.stage !== "lost" && stageIndex(item.stage) >= toIdx).length;
  const rate = entered ? Math.round((progressed / entered) * 100) : 0;
  return {
    fromStage,
    toStage,
    entered,
    progressed,
    rate,
    systemicIssue: entered >= 3 && rate < 55,
  };
}

function daysInStage(bid) {
  const anchor = bid.lastActionAt || bid.updatedAt || bid.createdAt;
  if (!anchor) return null;
  const delta = Date.now() - new Date(anchor).getTime();
  if (!Number.isFinite(delta) || delta < 0) return null;
  return Math.floor(delta / (1000 * 60 * 60 * 24));
}

function computeVelocity(stagedRows) {
  const byStage = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage, { totalDays: 0, count: 0, avgDays: 0 }]));
  stagedRows.forEach((item) => {
    if (!PIPELINE_STAGES.includes(item.stage)) return;
    if (!Number.isFinite(item.stageDays)) return;
    byStage[item.stage].totalDays += item.stageDays;
    byStage[item.stage].count += 1;
  });
  PIPELINE_STAGES.forEach((stage) => {
    const row = byStage[stage];
    row.avgDays = row.count ? Math.max(1, Math.round(row.totalDays / row.count)) : 0;
  });
  const stalled = stagedRows.filter((item) => {
    if (!PIPELINE_STAGES.includes(item.stage) || !Number.isFinite(item.stageDays)) return false;
    const avg = byStage[item.stage].avgDays;
    return avg >= 1 && item.stageDays > Math.max(avg * 1.35, avg + 2);
  });
  return { byStage, stalled };
}

function deriveStepStatus(bid, projects, invoices, links) {
  const link = normalizeLink(links[bid.id] || {});
  const qualified = ["Qualified", "Ready for estimate"].includes(bid.qualification?.status) || bid.status === "Qualified";
  const won = bid.status === "Won" || projects.some((p) => p.sourceBidId === bid.id || p.name?.includes(bid.package));
  const estimateDone = link.estimateSkipped || bid.qualification?.nextGate?.toLowerCase().includes("estimate") || bid.status === "Qualified";
  const linkedInvoice = invoices.find((inv) => inv.id === link.invoiceId);
  const invoiceIssued = linkedInvoice?.status === "Issued" || linkedInvoice?.status === "Paid";
  const paid = linkedInvoice?.status === "Paid";

  const complete = {
    qualify: qualified,
    project: won,
    estimate: estimateDone,
    invoice: invoiceIssued,
    payment: paid,
  };

  let current = "qualify";
  if (complete.payment) current = "done";
  else if (complete.invoice) current = "payment";
  else if (complete.project && complete.estimate) current = "invoice";
  else if (complete.project) current = "estimate";
  else if (complete.qualify) current = "project";
  else current = "qualify";

  return { complete, current, linkedInvoice, link };
}

export default function PortalPipeline() {
  const { state, refreshSyncStamp } = useWorkspaceState();
  const { session } = useCustomerSession();
  const { academyState, assignProgram } = useAcademyLms();
  const { bids, updateBidQualification, routeBidToEstimate, markWonAndCreateProject, updateBidStatus } = useBidWorkspace();
  const { projects, activeProject, reloadProjects } = useProjectWorkspace();

  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const [invoiceDraft, setInvoiceDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [viewMode, setViewMode] = useState("commercial");
  const [lostDebriefReason, setLostDebriefReason] = useState("");
  const [lostDebriefNotes, setLostDebriefNotes] = useState("");
  const [targetRevenueInput, setTargetRevenueInput] = useState(() => String(readLocalJson(PIPELINE_TARGET_REVENUE_KEY, 25000000)));
  const [governanceByBid, setGovernanceByBid] = useState(() => readLocalJson(PIPELINE_GOVERNANCE_KEY, {}));
  const [trainingProgramKey, setTrainingProgramKey] = useState("");
  const [trainingMessage, setTrainingMessage] = useState("");

  const invoicesLoad = usePortalApiLoad(() => fetchPortalInvoices(), []);
  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({}), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);
  const scheduleLoad = usePortalApiLoad(() => fetchFieldSchedule({}), []);
  const financeLoad = usePortalApiLoad(() => fetchFinancialWorkspace("dashboard"), []);
  const invoices = invoicesLoad.data?.items || [];
  const allFiles = filesLoad.data?.items || [];
  const allMessages = messagesLoad.data?.items || [];
  const scheduleEvents = scheduleLoad.data?.items || [];

  const pipelineLoad = usePortalApiLoad(async () => {
    const payload = await fetchCommercialPipeline();
    const items = await migrateLocalPipelineToApi(payload.items || []);
    return {
      ...payload,
      items,
      links: pipelineItemsToMap(items),
    };
  }, []);

  const links = pipelineLoad.data?.links || {};
  const pipelineSource = pipelineLoad.backingSource || (pipelineLoad.status === "error" ? "error" : "loading");
  const pipelineLoadError = pipelineLoad.error || "";

  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";
  const activeBid = bids.find((bid) => bid.id === activeBidId) || bids[0] || null;
  const goNoGoScore = useMemo(() => (activeBid ? scoreBidQualification(activeBid) : null), [activeBid]);
  const stagnationAlert = useMemo(() => (activeBid ? detectPipelineStagnation(activeBid) : null), [activeBid]);

  useEffect(() => {
    writeLocalJson(PIPELINE_GOVERNANCE_KEY, governanceByBid);
  }, [governanceByBid]);

  useEffect(() => {
    const numeric = parseCurrency(targetRevenueInput);
    if (numeric > 0) {
      writeLocalJson(PIPELINE_TARGET_REVENUE_KEY, numeric);
    }
  }, [targetRevenueInput]);

  useEffect(() => {
    if (!activeBidId && bids[0]?.id) setActiveBidId(bids[0].id);
  }, [bids, activeBidId]);

  async function savePipelineLink(bidId, patch) {
    const merged = { ...normalizeLink(links[bidId]), ...patch, bidId };
    const pipeline = deriveStepStatus(
      bids.find((bid) => bid.id === bidId) || { id: bidId },
      projects,
      invoices,
      { ...links, [bidId]: merged },
    );
    const body = {
      bidId,
      projectId: merged.projectId,
      invoiceId: merged.invoiceId,
      estimateSkipped: merged.estimateSkipped,
      currentStep: pipeline.current,
      assignedProgramKey: merged.assignedProgramKey,
      assignedProgramTitle: merged.assignedProgramTitle,
      trainingAssignedAt: merged.trainingAssignedAt,
    };
    try {
      const payload = await upsertPipelineLink(body);
      await pipelineLoad.reload();
      return { ...links, [bidId]: normalizeLink(payload.item) };
    } catch (err) {
      throw err;
    }
  }

  const pipelineRows = useMemo(
    () => bids.map((bid) => ({ bid, ...deriveStepStatus(bid, projects, invoices, links) })),
    [bids, projects, invoices, links],
  );

  const enrichedRows = useMemo(() => {
    return pipelineRows.map((row) => {
      const stage = deriveRevenueStage(row.bid);
      const stageDays = daysInStage(row.bid);
      const stagnation = detectPipelineStagnation(row.bid);
      const probability = computeBidProbability(row.bid, stagnation, allMessages);
      const rawValue = parseCurrency(row.bid.value);
      const weightedValue = rawValue * probability;
      return {
        ...row,
        stage,
        stageDays,
        probability,
        rawValue,
        weightedValue,
        stagnation,
      };
    });
  }, [pipelineRows, allMessages]);

  const conversions = useMemo(
    () => [
      conversionBetween(enrichedRows, "lead", "bid"),
      conversionBetween(enrichedRows, "bid", "negotiation"),
      conversionBetween(enrichedRows, "negotiation", "won"),
    ],
    [enrichedRows],
  );

  const velocity = useMemo(() => computeVelocity(enrichedRows), [enrichedRows]);

  const weightedTotals = useMemo(() => {
    const weightedPipeline = enrichedRows.reduce((sum, row) => sum + (row.stage === "won" || row.stage === "lost" ? 0 : row.weightedValue), 0);
    const booked = enrichedRows.reduce((sum, row) => sum + (row.stage === "won" ? row.rawValue : 0), 0);
    const actuals = invoices
      .filter((inv) => String(inv.status || "").toLowerCase().includes("paid"))
      .reduce((sum, inv) => sum + parseCurrency(inv.amount), 0);
    return { weightedPipeline, booked, actuals };
  }, [enrichedRows, invoices]);

  const targetRevenue = parseCurrency(targetRevenueInput) || 0;
  const gapToGoal = Math.max(0, targetRevenue - (weightedTotals.booked + weightedTotals.actuals + weightedTotals.weightedPipeline));

  const capacitySnapshot = useMemo(() => {
    const modeledCapacity = scheduleEvents.reduce((sum, item) => sum + parseCurrency(item.estimatedCost), 0);
    const projectedQuarterWins = enrichedRows.reduce((sum, row) => {
      if (row.stage === "won" || row.stage === "lost") return sum;
      if (row.probability < 0.45) return sum;
      return sum + row.rawValue * row.probability;
    }, 0);
    return {
      modeledCapacity,
      projectedQuarterWins,
      overCapacity: modeledCapacity > 0 && projectedQuarterWins > modeledCapacity,
    };
  }, [enrichedRows, scheduleEvents]);

  const activePipeline = activeBid ? deriveStepStatus(activeBid, projects, invoices, links) : null;
  const stepIndex = activePipeline?.current === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === activePipeline?.current);
  const learnerId = session?.email || session?.customerId;
  const lanePrograms = useMemo(
    () => (academyState?.catalog?.programs || []).filter((item) => ["licensure", "certification", "apprenticeship"].includes(item.lane)),
    [academyState?.catalog?.programs],
  );
  const activeProjectId = activePipeline?.link?.projectId || activeProject?.id || "";
  const activeGovernance = activeBid ? (governanceByBid[activeBid.id] || {}) : {};

  const activeEvidenceMatch = useMemo(() => {
    if (!activeBid) return [];
    const bidTokens = `${activeBid.id} ${activeBid.package}`.toLowerCase();
    return allFiles.filter((file) => {
      const hay = `${file.ownerObjectId || ""} ${file.name || ""} ${file.note || ""} ${file.linkedEvidenceTarget || ""}`.toLowerCase();
      return hay.includes(activeBid.id.toLowerCase()) || hay.includes(activeBid.package?.toLowerCase?.() || "") || hay.includes(bidTokens);
    });
  }, [activeBid, allFiles]);

  const financeMarginSnapshot = financeLoad.data?.dashboard || {};
  const marginTargetPct = Number(financeMarginSnapshot.marginTargetPct ?? financeMarginSnapshot.targetMarginPct ?? 15);
  const marginForecastPct = Number(financeMarginSnapshot.forecastMarginPct ?? financeMarginSnapshot.grossMarginPct ?? 0);

  const complianceGate = useMemo(() => {
    const evidencePacketReady = Boolean(activeGovernance.evidencePacketComplete) || activeEvidenceMatch.length > 0;
    const marginSignoffReady = Boolean(activeGovernance.marginSignoffComplete) || (Number.isFinite(marginForecastPct) && Number.isFinite(marginTargetPct) && marginForecastPct >= marginTargetPct);
    return {
      evidencePacketReady,
      marginSignoffReady,
      pass: evidencePacketReady && marginSignoffReady,
    };
  }, [activeGovernance.evidencePacketComplete, activeGovernance.marginSignoffComplete, activeEvidenceMatch.length, marginForecastPct, marginTargetPct]);

  useEffect(() => {
    publishPortalPageContext({
      surface: "pipeline",
      projectId: activeProjectId || activeProject?.id || "",
      bidId: activeBid?.id || "",
      pipelineStep: activePipeline?.current || "qualify",
    });
    return () => publishPortalPageContext(null);
  }, [activeBid?.id, activePipeline?.current, activeProject?.id, activeProjectId]);

  async function assignTrainingProgram() {
    if (!activeBid || !trainingProgramKey || !learnerId) {
      setTrainingMessage("Select a program and sign in to assign training.");
      return;
    }
    const program = lanePrograms.find((item) => item.key === trainingProgramKey);
    if (!program) {
      setTrainingMessage("Program not found.");
      return;
    }
    setBusy("training");
    setTrainingMessage("");
    try {
      const projectId = activeProjectId || activeProject?.id || "";
      await assignProgram(learnerId, program.key, "Pipeline assignment", projectId);
      await savePipelineLink(activeBid.id, {
        assignedProgramKey: program.key,
        assignedProgramTitle: program.title,
        trainingAssignedAt: new Date().toISOString(),
        projectId: projectId || undefined,
      });
      setTrainingMessage(`Assigned ${program.title} to this pipeline job.`);
      refreshSyncStamp("Pipeline training program assigned");
    } catch (err) {
      setTrainingMessage(err.message || "Unable to assign training program.");
    } finally {
      setBusy("");
    }
  }

  async function runQualify() {
    if (!activeBid) return;
    setBusy("qualify");
    setError("");
    try {
      await updateBidQualification(activeBid.id, {
        score: "88/100",
        status: "Qualified",
        budgetFit: "Confirmed",
        scopeFit: "Confirmed",
        evidence: "Pipeline qualification complete",
        nextGate: "Award and project conversion",
      }, "Pipeline wizard qualified the opportunity.");
      await savePipelineLink(activeBid.id, {});
      refreshSyncStamp("Pipeline qualification complete");
    } catch (err) {
      setError(err.message || "Qualification failed.");
    } finally {
      setBusy("");
    }
  }

  async function triggerWonAutomations(bid, projectId) {
    if (!bid?.id || !projectId) return;
    const governance = governanceByBid[bid.id] || {};
    if (!governance.foldersProvisioned) {
      const templates = [
        { name: `${bid.package} / 01 Contract`, category: "Contract", discipline: "Commercial" },
        { name: `${bid.package} / 02 Drawings and RFIs`, category: "Drawing", discipline: "Preconstruction" },
        { name: `${bid.package} / 03 Field Execution`, category: "Photo", discipline: "Field" },
      ];
      for (const entry of templates) {
        await mutateWorkflowFile("create-file-record", {
          projectId,
          name: entry.name,
          category: entry.category,
          discipline: entry.discipline,
          owner: "Pipeline automation",
          status: "Registered",
          evidenceStatus: "Pipeline auto-provisioned",
          linkedEvidenceTarget: `${projectId} award evidence chain`,
          detail: `Pipeline automation provisioned ${entry.name} after award conversion for ${bid.id}.`,
        });
      }
    }
    await sendPortalMessage({
      channel: "teams",
      subject: `${bid.package} moved to WON - field supervision notify`,
      message: `Pipeline automation created project ${projectId}, provisioned initial file structure, and requests field supervision kickoff readiness.`,
    });
    setGovernanceByBid((current) => ({
      ...current,
      [bid.id]: {
        ...(current[bid.id] || {}),
        foldersProvisioned: true,
        notificationsSentAt: new Date().toISOString(),
      },
    }));
  }

  async function runAward() {
    if (!activeBid) return;
    if (!complianceGate.pass) {
      setError("Hard-gate compliance blocked: evidence packet and finance margin sign-off are required before awarding to Won.");
      return;
    }
    setBusy("project");
    setError("");
    try {
      await markWonAndCreateProject(activeBid.id, "Pipeline wizard converted award into project after hard-gate compliance pass.");
      const refreshedProjects = await reloadProjects();
      const project = refreshedProjects.find((item) => item.sourceBidId === activeBid.id) || projects.find((item) => item.sourceBidId === activeBid.id);
      await savePipelineLink(activeBid.id, { projectId: project?.id });
      if (project?.id) {
        await triggerWonAutomations(activeBid, project.id);
      }
      setNotice(`Award automation completed for ${activeBid.id}. Project created, file spine provisioned, and field supervision notified.`);
      refreshSyncStamp("Pipeline project conversion complete");
    } catch (err) {
      setError(err.message || "Project conversion failed.");
    } finally {
      setBusy("");
    }
  }

  async function runLostDebrief() {
    if (!activeBid || !lostDebriefReason.trim()) {
      setError("Select a lost-bid reason before recording debrief.");
      return;
    }
    setBusy("lost");
    setError("");
    try {
      const detail = `Lost bid debrief recorded. Reason: ${lostDebriefReason}. Notes: ${lostDebriefNotes || "n/a"}`;
      await updateBidStatus(activeBid.id, "Lost", detail);
      setGovernanceByBid((current) => ({
        ...current,
        [activeBid.id]: {
          ...(current[activeBid.id] || {}),
          lostDebrief: {
            reason: lostDebriefReason,
            notes: lostDebriefNotes,
            at: new Date().toISOString(),
          },
        },
      }));
      await sendPortalMessage({
        channel: "email",
        subject: `${activeBid.package} lost debrief logged`,
        message: `Mandatory lost-bid debrief captured for ${activeBid.id}. Reason: ${lostDebriefReason}. Notes: ${lostDebriefNotes || "n/a"}.`,
      });
      setNotice(`Lost-bid debrief completed for ${activeBid.id}.`);
      refreshSyncStamp("Lost bid debrief logged for AI learning loop");
      setLostDebriefReason("");
      setLostDebriefNotes("");
    } catch (err) {
      setError(err.message || "Unable to record lost bid debrief.");
    } finally {
      setBusy("");
    }
  }

  async function runEstimate() {
    if (!activeBid) return;
    setBusy("estimate");
    setError("");
    try {
      await routeBidToEstimate(activeBid.id, "Pipeline wizard routed opportunity to estimate.");
      refreshSyncStamp("Pipeline estimate routing complete");
    } catch (err) {
      setError(err.message || "Estimate routing failed.");
    } finally {
      setBusy("");
    }
  }

  async function skipEstimate() {
    if (!activeBid) return;
    await savePipelineLink(activeBid.id, { estimateSkipped: true });
    refreshSyncStamp("Estimate step skipped in pipeline");
  }

  async function runInvoice() {
    if (!activeBid) return;
    const projectId = activePipeline?.link?.projectId || activeProject?.id || "";
    const estimateId = activePipeline?.link?.estimateId || "EST-1";
    setBusy("invoice");
    setError("");
    try {
      const bridged = await createInvoiceFromEstimate(estimateId, projectId);
      const invoiceId = bridged?.portalInvoice?.id;
      if (invoiceId) {
        await savePipelineLink(activeBid.id, { invoiceId, projectId, estimateId });
        await invoicesLoad.reload();
        refreshSyncStamp("Pipeline invoice issued from governed estimate bridge");
        return;
      }
      throw new Error("Estimate bridge did not return an invoice.");
    } catch (bridgeError) {
      const name = invoiceDraft.invoiceName.trim() || `${activeBid.package} mobilization`;
      const amount = invoiceDraft.amount.trim() || activeBid.value?.replace(/[^\d.]/g, "") || "1000";
      try {
        const created = await createPortalInvoice({ invoiceName: name, amount: amount.startsWith("$") ? amount : `$${amount}`, note: invoiceDraft.note || `Invoice for ${activeBid.package}` });
        const invoiceId = created.item?.id;
        if (invoiceId) {
          await issuePortalInvoice(invoiceId);
          await savePipelineLink(activeBid.id, { invoiceId, projectId });
          await invoicesLoad.reload();
        }
        refreshSyncStamp("Pipeline invoice issued");
      } catch (err) {
        setError(bridgeError.message || err.message || "Invoice creation failed.");
      }
    } finally {
      setBusy("");
    }
  }

  function runPayment() {
    const invoiceId = activePipeline?.linkedInvoice?.id || activePipeline?.link?.invoiceId;
    if (!invoiceId || typeof window === "undefined") return;
    window.location.href = `/portal/finance?view=payments&invoiceId=${encodeURIComponent(invoiceId)}`;
  }

  return (
    <PortalShell
      title="Commercial pipeline"
      subtitle="One guided flow from qualification through project award, billing, and payment."
      activeHref="/portal/pipeline"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/bids"
      primaryLabel="Open qualification board"
    >
      <PortalPageIntro
        eyebrow="Pipeline wizard"
        title={`${companyName} commercial flow`}
        detail="Select a job, complete each step in order, and keep billing tied to the same opportunity."
      />

      <PortalApiStatusBanner
        status={pipelineLoad.status}
        error={pipelineLoad.error}
        onRetry={pipelineLoad.reload}
        label="pipeline"
      />

      {pipelineLoadError ? <PortalAlert tone="warning">{pipelineLoadError}</PortalAlert> : null}
      {notice ? <PortalAlert tone="success">{notice}</PortalAlert> : null}

      {activeBid?.id ? (
        <div style={{ marginBottom: 18 }}>
          <AuricruxInsightPanel
            title="Auricrux Pipeline Intelligence"
            targetObjectType="Bid"
            targetObjectId={activeBid.id}
            sourceRoute="/portal/pipeline"
            rationale={`Advance ${activeBid.package || activeBid.id} through the governed commercial pipeline.`}
            nextAction={STEPS[Math.max(0, stepIndex)]?.detail || "Continue the active pipeline step with governed billing continuity."}
            actionHref="/portal/bids"
            actionLabel="Open qualification board"
            tone="blue"
            liveRecommend
            operateConfig={{
              variant: "bid-doteach",
              bidId: activeBid.id,
              packageLabel: activeBid.package || activeBid.id,
              sourceRoute: "/portal/pipeline",
            }}
          />
        </div>
      ) : null}

      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Active jobs", value: enrichedRows.length, hint: "In pipeline" },
          { label: "Risk-adjusted value", value: formatUsd(weightedTotals.weightedPipeline), hint: "Weighted pipeline" },
          { label: "Current step", value: activePipeline?.current === "done" ? "Complete" : STEPS.find((step) => step.key === activePipeline?.current)?.label || "—", hint: activeBid?.package || "Select a job" },
          { label: "Completed steps", value: activePipeline ? `${Object.values(activePipeline.complete).filter(Boolean).length}/${STEPS.length}` : "0/5", hint: "For selected job" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, color: portalTokens.primaryInk, marginBottom: 10 }}>Enterprise RevOps view</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {[
            { key: "commercial", label: "Commercial view" },
            { key: "resource", label: "Resource view" },
            { key: "financial", label: "Financial view" },
          ].map((option) => (
            <button
              key={option.key}
              type="button"
              style={viewMode === option.key ? portalButtonPrimary : portalButtonSecondary}
              onClick={() => setViewMode(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>

        {viewMode === "commercial" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {conversions.map((entry) => (
              <div key={`${entry.fromStage}-${entry.toStage}`} style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: entry.systemicIssue ? "#fff7ed" : "#f8fafc" }}>
                <div style={{ fontSize: 12, color: portalTokens.muted }}>{`${STAGE_LABELS[entry.fromStage]} -> ${STAGE_LABELS[entry.toStage]}`}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: portalTokens.primaryInk }}>{entry.rate}%</div>
                <div style={{ fontSize: 12, color: portalTokens.body }}>{`${entry.progressed}/${entry.entered} progressed`}</div>
                {entry.systemicIssue ? <div style={{ marginTop: 6, fontSize: 12, color: "#b45309", fontWeight: 700 }}>AI flag: systemic drop-off detected</div> : null}
              </div>
            ))}
          </div>
        ) : null}

        {viewMode === "resource" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Modeled capacity (from scheduling)</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: portalTokens.primaryInk }}>{formatUsd(capacitySnapshot.modeledCapacity)}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Projected wins next quarter</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: portalTokens.primaryInk }}>{formatUsd(capacitySnapshot.projectedQuarterWins)}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: capacitySnapshot.overCapacity ? "#fff7ed" : "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Capacity risk</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: capacitySnapshot.overCapacity ? "#b45309" : portalTokens.primaryInk }}>
                {capacitySnapshot.overCapacity ? "Over-capacity warning" : "Within capacity"}
              </div>
              <div style={{ fontSize: 12, color: portalTokens.body, marginTop: 4 }}>
                {capacitySnapshot.overCapacity
                  ? "Projected wins exceed scheduled capacity; rebalance crew/equipment plan."
                  : "Projected wins currently align with scheduled capacity."}
              </div>
            </div>
          </div>
        ) : null}

        {viewMode === "financial" ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Booked revenue</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: portalTokens.primaryInk }}>{formatUsd(weightedTotals.booked)}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Actual cash-in</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: portalTokens.primaryInk }}>{formatUsd(weightedTotals.actuals)}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: "#f8fafc" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Target revenue</div>
              <input
                value={targetRevenueInput}
                onChange={(event) => setTargetRevenueInput(event.target.value)}
                placeholder="Annual target"
                style={{ marginTop: 6, width: "100%", borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
              />
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 12, background: gapToGoal > 0 ? "#fff7ed" : "#f0fdf4" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Gap-to-goal</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: gapToGoal > 0 ? "#b45309" : "#15803d" }}>{formatUsd(gapToGoal)}</div>
            </div>
          </div>
        ) : null}
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ fontWeight: 800, color: portalTokens.primaryInk, marginBottom: 8 }}>Velocity and predictive risk alerts</div>
        {velocity.stalled.length ? (
          <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
            {velocity.stalled.slice(0, 6).map((item) => (
              <li key={`${item.bid.id}-${item.stage}`}>{`${item.bid.package}: ${item.stageDays}d in ${STAGE_LABELS[item.stage]} (avg ${velocity.byStage[item.stage]?.avgDays || 0}d)`}</li>
            ))}
          </ul>
        ) : (
          <div style={{ color: portalTokens.body }}>No stalled opportunities beyond historical stage averages.</div>
        )}
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ color: portalTokens.primaryInk, fontWeight: 700, marginBottom: 8 }}>Select active job</div>
        <div style={{ display: "grid", gap: 10 }}>
          {enrichedRows.map(({ bid, complete, current, stage, probability, weightedValue }) => (
            <button
              key={bid.id}
              type="button"
              onClick={() => setActiveBidId(bid.id)}
              style={{
                textAlign: "left",
                border: bid.id === activeBidId ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 12,
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <strong>{bid.package}</strong> | {bid.value}
              <div style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>
                {current === "done" ? "Complete" : `Next: ${STEPS.find((s) => s.key === current)?.label || current}`}
                {" | "}
                {Object.values(complete).filter(Boolean).length}/{STEPS.length} steps
              </div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>
                {`Stage: ${STAGE_LABELS[stage] || stage} | Win probability: ${Math.round(probability * 100)}% | Risk-adjusted: ${formatUsd(weightedValue)}`}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeBid && activePipeline ? (
        <div style={portalCardStyle}>
          <h2 style={{ marginTop: 0 }}>{activeBid.package}</h2>
          {goNoGoScore ? (
            <div style={{ marginBottom: 14, padding: 14, borderRadius: 12, border: "1px solid #dbeafe", background: "#f8fafc" }}>
              <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>Go / No-Go score</div>
              <div style={{ color: "#334155", lineHeight: 1.7 }}>
                <div><strong>Score:</strong> {goNoGoScore.numericScore}/100</div>
                <div><strong>Recommendation:</strong> {goNoGoScore.recommendation.toUpperCase()}</div>
                <div style={{ marginTop: 6 }}>{goNoGoScore.summary}</div>
              </div>
            </div>
          ) : null}
          {stagnationAlert ? (
            <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" }}>
              <strong>Pipeline stagnation alert:</strong> {stagnationAlert.message}
            </div>
          ) : null}
          <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, border: "1px solid #dbe3ef", background: "#f8fafc" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Hard-gate compliance</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={Boolean(activeGovernance.evidencePacketComplete)}
                  onChange={(event) => setGovernanceByBid((current) => ({
                    ...current,
                    [activeBid.id]: { ...(current[activeBid.id] || {}), evidencePacketComplete: event.target.checked },
                  }))}
                />
                Evidence packets complete (Files)
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={Boolean(activeGovernance.marginSignoffComplete)}
                  onChange={(event) => setGovernanceByBid((current) => ({
                    ...current,
                    [activeBid.id]: { ...(current[activeBid.id] || {}), marginSignoffComplete: event.target.checked },
                  }))}
                />
                Margin sign-off complete (Finance)
              </label>
            </div>
            <div style={{ marginTop: 8, color: portalTokens.body, fontSize: 13 }}>
              Auto-detected evidence records: {activeEvidenceMatch.length} | Margin forecast {Number.isFinite(marginForecastPct) ? `${marginForecastPct}%` : "n/a"} vs target {Number.isFinite(marginTargetPct) ? `${marginTargetPct}%` : "n/a"}
            </div>
            <div style={{ marginTop: 6, color: complianceGate.pass ? "#15803d" : "#b45309", fontWeight: 700 }}>
              {complianceGate.pass ? "Compliant: eligible for Won transition" : "Blocked: Won transition requires both evidence and margin sign-off"}
            </div>
          </div>
          <PortalWorkflowStepper steps={STEPS} currentKey={activePipeline.current === "done" ? "payment" : activePipeline.current} completeMap={activePipeline.complete} />
          <p style={{ color: portalTokens.body, lineHeight: 1.7 }}>{STEPS[Math.min(stepIndex, STEPS.length - 1)]?.detail}</p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {activePipeline.current === "qualify" ? (
              <button type="button" style={portalButtonSecondary} disabled={busy === "qualify"} onClick={runQualify}>
                {busy === "qualify" ? "Qualifying..." : "Qualify opportunity"}
              </button>
            ) : null}
            {activePipeline.current === "project" ? (
              <button type="button" style={portalButtonSecondary} disabled={busy === "project"} onClick={runAward}>
                {busy === "project" ? "Converting..." : "Award and create project"}
              </button>
            ) : null}
            {activePipeline.current === "estimate" ? (
              <>
                <button type="button" style={portalButtonSecondary} disabled={busy === "estimate"} onClick={runEstimate}>
                  {busy === "estimate" ? "Routing..." : "Route to estimate"}
                </button>
                <button type="button" style={portalButtonSecondary} onClick={skipEstimate}>Skip estimate</button>
              </>
            ) : null}
            {activePipeline.current === "invoice" ? (
              <div style={{ width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input placeholder="Invoice name" value={invoiceDraft.invoiceName} onChange={(e) => setInvoiceDraft((c) => ({ ...c, invoiceName: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${portalTokens.borderStrong}` }} />
                  <input placeholder="Amount" value={invoiceDraft.amount} onChange={(e) => setInvoiceDraft((c) => ({ ...c, amount: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${portalTokens.borderStrong}` }} />
                </div>
                <button type="button" style={portalButtonPrimary} disabled={busy === "invoice"} onClick={runInvoice}>
                  {busy === "invoice" ? "Issuing..." : "Create and issue invoice"}
                </button>
              </div>
            ) : null}
            {activePipeline.current === "payment" ? (
              <>
                <button type="button" style={portalButtonPrimary} onClick={runPayment}>
                  Record payment in FCA Books
                </button>
                <a href={`/portal/billing/${activePipeline.linkedInvoice?.id || activePipeline.link?.invoiceId}`} style={portalButtonSecondary}>View invoice</a>
              </>
            ) : null}
            {activePipeline.current === "done" ? (
              <div style={{ color: "#15803d", fontWeight: 700 }}>Pipeline complete for this job.</div>
            ) : null}
          </div>

          <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ color: portalTokens.primaryInk, fontWeight: 700, marginBottom: 8 }}>Lost bid debrief workflow</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
              <select
                value={lostDebriefReason}
                onChange={(event) => setLostDebriefReason(event.target.value)}
                style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
              >
                <option value="">Select lost reason</option>
                <option value="Price">Price</option>
                <option value="Scope mismatch">Scope mismatch</option>
                <option value="Relationship">Relationship</option>
                <option value="Incumbent advantage">Incumbent advantage</option>
                <option value="Schedule/capacity">Schedule/capacity</option>
              </select>
              <input
                value={lostDebriefNotes}
                onChange={(event) => setLostDebriefNotes(event.target.value)}
                placeholder="Debrief notes"
                style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
              />
            </div>
            <button type="button" style={portalButtonSecondary} disabled={busy === "lost"} onClick={runLostDebrief}>
              {busy === "lost" ? "Recording debrief..." : "Record lost bid debrief"}
            </button>
          </div>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid #e2e8f0" }}>
            <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Academy training assignment</div>
            <p style={{ color: "#475569", lineHeight: 1.6, marginTop: 0 }}>
              Link a licensure, certification, or apprenticeship program to this pipeline job for project-scoped crew readiness.
            </p>
            {activePipeline.link?.assignedProgramTitle ? (
              <div style={{ padding: 12, borderRadius: 10, border: "1px solid #bfdbfe", background: "#eff6ff", marginBottom: 12 }}>
                <strong>{activePipeline.link.assignedProgramTitle}</strong>
                <div style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
                  Assigned {activePipeline.link.trainingAssignedAt ? new Date(activePipeline.link.trainingAssignedAt).toLocaleDateString() : "recently"}
                  {activeProjectId ? ` · Project ${activeProjectId}` : ""}
                </div>
                <a
                  href={`/academy/programs/${activePipeline.link.assignedProgramKey}`}
                  style={{ display: "inline-block", marginTop: 8, color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}
                >
                  Open assigned program
                </a>
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <select
                value={trainingProgramKey}
                onChange={(e) => setTrainingProgramKey(e.target.value)}
                style={{ flex: "1 1 240px", padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }}
              >
                <option value="">Select academy program...</option>
                {lanePrograms.map((program) => (
                  <option key={program.key} value={program.key}>
                    [{program.lane}] {program.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                style={portalButtonSecondary}
                disabled={busy === "training" || !trainingProgramKey}
                onClick={assignTrainingProgram}
              >
                {busy === "training" ? "Assigning..." : "Assign to job"}
              </button>
            </div>
            {trainingMessage ? <div style={{ color: "#475569", marginTop: 10 }}>{trainingMessage}</div> : null}
          </div>
        </div>
      ) : (
        <PortalEmptyState
          title="No pipeline jobs yet"
          detail="Qualify your first opportunity on the bids board, then return here to run the commercial flow."
          primaryHref="/portal/bids"
          primaryLabel="Open qualification board"
        />
      )}
    </PortalShell>
  );
}
