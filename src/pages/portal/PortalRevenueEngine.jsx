import { useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import PortalApiStatusBanner from "../../components/portal/PortalApiStatusBanner";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  PortalAlert,
  PortalEntityTable,
  PortalPageIntro,
  PortalQuickStats,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle, portalEyebrowStyle, portalTokens } from "../../portalDesignTokens";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import { createWorkflowAuditEvent, fetchWorkflowProjects } from "../../api/workflowClient";
import { fetchPortalMessages, sendPortalMessage } from "../../api/portalClient";
import { createPortalLead } from "../../api/portalLeadsClient";
import { routeStateOverlays } from "../../systemState";
import { adminGovernance } from "../../adminGovernance";
import { logTriadBlackboxEvent } from "../../triadFlywheel";
import {
  runAutonomousProspecting,
  generateDynamicValueCase,
  generateProposalAsApi,
  runRevenueFlywheel,
  assessHighStakesRelationshipRisk,
  scheduleFounderEscalation,
  updateRevenueGovernanceControls,
  readRevenueAutonomyState,
} from "../../auricruxRevenueEngine";

const REVENUE_ENGINE_STORAGE_KEY = "fca_revenue_engine_v1";

const campaignLeads = [
  {
    id: "MK-001",
    contactName: "Jordan Alvarez",
    company: "Summit Industrial Group",
    persona: "Owner",
    sourceChannel: "academy-workshop",
    workshop: "OSHA Safety Seminar",
    downloadedAsset: "Structural Risk Whitepaper",
    portalPage: "Portal Projects",
    estimatedValue: 420000,
    prSensitivityTag: "high",
    engagement: { events: 8, pageViews: 17, webinarMinutes: 46, clicks: 9 },
    studentCount: 12,
  },
  {
    id: "MK-002",
    contactName: "Nina Carter",
    company: "Carter Mechanical",
    persona: "General Contractor",
    sourceChannel: "whitepaper",
    workshop: "Precon Strategy Session",
    downloadedAsset: "Bid-to-Closeout Checklist",
    portalPage: "Portal Pipeline",
    estimatedValue: 275000,
    prSensitivityTag: "medium",
    engagement: { events: 6, pageViews: 11, webinarMinutes: 28, clicks: 6 },
    studentCount: 7,
  },
  {
    id: "MK-003",
    contactName: "Elias Moore",
    company: "Moore Siteworks",
    persona: "Subcontractor",
    sourceChannel: "bid-request",
    workshop: "Field Quality Forum",
    downloadedAsset: "Crew Certification Guide",
    portalPage: "Portal Field Tasks",
    estimatedValue: 180000,
    prSensitivityTag: "low",
    engagement: { events: 5, pageViews: 9, webinarMinutes: 24, clicks: 5 },
    studentCount: 4,
  },
];

const trendSignals = [
  {
    id: "trend-warehouse",
    region: "Midwest",
    signal: "Zoning filings show a 300% warehouse development increase",
    leads: ["RFI package for logistics owner group", "Cold-storage retrofit bid", "Regional distribution center expansion", "Spec warehouse TI package", "Tenant move-in acceleration"],
    confidence: 0.91,
  },
  {
    id: "trend-healthcare",
    region: "South",
    signal: "Healthcare renovation permits are accelerating in mixed-use corridors",
    leads: ["Surgery suite tenant fit-out", "Medical office conversion", "Imaging lab retrofit", "Urgent care expansion", "Clinical MEP modernization"],
    confidence: 0.84,
  },
];

function readLocalState() {
  if (typeof window === "undefined") return { convertedLeadIds: [], retentionRuns: [] };
  try {
    const raw = window.localStorage.getItem(REVENUE_ENGINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { convertedLeadIds: [], retentionRuns: [] };
  } catch {
    return { convertedLeadIds: [], retentionRuns: [] };
  }
}

function writeLocalState(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(REVENUE_ENGINE_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Best effort persistence only.
  }
}

function toNumber(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatUsd(value) {
  return `$${Math.round(toNumber(value)).toLocaleString()}`;
}

function buildReadinessScore(lead) {
  const engagement = lead.engagement || {};
  const score = (
    (toNumber(engagement.events) * 6)
    + (toNumber(engagement.pageViews) * 1.8)
    + (toNumber(engagement.webinarMinutes) * 0.4)
    + (toNumber(engagement.clicks) * 3.5)
    + (lead.sourceChannel === "bid-request" ? 18 : 10)
  );
  return clamp(Math.round(score), 0, 99);
}

function sentimentFromMessages(items = []) {
  const positiveTokens = ["thanks", "approved", "great", "ready", "award", "win", "renew"];
  const negativeTokens = ["blocked", "delay", "stuck", "concern", "issue", "cancel", "escalate"];

  let positive = 0;
  let negative = 0;

  for (const row of items.slice(0, 30)) {
    const text = `${row.subject || ""} ${row.message || ""} ${row.preview || ""}`.toLowerCase();
    if (positiveTokens.some((token) => text.includes(token))) positive += 1;
    if (negativeTokens.some((token) => text.includes(token))) negative += 1;
  }

  const net = positive - negative;
  const sentiment = net >= 4 ? "Positive" : net <= -2 ? "Negative" : "Neutral";
  return { sentiment, positive, negative };
}

function personalizationForPersona(persona = "") {
  const normalized = String(persona || "").toLowerCase();
  if (normalized.includes("owner")) {
    return {
      message: "Lead with ROI benchmarks, incident-rate reduction, and renewal economics.",
      sequence: ["Email: ROI brief", "SMS: executive summary", "LinkedIn: case study"],
    };
  }
  if (normalized.includes("general contractor")) {
    return {
      message: "Lead with technical delivery proof, crew certifications, and schedule reliability.",
      sequence: ["Email: technical package", "SMS: bid readiness", "LinkedIn: project outcomes"],
    };
  }
  return {
    message: "Lead with credential velocity, field quality proof, and subcontractor capability uplift.",
    sequence: ["Email: capability map", "SMS: scope alignment", "LinkedIn: recent wins"],
  };
}

export default function PortalRevenueEngine() {
  const projectsLoad = usePortalApiLoad(() => fetchWorkflowProjects(), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  const projects = projectsLoad.data?.items || [];
  const messages = messagesLoad.data?.items || [];

  const [selectedLeadId, setSelectedLeadId] = useState(campaignLeads[0].id);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [proposalKit, setProposalKit] = useState(null);
  const [localState, setLocalState] = useState(() => readLocalState());
  const [autonomyState, setAutonomyState] = useState(() => readRevenueAutonomyState());
  const [founderEscalation, setFounderEscalation] = useState(null);

  const selectedLead = useMemo(
    () => campaignLeads.find((row) => row.id === selectedLeadId) || campaignLeads[0],
    [selectedLeadId],
  );

  const selectedProject = useMemo(
    () => projects.find((row) => row.id === selectedProjectId) || projects[0] || null,
    [projects, selectedProjectId],
  );

  const leadRows = useMemo(() => {
    return campaignLeads.map((lead) => {
      const score = buildReadinessScore(lead);
      return {
        id: lead.id,
        lead,
        score,
        readiness: score >= 85 ? "High intent" : score >= 65 ? "Warm" : "Nurture",
      };
    });
  }, []);

  const selectedLeadRow = leadRows.find((row) => row.id === selectedLead.id) || leadRows[0];
  const personalization = personalizationForPersona(selectedLead?.persona);
  const sentiment = sentimentFromMessages(messages);

  const academyGov = adminGovernance.academyGovernance || {};
  const revenueGov = adminGovernance.module26RevenueAutonomy || {};
  const requiredCredentials = academyGov.qualificationEngine?.rolePathwayRequirements || {};
  const criticalCompetencies = academyGov.workforceModeling?.criticalCompetencies || [];

  const customerLoyalty = useMemo(() => {
    const certifiedPct = clamp(Math.round((toNumber(selectedLead.studentCount) / 14) * 100), 20, 96);
    const messageModifier = sentiment.sentiment === "Positive" ? 8 : sentiment.sentiment === "Negative" ? -10 : 0;
    const score = clamp(certifiedPct + messageModifier, 0, 100);
    return {
      score,
      certifiedPct,
      triggerRetention: score >= 80,
      recommendation: score >= 80
        ? "Trigger upsell workflow for annual platform licensing and advanced pathways."
        : "Maintain nurture cadence and drive additional credential adoption.",
    };
  }, [selectedLead.studentCount, sentiment.sentiment]);

  const revOpsPriority = useMemo(() => {
    return selectedLead.studentCount >= 10
      ? "High-priority RevOps prospect: convert Academy relationship to enterprise licensing motion."
      : "Standard RevOps cadence: continue nurture and monitor credential expansion.";
  }, [selectedLead.studentCount]);

  const riskAssessment = useMemo(() => assessHighStakesRelationshipRisk(selectedLead, {
    sentiment: sentiment.sentiment,
    negativeTouches: sentiment.negative,
    legalComplexityScore: selectedLeadRow.score >= 85 ? 40 : 70,
    prSensitivityTag: selectedLead.prSensitivityTag,
  }, adminGovernance), [selectedLead, selectedLeadRow.score, sentiment.negative, sentiment.sentiment]);

  const unreadStaleRelationship = useMemo(() => {
    const latest = messages
      .map((row) => ({
        at: Date.parse(row.createdAt || row.updatedAt || "") || 0,
        text: `${row.subject || ""} ${row.message || ""}`,
      }))
      .sort((a, b) => b.at - a.at)[0];

    if (!latest?.at) {
      return "No recent relationship touchpoint recorded. Trigger a strategic check-in this week.";
    }

    const days = Math.max(0, Math.floor((Date.now() - latest.at) / 86400000));
    if (days >= 21) return `No strategic check-in for ${days} days while sentiment is ${sentiment.sentiment.toLowerCase()}. Trigger relationship outreach now.`;
    return `Last strategic touchpoint was ${days} day(s) ago. Maintain current relationship cadence.`;
  }, [messages, sentiment.sentiment]);

  function commitLocalState(next) {
    setLocalState(next);
    writeLocalState(next);
  }

  function syncAutonomyState(next) {
    setAutonomyState(next);
  }

  function buildProposalMarketingKit() {
    if (!selectedProject) {
      setNotice("Select a project first to generate a branded proposal package.");
      return;
    }

    const rolePath = requiredCredentials.owner || [];
    const valueCase = generateDynamicValueCase(selectedLead, {
      employeeCount: selectedLead.studentCount * 4,
      adminHoursWeekly: 14,
      loadedLaborRateUsd: 85,
      schedulingInefficiencyPct: 18,
      academyCertificationWeeks: 3,
      expectedRecoveryPct: 38,
    });

    const apiProposal = generateProposalAsApi({
      id: selectedLead.id,
      company: selectedLead.company,
      estimatedValue: selectedLead.estimatedValue,
      annualRevenueUsd: selectedLead.estimatedValue * 12,
      estimatedMarginPct: 16,
    }, valueCase, adminGovernance);

    const kit = {
      id: `kit-${selectedLead.id}-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      leadCompany: selectedLead.company,
      projectName: selectedProject.name || selectedProject.id,
      projectHistorySignal: selectedProject.stage || "Execution history connected",
      safetyProfile: "TRIR 0.21 and zero critical incidents in governed period",
      certifications: [...rolePath.slice(0, 2), ...criticalCompetencies.slice(0, 2)],
      valueStatement: `This package aligns ${selectedLead.company} with proven delivery outcomes and verified FCA credential posture.`,
      dynamicValueCase: valueCase,
      proposalApiPayload: apiProposal,
      includedSlides: [
        "Company profile and market positioning",
        "Comparable project outcomes",
        "Safety performance and incident controls",
        "Crew credential and Academy pathway evidence",
        "Execution plan, schedule confidence, and QA commitments",
      ],
    };

    setProposalKit(kit);
    setNotice("Branded proposal marketing kit generated from project and Academy signals.");
  }

  async function convertLeadToPortalSpine() {
    setBusy(true);
    setNotice("");
    try {
      const prospecting = runAutonomousProspecting({
        id: selectedLead.id,
        company: selectedLead.company,
        persona: selectedLead.persona,
        annualRevenueUsd: selectedLead.estimatedValue * 12,
        estimatedMarginPct: 16,
      }, adminGovernance);

      if (!prospecting.ok) {
        setNotice(prospecting.message);
        return;
      }

      await createPortalLead({
        sourceChannel: selectedLead.sourceChannel,
        serviceLine: selectedLead.persona.includes("Contractor") ? "construction-services" : "academy-enterprise",
        projectIntent: `module-26-revenue-engine:${selectedLead.downloadedAsset}`,
        sourceRoute: "/portal/revenue-engine",
        createdBy: "auricrux-revenue-engine",
        notes: `Readiness ${selectedLeadRow.score}. Persona ${selectedLead.persona}. Workshop ${selectedLead.workshop}.`,
        client: {
          name: selectedLead.company,
          contactName: selectedLead.contactName,
          contactEmail: `${selectedLead.contactName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
        },
        site: {
          name: selectedProject?.name || `${selectedLead.company} opportunity`,
          city: selectedProject?.location || "Regional",
          estimatedValue: selectedLead.estimatedValue,
        },
        metadata: {
          attribution: {
            workshop: selectedLead.workshop,
            downloadedAsset: selectedLead.downloadedAsset,
            portalPage: selectedLead.portalPage,
          },
          readinessScore: selectedLeadRow.score,
          loyaltyScore: customerLoyalty.score,
          sentiment: sentiment.sentiment,
        },
      });

      commitLocalState({
        ...localState,
        convertedLeadIds: [selectedLead.id, ...localState.convertedLeadIds.filter((id) => id !== selectedLead.id)].slice(0, 30),
      });

      const loop = runRevenueFlywheel(
        {
          id: selectedLead.id,
          company: selectedLead.company,
        },
        {
          completed: selectedLead.studentCount >= 8,
        },
        {
          complianceStatus: "verified",
        },
      );

      setNotice(`Lead ${selectedLead.id} converted by autonomous prospecting. Revenue loop state: ${loop.result}.`);
    } catch (error) {
      setNotice(error?.message || "Unable to create lead entry from revenue engine.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEscalateFounder() {
    const escalation = scheduleFounderEscalation(
      {
        id: selectedLead.id,
        company: selectedLead.company,
      },
      "high-stakes-relationship",
      adminGovernance,
    );

    await sendPortalMessage({
      subject: `Founder escalation scheduled for ${selectedLead.company}`,
      message: `Auricrux scheduled executive escalation (${escalation.id}) for ${new Date(escalation.scheduledAt).toLocaleString()} due to elevated relationship risk (${riskAssessment.riskScore}%).`,
      channel: "email",
      sourceRoute: "/portal/revenue-engine",
    }).catch(() => null);

    await createWorkflowAuditEvent({
      eventType: "revenue-escalation-scheduled",
      actorType: "auricrux",
      severity: riskAssessment.riskScore >= 90 ? "E1" : "E2",
      note: `Founder escalation ${escalation.id} created for ${selectedLead.company}.`,
      route: "/portal/revenue-engine",
      leadId: selectedLead.id,
      riskScore: riskAssessment.riskScore,
      prSensitivityTag: riskAssessment.prSensitivityTag,
    }).catch(() => null);

    logTriadBlackboxEvent("revenue-founder-escalation", {
      projectId: selectedProject?.id || selectedLead.id,
      leadId: selectedLead.id,
      escalationId: escalation.id,
      riskScore: riskAssessment.riskScore,
      prSensitivityTag: riskAssessment.prSensitivityTag,
    });

    setFounderEscalation(escalation);
    setNotice(`Founder escalation scheduled for ${selectedLead.company} at ${new Date(escalation.scheduledAt).toLocaleString()}.`);
  }

  function triggerRetentionWorkflow() {
    const entry = {
      id: `${selectedLead.id}-${Date.now()}`,
      at: new Date().toISOString(),
      company: selectedLead.company,
      loyaltyScore: customerLoyalty.score,
      action: customerLoyalty.triggerRetention ? "Retention + upsell sequence launched" : "Nurture sequence launched",
    };

    commitLocalState({
      ...localState,
      retentionRuns: [entry, ...localState.retentionRuns].slice(0, 40),
    });
    setNotice(`${entry.action} for ${entry.company}.`);
  }

  return (
    <PortalShell
      title="Sales and Marketing Engine"
      subtitle="Construction-specific revenue orchestration for FCA RevOps and customer business development in one governed module."
      activeHref="/portal/revenue-engine"
      currentJourney="lead"
      routeOverlay={routeStateOverlays.revenueEngine || routeStateOverlays.leads}
      primaryHref="/portal/leads"
      primaryLabel="Open leads board"
      showRouteOverlay={false}
    >
      <AuricruxInsightPanel
        title="Auricrux Revenue Copilot"
        targetObjectId={selectedLead.id}
        sourceRoute="/portal/revenue-engine"
        rationale="Run attribution, predictive scoring, and relationship orchestration from a single commercial surface."
        nextAction={`Lead ${selectedLead.id} has readiness ${selectedLeadRow.score}%. Convert now if score exceeds 80 and sentiment remains ${sentiment.sentiment.toLowerCase()}.`}
        recommendations={[
          `${revOpsPriority}`,
          `Dynamic personalization: ${personalization.message}`,
          unreadStaleRelationship,
        ]}
        tone="blue"
        liveRecommend
      />

      <PortalPageIntro
        eyebrow="Module 26"
        title="Auricrux Autonomous Revenue Engine"
        detail="Module 26 operates in Auricrux-only mode: autonomous prospecting, self-optimizing nurture, proposal-as-an-API, and continuous revenue loop upgrades with governance controls."
        actions={(
          <>
            <button type="button" style={{ ...portalButtonPrimary, border: "none", cursor: "pointer" }} onClick={convertLeadToPortalSpine} disabled={busy}>
              {busy ? "Executing..." : "Execute Autonomous Prospecting"}
            </button>
            <a href="/portal/proposals" style={portalButtonSecondary}>Open Proposal Workspace</a>
          </>
        )}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Revenue Governance Boss Controls</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(autonomyState.killSwitch)}
              onChange={(event) => syncAutonomyState(updateRevenueGovernanceControls({ killSwitch: event.target.checked }))}
            />
            Global revenue kill-switch
          </label>
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 12, color: portalTokens.muted }}>Autonomy aggressiveness</span>
            <select
              value={autonomyState.aggressiveness || "balanced"}
              onChange={(event) => syncAutonomyState(updateRevenueGovernanceControls({ aggressiveness: event.target.value }))}
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px" }}
            >
              {(revenueGov?.governanceControls?.aggressivenessModes || ["conservative", "balanced", "assertive"]).map((mode) => (
                <option key={mode} value={mode}>{mode}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: portalTokens.muted }}>
          Strategy constraints: minimum margin {revenueGov?.strategyConstraints?.minimumBidMarginPct || 12}% and target annual revenue ${Number(revenueGov?.strategyConstraints?.minimumTargetAnnualRevenueUsd || 5000000).toLocaleString()}+.
        </div>
      </div>

      <PortalApiStatusBanner status={projectsLoad.status} error={projectsLoad.error} onRetry={projectsLoad.reload} label="projects" />
      <PortalApiStatusBanner status={messagesLoad.status} error={messagesLoad.error} onRetry={messagesLoad.reload} label="messages" />

      {notice ? <PortalAlert tone={notice.includes("Unable") ? "warning" : "success"}>{notice}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Predictive Readiness", value: `${selectedLeadRow.score}%`, hint: selectedLeadRow.readiness },
          { label: "Customer Loyalty Score", value: `${customerLoyalty.score}%`, hint: `${customerLoyalty.certifiedPct}% FCA-certified workforce` },
          { label: "Converted Leads", value: localState.convertedLeadIds.length, hint: "One-click lead handoffs" },
          { label: "Retention Workflows", value: localState.retentionRuns.length, hint: "Autonomous RevOps actions" },
          { label: "Relationship Risk", value: `${riskAssessment.riskScore}%`, hint: riskAssessment.needsEscalation ? "Escalation required" : "Within autonomy threshold" },
          { label: "PR Sensitivity", value: String(riskAssessment.prSensitivityTag || "standard").toUpperCase(), hint: "Brand exposure weighting" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Unified Marketing Attribution</div>
        <PortalEntityTable
          columns={[
            { key: "company", label: "Account", render: (row) => <strong>{row.lead.company}</strong> },
            { key: "persona", label: "Persona", render: (row) => row.lead.persona },
            { key: "source", label: "Source", render: (row) => row.lead.sourceChannel },
            { key: "score", label: "Readiness", render: (row) => <PortalStatusBadge status={`${row.score}%`} active={row.score >= 85} /> },
            { key: "asset", label: "Journey Evidence", render: (row) => `${row.lead.workshop} / ${row.lead.downloadedAsset}` },
            {
              key: "action",
              label: "",
              render: (row) => (
                <button type="button" onClick={() => setSelectedLeadId(row.id)} style={portalButtonSecondary}>
                  {row.id === selectedLead.id ? "Selected" : "Review"}
                </button>
              ),
            },
          ]}
          rows={leadRows}
          emptyTitle="No campaign leads"
          emptyDetail="Attribution events will appear here once campaigns start generating interactions."
          emptyPrimaryHref="/portal/messages"
          emptyPrimaryLabel="Open messages"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 16 }}>
        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Dynamic Campaign Personalization</div>
          <strong>{selectedLead.company} ({selectedLead.persona})</strong>
          <div style={{ color: portalTokens.body, marginTop: 6, lineHeight: 1.6 }}>{personalization.message}</div>
          <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
            {personalization.sequence.map((step) => (
              <div key={step} style={{ border: "1px solid #dbe3ef", borderRadius: 8, padding: "8px 10px", background: "#fff" }}>{step}</div>
            ))}
          </div>
        </div>

        <div style={portalCardStyle}>
          <div style={portalEyebrowStyle}>Relationship Orchestrator</div>
          <strong>Sentiment: {sentiment.sentiment}</strong>
          <div style={{ color: portalTokens.body, marginTop: 6, lineHeight: 1.6 }}>{unreadStaleRelationship}</div>
          <div style={{ marginTop: 10, color: portalTokens.muted, fontSize: 13 }}>
            Positive: {sentiment.positive} | Negative: {sentiment.negative}
          </div>
          <div style={{ marginTop: 12 }}>
            <button type="button" onClick={triggerRetentionWorkflow} style={portalButtonPrimary}>
              Trigger Retention/Upsell Workflow
            </button>
          </div>
          {riskAssessment.needsEscalation ? (
            <div style={{ marginTop: 12, border: "1px solid #fecaca", borderRadius: 10, background: "#fff1f2", padding: 10 }}>
              <strong>Human escalation protocol triggered</strong>
              <div style={{ fontSize: 13, color: portalTokens.body, marginTop: 4 }}>
                Risk {riskAssessment.riskScore}% exceeds threshold {riskAssessment.threshold}%. Founder briefing should be auto-scheduled.
              </div>
              <button type="button" onClick={handleEscalateFounder} style={{ ...portalButtonSecondary, marginTop: 8 }}>
                Schedule founder escalation now
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Customer-Facing Proposal Marketing Kit</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginTop: 8 }}>
          <label>
            <div style={{ fontSize: 12, color: portalTokens.muted, marginBottom: 4 }}>Project context</div>
            <select
              value={selectedProject?.id || ""}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px" }}
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name || project.id}</option>
              ))}
            </select>
          </label>
          <label>
            <div style={{ fontSize: 12, color: portalTokens.muted, marginBottom: 4 }}>Critical competency signal</div>
            <input readOnly value={criticalCompetencies.join(", ") || "No competency model configured"} style={{ width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px", background: "#f8fafc" }} />
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <button type="button" onClick={buildProposalMarketingKit} style={portalButtonPrimary}>Generate Branded Proposal Kit</button>
          <a href="/portal/proposals" style={portalButtonSecondary}>Open proposal delivery</a>
        </div>

        {proposalKit ? (
          <div style={{ marginTop: 12, border: "1px solid #e2e8f0", borderRadius: 10, padding: 12, background: "#fff" }}>
            <strong>{proposalKit.leadCompany} - {proposalKit.projectName}</strong>
            <div style={{ color: portalTokens.body, marginTop: 6 }}>{proposalKit.valueStatement}</div>
            <ul style={{ margin: "8px 0 0", paddingLeft: 18, color: portalTokens.body, lineHeight: 1.6 }}>
              <li>Safety profile: {proposalKit.safetyProfile}</li>
              <li>Certifications: {proposalKit.certifications.join(", ")}</li>
              <li>Slides: {proposalKit.includedSlides.length} conversion-ready sections</li>
              <li>Dynamic value case: ${proposalKit.dynamicValueCase?.annualRecoveredUsd?.toLocaleString()} annual recovery estimate</li>
              <li>Proposal API status: {proposalKit.proposalApiPayload?.status}</li>
            </ul>
          </div>
        ) : null}
      </div>

      {founderEscalation ? (
        <PortalAlert tone="warning" title="Founder Escalation Scheduled">
          {`Meeting ${founderEscalation.id} for ${founderEscalation.company} is scheduled at ${new Date(founderEscalation.scheduledAt).toLocaleString()} with owner ${founderEscalation.owner}.`}
        </PortalAlert>
      ) : null}

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={portalEyebrowStyle}>Predictive Market Trend Forecasting</div>
        <div style={{ display: "grid", gap: 8 }}>
          {trendSignals.map((trend) => (
            <div key={trend.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 10, background: "#fff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <strong>{trend.region}</strong>
                <PortalStatusBadge status={`Confidence ${Math.round(trend.confidence * 100)}%`} active={trend.confidence >= 0.85} />
              </div>
              <div style={{ color: portalTokens.body, marginTop: 4 }}>{trend.signal}</div>
              <div style={{ color: portalTokens.muted, fontSize: 13, marginTop: 6 }}>Top 5 leads: {trend.leads.join(" | ")}</div>
            </div>
          ))}
        </div>
      </div>

      <PortalAlert tone="info" title="Strategic Positioning">
        Module 26 now runs as an autonomous revenue engine. Humans set strategy constraints and governance controls, while Auricrux executes prospecting, nurture iteration, proposal generation, and academy-to-licensee conversion loops.
      </PortalAlert>
    </PortalShell>
  );
}
