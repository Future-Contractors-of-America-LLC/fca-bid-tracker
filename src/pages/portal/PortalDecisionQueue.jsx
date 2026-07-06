import { useEffect, useMemo, useState } from "react";
import PortalShell from "../../components/PortalShell";
import {
  PortalEntityTable,
  PortalPageIntro,
  PortalStatusBadge,
} from "../../components/portal/PortalPrimitives";
import { portalButtonPrimary, portalButtonSecondary, portalCardStyle } from "../../portalDesignTokens";
import { routeStateOverlays } from "../../systemState";
import AuricruxInsightPanel from "../../components/auricrux/AuricruxInsightPanel";
import {
  listInstructorReviewQueue,
  resolveInstructorReviewItem,
} from "../../lib/instructorReviewQueue";
import { probeDecisionQueueCapability } from "../../api/moduleCapabilityClient";

export default function PortalDecisionQueue() {
  const [queue, setQueue] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [overrideReason, setOverrideReason] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiSpineStatus, setApiSpineStatus] = useState("checking");

  async function refreshQueue() {
    setLoading(true);
    try {
      const items = await listInstructorReviewQueue({ limit: 300 });
      setQueue(items || []);
      if (items?.length && !activeId) {
        setActiveId(items[0].id);
      }
    } catch {
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshQueue();
  }, []);

  useEffect(() => {
    let active = true;
    probeDecisionQueueCapability()
      .then((probe) => {
        if (!active) return;
        setApiSpineStatus(probe.ok ? "connected" : "offline");
      })
      .catch(() => {
        if (active) setApiSpineStatus("offline");
      });
    return () => {
      active = false;
    };
  }, []);

  const activeDecision = useMemo(() => queue.find((row) => row.id === activeId) || queue[0] || null, [queue, activeId]);

  async function approveDecision() {
    if (!activeDecision) return;
    try {
      const result = await resolveInstructorReviewItem(activeDecision.id, {
        decision: "Approved",
        reason: "Instructor approved action after review.",
      });
      setNotice(`Approved ${result.summary || result.id}.`);
      await refreshQueue();
    } catch (error) {
      setNotice(error?.message || "Unable to approve decision.");
    }
  }

  async function overrideDecision() {
    if (!activeDecision) return;
    if (!overrideReason.trim()) {
      setNotice("Override reason is required so Auricrux can learn.");
      return;
    }
    try {
      const result = await resolveInstructorReviewItem(activeDecision.id, {
        decision: "Overridden",
        reason: overrideReason,
      });
      setNotice(`Overrode ${result.summary || result.id}. Instructor feedback captured for policy reinforcement.`);
      setOverrideReason("");
      await refreshQueue();
    } catch (error) {
      setNotice(error?.message || "Unable to override decision.");
    }
  }

  return (
    <PortalShell
      title="Auricrux Decision Queue"
      subtitle="Human-in-the-loop override layer for enterprise liability, trust, and reinforcement learning."
      activeHref="/portal/decision-queue"
      currentJourney="coordination"
      routeOverlay={routeStateOverlays.admin}
      primaryHref="/portal/command-tower"
      primaryLabel="Back to command tower"
    >
      <AuricruxInsightPanel
        title="Auricrux Decision Governance"
        targetObjectId={activeDecision?.id || "decision-queue"}
        sourceRoute="/portal/decision-queue"
        rationale="Human override decisions are governance-critical signals for enterprise liability and model reinforcement quality."
        nextAction={activeDecision ? `Resolve ${activeDecision.summary || activeDecision.id} with explicit rationale for durable policy learning.` : "Review next pending decision for accountable approval."}
        actionHref="/portal/command-tower"
        actionLabel="Open Command Tower"
        tone="amber"
        liveRecommend={Boolean(activeDecision)}
      />

      <PortalPageIntro
        eyebrow="Phase 3"
        title="Human-in-the-loop control surface"
        detail={`Review instructor queue actions before execution, approve or override, and feed rationale back into policy reinforcement and immutable audit trails. API spine: ${apiSpineStatus}.`}
      />

      {notice ? <div style={{ ...portalCardStyle, marginBottom: 12, color: "#065f46" }}>{notice}</div> : null}

      <div style={{ ...portalCardStyle, marginBottom: 14 }}>
        <h3 style={{ marginTop: 0 }}>Pending and resolved instructor review actions</h3>
        <PortalEntityTable
          columns={[
            { key: "summary", label: "Decision" },
            { key: "actionType", label: "Action" },
            { key: "targetObjectId", label: "Object" },
            {
              key: "status",
              label: "Status",
              render: (row) => <PortalStatusBadge status={row.status} active={String(row.status || "").toLowerCase().includes("pending")} />,
            },
            { key: "createdAt", label: "Created" },
            {
              key: "select",
              label: "",
              render: (row) => (
                <button type="button" style={portalButtonSecondary} onClick={() => setActiveId(row.id)}>
                  {activeId === row.id ? "Selected" : "Review"}
                </button>
              ),
            },
          ]}
          rows={queue.map((row) => ({
            id: row.id,
            summary: row.summary || "Instructor review action",
            actionType: row.actionType || "operation",
            targetObjectId: row.targetObjectId || "-",
            status: row.status,
            createdAt: row.createdAt,
          }))}
          emptyTitle={loading ? "Loading instructor review queue" : "No queued decisions"}
          emptyDetail="Queue entries are generated by CTE Safe-Mode mutation gates and require explicit instructor resolution."
        />
      </div>

      {activeDecision ? (
        <div style={portalCardStyle}>
          <h3 style={{ marginTop: 0 }}>Decision review</h3>
          <div><strong>Summary:</strong> {activeDecision.summary || "Instructor review action"}</div>
          <div><strong>Action type:</strong> {activeDecision.actionType || "operation"}</div>
          <div><strong>Target object:</strong> {activeDecision.targetObjectType || "Operation"} {activeDecision.targetObjectId || ""}</div>
          <div><strong>Payload:</strong></div>
          <pre style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: 10, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(activeDecision.payload || {}, null, 2)}
          </pre>

          {String(activeDecision.status || "").toLowerCase().includes("pending") ? (
            <>
              <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
                <span>Override reason (required for override learning)</span>
                <textarea
                  value={overrideReason}
                  onChange={(event) => setOverrideReason(event.target.value)}
                  rows={3}
                  style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "9px 10px", font: "inherit" }}
                  placeholder="Example: client relationship exception, compliance context not captured"
                />
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <button type="button" style={portalButtonPrimary} onClick={approveDecision}>Approve decision</button>
                <button type="button" style={portalButtonSecondary} onClick={overrideDecision}>Override with feedback</button>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 10 }}>
              <PortalStatusBadge status={`Resolved: ${activeDecision.status}`} />
              {activeDecision.resolution?.reason ? <div style={{ marginTop: 6 }}><strong>Resolution reason:</strong> {activeDecision.resolution.reason}</div> : null}
            </div>
          )}
        </div>
      ) : null}
    </PortalShell>
  );
}
