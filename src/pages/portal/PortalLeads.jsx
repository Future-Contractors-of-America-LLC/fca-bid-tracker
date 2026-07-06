import { useCallback, useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchPortalLeads, qualifyPortalLead } from "../../api/portalLeadsClient";
import { publishPortalPageContext } from "../../portalPageContext";
import { routeStateOverlays } from "../../systemState";
import { adminGovernance } from "../../adminGovernance";
import { executeLeadWonHandoff } from "../../triadFlywheel";
import { updateProjectWorkspace, writeActiveProjectId } from "../../projectWorkspaceStore";
import {
  PortalAlert,
  PortalEmptyState,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalTokens } from "../../portalDesignTokens";
import {
  FCA_MINIMUM_OUTPUT_FORMAT_OPTIONS,
  buildStructuredExport,
  normalizeFormat,
} from "../../constructionFormats";

const LEAD_COLLAB_STORAGE_KEY = "fca_lead_collab_v1";

const QUALIFICATION_WEIGHTS = {
  client: 20,
  project: 15,
  capacity: 20,
  competition: 15,
  commercial: 20,
  relationship: 10,
};

const RAPID_FILTER_FIELDS = [
  { key: "bonding", label: "Bonding capacity" },
  { key: "certifications", label: "Required certifications" },
  { key: "insurance", label: "Insurance minimums" },
  { key: "geography", label: "Geographic presence" },
  { key: "strategicFit", label: "Strategic fit" },
  { key: "timelineFeasible", label: "Timeline feasibility" },
];

function createDefaultLeadCollaboration() {
  return {
    owner: "",
    approver: "",
    notes: "",
    handoffApproved: false,
    proposalManagerAuthority: true,
    estimatedMarginPct: "",
    executiveOverride: false,
    triadStatus: "Review",
    triadProjectId: "",
    intelligenceInputs: {
      likelyIncumbent: "",
      incumbentTailoredRisk: "unknown",
      capacitySignal: "unknown",
      historicalPerformance: "unknown",
      noBidReason: "",
    },
    rapidFilter: {
      bonding: "pending",
      certifications: "pending",
      insurance: "pending",
      geography: "pending",
      strategicFit: "pending",
      timelineFeasible: "pending",
      completedAt: "",
    },
    log: [],
  };
}

function readLeadCollabState() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LEAD_COLLAB_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLeadCollabState(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LEAD_COLLAB_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Best effort persistence only.
  }
}

function scoreFromRange(value, thresholds) {
  if (!Number.isFinite(value) || value <= 0) return 15;
  for (const threshold of thresholds) {
    if (value >= threshold.min) return threshold.score;
  }
  return 25;
}

function percent(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function computeLeadIntelligence(lead) {
  const value = Number(lead.estimatedValue || 0);
  const budgetSignalScore = scoreFromRange(value, [
    { min: 10000000, score: 98 },
    { min: 5000000, score: 92 },
    { min: 2000000, score: 84 },
    { min: 750000, score: 72 },
    { min: 250000, score: 58 },
  ]);

  const serviceFitScore = lead.serviceLine && lead.serviceLine !== "General" ? 86 : 62;
  const intentScore = (lead.projectIntent || "").trim().length >= 40 ? 88 : 64;
  const explicitScore = Math.round((budgetSignalScore * 0.5) + (serviceFitScore * 0.3) + (intentScore * 0.2));

  const statusSignal = {
    new: 42,
    "under-review": 66,
    qualified: 88,
  }[lead.status] || 40;
  const ownershipSignal = lead.opportunityId ? 82 : 50;
  const behavioralScore = Math.round((statusSignal * 0.65) + (ownershipSignal * 0.35));

  const capabilityFitScore = Math.round((serviceFitScore * 0.45) + (intentScore * 0.35) + (ownershipSignal * 0.2));
  const winProbability = Math.round((explicitScore * 0.45) + (behavioralScore * 0.2) + (capabilityFitScore * 0.35));

  const upstreamSignals = {
    permit: lead.raw?.permitStatus || lead.raw?.site?.permitStatus || "No permit signal captured yet",
    zoning: lead.raw?.zoningStatus || lead.raw?.site?.zoningStatus || "No zoning signal captured yet",
    land: lead.raw?.landStatus || lead.raw?.site?.landStatus || "No land-acquisition signal captured yet",
    procurementCycle: lead.raw?.procurementCycle || "Procurement cycle not captured",
  };

  const qualificationDecision = {
    pass: winProbability >= 70 && explicitScore >= 65,
    rationale: winProbability >= 70 && explicitScore >= 65
      ? "Lead meets ROI and fit gate; prioritize bid pursuit before public RFP congestion."
      : "Lead requires deeper evidence before committing full estimating effort.",
    blockers: [
      explicitScore < 65 ? "Budget and scope signals are below enterprise gate." : "",
      !lead.opportunityId ? "Opportunity handoff has not been initiated yet." : "",
      lead.status === "new" ? "Stakeholder engagement signal still early." : "",
    ].filter(Boolean),
  };

  return {
    explicitScore,
    behavioralScore,
    capabilityFitScore,
    winProbability,
    upstreamSignals,
    qualificationDecision,
  };
}

function computeHistoricalPerformance(leads, activeLead) {
  const serviceLine = activeLead?.serviceLine || "General";
  const location = activeLead?.location || "Unknown";
  const relevantByService = leads.filter((item) => item.serviceLine === serviceLine);
  const relevantByLocation = leads.filter((item) => item.location === location);
  const winLikeByService = relevantByService.filter((item) => item.status === "qualified").length;
  const winLikeByLocation = relevantByLocation.filter((item) => item.status === "qualified").length;

  return {
    serviceLineWinRate: percent(winLikeByService, relevantByService.length),
    regionalWinRate: percent(winLikeByLocation, relevantByLocation.length),
    serviceLineSample: relevantByService.length,
    regionalSample: relevantByLocation.length,
  };
}

function readRapidFilterSignal(lead, rapidFilter, key) {
  const override = rapidFilter?.[key];
  if (override && override !== "pending") return override;
  const raw = lead?.raw || {};
  const site = raw.site || {};

  const inferred = {
    bonding: raw.bondingQualified,
    certifications: raw.certificationsQualified,
    insurance: raw.insuranceQualified,
    geography: raw.geographyQualified ?? site.geographyQualified,
    strategicFit: raw.strategicFit,
    timelineFeasible: raw.timelineFeasible,
  }[key];

  if (typeof inferred === "boolean") return inferred ? "pass" : "fail";
  return "pending";
}

function computeRapidFilter(lead, collaboration) {
  const rapidFilter = collaboration?.rapidFilter || {};
  const signals = Object.fromEntries(
    RAPID_FILTER_FIELDS.map((field) => [field.key, readRapidFilterSignal(lead, rapidFilter, field.key)]),
  );
  const mandatoryKeys = ["bonding", "certifications", "insurance", "geography"];
  const mandatoryFailed = mandatoryKeys.some((key) => signals[key] === "fail");
  const pendingCount = Object.values(signals).filter((value) => value === "pending").length;
  const allPassed = Object.values(signals).every((value) => value === "pass");

  return {
    signals,
    mandatoryFailed,
    pendingCount,
    pass: allPassed,
    statusLabel: mandatoryFailed
      ? "Auto decline"
      : allPassed
        ? "Go for qualification"
        : pendingCount > 0
          ? "Review in progress"
          : "Conditional review",
    rationale: mandatoryFailed
      ? "One or more hard requirements failed. Decline before estimating spend."
      : allPassed
        ? "Lead passed the first 48-72h rapid filter."
        : "Complete all rapid filter fields before committing estimator capacity.",
  };
}

function clampScore1to5(value) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function computeQualificationScorecard(lead, intelligence, rapidFilter, collaboration, historicalPerformance) {
  const inputs = collaboration?.intelligenceInputs || {};
  const explicitScore = intelligence?.explicitScore || 0;
  const winProbability = intelligence?.winProbability || 0;
  const intentLength = (lead?.projectIntent || "").trim().length;
  const highValue = Number(lead?.estimatedValue || 0) >= 2000000;
  const incumbentRisk = inputs.incumbentTailoredRisk === "high" ? 1 : inputs.incumbentTailoredRisk === "low" ? 0 : 0.5;
  const capacityBias = {
    high: 5,
    medium: 3,
    low: 1,
    unknown: 3,
  }[inputs.capacitySignal || "unknown"];

  const dimensions = {
    client: clampScore1to5((lead?.email ? 3 : 2) + (lead?.sourceChannel === "referral" ? 1 : 0) + (highValue ? 1 : 0)),
    project: clampScore1to5((intentLength >= 80 ? 4 : intentLength >= 40 ? 3 : 2) + (rapidFilter.signals.timelineFeasible === "pass" ? 1 : 0)),
    capacity: clampScore1to5(capacityBias),
    competition: clampScore1to5((winProbability >= 80 ? 5 : winProbability >= 65 ? 4 : winProbability >= 50 ? 3 : 2) - incumbentRisk),
    commercial: clampScore1to5((explicitScore >= 85 ? 5 : explicitScore >= 70 ? 4 : explicitScore >= 55 ? 3 : 2) + (highValue ? 1 : 0)),
    relationship: clampScore1to5((lead?.opportunityId ? 4 : 2) + (lead?.sourceChannel === "referral" ? 1 : 0)),
  };

  if (historicalPerformance.serviceLineSample >= 3 && historicalPerformance.serviceLineWinRate < 30) {
    dimensions.competition = clampScore1to5(dimensions.competition - 1);
  }
  if (historicalPerformance.regionalSample >= 3 && historicalPerformance.regionalWinRate < 30) {
    dimensions.relationship = clampScore1to5(dimensions.relationship - 1);
  }

  const weightedTotal = Object.entries(dimensions).reduce((total, [key, value]) => {
    return total + (value * (QUALIFICATION_WEIGHTS[key] || 0));
  }, 0);
  const weightedAverage = Math.round((weightedTotal / 100) * 10) / 10;

  const decision = weightedAverage > 4
    ? "Pursue aggressively"
    : weightedAverage >= 3
      ? "Pursue conditionally"
      : "No-bid";

  const proposalAuthorityEnabled = collaboration?.proposalManagerAuthority !== false;
  const canAutoDecline = proposalAuthorityEnabled && (decision === "No-bid" || rapidFilter.mandatoryFailed);

  return {
    dimensions,
    weightedAverage,
    decision,
    canAutoDecline,
    thresholds: {
      aggressive: "> 4.0",
      conditional: "3.0 - 3.9",
      noBid: "< 3.0",
    },
  };
}

function buildNoBidLetter(lead, scorecard, reason) {
  const clientName = lead?.company || "Client";
  const leadId = lead?.leadId || "LEAD";
  const rationale = reason || "the opportunity does not align with our current strategic priorities and bid calendar";
  return `Subject: Bid Decision for ${leadId}\n\nDear ${clientName} Team,\n\nThank you for inviting Future Contractors of America to participate in this opportunity. After completing our qualification review, we will respectfully decline to bid at this time because ${rationale}.\n\nThis decision follows our enterprise bid/no-bid process to ensure we only pursue projects where we can commit the right team and deliver the highest value.\n\nWe appreciate the opportunity and would welcome future invitations that align with our current delivery profile.\n\nSincerely,\nFCA Proposal Management\nQualification score: ${scorecard.weightedAverage.toFixed(1)} (${scorecard.decision})\nGenerated: ${new Date().toISOString()}\n`;
}

function buildLeadHandoffPayload(lead, intelligence, collaboration) {
  return {
    leadId: lead.leadId,
    company: lead.company,
    contact: {
      name: lead.contact,
      email: lead.email || "",
      phone: lead.phone || "",
    },
    serviceLine: lead.serviceLine,
    location: lead.location,
    sourceChannel: lead.sourceChannel,
    projectIntent: lead.projectIntent,
    status: lead.status,
    opportunityId: lead.opportunityId || null,
    estimatedValue: Number(lead.estimatedValue || 0),
    upstreamSignals: intelligence.upstreamSignals,
    intelligence: {
      explicitScore: intelligence.explicitScore,
      behavioralScore: intelligence.behavioralScore,
      capabilityFitScore: intelligence.capabilityFitScore,
      winProbability: intelligence.winProbability,
      qualificationPass: intelligence.qualificationDecision.pass,
      qualificationRationale: intelligence.qualificationDecision.rationale,
      qualificationBlockers: intelligence.qualificationDecision.blockers,
    },
    collaboration: {
      owner: collaboration.owner || "Unassigned",
      approver: collaboration.approver || "Unassigned",
      handoffApproved: Boolean(collaboration.handoffApproved),
      notes: collaboration.notes || "",
      log: Array.isArray(collaboration.log) ? collaboration.log : [],
    },
    generatedAt: new Date().toISOString(),
    sourceRoute: "/portal/leads",
  };
}

function downloadTextFile(name, content, type = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(href);
}

function buildLeadExportPayload(lead) {
  return {
    leadId: lead.leadId,
    company: lead.company,
    contact: lead.contact,
    email: lead.email || "",
    phone: lead.phone || "",
    location: lead.location,
    serviceLine: lead.serviceLine,
    projectIntent: lead.projectIntent,
    sourceChannel: lead.sourceChannel,
    status: lead.status,
    opportunityId: lead.opportunityId || "",
    estimatedValue: lead.estimatedValue || 0,
    exportedAt: new Date().toISOString(),
    planDeliverables: [
      "Issued for Review",
      "Issued for Pricing",
      "Issued for Construction",
      "As-Built / Redline Package",
      "BIM / MEP Coordination Bundle",
    ],
  };
}

function downloadLeadPlanSet(lead, format) {
  if (!lead?.leadId) return;
  const payload = buildLeadExportPayload(lead);
  const baseName = `${lead.leadId}-${lead.company || "lead"}`.replace(/[^a-zA-Z0-9_-]+/g, "-").toLowerCase();
  const output = buildStructuredExport({
    format,
    payload: {
      projectId: payload.opportunityId || payload.leadId,
      packageName: "Lead Plan Set Packet",
      generatedAt: payload.exportedAt,
      files: payload.planDeliverables.map((item, index) => ({
        fileId: `${payload.leadId}-deliverable-${index + 1}`,
        name: item,
        category: "Plan Deliverable",
        discipline: payload.serviceLine || "General",
        status: payload.status,
      })),
      description: `Lead package for ${payload.company} (${payload.leadId}) generated by FCA native workflow on Microsoft resources.`,
    },
    baseName: `${baseName}-plan-set`,
  });
  downloadTextFile(output.fileName, output.content, output.mimeType);
}

export default function PortalLeads() {
  const [leads, setLeads] = useState([]);
  const [source, setSource] = useState("loading");
  const [error, setError] = useState("");
  const [activeLeadId, setActiveLeadId] = useState("");
  const [qualifying, setQualifying] = useState(false);
  const [notice, setNotice] = useState("");
  const [exportFormat, setExportFormat] = useState("ifc");
  const [collaborationByLead, setCollaborationByLead] = useState(() => readLeadCollabState());

  const loadLeads = useCallback(async () => {
    setSource("loading");
    const result = await fetchPortalLeads();
    setLeads(result.leads);
    setSource(result.source);
    setError(result.error || "");
    if (result.leads.length && !activeLeadId) {
      setActiveLeadId(result.leads[0].leadId);
    }
  }, [activeLeadId]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const activeLead = useMemo(
    () => leads.find((entry) => entry.leadId === activeLeadId) || leads[0] || null,
    [activeLeadId, leads],
  );
  const activeIntelligence = useMemo(
    () => (activeLead ? computeLeadIntelligence(activeLead) : null),
    [activeLead],
  );

  const historicalPerformance = useMemo(
    () => (activeLead ? computeHistoricalPerformance(leads, activeLead) : null),
    [activeLead, leads],
  );

  const activeCollaboration = activeLead
    ? (collaborationByLead[activeLead.leadId] || createDefaultLeadCollaboration())
    : null;

  const activeRapidFilter = useMemo(
    () => (activeLead ? computeRapidFilter(activeLead, activeCollaboration) : null),
    [activeCollaboration, activeLead],
  );

  const activeScorecard = useMemo(
    () => (activeLead && activeIntelligence && activeRapidFilter && historicalPerformance
      ? computeQualificationScorecard(activeLead, activeIntelligence, activeRapidFilter, activeCollaboration, historicalPerformance)
      : null),
    [activeCollaboration, activeIntelligence, activeLead, activeRapidFilter, historicalPerformance],
  );

  useEffect(() => {
    writeLeadCollabState(collaborationByLead);
  }, [collaborationByLead]);

  useEffect(() => {
    if (!activeLead?.leadId) {
      publishPortalPageContext(null);
      return undefined;
    }
    publishPortalPageContext({
      surface: "portal-leads",
      leadId: activeLead.leadId,
      targetObjectId: activeLead.leadId,
      targetObjectType: "Lead",
    });
    return () => publishPortalPageContext(null);
  }, [activeLead?.leadId]);

  const newCount = leads.filter((lead) => ["new", "under-review"].includes(lead.status)).length;
  const qualifiedCount = leads.filter((lead) => lead.status === "qualified").length;
  const opportunityCount = leads.filter((lead) => Boolean(lead.opportunityId)).length;
  const highPriorityCount = leads.filter((lead) => computeLeadIntelligence(lead).winProbability >= 75).length;

  const conversion = {
    qualifiedRate: percent(qualifiedCount, leads.length),
    opportunityRate: percent(opportunityCount, leads.length),
    highPriorityRate: percent(highPriorityCount, leads.length),
  };

  const tableRows = useMemo(
    () =>
      leads.map((lead) => ({
        id: lead.leadId,
        active: lead.leadId === activeLeadId,
        lead,
        company: lead.company,
        contact: lead.contact,
        serviceLine: lead.serviceLine,
        status: lead.status,
        sourceChannel: lead.sourceChannel,
        value: lead.estimatedValue ? `$${Number(lead.estimatedValue).toLocaleString()}` : "—",
      })),
    [activeLeadId, leads],
  );

  async function handleQualify() {
    if (!activeLead || activeLead.status === "qualified") return;
    if (!activeRapidFilter?.pass) {
      setNotice("Rapid filter is not fully passed. Complete 48-72h go/no-go checks before qualifying.");
      return;
    }
    if (activeScorecard?.decision === "No-bid") {
      setNotice("Lead scored below qualification threshold (< 3.0). Route as no-bid instead of qualification.");
      return;
    }
    setQualifying(true);
    setNotice("");
    try {
      await qualifyPortalLead(activeLead.leadId, {
        reason: `Qualified from enterprise lead board for ${activeLead.company} after strategic intelligence gate pass.`,
      });
      setNotice(`Lead ${activeLead.leadId} qualified and opportunity created.`);
      setCollaborationByLead((current) => {
        const leadState = current[activeLead.leadId] || createDefaultLeadCollaboration();
        return {
          ...current,
          [activeLead.leadId]: {
            ...leadState,
            log: [
              {
                at: new Date().toISOString(),
                detail: `Lead qualified and routed to opportunity by portal operator for ${activeLead.company}.`,
              },
              ...leadState.log,
            ].slice(0, 12),
          },
        };
      });
      await loadLeads();
    } catch (qualifyError) {
      setNotice(qualifyError.message || "Qualification failed.");
    } finally {
      setQualifying(false);
    }
  }

  function initializeProjectWorkspace(projectId, lead) {
    const nextWorkspace = updateProjectWorkspace((current) => {
      const existing = current.find((project) => project.id === projectId);
      if (existing) return current;

      const nextProject = {
        id: projectId,
        name: `${lead.company || "New"} Project Workspace`,
        customer: lead.company || "Unassigned customer",
        stage: "Mobilization",
        nextAction: "Field Guardian kickoff and baseline schedule alignment",
        owner: lead.contact || "Project Manager",
        due: "Mobilization date pending",
        superintendent: "Field Guardian AI",
        permitStatus: "Permit readiness in review",
        siteStatus: "Pre-construction setup",
        commercialFocus: "Budget initialized from won estimate",
        fileSetLabel: "4-folder project workspace initialized",
        fileSpineStatus: "Commercial, execution, finance, and closeout folders provisioned.",
        auditLabel: "Triad flywheel handoff recorded",
        auditStatus: "Lead -> Project handoff executed by Auricrux state-bus.",
        auricruxMode: "Field Guardian assigned",
        auricruxSummary: "Auricrux initialized zero-click project setup from won lead.",
        actionHistory: [
          {
            at: new Date().toISOString(),
            detail: `Auricrux created ${projectId} from won lead ${lead.leadId}.`,
          },
        ],
        lastActionAt: new Date().toISOString(),
      };

      return [nextProject, ...current];
    });

    writeActiveProjectId(projectId, nextWorkspace);
  }

  function handleMarkWonAndSetup() {
    if (!activeLead) return;

    const minimumMarginThresholdPct = toNumber(adminGovernance?.triadPilot?.minimumMarginThresholdPct || 14);
    const estimatedMarginPct = toNumber(
      activeCollaboration?.estimatedMarginPct || activeLead?.estimatedMarginPct || activeLead?.marginPct || 0,
    );
    const executiveOverride = Boolean(activeCollaboration?.executiveOverride);

    const result = executeLeadWonHandoff(
      {
        ...activeLead,
        estimatedMarginPct,
      },
      {
        minimumMarginThresholdPct,
        executiveOverride,
      },
    );

    if (!result.ok) {
      setNotice(result.message || "Lead did not pass constitutional margin gate.");
      appendActiveLog("Triad handoff blocked by minimum margin threshold.");
      return;
    }

    initializeProjectWorkspace(result.projectId, activeLead);
    updateActiveCollaboration({
      triadStatus: "Won",
      triadProjectId: result.projectId,
      handoffApproved: true,
    });
    appendActiveLog(`Lead marked Won and project workspace ${result.projectId} initialized with Field Guardian assignment.`);
    setNotice(`Auricrux flywheel executed: ${activeLead.leadId} -> ${result.projectId} with finance budget and file workspace initialized.`);
  }

  function updateActiveCollaboration(patch) {
    if (!activeLead) return;
    setCollaborationByLead((current) => {
      const leadState = current[activeLead.leadId] || createDefaultLeadCollaboration();
      return {
        ...current,
        [activeLead.leadId]: {
          ...leadState,
          ...patch,
        },
      };
    });
  }

  function appendActiveLog(detail) {
    if (!activeLead) return;
    setCollaborationByLead((current) => {
      const leadState = current[activeLead.leadId] || createDefaultLeadCollaboration();
      return {
        ...current,
        [activeLead.leadId]: {
          ...leadState,
          log: [{ at: new Date().toISOString(), detail }, ...leadState.log].slice(0, 12),
        },
      };
    });
  }

  return (
    <PortalShell
      title="Leads board"
      subtitle="Govern every intake lead, qualify into opportunities, and hand off to bids and pipeline."
      activeHref="/portal/leads"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.leads || routeStateOverlays.bids}
      primaryHref="/portal/bids"
      primaryLabel="Open qualification board"
    >
      <PortalPageIntro
        eyebrow="Growth spine"
        title="Unified leads command"
        detail="Review intake and job-board leads in one governed board. Qualify winners into opportunities, then route to bids and commercial pipeline."
      />
      <div style={{ marginBottom: 12, color: "#64748b", fontSize: 13 }}>
        FCA-native lead packages run on Microsoft resources and can be exported to required construction exchange formats.
      </div>

      <PortalApiStatusBanner status={source} error={error} onRetry={loadLeads} label="leads data" />

      {notice ? <PortalAlert tone={notice.includes("failed") ? "warning" : "success"}>{notice}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Total leads", value: leads.length, hint: "On tenant spine" },
          { label: "Awaiting review", value: newCount, hint: "New or under review" },
          { label: "Qualified", value: qualifiedCount, hint: "Ready for bid handoff" },
          { label: "High priority", value: highPriorityCount, hint: "Strategic win probability >= 75" },
        ]}
      />

      <article style={{ ...portalCardStyle, marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Centralized pipeline visualization</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Qualified conversion</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: portalTokens.primaryInk }}>{conversion.qualifiedRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>Opportunity handoff conversion</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: portalTokens.primaryInk }}>{conversion.opportunityRate}%</div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: portalTokens.muted }}>High-priority density</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: portalTokens.primaryInk }}>{conversion.highPriorityRate}%</div>
          </div>
        </div>
      </article>

      {activeLead ? (
        <AuricruxInsightPanel
          title="Auricrux lead intelligence"
          targetObjectId={activeLead.leadId}
          targetObjectType="Lead"
          sourceRoute="/portal/leads"
          rationale={`Review qualification readiness for ${activeLead.company} before routing to bids.`}
          nextAction={
            activeLead.status === "qualified"
              ? "Route qualified opportunity into bid intake."
              : "Confirm budget, jurisdiction, and ownership — then qualify."
          }
        />
      ) : null}

      {leads.length === 0 && source !== "loading" ? (
        <PortalEmptyState
          title="No leads on the spine yet"
          detail="Intake and job-board submissions appear here once captured through governed API routes."
          primaryHref="/contact"
          primaryLabel="Open intake"
          secondaryHref="/job-board"
          secondaryLabel="View job board"
        />
      ) : (
        <PortalEntityTable
          columns={[
            { key: "company", label: "Company" },
            { key: "contact", label: "Contact" },
            { key: "serviceLine", label: "Service line" },
            {
              key: "status",
              label: "Status",
              render: (row) => <PortalStatusBadge status={row.status} active={row.active} />,
            },
            { key: "sourceChannel", label: "Source" },
            { key: "value", label: "Est. value" },
            {
              key: "select",
              label: "",
              render: (row) => (
                <button type="button" style={portalButtonSecondary} onClick={() => setActiveLeadId(row.id)}>
                  {row.active ? "Selected" : "Review"}
                </button>
              ),
            },
          ]}
          rows={tableRows}
          emptyTitle="No leads on the spine yet"
          emptyDetail="Intake and job-board submissions appear here once captured through governed API routes."
          emptyPrimaryHref="/contact"
          emptyPrimaryLabel="Open intake"
        />
      )}

      {activeLead ? (
        <article style={{ ...portalCardStyle, marginTop: 16 }}>
          <h3 style={{ marginTop: 0 }}>{activeLead.company}</h3>
          <p style={{ color: portalTokens.body, lineHeight: 1.55 }}>
            {activeLead.projectIntent || "No project intent recorded."}
          </p>
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, margin: "12px 0" }}>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Contact</dt>
              <dd style={{ margin: 0 }}>{activeLead.contact}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Location</dt>
              <dd style={{ margin: 0 }}>{activeLead.location}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Opportunity</dt>
              <dd style={{ margin: 0 }}>{activeLead.opportunityId || "Not created yet"}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Win probability</dt>
              <dd style={{ margin: 0 }}>{activeIntelligence?.winProbability || 0}%</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Weighted qualification score</dt>
              <dd style={{ margin: 0 }}>{activeScorecard?.weightedAverage?.toFixed(1) || "0.0"}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Qualification gate</dt>
              <dd style={{ margin: 0 }}>{activeScorecard?.decision || "Review"}</dd>
            </div>
            <div>
              <dt style={{ fontSize: 12, color: portalTokens.muted }}>Triad status</dt>
              <dd style={{ margin: 0 }}>{activeCollaboration?.triadStatus || "Review"}</dd>
            </div>
          </dl>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 12 }}>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 10, background: "#f8fbff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Explicit score</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: portalTokens.primaryInk }}>{activeIntelligence?.explicitScore || 0}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 10, background: "#f8fbff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Behavioral score</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: portalTokens.primaryInk }}>{activeIntelligence?.behavioralScore || 0}</div>
            </div>
            <div style={{ border: "1px solid #dbe3ef", borderRadius: 12, padding: 10, background: "#f8fbff" }}>
              <div style={{ fontSize: 12, color: portalTokens.muted }}>Capability-fit score</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: portalTokens.primaryInk }}>{activeIntelligence?.capabilityFitScore || 0}</div>
            </div>
          </div>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Rapid filter (first 48-72 hours)</h4>
            <p style={{ marginTop: 0, marginBottom: 8, color: portalTokens.body }}>
              {activeRapidFilter?.rationale}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 10 }}>
              {RAPID_FILTER_FIELDS.map((field) => (
                <label key={field.key} style={{ display: "grid", gap: 4 }}>
                  <span style={{ fontSize: 12, color: portalTokens.muted }}>{field.label}</span>
                  <select
                    value={activeCollaboration?.rapidFilter?.[field.key] || "pending"}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      updateActiveCollaboration({
                        rapidFilter: {
                          ...(activeCollaboration?.rapidFilter || createDefaultLeadCollaboration().rapidFilter),
                          [field.key]: nextValue,
                          completedAt: new Date().toISOString(),
                        },
                      });
                    }}
                    style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                  >
                    <option value="pending">Pending</option>
                    <option value="pass">Pass</option>
                    <option value="fail">Fail</option>
                  </select>
                </label>
              ))}
            </div>
            <div style={{ fontSize: 13, color: portalTokens.body }}>
              Rapid filter status: <strong>{activeRapidFilter?.statusLabel || "Review"}</strong>
            </div>
          </article>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Enterprise weighted qualification framework</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 10 }}>
              {Object.entries(activeScorecard?.dimensions || {}).map(([key, value]) => (
                <div key={key} style={{ border: "1px solid #dbe3ef", borderRadius: 10, padding: 8, background: "#ffffff" }}>
                  <div style={{ fontSize: 12, color: portalTokens.muted, textTransform: "capitalize" }}>{`${key} (${QUALIFICATION_WEIGHTS[key]}%)`}</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: portalTokens.primaryInk }}>{value}</div>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 0, marginBottom: 6, color: portalTokens.body }}>
              Decision thresholds: {activeScorecard?.thresholds.aggressive} pursue aggressively, {activeScorecard?.thresholds.conditional} pursue conditionally, {activeScorecard?.thresholds.noBid} no-bid.
            </p>
            <p style={{ margin: 0, color: portalTokens.body }}>
              Current recommendation: <strong>{activeScorecard?.decision || "Review"}</strong>
            </p>
          </article>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Advanced project sourcing and upstream intelligence</h4>
            <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              <li>Permit signal: {activeIntelligence?.upstreamSignals.permit}</li>
              <li>Zoning signal: {activeIntelligence?.upstreamSignals.zoning}</li>
              <li>Land/acquisition signal: {activeIntelligence?.upstreamSignals.land}</li>
              <li>Procurement cycle: {activeIntelligence?.upstreamSignals.procurementCycle}</li>
              <li>Service-line historical win rate: {historicalPerformance?.serviceLineWinRate || 0}% ({historicalPerformance?.serviceLineSample || 0} leads)</li>
              <li>Regional historical win rate: {historicalPerformance?.regionalWinRate || 0}% ({historicalPerformance?.regionalSample || 0} leads)</li>
            </ul>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 10 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Likely incumbent competitor</span>
                <input
                  value={activeCollaboration?.intelligenceInputs?.likelyIncumbent || ""}
                  onChange={(event) => updateActiveCollaboration({
                    intelligenceInputs: {
                      ...(activeCollaboration?.intelligenceInputs || createDefaultLeadCollaboration().intelligenceInputs),
                      likelyIncumbent: event.target.value,
                    },
                  })}
                  placeholder="Capture likely incumbent"
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Tailored incumbent risk</span>
                <select
                  value={activeCollaboration?.intelligenceInputs?.incumbentTailoredRisk || "unknown"}
                  onChange={(event) => updateActiveCollaboration({
                    intelligenceInputs: {
                      ...(activeCollaboration?.intelligenceInputs || createDefaultLeadCollaboration().intelligenceInputs),
                      incumbentTailoredRisk: event.target.value,
                    },
                  })}
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                >
                  <option value="unknown">Unknown</option>
                  <option value="low">Low</option>
                  <option value="high">High</option>
                </select>
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Capacity signal</span>
                <select
                  value={activeCollaboration?.intelligenceInputs?.capacitySignal || "unknown"}
                  onChange={(event) => updateActiveCollaboration({
                    intelligenceInputs: {
                      ...(activeCollaboration?.intelligenceInputs || createDefaultLeadCollaboration().intelligenceInputs),
                      capacitySignal: event.target.value,
                    },
                  })}
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                >
                  <option value="unknown">Unknown</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </label>
            </div>
          </article>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Automated qualification framework</h4>
            <p style={{ marginTop: 0, marginBottom: 8, color: portalTokens.body }}>{activeIntelligence?.qualificationDecision.rationale}</p>
            {activeIntelligence?.qualificationDecision.blockers?.length ? (
              <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
                {activeIntelligence.qualificationDecision.blockers.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : (
              <p style={{ margin: 0, color: portalTokens.body }}>No qualification blockers currently detected.</p>
            )}
          </article>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Collaboration and approval workflow</h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 10 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Lead owner</span>
                <input
                  value={activeCollaboration?.owner || ""}
                  onChange={(event) => updateActiveCollaboration({ owner: event.target.value })}
                  placeholder="Assign lead owner"
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                />
              </label>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Approver</span>
                <input
                  value={activeCollaboration?.approver || ""}
                  onChange={(event) => updateActiveCollaboration({ approver: event.target.value })}
                  placeholder="Assign approver"
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                />
              </label>
            </div>
            <label style={{ display: "grid", gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: portalTokens.muted }}>Shared notes</span>
              <textarea
                value={activeCollaboration?.notes || ""}
                onChange={(event) => updateActiveCollaboration({ notes: event.target.value })}
                placeholder="Add team notes, stakeholder context, and decision history"
                rows={3}
                style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px", font: "inherit" }}
              />
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, color: portalTokens.body }}>
              <input
                type="checkbox"
                checked={activeCollaboration?.proposalManagerAuthority !== false}
                onChange={(event) => updateActiveCollaboration({ proposalManagerAuthority: event.target.checked })}
              />
              Proposal manager has delegated authority to decline below-threshold opportunities
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 10 }}>
              <label style={{ display: "grid", gap: 4 }}>
                <span style={{ fontSize: 12, color: portalTokens.muted }}>Estimated margin % (Won gate)</span>
                <input
                  value={activeCollaboration?.estimatedMarginPct || ""}
                  onChange={(event) => updateActiveCollaboration({ estimatedMarginPct: event.target.value })}
                  placeholder="e.g. 18"
                  style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px" }}
                />
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 20, color: portalTokens.body }}>
                <input
                  type="checkbox"
                  checked={Boolean(activeCollaboration?.executiveOverride)}
                  onChange={(event) => updateActiveCollaboration({ executiveOverride: event.target.checked })}
                />
                Executive override for minimum margin threshold
              </label>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <button
                type="button"
                style={portalButtonSecondary}
                onClick={() => {
                  const approved = !activeCollaboration?.handoffApproved;
                  updateActiveCollaboration({ handoffApproved: approved });
                  appendActiveLog(approved ? "Bid handoff approved by team." : "Bid handoff approval revoked.");
                }}
              >
                {activeCollaboration?.handoffApproved ? "Handoff approved" : "Approve handoff"}
              </button>
              <button
                type="button"
                style={portalButtonSecondary}
                onClick={() => appendActiveLog("Collaboration checkpoint recorded by operator.")}
              >
                Log checkpoint
              </button>
            </div>
            <div style={{ fontSize: 12, color: portalTokens.muted, marginBottom: 6 }}>Notification log</div>
            <ul style={{ margin: 0, paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              {(activeCollaboration?.log || []).slice(0, 5).map((entry) => (
                <li key={`${entry.at}-${entry.detail}`}>{`${entry.at}: ${entry.detail}`}</li>
              ))}
              {!(activeCollaboration?.log || []).length ? <li>No collaboration events logged yet.</li> : null}
            </ul>
          </article>

          <article style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, marginBottom: 12, background: "#f8fafc" }}>
            <h4 style={{ marginTop: 0, marginBottom: 8 }}>Professional no-bid management</h4>
            <p style={{ marginTop: 0, marginBottom: 8, color: portalTokens.body }}>
              Decline early and professionally when mandatory requirements fail or the weighted score is below threshold.
            </p>
            <label style={{ display: "grid", gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: portalTokens.muted }}>No-bid rationale</span>
              <textarea
                value={activeCollaboration?.intelligenceInputs?.noBidReason || ""}
                onChange={(event) => updateActiveCollaboration({
                  intelligenceInputs: {
                    ...(activeCollaboration?.intelligenceInputs || createDefaultLeadCollaboration().intelligenceInputs),
                    noBidReason: event.target.value,
                  },
                })}
                placeholder="State concise strategic reason for declining"
                rows={2}
                style={{ borderRadius: 10, border: "1px solid #cbd5e1", padding: "8px 10px", font: "inherit" }}
              />
            </label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                style={portalButtonSecondary}
                onClick={() => {
                  const letter = buildNoBidLetter(
                    activeLead,
                    activeScorecard || { weightedAverage: 0, decision: "No-bid" },
                    activeCollaboration?.intelligenceInputs?.noBidReason,
                  );
                  downloadTextFile(`${activeLead.leadId}-no-bid-letter.txt`.toLowerCase(), letter, "text/plain");
                  appendActiveLog("Professional no-bid letter generated and ready for client delivery.");
                  setNotice(`No-bid letter generated for ${activeLead.leadId}.`);
                }}
              >
                Generate no-bid letter
              </button>
              <button
                type="button"
                style={portalButtonSecondary}
                disabled={!activeScorecard?.canAutoDecline}
                onClick={() => {
                  const reason = activeCollaboration?.intelligenceInputs?.noBidReason || "Opportunity did not satisfy enterprise qualification threshold.";
                  appendActiveLog(`No-bid decision recorded by proposal authority. Reason: ${reason}`);
                  setNotice(`No-bid recorded for ${activeLead.leadId}. Keep client communication timely and professional.`);
                }}
              >
                Record no-bid decision
              </button>
            </div>
          </article>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              style={portalButtonPrimary}
              disabled={qualifying || activeLead.status === "qualified" || !activeRapidFilter?.pass || activeScorecard?.decision === "No-bid"}
              onClick={handleQualify}
            >
              {qualifying ? "Qualifying…" : activeLead.status === "qualified" ? "Already qualified" : "Qualify lead"}
            </button>
            <button
              type="button"
              style={portalButtonPrimary}
              disabled={!activeCollaboration?.handoffApproved || activeScorecard?.decision === "No-bid"}
              onClick={handleMarkWonAndSetup}
            >
              Mark Won + execute project setup
            </button>
            <a href="/portal/bids" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open bids board
            </a>
            <a href="/portal/command-tower" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open command tower
            </a>
            <a href="/portal/decision-queue" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open decision queue
            </a>
            <a href="/portal/pipeline" style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
              Open pipeline
            </a>
            <select
              value={exportFormat}
              onChange={(event) => setExportFormat(event.target.value)}
              style={{
                borderRadius: 10,
                border: "1px solid #cbd5e1",
                padding: "10px 12px",
                background: "#fff",
                color: portalTokens.body,
                fontWeight: 700,
              }}
              aria-label="Plan set export format"
            >
              {FCA_MINIMUM_OUTPUT_FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{`Download plan set (${option.label})`}</option>
              ))}
            </select>
            <button
              type="button"
              style={portalButtonSecondary}
              onClick={() => {
                downloadLeadPlanSet(activeLead, exportFormat);
                setNotice(`Lead plan set exported as ${normalizeFormat(exportFormat).toUpperCase()}.`);
                appendActiveLog(`Plan-set package exported as ${normalizeFormat(exportFormat).toUpperCase()}.`);
              }}
            >
              Download lead plan set
            </button>
            <button
              type="button"
              style={portalButtonSecondary}
              onClick={() => {
                const handoffPayload = buildLeadHandoffPayload(activeLead, activeIntelligence, activeCollaboration || {});
                downloadTextFile(
                  `${activeLead.leadId}-crm-erp-handoff.json`.toLowerCase(),
                  JSON.stringify(handoffPayload, null, 2),
                  "application/json",
                );
                setNotice(`CRM/ERP handoff package exported for ${activeLead.leadId}.`);
                appendActiveLog("CRM/ERP bid handoff package exported for downstream teams.");
              }}
            >
              Export CRM/ERP handoff
            </button>
            <a
              href={`/portal/design?leadId=${encodeURIComponent(activeLead.leadId)}${activeLead.opportunityId ? `&opportunityId=${encodeURIComponent(activeLead.opportunityId)}` : ""}`}
              style={{ ...portalButtonSecondary, textDecoration: "none", display: "inline-flex", alignItems: "center" }}
            >
              Open plan generation workspace
            </a>
          </div>
        </article>
      ) : null}
    </PortalShell>
  );
}
