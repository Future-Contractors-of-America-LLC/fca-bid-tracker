import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import useWorkspaceState from "../../hooks/useWorkspaceState";
import useBidWorkspace from "../../hooks/useBidWorkspace";
import useProjectWorkspace from "../../hooks/useProjectWorkspace";
import useCustomerSession from "../../hooks/useCustomerSession";
import {
  createPortalInvoice,
  fetchPortalInvoices,
  issuePortalInvoice,
} from "../../api/portalClient";
import {
  fetchCommercialPipeline,
  migrateLocalPipelineToApi,
  pipelineItemsToMap,
  upsertPipelineLink,
} from "../../api/pipelineClient";
import { createInvoiceFromEstimate } from "../../api/financialClient";
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

const STEPS = [
  { key: "qualify", label: "Qualify bid", detail: "Score and qualify the opportunity." },
  { key: "project", label: "Award to project", detail: "Convert won work into a live project." },
  { key: "estimate", label: "Estimate (optional)", detail: "Route to estimate or skip." },
  { key: "invoice", label: "Issue invoice", detail: "Create and issue customer invoice." },
  { key: "payment", label: "Collect payment", detail: "Record payment in FCA Books and post to GL." },
];

function readLocalPipelineLinks() {
  if (typeof window === "undefined") return {};
  try {
    const raw = JSON.parse(window.localStorage.getItem(PIPELINE_KEY) || "{}");
    return Object.fromEntries(
      Object.entries(raw).map(([bidId, link]) => [bidId, { bidId, ...link }]),
    );
  } catch {
    return {};
  }
}

function writeLocalPipelineLink(bidId, patch) {
  if (typeof window === "undefined") return;
  const current = readLocalPipelineLinks();
  const legacy = { ...current[bidId] };
  delete legacy.bidId;
  window.localStorage.setItem(
    PIPELINE_KEY,
    JSON.stringify({ ...current, [bidId]: { ...legacy, ...patch } }),
  );
}

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
  const { bids, updateBidQualification, routeBidToEstimate, markWonAndCreateProject } = useBidWorkspace();
  const { projects, activeProject } = useProjectWorkspace();

  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const [invoices, setInvoices] = useState([]);
  const [links, setLinks] = useState({});
  const [pipelineSource, setPipelineSource] = useState("loading");
  const [pipelineBanner, setPipelineBanner] = useState("");
  const [invoiceDraft, setInvoiceDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [trainingProgramKey, setTrainingProgramKey] = useState("");
  const [trainingMessage, setTrainingMessage] = useState("");

  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";
  const activeBid = bids.find((bid) => bid.id === activeBidId) || bids[0] || null;
  const goNoGoScore = useMemo(() => (activeBid ? scoreBidQualification(activeBid) : null), [activeBid]);
  const stagnationAlert = useMemo(() => (activeBid ? detectPipelineStagnation(activeBid) : null), [activeBid]);

  useEffect(() => {
    if (!activeBidId && bids[0]?.id) setActiveBidId(bids[0].id);
  }, [bids, activeBidId]);

  useEffect(() => {
    fetchPortalInvoices()
      .then((payload) => setInvoices(payload.items || []))
      .catch(() => setInvoices([]));
  }, []);

  useEffect(() => {
    let active = true;
    setPipelineBanner("");
    fetchCommercialPipeline()
      .then(async (payload) => {
        if (!active) return;
        const items = await migrateLocalPipelineToApi(payload.items || []);
        setLinks(pipelineItemsToMap(items));
        setPipelineSource(payload.backingSource || "auricrux-central-table-store");
      })
      .catch(() => {
        if (!active) return;
        setLinks(readLocalPipelineLinks());
        setPipelineSource("localStorage-fallback");
        setPipelineBanner("Pipeline API unreachable. Showing local fallback data until sync recovers.");
      });
    return () => {
      active = false;
    };
  }, []);

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
      const nextLinks = { ...links, [bidId]: normalizeLink(payload.item) };
      setLinks(nextLinks);
      setPipelineSource(payload.backingSource || "auricrux-central-table-store");
      setPipelineBanner("");
      return nextLinks;
    } catch {
      writeLocalPipelineLink(bidId, patch);
      const fallback = readLocalPipelineLinks();
      setLinks(fallback);
      setPipelineSource("localStorage-fallback");
      setPipelineBanner("Pipeline API unreachable. Changes saved locally until sync recovers.");
      return fallback;
    }
  }

  const pipelineRows = useMemo(
    () => bids.map((bid) => ({ bid, ...deriveStepStatus(bid, projects, invoices, links) })),
    [bids, projects, invoices, links],
  );

  const activePipeline = activeBid ? deriveStepStatus(activeBid, projects, invoices, links) : null;
  const stepIndex = activePipeline?.current === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === activePipeline?.current);
  const learnerId = session?.email || session?.customerId;
  const lanePrograms = useMemo(
    () => (academyState?.catalog?.programs || []).filter((item) => ["licensure", "certification", "apprenticeship"].includes(item.lane)),
    [academyState?.catalog?.programs],
  );
  const activeProjectId = activePipeline?.link?.projectId || activeProject?.id || "";

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

  async function runAward() {
    if (!activeBid) return;
    setBusy("project");
    setError("");
    try {
      await markWonAndCreateProject(activeBid.id, "Pipeline wizard converted award into project.");
      const project = projects.find((item) => item.sourceBidId === activeBid.id);
      await savePipelineLink(activeBid.id, { projectId: project?.id });
      refreshSyncStamp("Pipeline project conversion complete");
    } catch (err) {
      setError(err.message || "Project conversion failed.");
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
        const payload = await fetchPortalInvoices();
        setInvoices(payload.items || []);
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
          const payload = await fetchPortalInvoices();
          setInvoices(payload.items || []);
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

      {pipelineBanner ? <PortalAlert tone="warning">{pipelineBanner}</PortalAlert> : null}

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
          />
        </div>
      ) : null}

      {error ? <PortalAlert tone="error">{error}</PortalAlert> : null}

      <PortalQuickStats
        items={[
          { label: "Active jobs", value: pipelineRows.length, hint: "In pipeline" },
          { label: "Current step", value: activePipeline?.current === "done" ? "Complete" : STEPS.find((step) => step.key === activePipeline?.current)?.label || "—", hint: activeBid?.package || "Select a job" },
          { label: "Completed steps", value: activePipeline ? `${Object.values(activePipeline.complete).filter(Boolean).length}/${STEPS.length}` : "0/5", hint: "For selected job" },
        ]}
      />

      <div style={{ ...portalCardStyle, marginBottom: 16 }}>
        <div style={{ color: portalTokens.primaryInk, fontWeight: 700, marginBottom: 8 }}>Select active job</div>
        <div style={{ display: "grid", gap: 10 }}>
          {pipelineRows.map(({ bid, complete, current }) => (
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
