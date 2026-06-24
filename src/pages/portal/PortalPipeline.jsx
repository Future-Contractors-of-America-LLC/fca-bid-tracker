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
import { routeStateOverlays } from "../../systemState";
import BidsEcosystemHub from "../../components/bids/BidsEcosystemHub";
import BidQualificationChecklist from "../../components/bids/BidQualificationChecklist";
import useBidsNextActions from "../../hooks/useBidsNextActions";
import {
  buildQualifyPayload,
  getBidChecklist,
  isQualificationReady,
} from "../../utils/bidsModel";

const PIPELINE_KEY = "fca_commercial_pipeline_v1";

const cardStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  padding: 18,
  background: "#fff",
  boxShadow: "0 12px 24px rgba(15, 23, 42, 0.04)",
};

const actionButtonStyle = {
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 600,
  padding: "10px 12px",
  cursor: "pointer",
};

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
  const bidsActions = useBidsNextActions();
  const { bids, updateBidQualification, routeBidToEstimate, markWonAndCreateProject } = useBidWorkspace();
  const { projects } = useProjectWorkspace();

  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const [invoices, setInvoices] = useState([]);
  const [links, setLinks] = useState({});
  const [pipelineSource, setPipelineSource] = useState("loading");
  const [pipelineBanner, setPipelineBanner] = useState("");
  const [invoiceDraft, setInvoiceDraft] = useState({ invoiceName: "", amount: "", note: "" });
  const [checklists, setChecklists] = useState(() =>
    Object.fromEntries(bids.map((bid) => [bid.id, getBidChecklist(bid)])),
  );
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const companyName = state?.tenant?.name || session?.company || "Customer Workspace";
  const activeBid = bids.find((bid) => bid.id === activeBidId) || bids[0] || null;

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

  async function runQualify() {
    if (!activeBid) return;
    const checklist = checklists[activeBid.id] || getBidChecklist(activeBid);
    if (!isQualificationReady(activeBid, checklist)) {
      setError("Complete the qualification checklist on the bid board before pipeline qualification.");
      return;
    }
    setBusy("qualify");
    setError("");
    try {
      const payload = buildQualifyPayload(activeBid, checklist, "Pipeline wizard qualified the opportunity.");
      await updateBidQualification(activeBid.id, payload, payload.detail);
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
    const projectId = activePipeline?.link?.projectId || projects.find((p) => p.sourceBidId === activeBid.id)?.id;
    const estimateId = activePipeline?.link?.estimateId || "EST-1";
    if (!projectId) {
      setError("Award the project before issuing an invoice from the pipeline wizard.");
      return;
    }
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
      title={`${companyName} Commercial Pipeline`}
      subtitle="One guided flow from bid qualification through project award, billing, and payment."
      activeHref="/portal/pipeline"
      currentJourney="bid"
      routeOverlay={routeStateOverlays.bids}
      primaryHref="/portal/bids"
      primaryLabel="Open Qualification Board"
    >
      {pipelineBanner ? (
        <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #fde68a", background: "#fffbeb", color: "#92400e" }}>
          {pipelineBanner}
        </div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 18, background: "#eff6ff", borderColor: "#93c5fd" }}>
        <div style={{ fontWeight: 700, color: "#1d4ed8", marginBottom: 6 }}>CRM spine</div>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.65 }}>
          Qualified opportunities begin in Lead Intelligence. Complete bid checklists on the qualification board, then return here for bid-to-billing handoff.
        </p>
        <a href="/portal/leads" style={{ display: "inline-block", marginTop: 10, color: "#2563eb", fontWeight: 700 }}>
          Open Lead Intelligence
        </a>
        <a href="/portal/bids" style={{ display: "inline-block", marginTop: 10, marginLeft: 12, color: "#2563eb", fontWeight: 700 }}>
          Open Qualification Board
        </a>
      </div>

      <div style={{ marginBottom: 18 }}>
        <BidsEcosystemHub bidsActions={bidsActions.items} selectedBid={activeBid} />
      </div>

      {error ? (
        <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>
      ) : null}

      <div style={{ ...cardStyle, marginBottom: 18, background: "#f8fafc" }}>
        <div style={{ color: "#475569", fontSize: 14 }}><strong>Pipeline data source:</strong> {pipelineSource}</div>
      </div>

      <div style={{ ...cardStyle, marginBottom: 18, background: "#eff6ff", borderColor: "#1d4ed8" }}>
        <div style={{ color: "#1d4ed8", fontWeight: 700, marginBottom: 8 }}>Active jobs</div>
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
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>{activeBid.package}</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {STEPS.map((step, index) => {
              const done = activePipeline.complete[step.key];
              const active = stepIndex === index;
              return (
                <div
                  key={step.key}
                  style={{
                    flex: "1 1 120px",
                    borderRadius: 10,
                    padding: "10px 12px",
                    border: active ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                    background: done ? "#ecfdf5" : active ? "#eff6ff" : "#f8fafc",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {done ? "Done: " : `${index + 1}. `}{step.label}
                </div>
              );
            })}
          </div>

          <p style={{ color: "#475569", lineHeight: 1.7 }}>{STEPS[Math.min(stepIndex, STEPS.length - 1)]?.detail}</p>

          {activePipeline.current === "qualify" ? (
            <div style={{ marginBottom: 16 }}>
              <BidQualificationChecklist
                bid={activeBid}
                checklist={checklists[activeBid.id] || getBidChecklist(activeBid)}
                onChange={(next) => setChecklists((current) => ({ ...current, [activeBid.id]: next }))}
              />
            </div>
          ) : null}

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {activePipeline.current === "qualify" ? (
              <button
                type="button"
                style={actionButtonStyle}
                disabled={busy === "qualify" || !isQualificationReady(activeBid, checklists[activeBid.id] || getBidChecklist(activeBid))}
                onClick={runQualify}
              >
                {busy === "qualify" ? "Qualifying..." : "Qualify Opportunity"}
              </button>
            ) : null}
            {activePipeline.current === "project" ? (
              <button type="button" style={actionButtonStyle} disabled={busy === "project"} onClick={runAward}>
                {busy === "project" ? "Converting..." : "Award and Create Project"}
              </button>
            ) : null}
            {activePipeline.current === "estimate" ? (
              <>
                <button type="button" style={actionButtonStyle} disabled={busy === "estimate"} onClick={runEstimate}>
                  {busy === "estimate" ? "Routing..." : "Route to Estimate"}
                </button>
                <button type="button" style={actionButtonStyle} onClick={skipEstimate}>Skip estimate</button>
              </>
            ) : null}
            {activePipeline.current === "invoice" ? (
              <div style={{ width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <input placeholder="Invoice name" value={invoiceDraft.invoiceName} onChange={(e) => setInvoiceDraft((c) => ({ ...c, invoiceName: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }} />
                  <input placeholder="Amount" value={invoiceDraft.amount} onChange={(e) => setInvoiceDraft((c) => ({ ...c, amount: e.target.value }))} style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #cbd5e1" }} />
                </div>
                <button type="button" style={actionButtonStyle} disabled={busy === "invoice"} onClick={runInvoice}>
                  {busy === "invoice" ? "Issuing..." : "Create and Issue Invoice"}
                </button>
              </div>
            ) : null}
            {activePipeline.current === "payment" ? (
              <>
                <button type="button" style={{ ...actionButtonStyle, borderColor: "#16a34a", background: "#16a34a", color: "#fff" }} onClick={runPayment}>
                  Record payment in FCA Books
                </button>
                <a href={`/portal/billing/${activePipeline.linkedInvoice?.id || activePipeline.link?.invoiceId}`} style={{ ...actionButtonStyle, textDecoration: "none", display: "inline-block" }}>View invoice</a>
              </>
            ) : null}
            {activePipeline.current === "done" ? (
              <div style={{ color: "#15803d", fontWeight: 700 }}>Pipeline complete for this job.</div>
            ) : null}
          </div>
        </div>
      ) : (
        <div style={cardStyle}>No bids available. Open the qualification board to seed opportunities.</div>
      )}
    </PortalShell>
  );
}
