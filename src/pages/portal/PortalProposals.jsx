import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useProposalWorkspace from "../../hooks/useProposalWorkspace";
import usePortalApiLoad from "../../hooks/usePortalApiLoad";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import { fetchEstimates } from "../../api/commercialClient";
import { fetchWorkflowFiles, mutateWorkflowFile } from "../../api/workflowClient";
import { fetchFinancialWorkspace } from "../../api/financialClient";
import { sendPortalMessage, fetchPortalMessages } from "../../api/portalClient";
import { upsertPipelineLink } from "../../api/pipelineClient";
import { routeStateOverlays } from "../../systemState";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const buttonStyle = (primary = false) => ({
  borderRadius: 10,
  border: primary ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
  background: primary ? "#1d4ed8" : "#ffffff",
  color: primary ? "#ffffff" : "#0f172a",
  fontWeight: 700,
  padding: "10px 12px",
  cursor: "pointer",
});

const PROPOSAL_VERSIONS_KEY = "fca_proposal_versions_v1";
const PROPOSAL_ENGAGEMENT_KEY = "fca_proposal_engagement_v1";
const PROPOSAL_ALTERNATES_KEY = "fca_proposal_alternates_v1";
const PROPOSAL_PROJECT_TYPE_KEY = "fca_proposal_project_type_v1";

const DEFAULT_ALTERNATES = [
  { id: "alt-glass", label: "Upgrade facade to glass system", delta: 85000 },
  { id: "alt-accel", label: "Accelerate turnover by 2 weeks", delta: 42000 },
  { id: "alt-ve", label: "Value engineer masonry package", delta: -30000 },
];

const RFP_REQUIRED_TOKENS = ["insurance", "bond", "safety", "schedule", "submittal"];

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

function parseCurrency(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const numeric = Number(String(value || "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatUsd(value) {
  return `$${Math.round(value || 0).toLocaleString()}`;
}

function inferProjectType(proposal) {
  const text = `${proposal?.package || ""} ${proposal?.commercialNarrative || ""}`.toLowerCase();
  if (/hospital|clinic|medical|healthcare/.test(text)) return "Healthcare";
  if (/school|university|education|campus/.test(text)) return "Education";
  if (/airport|bridge|utility|infrastructure/.test(text)) return "Infrastructure";
  return "Commercial";
}

function conditionalBlocks(projectType) {
  if (projectType === "Healthcare") {
    return [
      "Healthcare safety record: 0.21 TRIR over last 24 months.",
      "Infection control and ICRA phased execution experience included.",
      "Clinical operations continuity and after-hours isolation methodology attached.",
      "Required healthcare insurance certificates are pre-packaged in compliance appendix.",
    ];
  }
  if (projectType === "Education") {
    return [
      "Active campus phasing and occupancy-protected sequencing included.",
      "DBE and public reporting workflow aligned to owner requirements.",
      "Academic calendar shutdown windows incorporated into mobilization logic.",
    ];
  }
  return [
    "Commercial tenant protection and turnover sequencing included.",
    "Safety metrics and insurance certificates included by default.",
    "Procurement and long-lead risk controls reflected in schedule narrative.",
  ];
}

function winProbabilitySignal({ proposalTotal, marketAverage, concreteDeltaPct }) {
  if (!marketAverage) {
    return {
      score: 0.74,
      note: "Insufficient historical market baseline. Auricrux is using neutral confidence.",
      recommendAdjust: false,
    };
  }
  const variancePct = Math.round(((proposalTotal - marketAverage) / marketAverage) * 100);
  const recommendAdjust = variancePct > 5 || concreteDeltaPct > 5;
  const score = Math.max(0.15, Math.min(0.96, 0.88 - (Math.max(0, variancePct - 2) * 0.015) - (Math.max(0, concreteDeltaPct - 2) * 0.01)));
  return {
    score,
    note: `Proposal is ${variancePct}% vs market and concrete package is ${concreteDeltaPct}% vs historical benchmark.`,
    recommendAdjust,
  };
}

function proposalBodyText(proposal, blocks = []) {
  const scopeLines = proposal?.scopePackage?.designSourcedLines?.map((line) => `${line.label} ${line.amount}`) || [];
  return [
    proposal?.commercialNarrative || "",
    proposal?.assumptionsSummary || "",
    proposal?.exclusionsSummary || "",
    ...scopeLines,
    ...blocks,
  ].join(" ").toLowerCase();
}

export default function PortalProposals() {
  const { state } = useWorkspaceState();
  const { proposals, meta, advanceProposal } = useProposalWorkspace();
  const { bids, markWonAndCreateProject } = useBidWorkspace();
  const { reloadProjects } = useProjectWorkspace();
  const estimatesLoad = usePortalApiLoad(() => fetchEstimates(), []);
  const filesLoad = usePortalApiLoad(() => fetchWorkflowFiles({}), []);
  const financeLoad = usePortalApiLoad(() => fetchFinancialWorkspace("dashboard"), []);
  const messagesLoad = usePortalApiLoad(() => fetchPortalMessages(), []);

  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [proposalVersions, setProposalVersions] = useState(() => readLocalJson(PROPOSAL_VERSIONS_KEY, {}));
  const [engagementLog, setEngagementLog] = useState(() => readLocalJson(PROPOSAL_ENGAGEMENT_KEY, []));
  const [proposalAlternates, setProposalAlternates] = useState(() => readLocalJson(PROPOSAL_ALTERNATES_KEY, {}));
  const [projectTypeMap, setProjectTypeMap] = useState(() => readLocalJson(PROPOSAL_PROJECT_TYPE_KEY, {}));

  const focusProposal = proposals[0] || null;
  const estimates = estimatesLoad.data?.items || [];
  const files = filesLoad.data?.items || [];
  const messages = messagesLoad.data?.items || [];

  const guardrailMarginPct = Number(
    financeLoad.data?.dashboard?.marginTargetPct
      ?? financeLoad.data?.dashboard?.targetMarginPct
      ?? 15,
  );

  const marginForecastPct = Number(
    financeLoad.data?.dashboard?.forecastMarginPct
      ?? financeLoad.data?.dashboard?.grossMarginPct
      ?? 0,
  );

  useEffect(() => {
    writeLocalJson(PROPOSAL_VERSIONS_KEY, proposalVersions);
  }, [proposalVersions]);

  useEffect(() => {
    writeLocalJson(PROPOSAL_ENGAGEMENT_KEY, engagementLog);
  }, [engagementLog]);

  useEffect(() => {
    writeLocalJson(PROPOSAL_ALTERNATES_KEY, proposalAlternates);
  }, [proposalAlternates]);

  useEffect(() => {
    writeLocalJson(PROPOSAL_PROJECT_TYPE_KEY, projectTypeMap);
  }, [projectTypeMap]);

  function resolvedEstimate(proposal) {
    return estimates.find((estimate) => estimate.estimateId === proposal.estimateId) || null;
  }

  function liveTotalFor(proposal) {
    const estimate = resolvedEstimate(proposal);
    return parseCurrency(estimate?.total || proposal.total || proposal.scopePackage?.total || 0);
  }

  function selectedAlternatesFor(proposalId) {
    const selected = proposalAlternates[proposalId] || {};
    return DEFAULT_ALTERNATES.filter((alt) => selected[alt.id]);
  }

  function dynamicTotalFor(proposal) {
    const base = liveTotalFor(proposal);
    const alternates = selectedAlternatesFor(proposal.proposalId);
    const alternateDelta = alternates.reduce((sum, alt) => sum + alt.delta, 0);
    return base + alternateDelta;
  }

  function toggleAlternate(proposalId, alternateId) {
    setProposalAlternates((current) => ({
      ...current,
      [proposalId]: {
        ...(current[proposalId] || {}),
        [alternateId]: !(current[proposalId] || {})[alternateId],
      },
    }));
    logEngagement(proposalId, "alternate-toggle", "pricing", `Client viewed alternate ${alternateId}.`);
  }

  function setProjectType(proposalId, value) {
    setProjectTypeMap((current) => ({ ...current, [proposalId]: value }));
  }

  function addVersionSnapshot(proposal, action, detail) {
    const snapshot = {
      id: `${proposal.proposalId}-${Date.now()}`,
      proposalId: proposal.proposalId,
      action,
      detail,
      timestamp: new Date().toISOString(),
      estimateId: proposal.estimateId,
      total: dynamicTotalFor(proposal),
      status: proposal.status,
    };
    setProposalVersions((current) => ({
      ...current,
      [proposal.proposalId]: [snapshot, ...(current[proposal.proposalId] || [])].slice(0, 60),
    }));
  }

  function logEngagement(proposalId, action, section, detail) {
    setEngagementLog((current) => [
      {
        id: `${proposalId}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        proposalId,
        action,
        section,
        detail,
        observedAt: new Date().toISOString(),
        actorFingerprint: state?.tenant?.name || "client-session",
      },
      ...current,
    ].slice(0, 240));
  }

  function complianceCheck(proposal, blocks) {
    const relatedRfpFiles = files.filter((file) => {
      const hay = `${file.name || ""} ${file.note || ""} ${file.ownerObjectId || ""}`.toLowerCase();
      return hay.includes("rfp") || hay.includes((proposal.bidId || "").toLowerCase()) || hay.includes((proposal.proposalId || "").toLowerCase());
    });
    const body = proposalBodyText(proposal, blocks);
    const missingTokens = RFP_REQUIRED_TOKENS.filter((token) => !body.includes(token));
    return {
      relatedRfpFiles,
      missingTokens,
      pass: missingTokens.length === 0,
    };
  }

  function marketBenchmarks() {
    const historicalApproved = proposals
      .filter((item) => String(item.status || "").toLowerCase().includes("approved"))
      .map((item) => parseCurrency(item.total || item.scopePackage?.total || 0))
      .filter((value) => value > 0);
    const marketAverage = historicalApproved.length
      ? historicalApproved.reduce((sum, value) => sum + value, 0) / historicalApproved.length
      : 0;
    return { marketAverage };
  }

  async function handleSendProposal(proposal) {
    setError("");
    setNotice("");
    if (marginForecastPct < guardrailMarginPct) {
      setError(`Commercial guardrail blocked send. Margin forecast ${marginForecastPct}% is below governance floor ${guardrailMarginPct}%.`);
      return;
    }

    const projectType = projectTypeMap[proposal.proposalId] || inferProjectType(proposal);
    const blocks = conditionalBlocks(projectType);
    const compliance = complianceCheck(proposal, blocks);
    if (!compliance.pass) {
      setError(`Compliance guardrail blocked send. Missing scope coverage: ${compliance.missingTokens.join(", ")}.`);
      return;
    }

    setBusyAction(`send-${proposal.proposalId}`);
    try {
      const liveTotal = liveTotalFor(proposal);
      const stale = parseCurrency(proposal.total || proposal.scopePackage?.total || 0) !== liveTotal;
      await advanceProposal(
        proposal.proposalId,
        "Sent",
        stale
          ? `Auricrux sent ${proposal.proposalId} with auto-synced SSOT total ${formatUsd(dynamicTotalFor(proposal))}.`
          : `Auricrux sent ${proposal.proposalId} to customer review.
`,
        "Track customer engagement and legal review posture",
      );
      addVersionSnapshot(proposal, "sent", "Customer delivery issued.");
      logEngagement(proposal.proposalId, "sent", "delivery", "Proposal issued to customer.");
      setNotice(stale ? "Proposal sent with latest estimate-linked total (SSOT sync applied)." : "Proposal sent to customer.");
    } catch (sendError) {
      setError(sendError.message || "Unable to send proposal.");
    } finally {
      setBusyAction("");
    }
  }

  async function handleAcceptAndLaunch(proposal) {
    setError("");
    setNotice("");
    if (marginForecastPct < guardrailMarginPct) {
      setError(`Commercial guardrail blocked acceptance. Margin forecast ${marginForecastPct}% is below governance floor ${guardrailMarginPct}%.`);
      return;
    }
    setBusyAction(`accept-${proposal.proposalId}`);
    try {
      await advanceProposal(
        proposal.proposalId,
        "Approved",
        `Auricrux recorded approval for ${proposal.proposalId} and initiated instant project launch.`,
        "Project mobilization active",
      );

      const bid = bids.find((item) => item.id === proposal.bidId);
      let projectId = "";
      if (bid) {
        const awardPayload = await markWonAndCreateProject(bid.id, `Proposal ${proposal.proposalId} accepted by customer with e-signature.`);
        projectId = awardPayload?.project?.id || awardPayload?.projectId || "";
      }

      if (projectId) {
        const folderTemplates = [
          { name: `${projectId} / 01 Contract`, category: "Contract", discipline: "Commercial" },
          { name: `${projectId} / 02 Drawings and RFIs`, category: "Drawing", discipline: "Preconstruction" },
          { name: `${projectId} / 03 Mobilization and Scheduling`, category: "Field", discipline: "Operations" },
        ];
        for (const folder of folderTemplates) {
          await mutateWorkflowFile("create-file-record", {
            projectId,
            name: folder.name,
            category: folder.category,
            discipline: folder.discipline,
            owner: "Proposal launch automation",
            status: "Registered",
            evidenceStatus: "Project launch provisioned",
            linkedEvidenceTarget: `${projectId} proposal launch evidence chain`,
            detail: `Proposal ${proposal.proposalId} acceptance provisioned ${folder.name}.`,
          }).catch(() => null);
        }

        await upsertPipelineLink({
          bidId: proposal.bidId,
          projectId,
          currentStep: "project",
        }).catch(() => null);

        await sendPortalMessage({
          channel: "teams",
          subject: `${projectId} proposal accepted - launch scheduling`,
          message: `Customer accepted ${proposal.proposalId}. Project ${projectId} is live, folders provisioned, and scheduling team should mobilize immediately.`,
        }).catch(() => null);

        await reloadProjects().catch(() => null);
      }

      addVersionSnapshot(proposal, "approved", "Proposal accepted with instant project launch.");
      logEngagement(proposal.proposalId, "accepted", "signature", "Digital acceptance captured and handoff triggered.");
      setNotice("Proposal accepted. Instant project launch orchestration completed.");
    } catch (acceptError) {
      setError(acceptError.message || "Unable to complete acceptance launch.");
    } finally {
      setBusyAction("");
    }
  }

  function simulateClientView(proposal) {
    logEngagement(proposal.proposalId, "opened", "overview", "Client opened interactive proposal link.");
    setNotice("Client engagement event recorded.");
  }

  function simulateLegalReview(proposal) {
    logEngagement(proposal.proposalId, "shared", "legal", "Proposal shared to legal review cohort.");
    setNotice("Legal review signal recorded for sales follow-up.");
  }

  return (
    <PortalShell
      title="Proposals"
      subtitle="Package scope, narrative, and approval-ready customer proposals."
      activeHref="/portal/proposals"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/projects"
      primaryLabel="Open Projects"
    >
      {error ? (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>
      ) : null}
      {notice ? (
        <div style={{ ...cardStyle, marginBottom: 16, border: "1px solid #86efac", background: "#f0fdf4", color: "#166534" }}>{notice}</div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 16, border: marginForecastPct < guardrailMarginPct ? "1px solid #fecaca" : "1px solid #bfdbfe", background: marginForecastPct < guardrailMarginPct ? "#fef2f2" : "#eff6ff" }}>
        <div style={{ fontWeight: 800, color: marginForecastPct < guardrailMarginPct ? "#991b1b" : "#1d4ed8", marginBottom: 8 }}>Commercial Logic Guardrails</div>
        <div style={{ color: "#334155", lineHeight: 1.7 }}>
          <div><strong>Governance margin floor:</strong> {guardrailMarginPct}%</div>
          <div><strong>Current forecast margin:</strong> {marginForecastPct}%</div>
          <div>{marginForecastPct < guardrailMarginPct ? "Send/accept is blocked until margin is above governance threshold." : "Proposal delivery is within commercial risk tolerance."}</div>
        </div>
      </div>

      {focusProposal?.proposalId ? (
        <div style={{ marginBottom: 16 }}>
          <AuricruxInsightPanel
            title="Auricrux Proposal Intelligence"
            targetObjectType="Proposal"
            targetObjectId={focusProposal.proposalId}
            sourceRoute="/portal/proposals"
            rationale={focusProposal.nextAction || "Dynamic proposal delivery requires estimate SSOT, risk guardrails, and legal-ready traceability."}
            nextAction={focusProposal.nextAction || "Optimize win probability and validate RFP scope alignment before send."}
            actionHref="/portal/projects"
            actionLabel="Open projects"
            tone="blue"
            liveRecommend
          />
        </div>
      ) : null}

      {!proposals.length ? (
        <div style={{ ...cardStyle, marginBottom: 16, color: "#475569", lineHeight: 1.7 }}>
          {meta?.backingSource === "unavailable"
            ? "Proposals are temporarily unavailable. Generate a proposal from Estimates or retry shortly."
            : "No proposals yet. Advance an estimate and generate a proposal package to start customer delivery."}
          <div style={{ marginTop: 12 }}>
            <a href="/portal/estimates" style={{ color: "#1d4ed8", fontWeight: 700, textDecoration: "none" }}>Open Estimates</a>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.proposalId}
            proposal={proposal}
            liveTotal={liveTotalFor(proposal)}
            dynamicTotal={dynamicTotalFor(proposal)}
            marketAverage={marketBenchmarks().marketAverage}
            marginForecastPct={marginForecastPct}
            guardrailMarginPct={guardrailMarginPct}
            blocks={conditionalBlocks(projectTypeMap[proposal.proposalId] || inferProjectType(proposal))}
            projectType={projectTypeMap[proposal.proposalId] || inferProjectType(proposal)}
            onProjectTypeChange={setProjectType}
            proposalVersions={proposalVersions[proposal.proposalId] || []}
            engagementLog={engagementLog.filter((entry) => entry.proposalId === proposal.proposalId)}
            selectedAlternates={selectedAlternatesFor(proposal.proposalId)}
            onToggleAlternate={toggleAlternate}
            onSend={handleSendProposal}
            onAccept={handleAcceptAndLaunch}
            onSimulateClient={simulateClientView}
            onSimulateLegal={simulateLegalReview}
            busyAction={busyAction}
            compliance={complianceCheck(proposal, conditionalBlocks(projectTypeMap[proposal.proposalId] || inferProjectType(proposal)))}
            winSignal={winProbabilitySignal({
              proposalTotal: dynamicTotalFor(proposal),
              marketAverage: marketBenchmarks().marketAverage,
              concreteDeltaPct: Math.round(((dynamicTotalFor(proposal) - liveTotalFor(proposal)) / Math.max(1, liveTotalFor(proposal))) * 100),
            })}
          />
        ))}
      </div>
    </PortalShell>
  );
}

function ProposalCard({
  proposal,
  liveTotal,
  dynamicTotal,
  marketAverage,
  marginForecastPct,
  guardrailMarginPct,
  blocks,
  projectType,
  onProjectTypeChange,
  proposalVersions,
  engagementLog,
  selectedAlternates,
  onToggleAlternate,
  onSend,
  onAccept,
  onSimulateClient,
  onSimulateLegal,
  busyAction,
  compliance,
  winSignal,
}) {
  const stale = parseCurrency(proposal.total || proposal.scopePackage?.total || 0) !== liveTotal;
  const legalSignalCount = engagementLog.filter((entry) => entry.section === "legal").length;
  const viewedCount = engagementLog.filter((entry) => entry.action === "opened").length;

  return (
    <div style={cardStyle}>
      <div style={{ color: "#2563eb", fontWeight: 700, marginBottom: 6 }}>{proposal.status}</div>
      <h3 style={{ marginTop: 0, marginBottom: 8 }}>{proposal.package}</h3>
      <div style={{ color: "#475569", lineHeight: 1.7 }}>
        <div><strong>Proposal ID:</strong> {proposal.proposalId}</div>
        <div><strong>Estimate:</strong> {proposal.estimateId}</div>
        <div><strong>Bid:</strong> {proposal.bidId}</div>
        <div><strong>Delivery mode:</strong> Interactive secure link + e-sign</div>
      </div>

      <div style={{ marginTop: 12, color: "#475569", lineHeight: 1.7 }}>
        <div><strong>SSOT Base Total:</strong> {formatUsd(liveTotal)}</div>
        <div><strong>Client Interactive Total:</strong> {formatUsd(dynamicTotal)}</div>
        {stale ? <div style={{ color: "#b45309", fontWeight: 700 }}>Estimate changed since last proposal render. SSOT sync will update on send.</div> : null}
        <div style={{ marginTop: 8 }}><strong>Narrative:</strong> {proposal.commercialNarrative}</div>
        <div style={{ marginTop: 8 }}><strong>Assumptions summary:</strong> {proposal.assumptionsSummary}</div>
        {proposal.exclusionsSummary ? <div style={{ marginTop: 8 }}><strong>Exclusions:</strong> {proposal.exclusionsSummary}</div> : null}
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Conditional content blocks</div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontSize: 13, color: "#475569" }}>
            Project type
            <select
              value={projectType}
              onChange={(event) => onProjectTypeChange(proposal.proposalId, event.target.value)}
              style={{ marginLeft: 8, border: "1px solid #cbd5e1", borderRadius: 8, padding: "6px 8px" }}
            >
              <option>Commercial</option>
              <option>Healthcare</option>
              <option>Education</option>
              <option>Infrastructure</option>
            </select>
          </label>
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "#334155", lineHeight: 1.7 }}>
          {blocks.map((block) => <li key={block}>{block}</li>)}
        </ul>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Auricrux win-probability and compliance</div>
        <div style={{ color: "#334155", lineHeight: 1.6 }}>
          <div><strong>Win probability:</strong> {`${Math.round(winSignal.score * 100)}%`}</div>
          <div>{winSignal.note}</div>
          {winSignal.recommendAdjust ? <div style={{ color: "#b45309", fontWeight: 700 }}>Recommendation: adjust pricing closer to historical win band before final send.</div> : null}
        </div>
        <div style={{ marginTop: 8, color: compliance.pass ? "#166534" : "#991b1b" }}>
          {compliance.pass
            ? "Scope alignment check passed against RFP requirements."
            : `Compliance check failed. Missing tokens: ${compliance.missingTokens.join(", ")}`}
        </div>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Interactive alternates</div>
        <div style={{ display: "grid", gap: 8 }}>
          {DEFAULT_ALTERNATES.map((alternate) => {
            const active = selectedAlternates.some((item) => item.id === alternate.id);
            return (
              <label key={alternate.id} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: 8, background: active ? "#eff6ff" : "#fff" }}>
                <input type="checkbox" checked={active} onChange={() => onToggleAlternate(proposal.proposalId, alternate.id)} />{" "}
                {alternate.label} ({formatUsd(alternate.delta)})
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Version history and engagement analytics</div>
        <div style={{ color: "#334155", marginBottom: 8 }}>{`Versions: ${proposalVersions.length} · Opens: ${viewedCount} · Legal signals: ${legalSignalCount}`}</div>
        <div style={{ display: "grid", gap: 6, maxHeight: 130, overflowY: "auto" }}>
          {proposalVersions.slice(0, 6).map((version) => (
            <div key={version.id} style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: 8, background: "#f8fafc", fontSize: 12, color: "#475569" }}>
              {`${version.timestamp} · ${version.action} · ${formatUsd(version.total)}`}
            </div>
          ))}
          {!proposalVersions.length ? <div style={{ color: "#64748b", fontSize: 12 }}>No versions recorded yet.</div> : null}
        </div>
      </div>

      {proposal.scopePackage?.designSourcedLines?.length ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Design-sourced scope ({proposal.scopePackage.designLineCount})</div>
          <div style={{ display: "grid", gap: 8 }}>
            {proposal.scopePackage.designSourcedLines.map((line) => (
              <div key={line.code} style={{ border: "1px solid #dbeafe", borderRadius: 10, padding: 10, background: "#eff6ff" }}>
                <div style={{ fontWeight: 700 }}>{line.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  {line.quantity} {line.unit} · {line.amount}
                  {line.sourceTakeoffId ? ` · takeoff ${line.sourceTakeoffId}` : ""}
                </div>
                {line.projectId && line.sourceFileId ? (
                  <a href={`/portal/design?projectId=${encodeURIComponent(line.projectId)}&fileId=${encodeURIComponent(line.sourceFileId)}`} style={{ fontSize: 12, color: "#2563eb" }}>
                    Trace to Design Workspace
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
        <button
          type="button"
          style={buttonStyle()}
          onClick={() => onSend(proposal)}
          disabled={busyAction === `send-${proposal.proposalId}` || marginForecastPct < guardrailMarginPct}
        >
          {busyAction === `send-${proposal.proposalId}` ? "Sending..." : "Send Proposal"}
        </button>
        <button
          type="button"
          style={buttonStyle(true)}
          onClick={() => onAccept(proposal)}
          disabled={busyAction === `accept-${proposal.proposalId}` || marginForecastPct < guardrailMarginPct}
        >
          {busyAction === `accept-${proposal.proposalId}` ? "Launching..." : "Accept + Launch Project"}
        </button>
        <button type="button" style={buttonStyle()} onClick={() => onSimulateClient(proposal)}>Log Client Open</button>
        <button type="button" style={buttonStyle()} onClick={() => onSimulateLegal(proposal)}>Log Legal Review</button>
      </div>
    </div>
  );
}
