import { useEffect, useMemo, useState } from "react";
import { appendAutomationLog } from "../sessionAutomationLog";
import { appendCommercialLog } from "../sessionCommercialLog";
import { readBidWorkspace, writeBidWorkspace, updateBidWorkspace } from "../bidWorkspaceStore";
import { fetchWorkflowBids, mutateWorkflowBid } from "../api/workflowClient";

function stampHistoryEntry(label, detail) {
  return {
    at: new Date().toISOString(),
    label,
    detail,
  };
}

export default function useBidWorkspace() {
  const [bids, setBids] = useState(() => readBidWorkspace());
  const [meta, setMeta] = useState({
    backingSource: "localStorage",
    persistenceState: "Local bid continuity active",
    lastSyncedAt: null,
  });

  useEffect(() => {
    let active = true;

    async function hydrate() {
      try {
        const payload = await fetchWorkflowBids();
        if (!active) return;
        const saved = writeBidWorkspace(payload.items || []);
        setBids(saved);
        setMeta({
          backingSource: payload.backingSource || "api-workflow-store",
          persistenceState: "API bid workflow spine active",
          lastSyncedAt: new Date().toISOString(),
        });
      } catch {
        if (!active) return;
        setBids(readBidWorkspace());
        setMeta({
          backingSource: "localStorage",
          persistenceState: "Fallback bid continuity active",
          lastSyncedAt: null,
        });
      }
    }

    hydrate();

    return () => {
      active = false;
    };
  }, []);

  return useMemo(
    () => ({
      bids,
      meta,
      async updateBidStatus(bidId, status, detail) {
        try {
          const payload = await mutateWorkflowBid("update-status", { bidId, status, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({
            backingSource: payload.backingSource || "api-workflow-store",
            persistenceState: "API bid workflow mutation active",
            lastSyncedAt: new Date().toISOString(),
          });
          const updatedBid = payload.bid;
          appendAutomationLog({
            type: "bid-status",
            title: `${updatedBid.package} moved to ${status}`,
            detail: detail || `Auricrux changed ${updatedBid.package} to ${status} inside the bid workspace.`,
            route: "/portal/bids",
          });
          appendCommercialLog({
            type: "bid-revenue",
            title: `${updatedBid.package} commercial posture updated`,
            detail: detail || `Auricrux advanced ${updatedBid.package} to ${status} and preserved the revenue-continuity move.`,
            route: "/portal/bids",
          });
          return saved;
        } catch {
          const saved = updateBidWorkspace((current) =>
            current.map((bid) =>
              bid.id !== bidId
                ? bid
                : {
                    ...bid,
                    status,
                    blocker: status === "Won" ? "Conversion cleared" : bid.blocker,
                    nextCommercialMove: detail || bid.nextCommercialMove,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [
                      stampHistoryEntry(`Status changed to ${status}`, detail || `Auricrux moved ${bid.package} into ${status}.`),
                      ...bid.actionHistory,
                    ].slice(0, 12),
                  }
            )
          );
          setBids(saved);
          setMeta({
            backingSource: "localStorage",
            persistenceState: "Fallback bid mutation active",
            lastSyncedAt: new Date().toISOString(),
          });
          return saved;
        }
      },
      async clearBidBlocker(bidId, detail = "Approval blocker cleared and package ready for next commercial move.") {
        try {
          const payload = await mutateWorkflowBid("clear-blocker", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({
            backingSource: payload.backingSource || "api-workflow-store",
            persistenceState: "API bid workflow mutation active",
            lastSyncedAt: new Date().toISOString(),
          });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-repair", title: `${updatedBid.package} blocker cleared`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-repair", title: `${updatedBid.package} approval path restored`, detail, route: "/portal/bids" });
          return saved;
        } catch {
          const saved = updateBidWorkspace((current) =>
            current.map((bid) =>
              bid.id !== bidId
                ? bid
                : {
                    ...bid,
                    blocker: "No active blocker",
                    nextCommercialMove: detail,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [stampHistoryEntry("Blocker cleared", detail), ...bid.actionHistory].slice(0, 12),
                  }
            )
          );
          setBids(saved);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback bid mutation active", lastSyncedAt: new Date().toISOString() });
          return saved;
        }
      },
      async updateBidQualification(bidId, updates, detail = "Qualification command surface updated.") {
        try {
          const payload = await mutateWorkflowBid("update-qualification", { bidId, updates, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid workflow mutation active", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-qualification", title: `${updatedBid.package} qualification updated`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-qualification", title: `${updatedBid.package} qualification posture updated`, detail, route: "/portal/bids" });
          return saved;
        } catch {
          const saved = updateBidWorkspace((current) =>
            current.map((bid) =>
              bid.id !== bidId
                ? bid
                : {
                    ...bid,
                    qualification: { ...bid.qualification, ...updates },
                    nextCommercialMove: updates?.nextGate || detail || bid.nextCommercialMove,
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [stampHistoryEntry("Qualification command updated", detail), ...bid.actionHistory].slice(0, 12),
                  }
            )
          );
          setBids(saved);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback bid mutation active", lastSyncedAt: new Date().toISOString() });
          return saved;
        }
      },
      async routeBidToEstimate(bidId, detail = "Qualified opportunity routed into estimate production.") {
        try {
          const payload = await mutateWorkflowBid("route-to-estimate", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid workflow mutation active", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-estimate-handoff", title: `${updatedBid.package} routed to estimate`, detail, route: "/portal/bids" });
          appendCommercialLog({ type: "bid-estimate-handoff", title: `${updatedBid.package} moved into estimate production`, detail, route: "/portal/bids" });
          return saved;
        } catch {
          const saved = updateBidWorkspace((current) =>
            current.map((bid) =>
              bid.id !== bidId
                ? bid
                : {
                    ...bid,
                    status: "Qualified",
                    blocker: "No active blocker",
                    nextCommercialMove: detail,
                    qualification: { ...bid.qualification, status: "Ready for estimate", evidence: "Qualification packet verified", nextGate: "Estimator handoff active" },
                    lastActionAt: new Date().toISOString(),
                    actionHistory: [stampHistoryEntry("Routed to estimate", detail), ...bid.actionHistory].slice(0, 12),
                  }
            )
          );
          setBids(saved);
          setMeta({ backingSource: "localStorage", persistenceState: "Fallback bid mutation active", lastSyncedAt: new Date().toISOString() });
          return saved;
        }
      },
      async markWonAndCreateProject(bidId, detail = "Won work converted into job setup.") {
        try {
          const payload = await mutateWorkflowBid("mark-won-create-project", { bidId, detail });
          const saved = updateBidWorkspace((current) =>
            current.map((bid) => (bid.id === bidId ? payload.bid : bid))
          );
          setBids(saved);
          setMeta({ backingSource: payload.backingSource || "api-workflow-store", persistenceState: "API bid-to-project conversion active", lastSyncedAt: new Date().toISOString() });
          const updatedBid = payload.bid;
          appendAutomationLog({ type: "bid-awarded", title: `${updatedBid.package} converted into project`, detail, route: "/portal/projects" });
          appendCommercialLog({ type: "bid-awarded", title: `${updatedBid.package} moved into job setup`, detail, route: "/portal/projects" });
          return payload;
        } catch {
          return { ok: false };
        }
      },
    }),
    [bids, meta]
  );
}
