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
import { createInvoiceCheckout } from "../../api/stripeClient";
import { routeStateOverlays } from "../../systemState";

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
  { key: "payment", label: "Collect payment", detail: "Pay via Stripe checkout." },
];

function readPipelineLinks() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(PIPELINE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writePipelineLink(bidId, patch) {
  if (typeof window === "undefined") return;
  const current = readPipelineLinks();
  window.localStorage.setItem(PIPELINE_KEY, JSON.stringify({ ...current, [bidId]: { ...current[bidId], ...patch } }));
}

function deriveStepStatus(bid, projects, invoices, links) {
  const link = links[bid.id] || {};
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
  const { bids, updateBidQualification, routeBidToEstimate, markWonAndCreateProject } = useBidWorkspace();
  const { projects } = useProjectWorkspace();

  const [activeBidId, setActiveBidId] = useState(() => bids[0]?.id || "");
  const [invoices, setInvoices] = useState([]);
  const [links, setLinks] = useState(readPipelineLinks);
  const [invoiceDraft, setInvoiceDraft] = useState({ invoiceName: "", amount: "", note: "" });
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

  const pipelineRows = useMemo(
    () => bids.map((bid) => ({ bid, ...deriveStepStatus(bid, projects, invoices, links) })),
    [bids, projects, invoices, links],
  );

  const activePipeline = activeBid ? deriveStepStatus(activeBid, projects, invoices, links) : null;
  const stepIndex = activePipeline?.current === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === activePipeline?.current);

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

  function skipEstimate() {
    if (!activeBid) return;
    writePipelineLink(activeBid.id, { estimateSkipped: true });
    setLinks(readPipelineLinks());
    refreshSyncStamp("Estimate step skipped in pipeline");
  }

  async function runInvoice() {
    if (!activeBid) return;
    const name = invoiceDraft.invoiceName.trim() || `${activeBid.package} mobilization`;
    const amount = invoiceDraft.amount.trim() || activeBid.value?.replace(/[^\d.]/g, "") || "1000";
    setBusy("invoice");
    setError("");
    try {
      const created = await createPortalInvoice({ invoiceName: name, amount: amount.startsWith("$") ? amount : `$${amount}`, note: invoiceDraft.note || `Invoice for ${activeBid.package}` });
      const invoiceId = created.item?.id;
      if (invoiceId) {
        await issuePortalInvoice(invoiceId);
        writePipelineLink(activeBid.id, { invoiceId });
        setLinks(readPipelineLinks());
        const payload = await fetchPortalInvoices();
        setInvoices(payload.items || []);
      }
      refreshSyncStamp("Pipeline invoice issued");
    } catch (err) {
      setError(err.message || "Invoice creation failed.");
    } finally {
      setBusy("");
    }
  }

  async function runPayment() {
    const invoiceId = activePipeline?.linkedInvoice?.id || activePipeline?.link?.invoiceId;
    if (!invoiceId) return;
    setBusy("payment");
    setError("");
    try {
      const checkout = await createInvoiceCheckout(invoiceId, {
        customerEmail: session?.email,
        successUrl: `${window.location.origin}/portal/pipeline?payment=success`,
        cancelUrl: `${window.location.origin}/portal/pipeline?payment=cancelled`,
      });
      if (checkout.checkoutUrl) window.location.href = checkout.checkoutUrl;
      else throw new Error("Stripe checkout URL was not returned.");
    } catch (err) {
      setError(err.message || "Payment failed.");
      setBusy("");
    }
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
      {error ? (
        <div style={{ ...cardStyle, marginBottom: 18, border: "1px solid #fecaca", background: "#fef2f2", color: "#991b1b" }}>{error}</div>
      ) : null}

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

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
            {activePipeline.current === "qualify" ? (
              <button type="button" style={actionButtonStyle} disabled={busy === "qualify"} onClick={runQualify}>
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
                <button type="button" style={{ ...actionButtonStyle, borderColor: "#16a34a", background: "#16a34a", color: "#fff" }} disabled={busy === "payment"} onClick={runPayment}>
                  {busy === "payment" ? "Opening Stripe..." : "Pay via Stripe"}
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
